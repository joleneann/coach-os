const docx = require("docx");
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, LevelFormat, BorderStyle, PageBreak,
} = docx;

const p = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: 160, ...opts.spacing },
    ...opts,
    children: Array.isArray(text) ? text : [new TextRun(text)],
  });

const bold = (b, rest) => [new TextRun({ text: b, bold: true }), new TextRun(rest)];

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Inter", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Inter", color: "1C1917" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Inter", color: "292524" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 },
      },
    ],
  },
  numbering: {
    config: [
      { reference: "b1", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "b2", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "b3", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "b4", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "b5", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "b6", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "n1", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    children: [
      // TITLE PAGE
      new Paragraph({ spacing: { before: 3600 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 200 },
        children: [new TextRun({ text: "Coach OS", size: 56, bold: true, font: "Inter", color: "1C1917" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 400 },
        children: [new TextRun({ text: "Learning Guide", size: 36, font: "Inter", color: "78716C" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 200 },
        children: [new TextRun({ text: "Understanding what we\u2019re building and how it works", size: 22, italics: true, color: "78716C" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { before: 1200 },
        children: [new TextRun({ text: "Last updated: April 2026 \u2014 Phase 1 Complete", size: 20, color: "A8A29E" })],
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // SECTION 1
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. What is Coach OS?")] }),
      p("Coach OS is software that replaces the spreadsheets, PDFs, and WhatsApp messages you currently use to run your coaching practice. Instead of sending clients an Excel file with 10 tabs and 1,000 rows, they fill out a clean web form. Instead of spending 8\u201310 hours manually writing a plan, the system helps you draft one in a fraction of the time. Instead of tracking client progress across scattered messages, everything lives in one place."),
      p("It solves three specific problems:"),
      new Paragraph({ numbering: { reference: "n1", level: 0 }, spacing: { after: 80 }, children: bold("Intake drop-off. ", "Clients find the Excel assessment overwhelming and either rush through it or abandon it halfway.") }),
      new Paragraph({ numbering: { reference: "n1", level: 0 }, spacing: { after: 80 }, children: bold("Plan creation time. ", "Synthesizing all that intake data into a personalized 35-page plan takes you 8\u201310+ hours per client.") }),
      new Paragraph({ numbering: { reference: "n1", level: 0 }, spacing: { after: 160 }, children: bold("Weekly review fatigue. ", "Reviewing tracker data and writing personalized weekly feedback for each client is valuable but operationally draining.") }),
      p("Coach OS is not trying to replace you as a coach. It\u2019s trying to give you better infrastructure so you can focus on the clinical judgment, the relationship, and the human parts of coaching \u2014 not the admin."),
      new Paragraph({ children: [new PageBreak()] }),

      // SECTION 2: DESIGN PHILOSOPHY
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. The Design Philosophy \u2014 Why Coach OS Feels Different")] }),
      p("Before we started building anything, we watched a video essay called \u201CLooksmaxxing Capitalism.\u201D The argument is this: when traditional paths to self-improvement collapse \u2014 education, careers, class mobility \u2014 the body becomes the last investable asset. People turn inward and start treating themselves like a balance sheet. Wellness becomes a vice when it turns your entire life into a KPI dashboard managed by what the video calls \u201Ca management consultant, who are some of the biggest losers in the world.\u201D"),
      p("The video makes an inversion that stuck with us: actual vices \u2014 going out, socializing, unoptimized experiences \u2014 do more for your self-improvement and genuine wellbeing than obsessive self-monitoring ever could."),
      p("This matters for Coach OS because a coaching app could easily become the very thing it\u2019s trying to heal. So we set five design rules:"),
      new Paragraph({ numbering: { reference: "b1", level: 0 }, spacing: { after: 100 }, children: bold("The client experience should feel human. ", "Daily check-ins should feel like texting your coach, not submitting a performance report. No red/green color coding. No guilt-inducing \u201Cyou missed 3 days\u201D banners.") }),
      new Paragraph({ numbering: { reference: "b1", level: 0 }, spacing: { after: 100 }, children: bold("The coach stays in control. ", "AI can draft and summarize. The coach makes every clinical decision and approves every client-facing output. The client should always feel they\u2019re hearing from their coach, not from software.") }),
      new Paragraph({ numbering: { reference: "b1", level: 0 }, spacing: { after: 100 }, children: bold("Progress is broader than metrics. ", "Behavioral wins matter alongside weight and macros. \u201CYou\u2019ve been consistent for 3 weeks\u201D is as important as \u201Cyou lost 0.5kg.\u201D") }),
      new Paragraph({ numbering: { reference: "b1", level: 0 }, spacing: { after: 100 }, children: bold("The system knows when not to intervene. ", "A missed check-in is a data point, not a failure. If a client goes quiet, the system tells the coach \u2014 it doesn\u2019t bombard the client with automated guilt.") }),
      new Paragraph({ numbering: { reference: "b1", level: 0 }, spacing: { after: 160 }, children: bold("Dashboard intensity is a clinical choice. ", "Some clients benefit from seeing all their data. Others would be harmed by it \u2014 especially those with obsessive or addictive tendencies. The coach chooses the dashboard mode per client. That\u2019s not a UX preference; it\u2019s a clinical judgment call.") }),
      p("These five rules inform every screen, every notification, and every feature we build. If something feels like surveillance instead of care, we redesign it."),
      new Paragraph({ children: [new PageBreak()] }),

      // SECTION 3: TOOLS
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. The Tools We\u2019re Using (and Why)")] }),
      p("You don\u2019t need to understand these deeply, but knowing what each tool does will help you talk about the project confidently. Think of these as the ingredients in a recipe \u2014 you don\u2019t need to grow the wheat, but it helps to know what flour does."),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Next.js \u2014 The Framework")] }),
      p("Next.js is the engine that runs the website. It handles showing pages to users, processing form submissions, and talking to the database. Think of it like the kitchen in a restaurant \u2014 clients see the menu and the food (the website), but Next.js is the kitchen where everything gets prepared."),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("PostgreSQL + Supabase \u2014 The Database")] }),
      p("The database is where all client data lives \u2014 intake responses, plans, check-ins, everything. PostgreSQL is the database software (like Excel, but much more powerful and designed for applications). Supabase is a company that hosts your database in the cloud for free. You created a Supabase project called \u201CCoach OS\u201D \u2014 that\u2019s where all the data is stored."),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Prisma \u2014 The Database Translator")] }),
      p("When the app needs to read or write data, it uses Prisma instead of raw database commands. Prisma lets you write readable code and catches mistakes before they happen. The schema.prisma file defines every table and column in the database \u2014 it\u2019s the blueprint."),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("NextAuth.js \u2014 Login & Security")] }),
      p("This handles logging in. Passwords are encrypted using bcrypt (even if someone accessed the database, they\u2019d see scrambled text). When you log in, a secure token is stored in your browser like a wristband at an event. The middleware checks it on every page load to verify who you are and what you\u2019re allowed to see."),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Tailwind CSS \u2014 The Styling")] }),
      p("CSS controls how websites look. Tailwind is a shortcut system \u2014 instead of writing separate style files, you add classes directly to elements. When you see \u201Ctext-sm text-stone-500\u201D in the code, that means \u201Csmall text, stone-gray color.\u201D The stone palette gives Coach OS its warm, non-clinical feel."),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("TypeScript \u2014 Safer JavaScript")] }),
      p("JavaScript makes websites interactive. TypeScript adds guardrails \u2014 it forces you to declare what type of data everything is, so bugs get caught before they reach users. Every .tsx file in the project is TypeScript."),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Git & GitHub \u2014 Version Control")] }),
      p("Git tracks every change ever made to the code, like Google Docs version history but for an entire codebase. GitHub (github.com/joleneann/coach-os) is where the code lives online. Anyone can see the code, the history, and the README."),
      new Paragraph({ children: [new PageBreak()] }),

      // SECTION 4: WHAT WE'VE BUILT
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. What We\u2019ve Built So Far \u2014 Phase 1")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("The Login System")] }),
      p("Every user has an account with an email and password. Passwords are hashed (scrambled) so even database access wouldn\u2019t reveal them. Two test accounts exist:"),
      new Paragraph({ numbering: { reference: "b2", level: 0 }, spacing: { after: 80 }, children: bold("Coach: ", "coach@test.dev / coach123") }),
      new Paragraph({ numbering: { reference: "b2", level: 0 }, spacing: { after: 160 }, children: bold("Client: ", "client@test.dev / client123") }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("The Intake Form")] }),
      p("Replaces the 10-sheet Excel. 127 questions defined in intake-schema.ts, each with a type (text, yes/no, dropdown, scale) and optional conditions. Conditional branching hides irrelevant questions \u2014 a client who answers \u201CNo\u201D to \u201CDo you exercise?\u201D never sees the follow-ups. Save and resume works automatically. The progress bar shows \u201CSection 4 of 10\u201D throughout."),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("The Coach Dashboard")] }),
      p("Shows your client list with intake status. Click a client to see their responses in collapsible panels. Auto-calculates BMI and waist-hip ratio from intake data."),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("The Intake Streamlining")] }),
      p("We merged exercise history into \u201CHabits & Lifestyle\u201D (past \u2192 present flow), moved food preferences out of the Food Record, and added yes/no gates before detail questions. Total: 127 questions in the schema, but a healthy client sees about 103."),
      new Paragraph({ children: [new PageBreak()] }),

      // SECTION 5: HOW PIECES CONNECT
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. How the Pieces Connect")] }),
      p("Here\u2019s the full flow, step by step:"),
      new Paragraph({ numbering: { reference: "b3", level: 0 }, spacing: { after: 80 }, children: [new TextRun("Someone opens the website")] }),
      new Paragraph({ numbering: { reference: "b3", level: 0 }, spacing: { after: 80 }, children: [new TextRun("Middleware checks: are they logged in?")] }),
      new Paragraph({ numbering: { reference: "b3", level: 0 }, spacing: { after: 80 }, children: [new TextRun("Not logged in \u2192 redirect to login")] }),
      new Paragraph({ numbering: { reference: "b3", level: 0 }, spacing: { after: 80 }, children: [new TextRun("Logged in as coach \u2192 coach dashboard (client list)")] }),
      new Paragraph({ numbering: { reference: "b3", level: 0 }, spacing: { after: 80 }, children: [new TextRun("Logged in as client \u2192 client dashboard (\u201CStart Intake\u201D button)")] }),
      new Paragraph({ numbering: { reference: "b3", level: 0 }, spacing: { after: 80 }, children: [new TextRun("Client clicks Start Intake \u2192 form loads from intake-schema.ts")] }),
      new Paragraph({ numbering: { reference: "b3", level: 0 }, spacing: { after: 80 }, children: [new TextRun("Each section saved to database via the API")] }),
      new Paragraph({ numbering: { reference: "b3", level: 0 }, spacing: { after: 160 }, children: [new TextRun("Coach clicks client name \u2192 sees all responses in collapsible sections")] }),
      new Paragraph({ children: [new PageBreak()] }),

      // SECTION 6: KEY FILES
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. Key Files and What They Do")] }),
      p("Every file has a job. Here are the important ones:"),
      new Paragraph({ numbering: { reference: "b4", level: 0 }, spacing: { after: 100 }, children: [new TextRun({ text: "prisma/schema.prisma", bold: true, font: "Consolas", size: 20 }), new TextRun(" \u2014 Defines every database table and its columns")] }),
      new Paragraph({ numbering: { reference: "b4", level: 0 }, spacing: { after: 100 }, children: [new TextRun({ text: "src/lib/intake-schema.ts", bold: true, font: "Consolas", size: 20 }), new TextRun(" \u2014 All 127 intake questions, types, conditions, voice flags")] }),
      new Paragraph({ numbering: { reference: "b4", level: 0 }, spacing: { after: 100 }, children: [new TextRun({ text: "src/lib/auth.ts", bold: true, font: "Consolas", size: 20 }), new TextRun(" \u2014 Login, sessions, and role-based access")] }),
      new Paragraph({ numbering: { reference: "b4", level: 0 }, spacing: { after: 100 }, children: [new TextRun({ text: "src/lib/db.ts", bold: true, font: "Consolas", size: 20 }), new TextRun(" \u2014 Database connection")] }),
      new Paragraph({ numbering: { reference: "b4", level: 0 }, spacing: { after: 100 }, children: [new TextRun({ text: "src/middleware.ts", bold: true, font: "Consolas", size: 20 }), new TextRun(" \u2014 Checks every page: logged in? Allowed here?")] }),
      new Paragraph({ numbering: { reference: "b4", level: 0 }, spacing: { after: 100 }, children: [new TextRun({ text: "src/app/intake/page.tsx", bold: true, font: "Consolas", size: 20 }), new TextRun(" \u2014 The intake form clients fill out")] }),
      new Paragraph({ numbering: { reference: "b4", level: 0 }, spacing: { after: 100 }, children: [new TextRun({ text: "src/app/coach/page.tsx", bold: true, font: "Consolas", size: 20 }), new TextRun(" \u2014 Coach\u2019s client list")] }),
      new Paragraph({ numbering: { reference: "b4", level: 0 }, spacing: { after: 100 }, children: [new TextRun({ text: "src/app/coach/clients/[id]/page.tsx", bold: true, font: "Consolas", size: 20 }), new TextRun(" \u2014 Individual client\u2019s intake review")] }),
      new Paragraph({ numbering: { reference: "b4", level: 0 }, spacing: { after: 100 }, children: [new TextRun({ text: "src/app/client/page.tsx", bold: true, font: "Consolas", size: 20 }), new TextRun(" \u2014 Client home page")] }),
      new Paragraph({ numbering: { reference: "b4", level: 0 }, spacing: { after: 100 }, children: [new TextRun({ text: "src/app/api/intake/route.ts", bold: true, font: "Consolas", size: 20 }), new TextRun(" \u2014 Saves and loads intake responses")] }),
      new Paragraph({ numbering: { reference: "b4", level: 0 }, spacing: { after: 160 }, children: [new TextRun({ text: "src/app/api/auth/register/route.ts", bold: true, font: "Consolas", size: 20 }), new TextRun(" \u2014 Creates new user accounts")] }),
      new Paragraph({ children: [new PageBreak()] }),

      // SECTION 7: WHAT'S NEXT
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. What\u2019s Coming Next \u2014 Phase 2 Preview")] }),
      p("Phase 2 is plan generation \u2014 the system that takes all intake data and helps you create a personalized coaching plan in hours instead of days."),
      p("We\u2019ll build:"),
      new Paragraph({ numbering: { reference: "b5", level: 0 }, spacing: { after: 100 }, children: bold("Intake summary with red flags. ", "A one-page clinical profile auto-generated from intake data \u2014 demographics, goals, dietary profile, bloodwork flags, sleep issues, behavioral indicators.") }),
      new Paragraph({ numbering: { reference: "b5", level: 0 }, spacing: { after: 100 }, children: bold("Coach decision form. ", "Where you input calorie targets, macro split, approach, referrals. The AI doesn\u2019t make these decisions \u2014 you do.") }),
      new Paragraph({ numbering: { reference: "b5", level: 0 }, spacing: { after: 100 }, children: bold("AI-assisted plan drafting. ", "Claude drafts each section from your decisions + intake data. It\u2019s a first draft, not a final product.") }),
      new Paragraph({ numbering: { reference: "b5", level: 0 }, spacing: { after: 100 }, children: bold("Section-by-section review. ", "You see each draft alongside the intake data that informed it. Accept, edit, or rewrite any section.") }),
      new Paragraph({ numbering: { reference: "b5", level: 0 }, spacing: { after: 160 }, children: bold("PDF export. ", "The approved plan becomes a clean PDF the client can download.") }),

      // CLOSING
      new Paragraph({
        spacing: { before: 600 },
        border: { top: { style: BorderStyle.SINGLE, size: 1, color: "D6D3D1", space: 12 } },
        children: [],
      }),
      p(new TextRun({ text: "This document will be updated after every build phase. Check back after Phase 2 for the plan generation walkthrough.", italics: true, color: "78716C" })),
    ],
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("docs/Learning Guide.docx", buffer);
  console.log("Learning Guide created: docs/Learning Guide.docx");
});
