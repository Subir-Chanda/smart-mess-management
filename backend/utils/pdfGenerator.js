// ======================================
// PDF GENERATOR — uses PDFKit (pure JS, no browser needed)
// Run: npm install pdfkit
// Fonts: DejaVuSans (pre-installed on Render/Ubuntu) — supports ₹ ✓ ✗
// ======================================

const PDFDocument = require("pdfkit");
const path = require("path");

// ======================================
// FONT PATHS — DejaVuSans (pre-installed on Render)
// ======================================

const FONT_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
const FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

// ======================================
// COLORS
// ======================================

const C = {
  white: "#ffffff",
  headerBg: "#c8c8c8",
  darkHeaderBg: "#02112b",
  altRow: "#f9f9f9",
  subRow: "#f0f0f0",
  border: "#cccccc",
  text: "#1a1a1a",
  green: "#006400",
  red: "#cc0000",
  gray: "#999999",
};

// ======================================
// HELPER — buffer PDFDocument → Buffer
// ======================================

function pdfToBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

// ======================================
// DRAWING HELPERS
// ======================================

function drawCell(doc, x, y, w, h, text, opts = {}) {
  const {
    fillColor = C.white,
    textColor = C.text,
    fontSize = 9,
    bold = false,
    align = "center",
    paddingX = 5,
    valign = "middle", // "top" | "middle"
    multiline = false,
    borderColor = C.border,
  } = opts;

  // background + border
  doc.rect(x, y, w, h).fillAndStroke(fillColor, borderColor);

  const textW = w - paddingX * 2;
  const textX = x + paddingX;

  doc
    .save()
    .fillColor(textColor)
    .fontSize(fontSize)
    .font(bold ? FONT_BOLD : FONT_REGULAR);

  if (multiline) {
    doc.text(String(text ?? ""), textX, y + 4, {
      width: textW,
      align,
      lineGap: 2,
    });
  } else {
    const approxLineH = fontSize * 1.2;
    const textY = valign === "middle" ? y + (h - approxLineH) / 2 : y + 4;
    doc.text(String(text ?? ""), textX, textY, {
      width: textW,
      align,
      lineBreak: false,
      ellipsis: true,
    });
  }

  doc.restore();
}

function drawHeader(doc, x, y, w, h, text, opts = {}) {
  drawCell(doc, x, y, w, h, text, {
    fillColor: opts.fillColor || C.headerBg,
    textColor: opts.textColor || C.text,
    bold: true,
    align: opts.align || "center",
    fontSize: opts.fontSize || 9,
    borderColor: opts.borderColor || C.border,
    ...opts,
  });
}

// ======================================
// 1. MONTHLY CALCULATION PDF  (A3 landscape)
// ======================================

