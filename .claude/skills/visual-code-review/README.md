# Visual Code Review Skill

**Location**: `.claude/skills/visual-code-review/`

## Quick Start

```
/visual-code-review #2
```

This skill automates browser-based visual testing of web applications using Chrome DevTools MCP.

## Files in This Directory

- **SKILL.md** (5.0 KB) - Skill definition and user guide
- **IMPLEMENTATION.md** (7.6 KB) - Implementation details and technical workflow
- **README.md** - This file

## What This Skill Does

1. **Accepts Parameters**:
   - Ticket reference: GitHub issue URL, issue number (#), or file path
   - App URL: Application to test (defaults to http://127.0.0.1:5173/)

2. **Performs Browser Tests**:
   - Desktop viewport (1280x800)
   - Mobile viewport (375x800)
   - Form interactions and validation
   - Feature verification
   - Regression detection

3. **Captures Evidence**:
   - Full-page screenshots at key checkpoints
   - Desktop and mobile viewport captures
   - Initial state, feature test, validation states

4. **Generates Reports**:
   - README with navigation
   - Detailed REPORT.md with findings
   - SUMMARY.txt with checklist
   - All artifacts timestamped and organized

5. **Returns Results**:
   - Full path to results folder
   - 8 files: 3 markdown/text docs + 5 PNG screenshots
   - ~750 KB total per test run

## Usage Examples

### Test GitHub Issue

```
/visual-code-review #2
/visual-code-review https://github.com/user/repo/issues/42
```

### Test with Custom App URL

```
/visual-code-review #2 http://localhost:8000
/visual-code-review #5 http://staging.example.com:5173
```

### Test Local Spec File

```
/visual-code-review ./docs/TICKET-SPEC.md
/visual-code-review ./FEATURE-REQUIREMENTS.md http://localhost:3000
```

## Skill Details

**Category**: code-review  
**Type**: Visual/Browser-based  
**Tools**: Chrome DevTools MCP  
**Artifacts**: Screenshots + Markdown reports  
**Output Folder**: `visual-code-review-YYYY-MM-DD-HHmmss/`

## Test Checklist

Each run performs these checks:

✅ Desktop UI elements visible and positioned correctly  
✅ Forms functional and accessible  
✅ Features work as specified in ticket  
✅ Data persists across page reloads  
✅ Error messages display correctly  
✅ Mobile viewport responsive (no horizontal scroll)  
✅ Touch targets ≥44px (accessibility)  
✅ Font size ≥16px (accessibility)  
✅ No regressions in existing features

## Output Example

```
visual-code-review-2026-11-12-171500/
├── README.md                 - Overview & navigation
├── REPORT.md                 - Detailed findings
├── SUMMARY.txt               - Checklist results
├── 01-desktop-initial.png    - Initial desktop state
├── 02-desktop-feature.png    - Desktop feature test
├── 03-desktop-validation.png - Desktop validation
├── 04-mobile-initial.png     - Mobile initial state
└── 05-mobile-feature.png     - Mobile feature test
```

**Return**: Full path to folder for review

## When to Use

✅ Verify new features work visually  
✅ Check for UI regressions  
✅ Test responsive design  
✅ Validate accessibility (44px, 16px)  
✅ Document feature behavior with screenshots  
✅ Create evidence for PR reviews

## Limitations

❌ Requires app already running  
❌ Only tests client-side UI behavior  
❌ Can't run automated test suites  
❌ Can't deploy or modify code  
❌ Screenshots may be large (~1-2 MB per run)

## Setup

1. Ensure dev server is running: `npm run dev`
2. Verify app accessible at specified URL
3. Have tickets with clear acceptance criteria
4. Have write permissions to repo folder

## Documentation

- Read **SKILL.md** for complete usage guide
- Read **IMPLEMENTATION.md** for technical details
- See `/visual-code-review` help for command reference

## Example Workflow

```
Developer: /visual-code-review #2
  ↓
Skill opens browser at 127.0.0.1:5173
  ↓
Tests desktop (1280x800)
  ├─ Captures: 01-desktop-initial.png
  ├─ Captures: 02-desktop-feature.png
  └─ Captures: 03-desktop-validation.png
  ↓
Resizes to mobile (375x800)
  ├─ Captures: 04-mobile-initial.png
  └─ Captures: 05-mobile-feature.png
  ↓
Generates reports
  ├─ README.md (overview)
  ├─ REPORT.md (detailed)
  └─ SUMMARY.txt (checklist)
  ↓
Returns: /path/to/visual-code-review-2026-11-12-171500/
```

## Related

- `/code-review` - Automated code review (standards + spec)
- `/prototype` - Build throwaway prototypes
- `/run` - Launch and drive app
- `/tdd` - Test-driven development

---

**Powered by**: Chrome DevTools MCP  
**Framework**: React / Web Applications  
**Artifacts**: Full-page screenshots + Markdown reports
