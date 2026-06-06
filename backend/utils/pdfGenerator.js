// ======================================
// PDF GENERATOR — uses PDFKit (pure JS, no browser needed)
// Run: npm install pdfkit
// ======================================

const PDFDocument = require("pdfkit");

// ======================================
// COLORS & SHARED CONSTANTS
// ======================================

const C = {
  bg: "#f5f0e6",
  white: "#ffffff",
  headerBg: "#c8c8c8",
  darkHeaderBg: "#02112b",
  altRow: "#f9f9f9",
  border: "#cccccc",
  darkBorder: "#999999",
  text: "#1a1a1a",
  green: "#006400",
  red: "#cc0000",
  gray: "#999999",
  subRow: "#f0f0f0",
};

// ======================================
// HELPER — buffer a PDFDocument to Buffer
// ======================================

function pdfToBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

// ======================================
// DRAWING HELPERS
// ======================================

function drawRect(doc, x, y, w, h, fillColor, strokeColor) {
  doc.save();
  if (fillColor) doc.fillColor(fillColor);
  if (strokeColor) {
    doc.rect(x, y, w, h).fillAndStroke(fillColor || C.white, strokeColor);
  } else {
    doc.rect(x, y, w, h).fill(fillColor || C.white);
  }
  doc.restore();
}

function drawCell(doc, x, y, w, h, text, opts = {}) {
  const {
    fillColor = C.white,
    textColor = C.text,
    fontSize = 9,
    bold = false,
    align = "center",
    paddingX = 4,
    paddingY = 3,
  } = opts;

  // cell background + border
  doc.save().rect(x, y, w, h).fillAndStroke(fillColor, C.border).restore();

  // text
  const textY = y + paddingY + (h - fontSize - paddingY * 2) / 2;
  doc
    .save()
    .fillColor(textColor)
    .fontSize(fontSize)
    .font(bold ? "Helvetica-Bold" : "Helvetica")
    .text(String(text ?? ""), x + paddingX, textY, {
      width: w - paddingX * 2,
      align,
      lineBreak: false,
      ellipsis: true,
    })
    .restore();
}

function drawHeader(doc, x, y, w, h, text, opts = {}) {
  drawCell(doc, x, y, w, h, text, {
    fillColor: opts.fillColor || C.headerBg,
    textColor: opts.textColor || C.text,
    bold: true,
    align: opts.align || "center",
    fontSize: opts.fontSize || 9,
    ...opts,
  });
}

// ======================================
// 1. MONTHLY CALCULATION PDF  (A3 landscape)
// ======================================

