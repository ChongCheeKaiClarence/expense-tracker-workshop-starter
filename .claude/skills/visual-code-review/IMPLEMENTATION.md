# Visual Code Review - Implementation Guide

This guide explains how the `/visual-code-review` skill works internally and how to use it effectively.

## How It Works

### 1. Parse Input

```
/visual-code-review #2 http://localhost:5173
              ↓                      ↓
          ticket-ref            app-url (optional)
```

- Extract ticket reference (URL, issue number, or file path)
- Extract app URL (default to 127.0.0.1:5173 if not provided)
- Validate both parameters

### 2. Fetch Ticket Details

- If GitHub URL or issue number: Fetch from GitHub API
- If file path: Read local file
- Extract acceptance criteria, feature description, requirements
- Parse into testable assertions

### 3. Open Browser

- Launch Chrome DevTools MCP
- Navigate to app URL
- Verify app loaded successfully

### 4. Run Desktop Tests (1280x800)

#### Initial State Check

```javascript
- Verify UI elements visible
- Check form controls present
- Capture screenshot: 01-desktop-initial.png
```

#### Feature Testing

```javascript
- Interact with new/modified features
- Verify acceptance criteria behaviors
- Capture screenshot: 02-desktop-feature.png
```

#### Validation Testing

```javascript
- Test error cases
- Verify error messages display
- Capture screenshot: 03-desktop-validation.png
```

### 5. Run Mobile Tests (375x800)

#### Resize Viewport

```javascript
resize(375, 800);
```

#### Responsive Check

```javascript
- Verify layout adapts
- Check no horizontal scrolling
- Verify touch targets ≥44px
- Verify font size ≥16px
- Capture screenshot: 04-mobile-initial.png
```

#### Feature on Mobile

```javascript
- Test features work on mobile
- Capture screenshot: 05-mobile-feature.png
```

### 6. Generate Reports

#### README.md

- Overview of test
- Quick links to all artifacts
- Table of test results

#### REPORT.md

- Detailed findings for each check
- Screenshots referenced
- Evidence of each assertion
- Pass/fail with explanations

#### SUMMARY.txt

- Checklist of all tests
- Overall pass/fail status
- Key findings bullet points

### 7. Save Artifacts

```
visual-code-review-YYYY-MM-DD-HHmmss/
├── README.md
├── REPORT.md
├── SUMMARY.txt
├── 01-desktop-initial.png
├── 02-desktop-feature.png
├── 03-desktop-validation.png
├── 04-mobile-initial.png
└── 05-mobile-feature.png
```

### 8. Return Results

```
Full path to results folder:
C:\Users\Clarence\Desktop\expense-tracker-workshop-starter\visual-code-review-2026-11-12-171500
```

## Usage Examples

### Example 1: Test GitHub Issue

```
/visual-code-review #2
```

- Fetches issue #2 from GitHub
- Uses default app URL (127.0.0.1:5173)
- Reads acceptance criteria
- Runs full test suite
- Returns path to results

### Example 2: Test with Custom URL

```
/visual-code-review https://github.com/user/repo/issues/42 http://staging.com:8000
```

- Fetches issue #42 from GitHub repo
- Tests against http://staging.com:8000
- Saves results with all artifacts

### Example 3: Test Local Spec File

```
/visual-code-review ./docs/FEATURE-SPEC.md
```

- Reads specification from local file
- Uses default app URL
- Tests against spec requirements
- Saves results

## Test Checklist Template

Each visual code review checks:

```
DESKTOP TESTS (1280x800)
  ✅ UI elements visible and properly positioned
  ✅ Form inputs accessible and functional
  ✅ Feature works as specified
  ✅ Data persists (localStorage verification)
  ✅ Error messages display correctly
  ✅ No visual regressions in existing features
  ✅ Totals/calculations correct

MOBILE TESTS (375x800)
  ✅ Layout responsive (no horizontal scroll)
  ✅ All controls visible
  ✅ Touch targets ≥44px (accessibility)
  ✅ Font size ≥16px (accessibility)
  ✅ Feature works on mobile
  ✅ Forms functional on mobile

REGRESSION TESTS
  ✅ Existing features still work
  ✅ No broken UI elements
  ✅ No new console errors
  ✅ Performance acceptable
```

