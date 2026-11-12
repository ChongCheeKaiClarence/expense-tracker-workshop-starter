---
name: visual-code-review
category: code-review
description: Browser-based visual review of web app features using Chrome DevTools MCP
when: User requests visual testing of a web app against ticket requirements
---

# Visual Code Review Skill

Automate browser-based visual testing of web applications. This skill opens Chrome DevTools, navigates to the app, performs interactive testing across desktop and mobile viewports, captures screenshots, and generates a comprehensive test report with findings.

## What it does

1. Accepts a ticket reference (GitHub issue URL or local file path)
2. Accepts an app URL (defaults to http://127.0.0.1:5173/)
3. Opens app in Chrome DevTools MCP browser
4. Performs systematic browser walkthrough:
   - Desktop viewport testing (1280x800)
   - Mobile viewport testing (375x800)
   - Form interactions and validation
   - Feature verification
   - Regression detection
5. Captures full-page screenshots at each checkpoint
6. Generates detailed report with findings
7. Saves all artifacts to timestamped folder in repo
8. Returns results path for review

## Usage

```
/visual-code-review ticket-ref [app-url]
```

**Examples:**

```
/visual-code-review #2
/visual-code-review https://github.com/user/repo/issues/2
/visual-code-review ./docs/TICKET-2-SPEC.md
/visual-code-review #2 http://localhost:3000
/visual-code-review ./spec.md http://staging.example.com:5173
```

## Parameters

- `ticket-ref` (required): GitHub issue URL, issue number (#123), or local file path to spec
- `app-url` (optional): Application URL to test. Default: `http://127.0.0.1:5173/`

## What it checks

The skill performs the following systematic tests:

### Desktop Tests (1280x800)

- [ ] UI element visibility and layout
- [ ] Form inputs and controls accessible
- [ ] Data persists across page reloads
- [ ] Feature state carries over between sessions
- [ ] Transaction/existing features work (no regression)
- [ ] Validation error messages display
- [ ] Totals and calculations correct

### Mobile Tests (375x800)

- [ ] All controls visible and accessible
- [ ] No horizontal scrolling
- [ ] Touch targets meet 44px minimum
- [ ] Font size meets 16px minimum
- [ ] Layout adapts responsively
- [ ] Labels associated with inputs
- [ ] Forms functional on mobile

### Feature-specific Tests

- [ ] New features function as specified
- [ ] Error handling working
- [ ] Persistence mechanisms (localStorage, etc.)
- [ ] Data integrity across operations
- [ ] No breaking changes to existing features

## Output

Creates timestamped folder: `visual-code-review-{YYYY-MM-DD-HHmmss}/`

Contains:

- `README.md` - Overview and navigation
- `REPORT.md` - Detailed findings
- `SUMMARY.txt` - Quick reference checklist
- `01-desktop-initial.png` - Initial desktop state
- `02-desktop-feature.png` - Desktop feature testing
- `03-desktop-validation.png` - Desktop validation states
- `04-mobile-initial.png` - Mobile initial state
- `05-mobile-feature.png` - Mobile feature testing

All artifacts saved with full paths returned.

## Return value

```
Full path to results folder:
C:\path\to\repo\visual-code-review-2026-11-12-171500

Contains 8 files:
- README.md (report overview)
- REPORT.md (detailed findings)
- SUMMARY.txt (checklist results)
- 5 PNG screenshots
```

## Example Workflow

```
User: /visual-code-review #42 http://localhost:8000
Claude:
  - Loads issue #42 from GitHub
  - Opens http://localhost:8000 in browser
  - Runs desktop tests (1280x800)
    ✅ Feature visible
    ✅ Form works
    ✅ Data persists
  - Takes desktop screenshots
  - Runs mobile tests (375x800)
    ✅ Responsive layout
    ✅ Touch targets 44px+
    ✅ No horizontal scroll
  - Takes mobile screenshots
  - Generates report
  - Saves all artifacts
  Returns: Full path to results folder
```

## What it DOESN'T do

- ❌ Modify app code or tests
- ❌ Perform git operations
- ❌ Deploy or push changes
- ❌ Run automated test suites
- ❌ Analyze server-side logic
- ❌ Check API responses directly

## Limitations

- Requires app already running on specified URL
- Only tests visible UI and client-side behavior
- Relies on Chrome DevTools MCP availability
- Screenshots capture full pages (may be large)
- Timing of async operations may require manual adjustment

## Related Skills

- `/code-review` - Automated code review against standards
- `/prototype` - Build throwaway features for design validation
- `/run` - Launch and drive the project's app

## Tips

1. **Start dev server first**: Ensure `npm run dev` is running before calling this skill
2. **Check ticket first**: Skill will read the ticket to understand what to test
3. **Review screenshots**: Always review the screenshot output for visual regressions
4. **Mobile testing**: Narrow viewport (375px) catches responsive design issues
5. **Regression detection**: Compare results against baseline for changes

---

**Powered by**: Chrome DevTools MCP  
**Framework**: React/Web Applications  
**Artifacts**: Screenshots + Markdown reports + Text summaries