exports.generateMonthlyPdf = async ({ data }) => {
  const rows = Array.isArray(data.rows) ? data.rows : [];

  const doc = new PDFDocument({
    size: "A3",
    layout: "landscape",
    margin: 30,
    info: { Title: "Monthly Calculation" },
  });

  const pageW = doc.page.width - 60;
  const startX = 30;
  let y = 30;

  // Title
  doc
    .fillColor(C.text)
    .fontSize(22)
    .font(FONT_BOLD)
    .text("Monthly Calculation", startX, y, { width: pageW, align: "center" });
  y += 32;

  // Info row
  doc
    .fontSize(11)
    .font(FONT_BOLD)
    .fillColor(C.text)
    .text(`Month : ${data.month} ${data.year}`, startX, y)
    .text(`Meal Rate : ₹${data.mealRate}`, startX, y, {
      width: pageW,
      align: "right",
    });
  y += 22;

  // Column definitions
  const colDefs = [
    { label: "Name", pct: 0.1, align: "left" },
    { label: "Deposit", pct: 0.07, align: "right" },
    { label: "Actual Meals", pct: 0.08, align: "center" },
    { label: "Billable Meals", pct: 0.08, align: "center" },
    { label: "Meal Cost", pct: 0.08, align: "right" },
    { label: "Guest Cost", pct: 0.08, align: "right" },
    { label: "Ranna Mashi", pct: 0.09, align: "right" },
    { label: "Kajer Mashi", pct: 0.09, align: "right" },
    { label: "Fixed Cost", pct: 0.08, align: "right" },
    { label: "Total Cost", pct: 0.09, align: "right" },
    { label: "Due / Balance", pct: 0.09, align: "right" },
  ];
  const cols = colDefs.map((c) => ({ ...c, w: Math.floor(c.pct * pageW) }));
  const hdrH = 24;
  const rowH = 20;

  // Header
  let x = startX;
  cols.forEach((col) => {
    drawHeader(doc, x, y, col.w, hdrH, col.label, { fontSize: 8 });
    x += col.w;
  });
  y += hdrH;

  // Rows
  rows.forEach((row, i) => {
    const bg = i % 2 === 0 ? C.white : C.altRow;
    x = startX;
    const cells = [
      { val: row.name, align: "left", bold: true },
      { val: `₹${row.deposit ?? 0}`, align: "right" },
      { val: row.mealCount ?? row.actualMealCount ?? 0, align: "center" },
      { val: row.billableMeals ?? row.mealCount ?? 0, align: "center" },
      { val: `₹${Number(row.mealCost ?? 0).toFixed(2)}`, align: "right" },
      { val: `₹${Number(row.guestCost ?? 0).toFixed(2)}`, align: "right" },
      { val: `₹${Number(row.rannaCost ?? 0).toFixed(2)}`, align: "right" },
      { val: `₹${Number(row.kajerCost ?? 0).toFixed(2)}`, align: "right" },
      { val: `₹${Number(row.fixedCost ?? 0).toFixed(2)}`, align: "right" },
      { val: `₹${Number(row.totalCost ?? 0).toFixed(2)}`, align: "right" },
      {
        val: `₹${Number(row.due ?? 0).toFixed(2)}`,
        align: "right",
        bold: true,
      },
    ];
    cols.forEach((col, ci) => {
      drawCell(doc, x, y, col.w, rowH, cells[ci].val, {
        fillColor: bg,
        align: cells[ci].align,
        bold: cells[ci].bold || false,
        fontSize: 8,
      });
      x += col.w;
    });
    y += rowH;
  });

  y += 20;

  // Summary boxes
  const boxW = Math.floor(pageW / 2) - 10;

  // Box 1
  doc.rect(startX, y, boxW, 80).stroke(C.border);
  doc
    .fontSize(10)
    .font(FONT_BOLD)
    .fillColor(C.text)
    .text("Summary", startX + 10, y + 8);
  doc
    .moveTo(startX + 10, y + 22)
    .lineTo(startX + boxW - 10, y + 22)
    .stroke(C.border);
  doc
    .fontSize(9)
    .font(FONT_REGULAR)
    .text(`Total Bazaar Cost : ₹${data.totalBazaarCost}`, startX + 10, y + 28)
    .text(
      `Total Guest Cost : ₹${data.totalGuestRecovery ?? data.totalGuestCost}`,
      startX + 10,
      y + 42,
    )
    .text(`Total Fixed Cost : ₹${data.totalFixedCost}`, startX + 10, y + 56);

  // Box 2
  const box2X = startX + boxW + 20;
  doc.rect(box2X, y, boxW, 80).stroke(C.border);
  doc
    .fontSize(10)
    .font(FONT_BOLD)
    .fillColor(C.text)
    .text("Additional Costs", box2X + 10, y + 8);
  doc
    .moveTo(box2X + 10, y + 22)
    .lineTo(box2X + boxW - 10, y + 22)
    .stroke(C.border);
  doc
    .fontSize(9)
    .font(FONT_REGULAR)
    .fillColor(C.text)
    .text(`Total Mashi Cost : ₹${data.totalMashiCost ?? 0}`, box2X + 10, y + 28)
    .text(
      `— Ranna Mashi Rate : ₹${data.rannaRate ?? 0} / member`,
      box2X + 10,
      y + 40,
    )
    .text(
      `— Kajer Mashi Rate : ₹${data.kajerRate ?? 0} / member`,
      box2X + 10,
      y + 52,
    )
    .font(FONT_BOLD)
    .text(`TOTAL : ₹${data.dueToPaid ?? 0}`, box2X + 10, y + 64);

  y += 100;

  // Totals box
  doc.rect(startX, y, pageW, 56).stroke(C.border);
  doc
    .fontSize(11)
    .font(FONT_BOLD)
    .fillColor(C.text)
    .text(
      `Total Due : ₹${Number(data.totalDueAmount).toFixed(2)}`,
      startX + 16,
      y + 8,
    )
    .text(
      `Current Mess Balance : ₹${Number(data.currentMessFundBalance).toFixed(2)}`,
      startX + 16,
      y + 24,
    )
    .text(
      `Difference : ₹${Number(data.difference).toFixed(2)}`,
      startX + 16,
      y + 40,
    );

  return pdfToBuffer(doc);
};

