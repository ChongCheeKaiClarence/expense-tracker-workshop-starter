import { test, expect } from "@playwright/test";

const transactionForm = (page) =>
  page
    .getByRole("region", { name: "Add Transaction", exact: true })
    .locator("form");
const transactionList = (page) =>
  page.getByRole("region", { name: "Transactions", exact: true });

const incomeTotal = (page) =>
  page
    .locator(".summary-card")
    .filter({ has: page.getByRole("heading", { name: "Income", exact: true }) })
    .locator("p");

function displayedAmount(text) {
  return Number(text.replace(/[$,]/g, ""));
}

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2027-01-15T12:00:00Z") });
});

test("adding income increases its total numerically, not by string concatenation", async ({
  page,
}) => {
  await page.goto("/");
  const before = displayedAmount(await incomeTotal(page).innerText());
  const form = transactionForm(page);
  await form
    .getByPlaceholder("Description", { exact: true })
    .fill("Workshop income");
  await form.getByPlaceholder("Amount", { exact: true }).fill("100");
  await form
    .getByRole("combobox", { name: "Transaction type", exact: true })
    .selectOption("income");
  await form.getByRole("button", { name: "Add", exact: true }).click();
  await expect
    .poll(async () => displayedAmount(await incomeTotal(page).innerText()))
    .toBe(before + 100);
});

test("transaction entry stays scoped when another form uses the same labels", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    const otherForm = document.createElement("form");
    otherForm.setAttribute("aria-label", "Other form");
    otherForm.innerHTML = `
      <label>Description<input name="description" placeholder="Description"></label>
      <label>Amount (USD)<input name="amount" type="number" placeholder="Amount"></label>
      <label>Transaction type<select name="type"><option value="expense">Expense</option></select></label>
      <label>Category<select name="category"><option value="food">food</option></select></label>
      <button type="button">Add</button>
    `;
    document.body.prepend(otherForm);
  });

  const form = transactionForm(page);
  await form
    .getByPlaceholder("Description", { exact: true })
    .fill("Scoped income");
  await form.getByPlaceholder("Amount", { exact: true }).fill("100");
  await form
    .getByRole("combobox", { name: "Transaction type", exact: true })
    .selectOption("income");
  await form
    .getByRole("combobox", { name: "Category", exact: true })
    .selectOption("other");
  await form.getByRole("button", { name: "Add", exact: true }).click();
  await expect(incomeTotal(page)).toHaveText("$5900.00");
  await expect(
    page.getByRole("row").filter({ hasText: "Scoped income" }),
  ).toContainText("other");

  const otherForm = page.getByRole("form", { name: "Other form", exact: true });
  await expect(
    otherForm.getByLabel("Description", { exact: true }),
  ).toHaveValue("");
  await expect(
    otherForm.getByLabel("Amount (USD)", { exact: true }),
  ).toHaveValue("");
  await expect(
    otherForm.getByRole("combobox", { name: "Transaction type", exact: true }),
  ).toHaveValue("expense");
  await expect(
    otherForm.getByRole("combobox", { name: "Category", exact: true }),
  ).toHaveValue("food");
});

test("fixture totals and UTC dates are deterministic across the year boundary", async ({
  page,
}) => {
  await page.goto("/");
  await expect(incomeTotal(page)).toHaveText("$5800.00");
  await expect(page.locator(".summary-card .expense-amount")).toHaveText(
    "$1545.00",
  );
  await expect(page.locator(".balance-amount")).toHaveText("$4255.00");
  await expect(page.locator("tbody tr")).toHaveCount(8);
  await expect(page.getByRole("row").filter({ hasText: "Rent" })).toContainText(
    "2026-12-02",
  );
  await expect(
    page.getByRole("row").filter({ hasText: "Groceries" }),
  ).toContainText("2027-01-03");
});

