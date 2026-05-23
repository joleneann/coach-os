import fs from "fs";
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak, TabStopType, TabStopPosition
} from "docx";

// ── Color Palette (Stone / Amber) ─────────────────────────────────
const C = {
  stone900: "1C1917",
  stone700: "44403C",
  stone500: "78716C",
  stone300: "D6D3D1",
  stone200: "E7E5E3",
  stone100: "F5F5F4",
  stone50:  "FAFAF9",
  amber600: "D97706",
  amber500: "F59E0B",
  amber100: "FEF3C7",
  amber50:  "FFFBEB",
  red600:   "DC2626",
  red100:   "FEE2E2",
  white:    "FFFFFF",
};

// ── Reusable Helpers ──────────────────────────────────────────────
const FONT = "Inter";
const PAGE_W = 12240; // US Letter
const PAGE_H = 15840;
const MARGIN = 1440; // 1 inch
const CONTENT_W = PAGE_W - 2 * MARGIN; // 9360

const border = (color = C.stone300) => ({
  style: BorderStyle.SINGLE, size: 1, color,
});
const borders = (color) => {
  const b = border(color);
  return { top: b, bottom: b, left: b, right: b };
};
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function text(t, opts = {}) {
  return new TextRun({ text: t, font: FONT, size: opts.size ?? 22, ...opts });
}
function boldText(t, opts = {}) {
  return text(t, { bold: true, ...opts });
}

function para(children, opts = {}) {
  if (typeof children === "string") children = [text(children)];
  return new Paragraph({ children, spacing: { after: 120 }, ...opts });
}

function heading1(t) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [text(t, { bold: true, size: 32, color: C.stone900 })],
  });
}
function heading2(t) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 160 },
    children: [text(t, { bold: true, size: 28, color: C.stone900 })],
  });
}
function heading3(t) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
    children: [text(t, { bold: true, size: 24, color: C.stone700 })],
  });
}

function emptyPara() {
  return new Paragraph({ spacing: { after: 60 }, children: [] });
}

// ── Table builder ─────────────────────────────────────────────────
function makeTable(headers, rows, colWidths) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) =>
      new TableCell({
        width: { size: colWidths[i], type: WidthType.DXA },
        borders: borders(C.stone300),
        shading: { fill: C.stone200, type: ShadingType.CLEAR },
        margins: cellMargins,
        children: [para([boldText(h, { size: 20 })], { spacing: { after: 0 } })],
      })
    ),
  });

  const dataRows = rows.map(
    (cells) =>
      new TableRow({
        children: cells.map((cell, i) => {
          const content = typeof cell === "string" ? cell : cell.text;
          const shade = cell?.shade;
          return new TableCell({
            width: { size: colWidths[i], type: WidthType.DXA },
            borders: borders(C.stone300),
            shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
            margins: cellMargins,
            children: [para([text(content, { size: 20 })], { spacing: { after: 0 } })],
          });
        }),
      })
  );

  return new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows],
  });
}

// 4-column test table (step tables)
function testTable(rows) {
  const cw = [500, 2800, 3030, 3030];
  return makeTable(["#", "Action", "Good (Expected)", "Bad (Look For)"], rows, cw);
}

// ── Checklist helper ──────────────────────────────────────────────
function checkItem(t) {
  return new Paragraph({
    spacing: { after: 80 },
    indent: { left: 360 },
    children: [
      text("\u2610  ", { size: 22 }), // empty ballot box
      text(t, { size: 21 }),
    ],
  });
}

// ── Bullet helper ─────────────────────────────────────────────────
function bullet(t, opts = {}) {
  return new Paragraph({
    numbering: { reference: "bullets", level: opts.level ?? 0 },
    spacing: { after: 60 },
    children: [text(t, { size: 21 })],
  });
}
function numberedItem(t, ref = "numbers") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 60 },
    children: [text(t, { size: 21 })],
  });
}

// ── Severity tag as inline bold colored text ──────────────────────
function severityTag(level) {
  const colors = { P0: C.red600, P1: C.amber600, P2: C.stone700, P3: C.stone500 };
  return boldText(`[${level}] `, { color: colors[level] ?? C.stone700, size: 21 });
}

function uxItem(level, desc) {
  return new Paragraph({
    numbering: { reference: "ux-numbers", level: 0 },
    spacing: { after: 60 },
    children: [severityTag(level), text(desc, { size: 21 })],
  });
}

// ── Highlight box ─────────────────────────────────────────────────
function highlightBox(label, content, fillColor = C.amber50) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CONTENT_W, type: WidthType.DXA },
            borders: borders(C.amber500),
            shading: { fill: fillColor, type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 160, right: 160 },
            children: [
              para([boldText(label, { size: 21, color: C.amber600 })], { spacing: { after: 60 } }),
              para([text(content, { size: 20 })], { spacing: { after: 0 } }),
            ],
          }),
        ],
      }),
    ],
  });
}

// Code block (monospace box)
function codeBlock(lines) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CONTENT_W, type: WidthType.DXA },
            borders: borders(C.stone300),
            shading: { fill: C.stone100, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 160, right: 160 },
            children: lines.map((l) =>
              para([text(l, { size: 19, font: "Consolas" })], { spacing: { after: 20 } })
            ),
          }),
        ],
      }),
    ],
  });
}