// ======================================
// 2. DEPOSIT LEDGER PDF  (A4 portrait)
// ======================================

exports.generateDepositPdf = async ({ data }) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    info: { Title: "Deposit Ledger" },
  });

  const pageW = doc.page.width - 80;
  const startX = 40;
  let y = 40;

  doc
    .fontSize(22)
    .font(FONT_BOLD)
    .fillColor(C.text)
    .text("Deposit Ledger", startX, y, { width: pageW, align: "center" });
  y += 32;
  doc
    .fontSize(11)
    .font(FONT_BOLD)
    .text(`${data.month} ${data.year}`, startX, y, {
      width: pageW,
      align: "center",
    });
  y += 24;

  const cols = [
    { label: "Name", w: Math.floor(pageW * 0.45), align: "left" },
    { label: "Amount", w: Math.floor(pageW * 0.28), align: "right" },
    { label: "Date", w: Math.floor(pageW * 0.27), align: "center" },
  ];
  const hdrH = 22;
  const rowH = 20;

  let x = startX;
  cols.forEach((col) => {
    drawHeader(doc, x, y, col.w, hdrH, col.label);
    x += col.w;
  });
  y += hdrH;

  let grandTotal = 0;

  data.members.forEach((member) => {
    let memberTotal = 0;

    member.deposits.forEach((d) => {
      memberTotal += d.amount;
      grandTotal += d.amount;
      x = startX;
      const cells = [
        { val: member.name, align: "left" },
        { val: `₹${d.amount}`, align: "right" },
        { val: `${d.date}/${d.month}/${d.year}`, align: "center" },
      ];
      cols.forEach((col, ci) => {
        drawCell(doc, x, y, col.w, rowH, cells[ci].val, {
          align: cells[ci].align,
          fontSize: 9,
        });
        x += col.w;
      });
      y += rowH;
    });

    // Subtotal row
    x = startX;
    const labelW = cols[0].w + cols[1].w;
    drawCell(doc, x, y, labelW, rowH, `Subtotal for ${member.name}`, {
      fillColor: C.subRow,
      bold: true,
      align: "right",
      fontSize: 9,
      paddingX: 8,
    });
    drawCell(doc, x + labelW, y, cols[2].w, rowH, `₹${memberTotal}`, {
      fillColor: C.subRow,
      bold: true,
      align: "right",
      fontSize: 9,
    });
    y += rowH;
  });

  y += 20;
  doc
    .fontSize(13)
    .font(FONT_BOLD)
    .fillColor(C.text)
    .text(`Grand Total Deposit : ₹${grandTotal}`, startX, y, {
      width: pageW,
      align: "right",
    });

  return pdfToBuffer(doc);
};

// ======================================
// 3. DAILY MEAL KHATA PDF  (A2 landscape)
// ======================================