## Integration with Workflow

### Before Using This Skill

1. ✅ Start dev server: `npm run dev`
2. ✅ Verify app URL is correct
3. ✅ Read the ticket to understand requirements

### Using This Skill

```
/visual-code-review [ticket-ref] [app-url]
```

### After Skill Completes

1. 📋 Review README.md for overview
2. 📊 Check REPORT.md for detailed findings
3. 📸 View screenshots to verify visual state
4. ✅ Compare against acceptance criteria
5. 📌 Reference full path in PR/commit message

## Common Scenarios

### Scenario 1: Verify New Feature

```
/visual-code-review #5
```

- Reads issue #5 requirements
- Opens app at default URL
- Tests new feature works
- Takes screenshots showing feature working
- Generates report with evidence

### Scenario 2: Check for Regressions

```
/visual-code-review #5 http://localhost:8000
```

- Tests existing features still work
- Verifies new feature doesn't break anything
- Compares layout against baseline
- Reports any regressions found

### Scenario 3: Mobile-Specific Testing

```
/visual-code-review ./MOBILE-SPEC.md http://local:5173
```

- Reads mobile-specific requirements
- Tests at 375px width
- Verifies accessibility (44px, 16px)
- Reports mobile-specific issues

## Output Structure

Every test run creates:

**Folder name format**: `visual-code-review-YYYY-MM-DD-HHmmss`

**Files generated**:

1. `README.md` (8-10 KB) - Navigation and overview
2. `REPORT.md` (8-12 KB) - Detailed findings
3. `SUMMARY.txt` (4-6 KB) - Quick checklist
4. `01-desktop-initial.png` (140-180 KB) - Initial state
5. `02-desktop-feature.png` (140-180 KB) - Feature test
6. `03-desktop-validation.png` (140-180 KB) - Validation
7. `04-mobile-initial.png` (140-180 KB) - Mobile state
8. `05-mobile-feature.png` (140-180 KB) - Mobile test

**Total size**: ~750-1000 KB per test run

## Limitations & Workarounds

| Limitation           | Workaround                              |
| -------------------- | --------------------------------------- |
| Requires app running | Start dev server before calling skill   |
| Can't test backend   | Focus on UI/client-side behavior        |
| Event handlers async | Wait for React re-renders in script     |
| Large screenshots    | Browse artifacts locally or compress    |
| Time-based tests     | Mock time using Chrome's clock features |

## Tips for Best Results

1. **Clear browser cache** before running tests if needed
2. **Verify app loads** at provided URL before calling skill
3. **Read ticket first** to understand what to test
4. **Review all screenshots** for visual changes
5. **Check REPORT.md** for detailed findings
6. **Reference results** in PR descriptions

## Example Full Workflow

```
1. Developer creates feature branch
2. Implements feature for issue #5
3. Runs: /visual-code-review #5
4. Skill opens browser, tests feature
5. Generates report with screenshots
6. Developer reviews artifacts
7. If issues found: Fix and re-run
8. If passing: Commit with reference to test results
9. Create PR with link to browser test results
```

## Troubleshooting

**App not loading**

- Check app URL is correct
- Verify dev server is running: `npm run dev`
- Try http://127.0.0.1:5173 instead of localhost

**Screenshots not saving**

- Check disk space available
- Verify write permissions to repo folder
- Check path doesn't exceed OS limits

**Tests timing out**

- Ensure app responds quickly
- Check for network issues
- Try simpler test without complex interactions

**Reports missing details**

- Check ticket was readable
- Verify ticket has clear acceptance criteria
- Check REPORT.md for error messages

---

**Related**: See SKILL.md for usage guide, or run `/visual-code-review` with no args for help.