test("adding a decimal expense updates totals and clears the form", async ({
  page,
}) => {
  await page.goto("/");
  const form = transactionForm(page);
  await form.getByLabel("Description", { exact: true }).fill("  Lunch  ");
  await form.getByLabel("Amount (USD)", { exact: true }).fill("12.34");
  await form.getByRole("button", { name: "Add", exact: true }).click();
  const row = page.getByRole("row").filter({ hasText: "Lunch" });
  await expect(row).toContainText("2027-01-15");
  await expect(row.getByRole("cell").nth(1)).toHaveText("Lunch");
  await expect(row).toContainText("-$12.34");
  await expect(page.locator(".summary-card .expense-amount")).toHaveText(
    "$1557.34",
  );
  await expect(page.locator(".balance-amount")).toHaveText("$4242.66");
  await expect(form.getByLabel("Description", { exact: true })).toHaveValue("");
  await expect(form.getByLabel("Amount (USD)", { exact: true })).toHaveValue(
    "",
  );
});

test("invalid entries preserve the existing transactions and totals", async ({
  page,
}) => {
  await page.goto("/");
  const form = transactionForm(page);
  await form.getByLabel("Description", { exact: true }).fill("Invalid example");
  for (const amount of ["", "0", "-1", "1.001", "1000000.01"]) {
    await form.getByLabel("Amount (USD)", { exact: true }).fill(amount);
    await form.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.locator("tbody tr")).toHaveCount(8);
    await expect(
      form.getByLabel("Amount (USD)", { exact: true }),
    ).toBeFocused();
    expect(
      await form
        .getByLabel("Amount (USD)", { exact: true })
        .evaluate((el) => el.checkValidity()),
    ).toBe(false);
  }
  await form.getByLabel("Description", { exact: true }).fill("   ");
  await form.getByLabel("Amount (USD)", { exact: true }).fill("10");
  await form.getByRole("button", { name: "Add", exact: true }).click();
  await expect(form.getByRole("alert")).toContainText("description");
  await expect(page.locator("tbody tr")).toHaveCount(8);
  await expect(page.locator(".balance-amount")).toHaveText("$4255.00");

  for (const amount of ["0.01", "1000000"]) {
    await form.getByLabel("Description", { exact: true }).fill("x".repeat(120));
    await form.getByLabel("Amount (USD)", { exact: true }).fill(amount);
    await form.getByRole("button", { name: "Add", exact: true }).click();
    await expect(form.getByRole("alert")).toHaveCount(0);
  }
  await expect(page.locator("tbody tr")).toHaveCount(10);
  await expect(page.locator(".summary-card .expense-amount")).toHaveText(
    "$1001545.01",
  );
  await expect(page.locator(".balance-amount")).toHaveText("$-995745.01");
});

test("table filters combine, show an empty state, and leave global totals alone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const filters = transactionList(page);
  const columnPositions = () =>
    page.getByRole("columnheader").evaluateAll((headers) =>
      headers.map((header) => {
        const { x, width } = header.getBoundingClientRect();
        return { x, width };
      }),
    );
  const startingColumns = await columnPositions();
  await filters
    .getByRole("combobox", { name: "Filter type", exact: true })
    .selectOption("income");
  await expect(page.locator("tbody tr")).toHaveCount(2);
  expect(await columnPositions()).toEqual(startingColumns);
  await filters
    .getByRole("combobox", { name: "Filter category", exact: true })
    .selectOption("food");
  await expect(
    page.getByText("No transactions match these filters."),
  ).toBeVisible();
  expect(await columnPositions()).toEqual(startingColumns);
  await filters
    .getByRole("combobox", { name: "Filter type", exact: true })
    .selectOption("expense");
  await expect(page.locator("tbody tr")).toHaveCount(2);
  expect(await columnPositions()).toEqual(startingColumns);
  await expect(page.getByRole("table")).toContainText("Groceries");
  await expect(page.getByRole("table")).toContainText("Dinner Out");
  await expect(page.locator(".summary-card .expense-amount")).toHaveText(
    "$1545.00",
  );
  await expect(page.locator(".balance-amount")).toHaveText("$4255.00");
  await filters
    .getByRole("combobox", { name: "Filter type", exact: true })
    .selectOption("all");
  await filters
    .getByRole("combobox", { name: "Filter category", exact: true })
    .selectOption("all");
  await expect(page.locator("tbody tr")).toHaveCount(8);
  expect(await columnPositions()).toEqual(startingColumns);
});