exports.generateMealKhataPdf = async ({ data }) => {
  const doc = new PDFDocument({
    size: "A2",
    layout: "landscape",
    margin: 20,
    info: { Title: "Daily Meal Khata" },
  });

  const pageW = doc.page.width - 40;
  const startX = 20;
  let y = 20;

  doc
    .fontSize(18)
    .font(FONT_BOLD)
    .fillColor(C.text)
    .text(`${data.month} ${data.year} — Daily Meal Khata`, startX, y, {
      width: pageW,
      align: "center",
    });
  y += 28;

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const nameColW = 110;
  const totalColW = 34;
  const remaining = pageW - nameColW - totalColW;
  const dayColW = Math.floor(remaining / 31 / 2); // per L or D column
  const pairW = dayColW * 2;

  const hdrH1 = 14; // day-number header
  const hdrH2 = 12; // L/D sub-header
  const rowH = 14;
  const fSize = 7;

  // Header row 1 — Name spans 2 rows; day numbers span 2 cols each
  let x = startX;
  drawHeader(doc, x, y, nameColW, hdrH1 + hdrH2, "Name", {
    align: "left",
    fontSize: fSize,
  });
  x += nameColW;
  days.forEach((d) => {
    drawHeader(doc, x, y, pairW, hdrH1, String(d), { fontSize: 6 });
    x += pairW;
  });
  drawHeader(doc, x, y, totalColW, hdrH1 + hdrH2, "Total", { fontSize: fSize });
  y += hdrH1;

  // Header row 2 — L / D per day
  x = startX + nameColW;
  days.forEach(() => {
    drawHeader(doc, x, y, dayColW, hdrH2, "L", { fontSize: 6 });
    drawHeader(doc, x + dayColW, y, dayColW, hdrH2, "D", { fontSize: 6 });
    x += pairW;
  });
  y += hdrH2;

  // Member rows
  data.members.forEach((member, i) => {
    const bg = i % 2 === 0 ? C.white : C.altRow;
    x = startX;

    drawCell(doc, x, y, nameColW, rowH, member.name, {
      fillColor: bg,
      bold: true,
      align: "left",
      fontSize: fSize,
      paddingX: 5,
    });
    x += nameColW;

    days.forEach((day) => {
      const e = member.entries[day] || {};
      const lChar = e.lunch === true ? "✓" : e.lunch === false ? "✗" : "-";
      const dChar = e.dinner === true ? "✓" : e.dinner === false ? "✗" : "-";
      const lColor =
        e.lunch === true ? C.green : e.lunch === false ? C.red : C.gray;
      const dColor =
        e.dinner === true ? C.green : e.dinner === false ? C.red : C.gray;

      drawCell(doc, x, y, dayColW, rowH, lChar, {
        fillColor: bg,
        textColor: lColor,
        fontSize: 6,
        paddingX: 1,
      });
      drawCell(doc, x + dayColW, y, dayColW, rowH, dChar, {
        fillColor: bg,
        textColor: dColor,
        fontSize: 6,
        paddingX: 1,
      });
      x += pairW;
    });

    drawCell(doc, x, y, totalColW, rowH, String(member.totalMeals), {
      fillColor: bg,
      bold: true,
      align: "center",
      fontSize: fSize,
    });
    y += rowH;
  });

  y += 14;
  doc
    .fontSize(11)
    .font(FONT_BOLD)
    .fillColor(C.text)
    .text(`Grand Total Meals : ${data.grandTotal}`, startX, y);

  return pdfToBuffer(doc);
};

// ======================================
// 4. MEAL GRID PDF  (A2 landscape)
// ======================================

exports.generateMealGridPdf = async ({ data }) => {
  const doc = new PDFDocument({
    size: "A2",
    layout: "landscape",
    margin: 20,
    info: { Title: "Meal Grid" },
  });

  const pageW = doc.page.width - 40;
  const startX = 20;
  let y = 20;

  doc
    .fontSize(18)
    .font(FONT_BOLD)
    .fillColor(C.text)
    .text(`Meal Grid — ${data.month} ${data.year}`, startX, y, {
      width: pageW,
      align: "center",
    });
  y += 28;

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const nameColW = 110;
  const totalColW = 36;
  const remaining = pageW - nameColW - totalColW;
  const dayColW = Math.floor(remaining / 31);

  const hdrH = 18;
  const rowH = 16;
  const fSize = 7;

  // Header
  let x = startX;
  drawHeader(doc, x, y, nameColW, hdrH, "Member", {
    fillColor: C.darkHeaderBg,
    textColor: C.white,
    align: "left",
    fontSize: 8,
    borderColor: C.darkHeaderBg,
  });
  x += nameColW;
  days.forEach((d) => {
    drawHeader(doc, x, y, dayColW, hdrH, String(d), {
      fillColor: C.darkHeaderBg,
      textColor: C.white,
      fontSize: 6,
      borderColor: C.darkHeaderBg,
    });
    x += dayColW;
  });
  drawHeader(doc, x, y, totalColW, hdrH, "Total", {
    fillColor: C.darkHeaderBg,
    textColor: C.white,
    fontSize: 8,
    borderColor: C.darkHeaderBg,
  });
  y += hdrH;

  let grandTotal = 0;

  data.members.forEach((member, i) => {
    grandTotal += member.totalMeals;
    const bg = i % 2 === 0 ? "#f8fafc" : C.white;
    x = startX;

    drawCell(doc, x, y, nameColW, rowH, member.name, {
      fillColor: bg,
      bold: true,
      align: "left",
      fontSize: fSize,
      paddingX: 5,
    });
    x += nameColW;

    days.forEach((day) => {
      const e = member.entries[day] || {};
      const lText = e.lunch === true ? "L" : e.lunch === false ? "-" : "";
      const dText = e.dinner === true ? "D" : e.dinner === false ? "-" : "";
      const lColor = e.lunch === true ? C.green : C.red;
      const dColor = e.dinner === true ? C.green : C.red;
      const halfW = Math.floor(dayColW / 2);

      // cell bg
      doc.rect(x, y, dayColW, rowH).fillAndStroke(bg, C.border);

      // L half
      if (lText) {
        doc
          .save()
          .fillColor(lColor)
          .fontSize(6)
          .font(FONT_BOLD)
          .text(lText, x + 1, y + (rowH - 6) / 2, {
            width: halfW - 1,
            align: "center",
            lineBreak: false,
          })
          .restore();
      }
      // D half
      if (dText) {
        doc
          .save()
          .fillColor(dColor)
          .fontSize(6)
          .font(FONT_BOLD)
          .text(dText, x + halfW, y + (rowH - 6) / 2, {
            width: halfW,
            align: "center",
            lineBreak: false,
          })
          .restore();
      }
      x += dayColW;
    });

    drawCell(doc, x, y, totalColW, rowH, String(member.totalMeals), {
      fillColor: bg,
      bold: true,
      align: "center",
      fontSize: fSize,
    });
    y += rowH;
  });

  y += 14;
  doc
    .fontSize(10)
    .font(FONT_BOLD)
    .fillColor(C.green)
    .text("L = Lunch    D = Dinner    ", startX, y, { continued: true })
    .fillColor(C.red)
    .text("- = Not taken");
  y += 16;
  doc
    .fontSize(13)
    .font(FONT_BOLD)
    .fillColor(C.text)
    .text(`Grand Total Meals : ${grandTotal}`, startX, y);

  return pdfToBuffer(doc);
};