// ═══════════════════════════════════════════════════════════════════
//                         DOCUMENT CONTENT
// ═══════════════════════════════════════════════════════════════════

const children = [];

// ── Title Page ────────────────────────────────────────────────────
children.push(
  emptyPara(), emptyPara(), emptyPara(), emptyPara(), emptyPara(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [text("COACH OS", { bold: true, size: 56, color: C.stone900 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [text("Manual Testing Plan", { size: 40, color: C.stone700 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [text("All 8 Phases", { size: 32, color: C.amber600 })],
  }),
  emptyPara(), emptyPara(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.amber500, space: 8 } },
    children: [],
  }),
  emptyPara(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [text("Prepared for Jolene Fernandes", { size: 24, color: C.stone700 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [text("April 2026", { size: 24, color: C.stone500 })],
  }),
  emptyPara(), emptyPara(), emptyPara(), emptyPara(), emptyPara(), emptyPara(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [text("Focus: Client Experience & UX Improvement", { size: 22, italics: true, color: C.stone500 })],
  }),
  new Paragraph({ children: [new PageBreak()] }),
);

// ── Context ───────────────────────────────────────────────────────
children.push(
  heading1("Context"),
  para("Coach OS is functionally complete across all 8 build phases, but the user experience needs significant improvement. This testing plan is designed for Jolene (the coach and product owner) to systematically test every flow, identify UX issues, and prioritize fixes."),
  para("The plan is written for a non-developer to follow step-by-step and focuses heavily on the client experience since that is what real clients will use daily."),
  emptyPara(),
);

// ── Severity Rating System ────────────────────────────────────────
children.push(
  heading1("Severity Rating System"),
  para("Tag every issue you find with one of these:"),
  emptyPara(),
  makeTable(
    ["Tag", "Meaning", "When to Fix"],
    [
      [{ text: "P0 CRITICAL", shade: C.red100 }, "App crashes, data lost, or someone cannot do their primary task", "Immediately"],
      [{ text: "P1 HIGH", shade: C.amber100 }, "A major flow is broken or confusing enough that real users will get stuck", "Before any client uses the app"],
      ["P2 MEDIUM", "Works but the experience is rough, slow, or ugly", "Next sprint"],
      ["P3 LOW", "Polish item, nice-to-have", "When you have time"],
    ],
    [1500, 4500, 3360]
  ),
  emptyPara(),
);

// ── Device Testing Matrix ─────────────────────────────────────────
children.push(
  heading1("Device Testing Matrix"),
  para("Test every flow on at least one device from each row:"),
  emptyPara(),
  makeTable(
    ["Device", "Browser", "Why"],
    [
      ["iPhone (any recent)", "Safari", "Primary client device. PWA install target."],
      ["Android phone", "Chrome", "Second most common client device."],
      ["iPad / Android tablet", "Safari or Chrome", "Intake form and plan reading."],
      ["Laptop / Desktop", "Chrome", "Where you (coach) do most work."],
      ["Laptop / Desktop", "Firefox", "Cross-browser check."],
    ],
    [3000, 2500, 3860]
  ),
  emptyPara(),
);

// ── Test Accounts ─────────────────────────────────────────────────
children.push(
  heading1("Test Accounts"),
  emptyPara(),
  codeBlock([
    "Coach:   coach@test.dev / coach123",
    "Rohan:   rohan@test.dev / client123   (ACTIVE, has plan + tracker)",
    "Priya:   priya@test.dev / client123   (INTAKE, incomplete)",
    "Lakshmi: lakshmi@test.dev / client123 (INTAKE, incomplete)",
    "Arjun:   client@test.dev / client123  (INTAKE, incomplete)",
  ]),
  emptyPara(),
);

// ── Cross-Cutting UX Checklist ────────────────────────────────────
children.push(
  heading1("Cross-Cutting UX Checklist"),
  para("Run this after completing EACH phase's tests. It catches issues that span multiple pages."),
  emptyPara(),
  heading3("A. Mobile Responsiveness"),
  checkItem("Every page is usable at 375px width without horizontal scrolling"),
  checkItem("All buttons/tap targets are at least 44x44px"),
  checkItem("Text is readable without zooming (minimum 14px body text)"),
  checkItem("No content is cut off or hidden behind other elements"),
  emptyPara(),
  heading3("B. Accessibility"),
  checkItem("Every icon-only button has a label or tooltip"),
  checkItem("All form fields have visible labels (not just placeholders)"),
  checkItem("You can complete any flow using only keyboard (Tab + Enter)"),
  checkItem("Color is never the ONLY way to communicate status"),
  checkItem("Focus outlines are visible when tabbing"),
  emptyPara(),
  heading3("C. Performance"),
  checkItem("Pages load in under 3 seconds on mobile connection"),
  checkItem('No "Loading..." text stays visible for more than 2 seconds normally'),
  checkItem("Scrolling is smooth on pages with charts"),
  emptyPara(),
  heading3("D. Copy and Tone"),
  checkItem("No em dashes anywhere in client-facing text"),
  checkItem('No guilt language: no "missed", "failed", "behind", "streak broken"'),
  checkItem('Positive framing: "5 of 7 days" not "2 days missed"'),
  checkItem('"Not today" not "skipped"'),
  checkItem('No hollow praise: no "Great job!" or "You\'re crushing it!"'),
  checkItem("Inter font is used everywhere (no fallback fonts visible)"),
  emptyPara(),
  heading3("E. Error Handling"),
  checkItem("Turn off internet, submit a form: clear error appears (not blank screen)"),
  checkItem("Refresh during a save: no data loss"),
  checkItem("Enter garbage into form fields: validation message appears"),
  new Paragraph({ children: [new PageBreak()] }),
);

// ═══════════════════════════════════════════════════════════════════
//                     PHASE 1: Foundation + Intake
// ═══════════════════════════════════════════════════════════════════
children.push(
  heading1("Phase 1: Foundation + Intake"),

  heading2("1.1 Login Flow"),
  para([text("Test as: ", { bold: true, size: 21 }), text("Various accounts", { size: 21 })]),
  emptyPara(),
  testTable([
    ["1", "Open the app (root URL)", "Redirects to /auth/login", "Blank page, error, or wrong page"],
    ["2", 'Click "Sign in" with both fields empty', "Browser validation blocks submission", "Form submits, or nothing happens"],
    ["3", "Enter wrong credentials, click Sign in", '"Invalid email or password" message appears below the form', "Blank screen, console-only error, or no message"],
    ["4", "Enter coach@test.dev / coach123", '"Signing in..." appears on button, then redirected to /coach', "Button stays clickable during loading. Redirects to wrong page"],
    ["5", "Log out (top-right button)", "Back to /auth/login", "Session persists. Can still access /coach"],
    ["6", "Enter rohan@test.dev / client123", "Redirected to /client", "Goes to /coach or errors"],
    ["7", "As Rohan, manually type /coach in URL bar", "Redirected back to /client", "Can see coach dashboard. SECURITY BUG (P0)"],
    ["8", "As Coach, manually type /client in URL bar", "Redirected back to /coach", "Can see client dashboard"],
  ]),
  emptyPara(),
  para([boldText("UX Improvement Opportunities:", { size: 21 })]),
  uxItem("P2", 'Add a "Show password" toggle'),
  uxItem("P2", 'No "forgot password" flow exists'),
  uxItem("P1", "No client registration UI (the API exists but there is no sign-up page)"),
  uxItem("P3", "Add a brand/welcome element to the login page"),
  emptyPara(),

  heading2("1.2 Intake Form"),
  para([text("Test as: ", { bold: true, size: 21 }), text("priya@test.dev (intake incomplete)", { size: 21 })]),
  emptyPara(),
  testTable([
    ["1", 'Click "Start Intake" from dashboard', "Taken to /intake. Sidebar shows sections with completion status.", '"Loading..." forever. Sidebar missing.'],
    ["2", "Check the sidebar", "Section names listed. Completed = checkmark. Current = highlighted. Empty = gray.", "Invisible, wrong order, or no checkmarks"],
    ["3", "MOBILE: Shrink browser to 375px or use phone", "Sidebar collapses or becomes alternate navigation", "KNOWN P1: Sidebar has no responsive breakpoint. Will overlap on mobile."],
    ["4", "Fill in a text field", 'Text appears, section status updates to "partial"', "Does not accept input, status does not change"],
    ["5", "Fill in a number field", "Only digits accepted", "Letters, negatives, or decimals on integer fields accepted"],
    ["6", "Answer a Yes/No question, then toggle it", "Clicking highlights one, clicking the other switches", "Both selected, or neither after toggling"],
    ["7", 'Answer "Yes" to a conditional question', "Follow-up questions appear below", "No follow-ups appear"],
    ["8", "Change conditional from Yes to No to Yes", "Sub-questions hide on No, reappear on Yes with previous values", "KNOWN P2: Conditional questions may not refresh correctly"],
    ["9", "Click Voice button on a textarea", "Browser asks for mic permission. Red dot + timer + Stop button appear.", "Permission does not trigger. No visual recording indicator."],
    ["10", "Record a few seconds, click Stop", '"Transcribing..." spinner. Text appears in textarea after 2-5 seconds.', "Hangs forever. Silent failure. Text does not appear."],
    ["11", "Deny microphone permission, try Voice", "Clear error with guidance on how to fix permissions", 'KNOWN P2: Only shows "Microphone access denied" with no instructions'],
    ["12", 'Click "Continue" at bottom of section', '"Saving..." briefly, then moves to next section. Page scrolls to top.', "Data not saved (verify by going back). No scroll."],
    ["13", "Click a section name in sidebar", "Current section saved first, then jumps to clicked section", "Data lost. Jump fails."],
    ["14", "MOBILE: View GHQ-28 section", "Matrix is scrollable or stacks vertically", "KNOWN P1: Long column headers unusable on phone. Radio buttons too small."],
    ["15", "Complete all questions in a section", "Sidebar checkmark appears for that section", "No checkmark. Triggers with empty required fields."],
    ["16", "Go to last section, click Submit", '"Submit" button (not "Continue"). Completion screen: "You\'re all done!"', "Submit fails. Can submit with empty required sections."],
    ["17", "CRITICAL: Close tab mid-section (after typing, BEFORE clicking Continue). Reopen.", "Should resume where you left off", "KNOWN P1: No unsaved changes warning. Section data lost."],
    ["18", "Check for required field indicators", 'Asterisk or "(required)" on required fields', "KNOWN P2: No indicators exist despite required: true in schema"],
    ["19", "Test metric/imperial toggle", "Toggle appears on measurement fields. Switching converts values.", "Values lost on toggle. Wrong conversions."],
  ]),
  emptyPara(),
  para([boldText("Priority UX Fixes:", { size: 21 })]),
  uxItem("P1", "Responsive mobile layout for sidebar"),
  uxItem("P1", "Auto-save on timer (every 30s) or on field blur"),
  uxItem("P1", '"You have unsaved changes" warning on navigation'),
  uxItem("P2", "Asterisks on required fields"),
  uxItem("P2", "Form validation blocking submission with empty required fields"),
  uxItem("P2", "Redesign GHQ-28 for mobile (stack vertically)"),
  uxItem("P2", "Progress bar at top showing overall completion"),
  uxItem("P3", 'Time estimate ("About 5 minutes remaining")'),
  new Paragraph({ children: [new PageBreak()] }),
);

// ═══════════════════════════════════════════════════════════════════
//                     PHASE 2: Plan Generation
// ═══════════════════════════════════════════════════════════════════
children.push(
  heading1("Phase 2: Plan Generation"),
  para([text("Test as: ", { bold: true, size: 21 }), text("coach@test.dev", { size: 21 })]),
  emptyPara(),

  heading2("2.1 Coach Dashboard"),
  testTable([
    ["1", "After login, arrive at /coach", '"Your Clients" heading with cards showing name, email, status badge', "Empty page despite clients existing"],
    ["2", "Check status badges", "ACTIVE = green badge, INTAKE = amber badge", "DESIGN NOTE [P3]: Uses green outside stone/amber palette."],
    ["3", "Click a client card", "Taken to /coach/clients/[id]", "404 or wrong client data"],
  ]),
  emptyPara(),

  heading2("2.2 Client Detail Page"),
  testTable([
    ["1", "Check header", 'Client name, "Back to Clients" link, status badge, logout', "Missing elements, wrong name"],
    ["2", "Check computed metrics cards (BMI, WHR, Weight, Stress)", "Cards show computed values. Missing data = card hidden.", '"NaN", "undefined", or wrong calculations'],
    ["3", "Expand/collapse intake sections", "Click heading to toggle. Data shown as label/value pairs.", 'Sections do not collapse. "[object Object]" in values.'],
    ["4", 'Check "This week" check-in grid', "7-day grid shows which days client checked in", "Wrong week. Misaligned."],
    ["5", "Check Plan Action Bar", "Correct state based on plan existence. Buttons link correctly.", "Wrong state shown. Broken links."],
  ]),
  emptyPara(),

  heading2("2.3 Plan Builder"),
  testTable([
    ["1", 'Click "Create Plan"', "Plan builder loads with client name, Red Flags, Computed Metrics, Intake Summary area, 7 decision sections", 'KNOWN P2: "Loading..." text on blank page. No skeleton.'],
    ["2", 'Click "Generate Summary"', '"Generating..." on button. Summary appears after a few seconds. Red flags shown with colored badges.', "KNOWN P2: No progress indicator. No spinner. Waits indefinitely if Groq is slow."],
    ["3", "Check red flag auto-population", "Red flags auto-fill Referrals and Supplements fields", "Overwrites manual entries. Does not populate at all."],
    ["4", "Fill in all decision fields", "All fields accept input. Add/remove rows work for supplements, referrals, habits.", "Fields do not save. Adding rows fails."],
    ["5", 'Click "Save Draft"', '"Saving..." then returns to "Save Draft"', "No confirmation. Error only in console."],
    ["6", 'Click "Generate Plan"', "Saves decisions first. Shows terminal command to run + link to review.", "Error. Nothing happens."],
    ["7", "CRITICAL: Navigate away after filling decisions but BEFORE saving", "", "KNOWN P1: No unsaved changes warning. All decisions lost."],
  ]),
  emptyPara(),

  heading2("2.4 Plan Review and Approval"),
  testTable([
    ["1", "Navigate to plan review page", 'Sections shown in order as cards. Formatted content. "Edit" button per section. "Approve" button in header.', '"Loading plan..." forever. Empty sections.'],
    ["2", 'Click "Edit" on a section', 'Content becomes editable textarea. "Save" and "Cancel" appear.', "Content disappears."],
    ["3", "Edit and click Save", '"Saving..." then updated content shown', "Silent failure. Content reverts."],
    ["4", 'Click "Approve Plan"', "", "KNOWN P0: NO confirmation dialog. Immediately approves. Creates tracker. Makes plan visible. IRREVERSIBLE."],
    ["5", "After approving, check page state", 'Read-only. "APPROVED" badge. No edit/approve buttons.', "Edit buttons still visible."],
  ]),
  emptyPara(),
  highlightBox(
    "P0 CRITICAL ISSUE",
    "There is no confirmation dialog before plan approval. This is an irreversible action that creates the tracker template and makes the plan visible to the client. A confirmation modal must be added.",
    C.red100
  ),
  emptyPara(),
  para([boldText("Priority UX Fixes:", { size: 21 })]),
  uxItem("P0", "Confirmation dialog before plan approval"),
  uxItem("P1", "Unsaved changes warning on plan builder"),
  uxItem("P2", 'Loading skeletons instead of "Loading..." text'),
  uxItem("P2", "Spinner/progress bar for AI generation"),
  uxItem("P3", '"Preview as client" button'),
  new Paragraph({ children: [new PageBreak()] }),
);

// ═══════════════════════════════════════════════════════════════════
//                  PHASE 3: Tracker + Daily Check-ins
// ═══════════════════════════════════════════════════════════════════
children.push(
  heading1("Phase 3: Tracker + Daily Check-ins"),
  para([text("Test as: ", { bold: true, size: 21 }), text("rohan@test.dev (active client with plan)", { size: 21 })]),
  emptyPara(),

  heading2("3.1 Client Dashboard - Today Tab"),
  testTable([
    ["1", "After login, arrive at /client", "Dashboard with tabs: Today (active), Progress, Reviews, Plan", "KNOWN P2: Amber spinner while loading. No skeleton."],
    ["2", "Check-in card (NOT checked in today)", 'Amber "Check in" button prominent. "Takes about 90 seconds." 7 dots. "X of 7 days this week."', "Wrong count. Missing dots. Button not visible."],
    ["3", "Check-in card (ALREADY checked in today)", 'Checkmark + "You\'ve checked in today" with "View or edit" link', 'Still shows "Check in" button'],
    ["4", "PAR Cycle Indicator", "4 dots: Plan, Act, Record, Reassess. Amber if applicable.", "Wrong states. Labels cut off."],
    ["5", "Week at a Glance", "7 circles (Mon-Sun). Amber = checked in, gray = not. Day initials above.", "Wrong days. Today not highlighted."],
  ]),
  emptyPara(),

  heading2("3.2 Daily Check-In Flow"),
  testTable([
    ["1", 'Click "Check in"', 'Taken to /client/checkin. "How was your day?" + today\'s date.', 'KNOWN P2: "Loading..." on blank page.'],
    ["2", "Look at Habits section", 'Large tappable cards with circular indicators. "Tap to respond" initially.', "Habits missing. Wrong habits."],
    ["3", "Tap a habit card once", 'Amber checkmark, status = "Yes"', "Nothing happens. Two taps needed."],
    ["4", "Tap again", 'Status = "Partly" (half-filled circle)', 'Skips to "Not today"'],
    ["5", "Tap again", 'Status = "Not today" (NOT "Skipped")', 'Shows "Skipped" -- violates design philosophy'],
    ["6", "Tap again", 'Back to "Tap to respond" (unanswered)', 'Stuck on "Not today"'],
    ["7", "Check graduated habits", "Habits on twice-weekly/weekly frequency only appear on scheduled days", "All habits appear every day regardless"],
    ["8", "Fill in a number metric", "Number input with unit label", "Accepts text/negatives. No unit label."],
    ["9", "Fill in a select metric", "Buttons for each option. Tapping highlights in amber.", "Multiple selected. Selection does not register."],
    ["10", "Fill in meal logging (if present)", 'Text input. Placeholder: "Skip if you\'d rather not log this one"', "Missing or wrong placeholder"],
    ["11", "Find Reflection section", "Textarea with rotating prompt. Voice button. Placeholder about it being optional.", "Same prompt every day. Voice missing."],
    ["12", "Record a voice reflection", "Same as intake voice: Record > Stop > Transcribe > Text appears", "Silent failure. Error with no guidance."],
    ["13", 'Click "Save"', '"Saving..." then "Saved. See you tomorrow." and "You can edit this check-in anytime today."', "Error. Nothing happens. Data lost."],
    ["14", "TIME THIS: From opening check-in to saving (4-5 habits + nothing else)", "Under 2 minutes", "Over 2 minutes = too many fields or too slow"],
    ["15", 'Check "This week" section below', "7 day dots. Today = amber. Tap past day to expand and see summary.", "Today not updated. Past expansion fails."],
    ["16", "Edit today's check-in", "Page pre-populates with saved responses. Saving updates (not duplicates).", "Empty form. Duplicate created."],
    ["17", "MOBILE: Test entire check-in flow on phone", "Cards full-width. Large tap targets. Smooth scroll.", "Cards too small. Need zoom. Horizontal scroll."],
  ]),
  emptyPara(),
  para([boldText("Priority UX Fixes:", { size: 21 })]),
  uxItem("P1", 'Unsaved changes warning when tapping "Back" without saving'),
  uxItem("P2", 'Loading skeletons instead of "Loading..."'),
  uxItem("P2", "Toast notification on successful save"),
  uxItem("P3", "Haptic feedback on habit taps (PWA)"),
  uxItem("P3", "Undo after accidental habit tap"),
  new Paragraph({ children: [new PageBreak()] }),
);

// ═══════════════════════════════════════════════════════════════════
//                   PHASE 4: Weekly Review + RAG
// ═══════════════════════════════════════════════════════════════════
children.push(
  heading1("Phase 4: Weekly Review + RAG"),

  heading2("4.1 Coach: Generating a Review"),
  para([text("Test as: ", { bold: true, size: 21 }), text("coach@test.dev. Navigate to a client with check-ins this week.", { size: 21 })]),
  emptyPara(),
  testTable([
    ["1", "Find Weekly Review section on client detail", '"Generate This Week\'s Review" button if check-ins exist. "No check-ins this week yet" if none.', "Button appears with no check-ins"],
    ["2", 'Click "Generate This Week\'s Review"', '"Generating..." on button. Review card appears with 3 sections. Status: "Ready for review".', "KNOWN P2: No progress indicator. 30-60 second wait with no spinner."],
    ["3", "Read the generated content", "Warm tone. No em dashes. No guilt language. No hollow praise. Claims are factually accurate.", 'Em dashes (AI may produce them). "Great job!". Wrong facts.'],
    ["4", 'Click "Edit before approving"', 'Content becomes editable textareas. "Your note to the client" textarea appears.', "Content disappears."],
    ["5", 'Edit and click "Approve"', '"Approving..." then status = "Approved". "Deliver to Client" button appears.', "Fails. Status does not change."],
    ["6", 'Click "Deliver to Client"', '"Delivering..." then status = "Delivered". Action buttons disappear.', "Fails. Client sees review before delivery."],
    ["7", "Check Tracker Suggestions", 'If graduation suggestions exist, cards with "Graduate" / "Resume daily" + Apply/Dismiss', '"Apply" does nothing.'],
  ]),
  emptyPara(),

  heading2("4.2 Client: Reading a Review"),
  para([text("Test as: ", { bold: true, size: 21 }), text("rohan@test.dev", { size: 21 })]),
  emptyPara(),
  testTable([
    ["1", 'Go to "Reviews" tab on dashboard', 'If delivered, card with week range + snippet + "Read Full Review". If none: "Your coach will share your first weekly review soon."', "Review visible before delivery = P0 trust violation"],
    ["2", 'Click "Read Full Review"', "Full 3-section review on /client/review. Emoji icons, coach note, week label.", "Empty. Out of order. Coach note missing."],
    ["3", "Check previous reviews list", "Past delivered reviews listed with dates", "Non-delivered reviews visible to client = P0"],
  ]),
  new Paragraph({ children: [new PageBreak()] }),
);

// ═══════════════════════════════════════════════════════════════════
//                    PHASE 5: Client Dashboard
// ═══════════════════════════════════════════════════════════════════
children.push(
  heading1("Phase 5: Client Dashboard"),
  para([text("Test as: ", { bold: true, size: 21 }), text("rohan@test.dev", { size: 21 })]),
  emptyPara(),

  heading2("5.1 Tab Navigation"),
  testTable([
    ["1", "Check tab bar", "4 tabs: Today, Progress, Reviews, Plan. Active = stone-900 + amber underline. Inactive = stone-400.", "Tabs cut off on mobile. Active state broken."],
    ["2", "If dashboard mode is MINIMAL", "Only Today, Reviews, Plan tabs (no Progress)", "All 4 tabs show in MINIMAL mode"],
    ["3", "Click each tab", "Content changes. No full page reload.", "Content does not change. Loading spinner on every switch."],
  ]),
  emptyPara(),

  heading2("5.2 Progress Tab"),
  testTable([
    ["1", 'Click "Progress" tab', 'Shows "Your habits" section + "Trends" charts', '"Keep checking in..." message despite data existing'],
    ["2", "Check Habit Progress", 'Each habit: label, frequency badge, 4-week adherence bar. Graduated = "Graduated [date]"', "Wrong frequencies. Bars do not render."],
    ["3", "Check Trend Charts", "Line charts for metrics. Amber line, stone grid. Tooltip on hover.", "KNOWN P2: Charts fixed at 120px height. Cramped on mobile."],
    ["4", "MOBILE: View Progress tab on phone", "Charts stack single column. Readable. Tooltips work on tap.", "Overlap. Unreadable axis labels."],
  ]),
  emptyPara(),

  heading2("5.3 Plan Tab"),
  testTable([
    ["1", 'Click "Plan" tab', 'Card with "View Full Plan" button', "Button goes nowhere"],
    ["2", 'Click "View Full Plan"', "/client/plan shows all sections as expandable cards. Formatted content.", 'Raw markdown. Out of order. "Loading your plan..." forever.'],
  ]),
  new Paragraph({ children: [new PageBreak()] }),
);

// ═══════════════════════════════════════════════════════════════════
//                      PHASE 6: Voice Input
// ═══════════════════════════════════════════════════════════════════
children.push(
  heading1("Phase 6: Voice Input"),
  para([boldText("Test on BOTH the intake form and the check-in page.", { size: 21 })]),
  emptyPara(),
  testTable([
    ["1", "Find Voice button", 'Microphone icon + "Voice" text near textarea', "Missing. Too small on mobile."],
    ["2", "Click Voice in Chrome/Edge/Firefox", "Mic permission prompt. After granting: red dot, timer, Stop button.", "No prompt. Recording starts without permission."],
    ["3", "Click Voice in Safari on iOS", "Should work (iOS 14.3+). If not, clear error.", "KNOWN P2: May fail silently on some iOS versions"],
    ["4", "Record 60 seconds (default max)", "Auto-stops at 60s. Transcription begins.", "Timer keeps going. No auto-stop."],
    ["5", "Record 2 seconds", "Transcription works for short clips", "Error for short recordings with no message"],
    ["6", "Record multiple entries in same field", "Each transcription appended with space separator", "Previous text overwritten. Words run together."],
    ["7", "Test offline / slow connection", "Clear error message", 'KNOWN P2: Generic "Failed to transcribe" for all failure types'],
  ]),
  emptyPara(),
  para([boldText("Priority UX Fixes:", { size: 21 })]),
  uxItem("P1", "Specific error messages per failure mode (no mic, permission denied, network, API)"),
  uxItem("P2", "Visual audio waveform during recording"),
  uxItem("P2", '"Your browser does not support voice recording" message on unsupported browsers'),
  uxItem("P3", "Playback before accepting transcription"),
  new Paragraph({ children: [new PageBreak()] }),
);

// ═══════════════════════════════════════════════════════════════════
//               PHASE 7: Wearable Integration (Scaffolded)
// ═══════════════════════════════════════════════════════════════════
children.push(
  heading1("Phase 7: Wearable Integration (Scaffolded)"),
  para("This phase is NOT functional yet. Test only that it does not break anything."),
  emptyPara(),
  testTable([
    ["1", "Check all UI pages for wearable buttons", 'No "Connect Fitbit/Google Fit" buttons visible anywhere', "Wearable button appears and leads to error"],
    ["2", "Manually navigate to /api/wearables/connect?provider=fitbit", "JSON error response (missing credentials)", "Server crashes. 500 with no message."],
  ]),
  emptyPara(),
  uxItem("P3", 'Consider a "Coming soon" placeholder card for wearables'),
  new Paragraph({ children: [new PageBreak()] }),
);

// ═══════════════════════════════════════════════════════════════════
//                    PHASE 8: Polish + Security
// ═══════════════════════════════════════════════════════════════════
children.push(
  heading1("Phase 8: Polish + Security"),

  heading2("8.1 PWA Installation"),
  testTable([
    ["1", 'Chrome on Android: look for "Add to Home Screen"', "Install prompt available. After install, opens in standalone mode.", "No install prompt. Opens in browser tab."],
    ["2", 'Safari on iOS: Share > "Add to Home Screen"', "Coach OS icon on home screen. Opens standalone.", "Default Safari icon. Opens in Safari."],
    ["3", "Check PWA icons", "192x192 and 512x512 icons look correct", "Missing, blurry, or default Next.js icon"],
    ["4", "Turn off WiFi/data, open app", "App shell loads from cache. Offline message shown. API calls fail gracefully.", "Blank white page. Unstyled plain text."],
  ]),
  emptyPara(),

  heading2("8.2 Security"),
  testTable([
    ["1", "Check response headers (DevTools > Network)", "Strict-Transport-Security, X-Content-Type-Options: nosniff, X-Frame-Options: DENY", "Headers missing"],
    ["2", "As client, try accessing another client's data via API URL", "401 or 403 error. Never returns other client's data.", "Returns other client's data = P0 SECURITY BUG"],
    ["3", "As coach, try accessing client not assigned to you", "403 or redirect to /coach", "Shows other coach's client = P0 SECURITY BUG"],
  ]),
  emptyPara(),

  heading2("8.3 Error Handling"),
  testTable([
    ["1", "Open DevTools Console, navigate the entire app", "No red errors during normal use", "KNOWN P2: Console errors invisible to user. No toast system."],
    ["2", "Throttle to Slow 3G, navigate pages", "Pages load slowly but with loading states. Content eventually appears.", "Blank pages. No loading indication."],
    ["3", "Set network to Offline, submit a form", "Error message appears on screen", "KNOWN P1: Most pages log errors to console only. No user-facing feedback."],
  ]),
  new Paragraph({ children: [new PageBreak()] }),
);

// ═══════════════════════════════════════════════════════════════════
//                   FULL USER JOURNEY TEST
// ═══════════════════════════════════════════════════════════════════
children.push(
  heading1("Full User Journey Test (Most Important)"),
  highlightBox(
    "Why this matters",
    "This test simulates the complete lifecycle from the client's perspective. It is the single most important test in this entire document. If this journey feels broken, confusing, or slow, the product is not ready for real clients."
  ),
  emptyPara(),
  para([text("Test as: ", { bold: true, size: 21 }), text("priya@test.dev (intake incomplete)", { size: 21 })]),
  emptyPara(),
  numberedItem("Log in as Priya. See Welcome screen. Click \"Start Intake\"."),
  numberedItem("Complete all intake sections. Submit."),
  numberedItem("Log out. Log in as coach (coach@test.dev)."),
  numberedItem("Find Priya in client list. Status should say \"Intake Complete\"."),
  numberedItem("Click into Priya. Click \"Create Plan\"."),
  numberedItem("Generate intake summary. Review red flags."),
  numberedItem("Fill in coach decisions. Save. Generate plan."),
  numberedItem("(Run plan generation script in terminal.)"),
  numberedItem("Navigate to Plan Review. Review sections. Approve."),
  numberedItem("Log out. Log in as Priya."),
  numberedItem("Dashboard shows full tab layout with \"Check in\" button."),
  numberedItem("Do a daily check-in. Answer habits, fill metric, write reflection."),
  numberedItem("Save. See \"Saved. See you tomorrow.\""),
  numberedItem("Dashboard \"Today\" tab: \"You've checked in today\"."),
  numberedItem("(Repeat check-ins for a few days if possible.)"),
  numberedItem("Log in as coach. Generate weekly review for Priya."),
  numberedItem("Review. Edit if needed. Approve. Deliver."),
  numberedItem("Log in as Priya. \"Reviews\" tab. Read review."),
  emptyPara(),
  para([boldText("At every step, note:", { size: 21 })]),
  checkItem("How long it took"),
  checkItem("Whether you felt confused about what to do next"),
  checkItem("Whether any error messages appeared"),
  checkItem("Whether the mobile experience was usable"),
  checkItem("Whether all text felt warm and non-judgmental"),
  new Paragraph({ children: [new PageBreak()] }),
);

// ═══════════════════════════════════════════════════════════════════
//                    ISSUE LOGGING TEMPLATE
// ═══════════════════════════════════════════════════════════════════
children.push(
  heading1("Issue Logging Template"),
  para("When you find an issue during testing, record it like this:"),
  emptyPara(),
  codeBlock([
    "ISSUE: [Short description]",
    "SEVERITY: P0 / P1 / P2 / P3",
    "PHASE: 1-8 or Cross-cutting",
    "PAGE: /path/to/page",
    "DEVICE: [Phone/Tablet/Desktop] + [Browser]",
    "STEPS TO REPRODUCE:",
    "1. ...",
    "2. ...",
    "3. ...",
    "EXPECTED: What should happen",
    "ACTUAL: What actually happens",
    "SCREENSHOT: [Attach if possible]",
  ]),
  new Paragraph({ children: [new PageBreak()] }),
);

// ═══════════════════════════════════════════════════════════════════
//                  KNOWN ISSUES SUMMARY
// ═══════════════════════════════════════════════════════════════════
children.push(
  heading1("Known Issues Summary"),
  emptyPara(),

  heading2("P0 Critical"),
  bullet("No confirmation dialog before plan approval (irreversible action)"),
  emptyPara(),

  heading2("P1 High"),
  bullet("Intake sidebar broken on mobile (no responsive breakpoint)"),
  bullet("GHQ-28 matrix unusable on mobile phones"),
  bullet("No unsaved changes warning on intake or plan builder"),
  bullet("No error boundaries (component crash kills entire page)"),
  bullet("Silent failures on most API calls (errors only in console)"),
  bullet("No client registration UI"),
  emptyPara(),

  heading2("P2 Medium"),
  bullet('"Loading..." text instead of skeletons on all pages'),
  bullet("No progress indicator for AI generation (30-60 second waits)"),
  bullet("No toast notification system"),
  bullet("No required field indicators on intake form"),
  bullet("No input validation feedback"),
  bullet("Voice recording error messages too generic"),
  bullet("Charts fixed at 120px height (cramped on mobile)"),
  bullet("Conditional questions may not refresh on parent change"),
  bullet("Missing ARIA labels on icon buttons"),
  bullet("No skip navigation links"),
  emptyPara(),

  heading2("P3 Low"),
  bullet("No keyboard shortcut documentation"),
  bullet("No breadcrumb navigation"),
  bullet('No "forgot password" flow'),
  bullet("Past reviews not individually viewable"),
  bullet('"Preview as client" for coach'),
  bullet("Service worker offline page is unstyled plain text"),
  new Paragraph({ children: [new PageBreak()] }),
);

// ═══════════════════════════════════════════════════════════════════
//                 CRITICAL FILES FOR FIXES
// ═══════════════════════════════════════════════════════════════════
children.push(
  heading1("Critical Files for Fixes"),
  para("When issues are found, these are the files that need to change:"),
  emptyPara(),
  makeTable(
    ["File", "What Needs Fixing"],
    [
      ["src/app/intake/page.tsx", "Mobile sidebar, auto-save, unsaved warning, required indicators"],
      ["src/app/client/checkin/page.tsx", "Loading skeletons, error boundaries, unsaved warning"],
      ["src/app/coach/clients/[id]/plan/review/page.tsx", "Confirmation dialog before approve"],
      ["src/components/dashboard/ClientDashboard.tsx", "Loading skeletons, error boundaries"],
      ["src/app/layout.tsx", "Global error boundary, toast notification provider"],
      ["src/components/VoiceRecorder.tsx", "Specific error messages per failure mode"],
    ],
    [4000, 5360]
  ),
  emptyPara(), emptyPara(),

  heading1("Verification"),
  para("After implementing fixes, re-run:"),
  emptyPara(),
  numberedItem("The Full User Journey Test end-to-end"),
  numberedItem("The Cross-Cutting UX Checklist on every page"),
  numberedItem("Mobile testing on at least iPhone Safari and Android Chrome"),
  numberedItem("The error handling tests (offline, slow network, bad input)"),
);

// ═══════════════════════════════════════════════════════════════════
//                      BUILD DOCUMENT
// ═══════════════════════════════════════════════════════════════════
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: FONT, size: 22 }, // 11pt
      },
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: FONT, color: C.stone900 },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: FONT, color: C.stone900 },
        paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: FONT, color: C.stone700 },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "ux-numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: PAGE_W, height: PAGE_H },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: C.stone300, space: 4 } },
              children: [
                text("Coach OS ", { size: 18, bold: true, color: C.stone500 }),
                text("Testing Plan", { size: 18, color: C.stone500 }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              border: { top: { style: BorderStyle.SINGLE, size: 2, color: C.stone300, space: 4 } },
              tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
              children: [
                text("April 2026", { size: 16, color: C.stone500 }),
                new TextRun({ children: ["\t"], font: FONT }),
                text("Page ", { size: 16, color: C.stone500 }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: C.stone500 }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync("D:\\Claude Code Projects\\Coach OS\\coach-os\\docs\\Coach-OS-Testing-Plan.docx", buffer);
console.log("Document created: Coach-OS-Testing-Plan.docx");