test("repeat entries stay distinct and reload resets synthetic changes", async ({
  page,
}) => {
  const messages = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type()))
      messages.push(message.text());
  });
  page.on("pageerror", (error) => messages.push(error.message));
  await page.goto("/");
  const form = transactionForm(page);
  for (const [description, amount] of [
    ["First item", "0.10"],
    ["Second item", "0.20"],
  ]) {
    await form.getByLabel("Description", { exact: true }).fill(description);
    await form.getByLabel("Amount (USD)", { exact: true }).fill(amount);
    await form.getByRole("button", { name: "Add", exact: true }).click();
  }
  await expect(page.locator("tbody tr")).toHaveCount(10);
  await expect(page.locator(".summary-card .expense-amount")).toHaveText(
    "$1545.30",
  );
  await page.reload();
  await expect(page.locator("tbody tr")).toHaveCount(8);
  await expect(page.locator(".summary-card .expense-amount")).toHaveText(
    "$1545.00",
  );
  expect(messages).toEqual([]);
});

test("narrow screens keep controls labelled and page content within the viewport", async ({
  page,
}) => {
  await page.goto("/");
  const form = transactionForm(page);
  const filters = transactionList(page);
  for (const width of [320, 360, 375]) {
    await page.setViewportSize({ width, height: 800 });
    await expect(page.getByRole("main")).toBeVisible();
    for (const [scope, role, name] of [
      [form, "textbox", "Description"],
      [form, "spinbutton", "Amount (USD)"],
      [form, "combobox", "Transaction type"],
      [form, "combobox", "Category"],
      [filters, "combobox", "Filter type"],
      [filters, "combobox", "Filter category"],
    ]) {
      const control = scope.getByRole(role, { name, exact: true });
      await expect(control).toBeVisible();
      const box = await control.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
    expect(
      await page
        .locator("tbody td")
        .first()
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    ).toBeGreaterThanOrEqual(16);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await form.getByLabel("Description", { exact: true }).focus();
    await page.keyboard.press("Tab");
    await expect(
      form.getByLabel("Amount (USD)", { exact: true }),
    ).toBeFocused();
  }
});

test("budget input accepts valid amounts and displays the budget", async ({
  page,
}) => {
  await page.goto("/");
  const budgetInput = page.getByLabel("Monthly budget", { exact: true });
  await budgetInput.fill("2500");
  await expect(page.getByText("Budget: $2500.00")).toBeVisible();
});

test("budget persists across page reloads", async ({ page }) => {
  await page.goto("/");
  const budgetInput = page.getByLabel("Monthly budget", { exact: true });
  await budgetInput.fill("3000");
  await expect(page.getByText("Budget: $3000.00")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Monthly budget", { exact: true })).toHaveValue(
    "3000",
  );
  await expect(page.getByText("Budget: $3000.00")).toBeVisible();
});

test("budget carries over to the next month", async ({ page }) => {
  await page.clock.install({ time: new Date("2027-01-15T12:00:00Z") });
  await page.goto("/");
  const budgetInput = page.getByLabel("Monthly budget", { exact: true });
  await budgetInput.fill("5000");
  await expect(page.getByText("Budget: $5000.00")).toBeVisible();

  // Manually set up the next month by manipulating localStorage
  // (simulating budget being set in January)
  await page.evaluate(() => {
    localStorage.setItem("budget-2027-01", "5000");
  });

  // Uninstall current clock and set to February
  await page.clock.install({ time: new Date("2027-02-15T12:00:00Z") });
  await page.reload();

  // Budget should carry over from previous month
  await expect(page.getByLabel("Monthly budget", { exact: true })).toHaveValue(
    "5000",
  );
  await expect(page.getByText("Budget: $5000.00")).toBeVisible();
});