// ======================================
// 5. BAZAAR LEDGER PDF  (A4 portrait)
// ======================================

exports.generateBazaarLedgerPdf = async ({ data }) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 36,
    autoFirstPage: true,
    info: { Title: "Daily Bazaar Ledger" },
  });

  const pageW = doc.page.width - 72;
  const startX = 36;
  let y = 36;

  const drawBazaarHeader = () => {
    let x = startX;
    cols.forEach((col) => {
      drawHeader(doc, x, y, col.w, hdrH, col.label);
      x += col.w;
    });
    y += hdrH;
  };

  doc
    .fontSize(22)
    .font(FONT_BOLD)
    .fillColor(C.text)
    .text("Daily Bazaar Ledger", startX, y, { width: pageW, align: "center" });
  y += 30;
  doc
    .fontSize(11)
    .font(FONT_BOLD)
    .text(`${data.month} ${data.year}`, startX, y, {
      width: pageW,
      align: "center",
    });
  y += 24;

  const cols = [
    { label: "Date", w: Math.floor(pageW * 0.12), align: "center" },
    { label: "Meal", w: Math.floor(pageW * 0.1), align: "center" },
    { label: "Items", w: Math.floor(pageW * 0.52), align: "left" },
    { label: "Total Cost", w: Math.floor(pageW * 0.14), align: "right" },
    { label: "Bazaar By", w: Math.floor(pageW * 0.12), align: "center" },
  ];
  const hdrH = 22;

  drawBazaarHeader();

  let grandTotal = 0;

  data.entries.forEach((entry) => {
    grandTotal += Number(entry.totalCost);

    const itemsText = entry.items
      .map((item) => `${item.itemName} = ₹${item.price}`)
      .join("\n");

    const lineH = 13;
    const cellH = Math.max(26, entry.items.length * lineH + 10);

    // page overflow guard
    if (y + cellH > doc.page.height - 60) {
      doc.addPage();
      y = 36;
      drawBazaarHeader();
    }

    let x = startX;
    const cells = [
      {
        val: `${entry.date}/${data.month}/${data.year}`,
        align: "center",
        bold: true,
        ml: false,
      },
      { val: entry.mealType, align: "center", bold: false, ml: false },
      { val: itemsText, align: "left", bold: false, ml: true },
      { val: `₹${entry.totalCost}`, align: "right", bold: true, ml: false },
      { val: entry.bazaarBy, align: "center", bold: false, ml: false },
    ];

    cols.forEach((col, ci) => {
      const cell = cells[ci];
      drawCell(doc, x, y, col.w, cellH, cell.val, {
        align: cell.align,
        bold: cell.bold,
        multiline: cell.ml,
        fontSize: 8,
        paddingX: 5,
        valign: cell.ml ? "top" : "middle",
      });
      x += col.w;
    });

    y += cellH;
  });

  y += 20;
  doc
    .fontSize(13)
    .font(FONT_BOLD)
    .fillColor(C.text)
    .text(`Grand Total Bazaar Cost : ₹${grandTotal}`, startX, y, {
      width: pageW,
      align: "right",
    });

  return pdfToBuffer(doc);
};