exports.generateMonthlyPdf = async ({ data }) => {
  const rows = Array.isArray(data.rows) ? data.rows : [];

  // A3 landscape
  const doc = new PDFDocument({
    size: "A3",
    layout: "landscape",
    margin: 30,
    info: { Title: "Monthly Calculation" },
  });

  const pageW = doc.page.width - 60; // usable width
  const startX = 30;
  let y = 30;

  // Title
  doc
    .fillColor(C.text)
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("Monthly Calculation", startX, y, { width: pageW, align: "center" });
  y += 32;

  // Info row
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor(C.text)
    .text(`Month : ${data.month} ${data.year}`, startX, y)
    .text(`Meal Rate : ₹${data.mealRate}`, startX, y, {
      width: pageW,
      align: "right",
    });
  y += 22;

  // Column definitions
  const colDefs = [
    { label: "Name", w: 0.1, align: "left" },
    { label: "Deposit", w: 0.07, align: "right" },
    { label: "Actual Meals", w: 0.08, align: "center" },
    { label: "Billable Meals", w: 0.08, align: "center" },
    { label: "Meal Cost", w: 0.08, align: "right" },
    { label: "Guest Cost", w: 0.08, align: "right" },
    { label: "Ranna Mashi", w: 0.09, align: "right" },
    { label: "Kajer Mashi", w: 0.09, align: "right" },
    { label: "Fixed Cost", w: 0.08, align: "right" },
    { label: "Total Cost", w: 0.09, align: "right" },
    { label: "Due / Balance", w: 0.09, align: "right" },
  ];

  // Normalize widths to pixels
  const cols = colDefs.map((c) => ({ ...c, w: Math.floor(c.w * pageW) }));
  const rowH = 20;
  const hdrH = 24;

  // Header row
  let x = startX;
  cols.forEach((col) => {
    drawHeader(doc, x, y, col.w, hdrH, col.label, {
      align: col.align === "right" ? "center" : col.align,
      fontSize: 8,
    });
    x += col.w;
  });
  y += hdrH;

  // Data rows
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
      const cell = cells[ci];
      drawCell(doc, x, y, col.w, rowH, cell.val, {
        fillColor: bg,
        align: cell.align,
        bold: cell.bold || false,
        fontSize: 8,
        paddingX: 5,
      });
      x += col.w;
    });
    y += rowH;
  });

  y += 20;

  // Summary boxes (side by side)
  const boxW = Math.floor(pageW / 2) - 10;
  const box1X = startX;
  const box2X = startX + boxW + 20;
  const boxY = y;

  // Box 1
  doc.rect(box1X, boxY, boxW, 80).stroke(C.border);
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor(C.text)
    .text("Summary", box1X + 10, boxY + 8);
  doc
    .moveTo(box1X + 10, boxY + 20)
    .lineTo(box1X + boxW - 10, boxY + 20)
    .stroke(C.border);
  doc
    .fontSize(9)
    .font("Helvetica")
    .text(`Total Bazaar Cost : ₹${data.totalBazaarCost}`, box1X + 10, boxY + 26)
    .text(
      `Total Guest Cost : ₹${data.totalGuestRecovery ?? data.totalGuestCost}`,
      box1X + 10,
      boxY + 40,
    )
    .text(`Total Fixed Cost : ₹${data.totalFixedCost}`, box1X + 10, boxY + 54);

  // Box 2
  doc.rect(box2X, boxY, boxW, 80).stroke(C.border);
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor(C.text)
    .text("Additional Costs", box2X + 10, boxY + 8);
  doc
    .moveTo(box2X + 10, boxY + 20)
    .lineTo(box2X + boxW - 10, boxY + 20)
    .stroke(C.border);
  doc
    .fontSize(9)
    .font("Helvetica")
    .text(
      `Total Mashi Cost : ₹${data.totalMashiCost ?? 0}`,
      box2X + 10,
      boxY + 26,
    )
    .text(
      `— Ranna Mashi Rate : ₹${data.rannaRate ?? 0} / member`,
      box2X + 10,
      boxY + 38,
    )
    .text(
      `— Kajer Mashi Rate : ₹${data.kajerRate ?? 0} / member`,
      box2X + 10,
      boxY + 50,
    )
    .font("Helvetica-Bold")
    .text(`TOTAL : ₹${data.dueToPaid ?? 0}`, box2X + 10, boxY + 64);

  y = boxY + 100;

  // Totals box
  doc.rect(startX, y, pageW, 50).stroke(C.border);
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor(C.text)
    .text(
      `Total Due : ₹${Number(data.totalDueAmount).toFixed(2)}`,
      startX + 16,
      y + 6,
    )
    .text(
      `Current Mess Balance : ₹${Number(data.currentMessFundBalance).toFixed(2)}`,
      startX + 16,
      y + 20,
    )
    .text(
      `Difference : ₹${Number(data.difference).toFixed(2)}`,
      startX + 16,
      y + 34,
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

  // Title
  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .fillColor(C.text)
    .text("Deposit Ledger", startX, y, { width: pageW, align: "center" });
  y += 30;

  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(`${data.month} ${data.year}`, startX, y, {
      width: pageW,
      align: "center",
    });
  y += 22;

  // Columns
  const cols = [
    { label: "Name", w: Math.floor(pageW * 0.45), align: "left" },
    { label: "Amount", w: Math.floor(pageW * 0.28), align: "right" },
    { label: "Date", w: Math.floor(pageW * 0.27), align: "center" },
  ];
  const rowH = 20;
  const hdrH = 22;

  // Header
  let x = startX;
  cols.forEach((col) => {
    drawHeader(doc, x, y, col.w, hdrH, col.label, {
      align: col.align === "right" ? "center" : col.align,
    });
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
          paddingX: 5,
        });
        x += col.w;
      });
      y += rowH;
    });

    // Subtotal row
    x = startX;
    drawCell(
      doc,
      x,
      y,
      cols[0].w + cols[1].w,
      rowH,
      `Subtotal for ${member.name}`,
      {
        fillColor: C.subRow,
        bold: true,
        align: "right",
        fontSize: 9,
        paddingX: 8,
      },
    );
    drawCell(
      doc,
      x + cols[0].w + cols[1].w,
      y,
      cols[2].w,
      rowH,
      `₹${memberTotal}`,
      { fillColor: C.subRow, bold: true, align: "right", fontSize: 9 },
    );
    y += rowH;
  });

  y += 20;
  doc
    .fontSize(13)
    .font("Helvetica-Bold")
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

  // Title
  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .fillColor(C.text)
    .text(`${data.month} ${data.year} — Daily Meal Khata`, startX, y, {
      width: pageW,
      align: "center",
    });
  y += 28;

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const nameColW = 110;
  const totalColW = 32;
  const remaining = pageW - nameColW - totalColW;
  const dayColW = Math.floor(remaining / 31 / 2); // L and D each
  const actualDayW = dayColW * 2;

  const hdrH = 14;
  const rowH = 14;
  const fontSize = 7;

  // Header row 1 — day numbers
  let x = startX;
  drawHeader(doc, x, y, nameColW, hdrH * 2, "Name", {
    align: "left",
    fontSize,
  });
  x += nameColW;
  days.forEach((d) => {
    drawHeader(doc, x, y, actualDayW, hdrH, String(d), { fontSize: 6 });
    x += actualDayW;
  });
  drawHeader(doc, x, y, totalColW, hdrH * 2, "Total", { fontSize });
  y += hdrH;

  // Header row 2 — L / D sub-headers
  x = startX + nameColW;
  days.forEach(() => {
    drawHeader(doc, x, y, dayColW, hdrH, "L", { fontSize: 6 });
    drawHeader(doc, x + dayColW, y, dayColW, hdrH, "D", { fontSize: 6 });
    x += actualDayW;
  });
  y += hdrH;

  // Member rows
  data.members.forEach((member, i) => {
    const bg = i % 2 === 0 ? C.white : C.altRow;
    x = startX;

    drawCell(doc, x, y, nameColW, rowH, member.name, {
      fillColor: bg,
      bold: true,
      align: "left",
      fontSize,
      paddingX: 5,
    });
    x += nameColW;

    days.forEach((day) => {
      const e = member.entries[day] || {};
      const lText = e.lunch === true ? "✓" : e.lunch === false ? "✗" : "-";
      const dText = e.dinner === true ? "✓" : e.dinner === false ? "✗" : "-";
      const lColor =
        e.lunch === true ? C.green : e.lunch === false ? C.red : C.gray;
      const dColor =
        e.dinner === true ? C.green : e.dinner === false ? C.red : C.gray;

      drawCell(doc, x, y, dayColW, rowH, lText, {
        fillColor: bg,
        textColor: lColor,
        fontSize: 6,
        paddingX: 1,
      });
      drawCell(doc, x + dayColW, y, dayColW, rowH, dText, {
        fillColor: bg,
        textColor: dColor,
        fontSize: 6,
        paddingX: 1,
      });
      x += actualDayW;
    });

    drawCell(doc, x, y, totalColW, rowH, String(member.totalMeals), {
      fillColor: bg,
      bold: true,
      align: "center",
      fontSize,
    });
    y += rowH;
  });

  y += 14;
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
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

  // Title
  doc
    .fontSize(18)
    .font("Helvetica-Bold")
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
  const fontSize = 7;

  // Header
  let x = startX;
  drawHeader(doc, x, y, nameColW, hdrH, "Member", {
    fillColor: C.darkHeaderBg,
    textColor: C.white,
    align: "left",
    fontSize: 8,
  });
  x += nameColW;
  days.forEach((d) => {
    drawHeader(doc, x, y, dayColW, hdrH, String(d), {
      fillColor: C.darkHeaderBg,
      textColor: C.white,
      fontSize: 6,
    });
    x += dayColW;
  });
  drawHeader(doc, x, y, totalColW, hdrH, "Total", {
    fillColor: C.darkHeaderBg,
    textColor: C.white,
    fontSize: 8,
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
      fontSize,
      paddingX: 5,
    });
    x += nameColW;

    days.forEach((day) => {
      const e = member.entries[day] || {};
      const lText = e.lunch === true ? "L" : e.lunch === false ? "-" : "";
      const dText = e.dinner === true ? "D" : e.dinner === false ? "-" : "";
      const lColor = e.lunch === true ? C.green : C.red;
      const dColor = e.dinner === true ? C.green : C.red;
      const cellText = lText + (lText && dText ? " " : "") + dText;

      // draw cell manually to support two-color text
      doc.rect(x, y, dayColW, rowH).fillAndStroke(bg, C.border);
      if (lText) {
        doc
          .fontSize(6)
          .font("Helvetica-Bold")
          .fillColor(lColor)
          .text(lText, x + 1, y + 4, {
            width: Math.floor(dayColW / 2) - 1,
            align: "center",
            lineBreak: false,
          });
      }
      if (dText) {
        doc
          .fontSize(6)
          .font("Helvetica-Bold")
          .fillColor(dColor)
          .text(dText, x + Math.floor(dayColW / 2), y + 4, {
            width: Math.floor(dayColW / 2),
            align: "center",
            lineBreak: false,
          });
      }
      x += dayColW;
    });

    drawCell(doc, x, y, totalColW, rowH, String(member.totalMeals), {
      fillColor: bg,
      bold: true,
      align: "center",
      fontSize,
    });
    y += rowH;
  });

  y += 14;
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor(C.green)
    .text("L = Lunch taken    D = Dinner taken    ", startX, y, {
      continued: true,
    })
    .fillColor(C.red)
    .text("- = Meal not taken");
  y += 16;
  doc
    .fontSize(13)
    .font("Helvetica-Bold")
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
    info: { Title: "Daily Bazaar Ledger" },
    autoFirstPage: true,
  });

  const pageW = doc.page.width - 72;
  const startX = 36;
  let y = 36;

  // Title
  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .fillColor(C.text)
    .text("Daily Bazaar Ledger", startX, y, { width: pageW, align: "center" });
  y += 30;

  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(`${data.month} ${data.year}`, startX, y, {
      width: pageW,
      align: "center",
    });
  y += 22;

  // Columns
  const cols = [
    { label: "Date", w: Math.floor(pageW * 0.12), align: "center" },
    { label: "Meal", w: Math.floor(pageW * 0.1), align: "center" },
    { label: "Items", w: Math.floor(pageW * 0.52), align: "left" },
    { label: "Total Cost", w: Math.floor(pageW * 0.14), align: "right" },
    { label: "Bazaar By", w: Math.floor(pageW * 0.12), align: "center" },
  ];
  const hdrH = 22;

  // Header
  let x = startX;
  cols.forEach((col) => {
    drawHeader(doc, x, y, col.w, hdrH, col.label, {
      align: col.align === "right" ? "center" : col.align,
    });
    x += col.w;
  });
  y += hdrH;

  let grandTotal = 0;

  data.entries.forEach((entry) => {
    grandTotal += Number(entry.totalCost);

    const itemsText = entry.items
      .map((item) => `${item.itemName} = ₹${item.price}`)
      .join("\n");

    // Calculate row height based on items
    const lineH = 13;
    const itemLines = entry.items.length;
    const cellH = Math.max(24, itemLines * lineH + 8);

    // Check for page overflow
    if (y + cellH > doc.page.height - 60) {
      doc.addPage();
      y = 36;
      // Redraw header
      x = startX;
      cols.forEach((col) => {
        drawHeader(doc, x, y, col.w, hdrH, col.label, {
          align: col.align === "right" ? "center" : col.align,
        });
        x += col.w;
      });
      y += hdrH;
    }

    x = startX;
    const cells = [
      {
        val: `${entry.date}/${data.month}/${data.year}`,
        align: "center",
        bold: true,
      },
      { val: entry.mealType, align: "center" },
      { val: itemsText, align: "left", multiline: true },
      { val: `₹${entry.totalCost}`, align: "right", bold: true },
      { val: entry.bazaarBy, align: "center" },
    ];

    cols.forEach((col, ci) => {
      const cell = cells[ci];
      // Draw background + border
      doc.rect(x, y, col.w, cellH).fillAndStroke(C.white, C.border);

      const textX = x + 5;
      const textY = y + 5;
      const textW = col.w - 10;

      doc
        .save()
        .fillColor(C.text)
        .fontSize(8)
        .font(cell.bold ? "Helvetica-Bold" : "Helvetica");

      if (cell.multiline) {
        doc.text(cell.val, textX, textY, {
          width: textW,
          align: "left",
          lineGap: 2,
        });
      } else {
        const tH = 8;
        const tY = y + (cellH - tH) / 2;
        doc.text(String(cell.val ?? ""), textX, tY, {
          width: textW,
          align: cell.align,
          lineBreak: false,
          ellipsis: true,
        });
      }
      doc.restore();
      x += col.w;
    });

    y += cellH;
  });

  y += 20;
  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .fillColor(C.text)
    .text(`Grand Total Bazaar Cost : ₹${grandTotal}`, startX, y, {
      width: pageW,
      align: "right",
    });

  return pdfToBuffer(doc);
};
