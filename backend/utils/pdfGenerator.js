// ======================================
// PDF GENERATOR — uses Puppeteer (HTML → PDF)
// Run: npm install puppeteer
// ======================================

const puppeteer = require("puppeteer");

// ======================================
// SHARED BASE STYLES
// ======================================

const baseStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    background: #f5f0e6;
    color: #1a1a1a;
    padding: 40px;
  }
  h1 {
    font-size: 38px;
    font-weight: 900;
    text-align: center;
    margin-bottom: 30px;
    letter-spacing: -0.5px;
  }
  h2 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 12px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    table-layout: fixed;
  }
  th {
    background: #c8c8c8;
    font-weight: 700;
    font-size: 13px;
    padding: 10px 12px;
    text-align: center;
    border: 1px solid #999;
    word-wrap: break-word;
  }
  td {
    padding: 10px 12px;
    font-size: 13px;
    text-align: center;
    border: 1px solid #ccc;
    background: white;
    font-variant-numeric: tabular-nums;
    word-wrap: break-word;
  }
  .num { 
    text-align: right; 
    padding-right: 14px !important;
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum";
    letter-spacing: 0;
  }
  .section { margin-bottom: 30px; }
`;

// ======================================
// HELPER — launch puppeteer & save PDF
// ======================================

async function htmlToPdf(html, pdfOptions = {}) {
  // On Render, Chrome is installed during build via:
  // `npx puppeteer browsers install chrome`
  // The path below is where Render caches it.
  // PUPPETEER_EXECUTABLE_PATH env var can override this if needed.
  const chromePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    "/opt/render/.cache/puppeteer/chrome/linux-149.0.7827.22/chrome-linux64/chrome";
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: chromePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdfData = await page.pdf({
    printBackground: true,
    ...pdfOptions,
  });
  await browser.close();
  // Puppeteer returns Uint8Array in newer versions — convert to proper Node.js Buffer
  return Buffer.from(pdfData);
}

// ======================================
// 1. MONTHLY CALCULATION PDF
// ======================================

exports.generateMonthlyPdf = async ({ data }) => {
  const rows = Array.isArray(data.rows) ? data.rows : [];
  const rowsHtml = rows
    .map(
      (row, i) => `
    <tr style="background:${i % 2 === 0 ? "#fff" : "#f9f9f9"}">
      <td style="font-weight:700;text-align:left;padding-left:16px">${row.name}</td>
      <td class="num">₹${row.deposit ?? 0}</td>
      <td>${row.mealCount ?? row.actualMealCount ?? 0}</td>
      <td>${row.billableMeals ?? row.mealCount ?? 0}</td>
      <td class="num">₹${Number(row.mealCost ?? 0).toFixed(2)}</td>
      <td class="num">₹${Number(row.guestCost ?? 0).toFixed(2)}</td>
      <td class="num">₹${Number(row.rannaCost ?? 0).toFixed(2)}</td>
      <td class="num">₹${Number(row.kajerCost ?? 0).toFixed(2)}</td>
      <td class="num">₹${Number(row.fixedCost ?? 0).toFixed(2)}</td>
      <td class="num">₹${Number(row.totalCost ?? 0).toFixed(2)}</td>
      <td class="num" style="font-weight:700">₹${Number(row.due ?? 0).toFixed(2)}</td>
    </tr>
  `,
    )
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    ${baseStyles}
    .info-row { display:flex; justify-content:space-between; font-size:15px; font-weight:600; margin-bottom:20px; }
    .summary-grid { display:flex; justify-content:space-between; margin-top:30px; gap:30px; }
    .summary-box { flex:1; background:white; border:1px solid #ccc; border-radius:8px; padding:20px; }
    .summary-box h3 { font-size:16px; margin-bottom:12px; border-bottom:2px solid #eee; padding-bottom:8px; }
    .summary-box p { font-size:14px; margin-bottom:6px; }
    .total-box { margin-top:24px; background:white; border:1px solid #ccc; border-radius:8px; padding:20px; font-size:16px; font-weight:700; line-height:2; }
  </style>
  </head><body>
  <h1>Monthly Calculation</h1>
  <div class="info-row">
    <span>Month : ${data.month} ${data.year}</span>
    <span>Meal Rate : ₹${data.mealRate}</span>
  </div>

  <table>
    <colgroup>
      <col style="width:11%"/>
      <col style="width:7%"/>
      <col style="width:8%"/>
      <col style="width:8%"/>
      <col style="width:8%"/>
      <col style="width:8%"/>
      <col style="width:9%"/>
      <col style="width:9%"/>
      <col style="width:8%"/>
      <col style="width:8%"/>
      <col style="width:9%"/>
    </colgroup>
    <thead>
      <tr>
        <th style="text-align:left;padding-left:16px">Name</th>
        <th>Deposit</th>
        <th>Actual Meals</th>
        <th>Billable Meals</th>
        <th>Meal Cost</th>
        <th>Guest Cost</th>
        <th>Ranna Mashi</th>
        <th>Kajer Mashi</th>
        <th>Fixed Cost</th>
        <th>Total Cost</th>
        <th>Due / Balance</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>

  <div class="summary-grid">
    <div class="summary-box">
      <h3>Summary</h3>
      <p>Total Bazaar Cost : ₹${data.totalBazaarCost}</p>
      <p>Total Guest Cost : ₹${data.totalGuestRecovery ?? data.totalGuestCost}</p>
      <p>Total Fixed Cost : ₹${data.totalFixedCost}</p>
    </div>
    <div class="summary-box">
      <h3>Additional Costs</h3>
      <p>Total Mashi Cost : ₹${data.totalMashiCost ?? 0}</p>
      <p>— Ranna Mashi Rate : ₹${data.rannaRate ?? 0} / member</p>
      <p>— Kajer Mashi Rate : ₹${data.kajerRate ?? 0} / member</p>
      <p>Total Rice Cost : ₹${data.totalRiceCost}</p>
      <p>Total Gas Cost : ₹${data.totalGasCost}</p>
      <hr style="margin:10px 0;border-color:#eee"/>
      <p style="font-weight:700">TOTAL : ₹${data.dueToPaid ?? 0}</p>
    </div>
  </div>

  <div class="total-box">
    Total Due : ₹${Number(data.totalDueAmount).toFixed(2)}<br/>
    Current Mess Balance : ₹${Number(data.currentMessFundBalance).toFixed(2)}<br/>
    Difference : ₹${Number(data.difference).toFixed(2)}
  </div>
  </body></html>`;

  return await htmlToPdf(html, { format: "A3", landscape: true });
};

// ======================================
// 2. DEPOSIT LEDGER PDF
// ======================================

exports.generateDepositPdf = async ({ data }) => {
  let grandTotal = 0;

  const rowsHtml = data.members
    .flatMap((member) => {
      let memberTotal = 0;
      const depositRows = member.deposits
        .map((d) => {
          memberTotal += d.amount;
          grandTotal += d.amount;
          return `
          <tr>
            <td style="text-align:left;padding-left:16px">${member.name}</td>
            <td class="num">₹${d.amount}</td>
            <td>${d.date}/${d.month}/${d.year}</td>
          </tr>`;
        })
        .join("");

      return [
        depositRows,
        `<tr style="background:#f0f0f0;font-weight:700">
          <td colspan="2" style="text-align:right;padding-right:12px">Subtotal for ${member.name}</td>
          <td class="num">₹${memberTotal}</td>
        </tr>`,
      ];
    })
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    ${baseStyles}
    .grand { margin-top:24px; font-size:18px; font-weight:700; text-align:right; padding:16px; background:white; border:1px solid #ccc; border-radius:8px; }
  </style>
  </head><body>
  <h1>Deposit Ledger</h1>
  <p style="text-align:center;margin-bottom:24px;font-size:15px;font-weight:600">
    ${data.month} ${data.year}
  </p>
  <table>
    <colgroup>
      <col style="width:45%"/>
      <col style="width:25%"/>
      <col style="width:30%"/>
    </colgroup>
    <thead>
      <tr>
        <th style="text-align:left;padding-left:16px">Name</th>
        <th>Amount</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  <div class="grand">Grand Total Deposit : ₹${grandTotal}</div>
  </body></html>`;

  return await htmlToPdf(html, { format: "A4" });
};

// ======================================
// 3. DAILY MEAL KHATA PDF
// ======================================

exports.generateMealKhataPdf = async ({ data }) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const dayHeaders = days
    .map(
      (d) => `
    <th colspan="2" style="font-size:11px;padding:6px 2px">${d}</th>`,
    )
    .join("");

  const ldHeaders = days
    .map(
      () => `
    <th style="font-size:10px;padding:4px 1px;font-weight:600">L</th>
    <th style="font-size:10px;padding:4px 1px;font-weight:600">D</th>`,
    )
    .join("");

  const memberRows = data.members
    .map(
      (member, i) => `
    <tr style="background:${i % 2 === 0 ? "#fff" : "#f9f9f9"}">
      <td style="font-weight:700;text-align:left;padding-left:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px">${member.name}</td>
      ${days
        .map((day) => {
          const e = member.entries[day] || {};
          const l = e.lunch === true ? "✓" : e.lunch === false ? "✗" : "-";
          const d = e.dinner === true ? "✓" : e.dinner === false ? "✗" : "-";
          const lColor =
            e.lunch === true
              ? "#006400"
              : e.lunch === false
                ? "#cc0000"
                : "#999";
          const dColor =
            e.dinner === true
              ? "#006400"
              : e.dinner === false
                ? "#cc0000"
                : "#999";
          return `
          <td style="color:${lColor};font-size:10px;padding:4px 1px">${l}</td>
          <td style="color:${dColor};font-size:10px;padding:4px 1px">${d}</td>`;
        })
        .join("")}
      <td style="font-weight:700;font-size:12px">${member.totalMeals}</td>
    </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    ${baseStyles}
    body { padding: 24px 16px; }
    h1 { font-size:30px; margin-bottom:8px; }
    .subtitle { text-align:center; font-size:16px; margin-bottom:24px; font-weight:600; }
    table { font-size:10px; }
    th, td { padding: 5px 2px; }
    th { background:#c8c8c8; }
  </style>
  </head><body>
  <h1>${data.month} ${data.year}</h1>
  <div class="subtitle">Daily Meal Khata</div>
  <table style="table-layout:fixed">
    <colgroup>
      <col style="width:120px"/>
      ${days.map(() => `<col style="width:18px"/><col style="width:18px"/>`).join("")}
      <col style="width:36px"/>
    </colgroup>
    <thead>
      <tr>
        <th rowspan="2" style="text-align:left;padding-left:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Name</th>
        ${dayHeaders}
        <th rowspan="2">Total</th>
      </tr>
      <tr>${ldHeaders}</tr>
    </thead>
    <tbody>${memberRows}</tbody>
  </table>

  <div style="margin-top:20px;font-size:13px;font-weight:600">
    Grand Total Meals : ${data.grandTotal}
  </div>
  </body></html>`;

  return await htmlToPdf(html, {
    format: "A2",
    landscape: true,
    margin: { top: "15px", bottom: "15px", left: "15px", right: "15px" },
  });
};

// ======================================
// 4. MEAL GRID PDF
// ======================================

exports.generateMealGridPdf = async ({ data }) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const dayHeaders = days
    .map(
      (d) =>
        `<th style="font-size:10px;padding:5px 2px;color:white;background:#02112b">${d}</th>`,
    )
    .join("");

  let grandTotal = 0;

  const memberRows = data.members
    .map((member, i) => {
      grandTotal += member.totalMeals;
      const rowBg = i % 2 === 0 ? "#f8fafc" : "#ffffff";
      const cells = days
        .map((day) => {
          const e = member.entries[day] || {};
          const hasLunch = e.lunch === true;
          const hasDinner = e.dinner === true;
          const noLunch = e.lunch === false;
          const noDinner = e.dinner === false;

          const lText = hasLunch ? "L" : noLunch ? "-" : "";
          const dText = hasDinner ? "D" : noDinner ? "-" : "";
          const lColor = hasLunch ? "#006400" : "#cc0000";
          const dColor = hasDinner ? "#006400" : "#cc0000";

          return `<td style="background:${rowBg};padding:3px 1px">
            <span style="color:${lColor};font-size:9px;font-weight:600">${lText}</span>
            <span style="color:${dColor};font-size:9px;font-weight:600;margin-left:2px">${dText}</span>
          </td>`;
        })
        .join("");

      return `
      <tr>
        <td style="background:${rowBg};font-weight:700;text-align:left;padding-left:8px;font-size:11px;white-space:nowrap">${member.name}</td>
        ${cells}
        <td style="background:${rowBg};font-weight:700;font-size:12px">${member.totalMeals}</td>
      </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    ${baseStyles}
    body { padding: 20px 12px; }
    h1 { font-size:26px; margin-bottom:4px; }
    th { background:#02112b; color:white; border-color:#02112b; }
    .total-th { background:#02112b; color:white; }
    .legend { margin-top:16px; font-size:12px; font-weight:600; }
    .grand { margin-top:12px; font-size:16px; font-weight:700; }
  </style>
  </head><body>
  <h1>Meal Grid — ${data.month} ${data.year}</h1>
  <table style="margin-top:16px">
    <thead>
      <tr>
        <th style="text-align:left;padding-left:8px;background:#02112b;color:white">Member</th>
        ${dayHeaders}
        <th class="total-th">Total</th>
      </tr>
    </thead>
    <tbody>${memberRows}</tbody>
  </table>
  <div class="legend">
    <span style="color:#006400">L = Lunch taken &nbsp;&nbsp; D = Dinner taken &nbsp;&nbsp;</span>
    <span style="color:#cc0000">- = Meal not taken</span>
  </div>
  <div class="grand">Grand Total Meals : ${grandTotal}</div>
  </body></html>`;

  return await htmlToPdf(html, {
    format: "A2",
    landscape: true,
    margin: { top: "15px", bottom: "15px", left: "12px", right: "12px" },
  });
};

// ======================================
// 5. BAZAAR LEDGER PDF
// ======================================

exports.generateBazaarLedgerPdf = async ({ data }) => {
  let grandTotal = 0;

  const rowsHtml = data.entries
    .map((entry) => {
      grandTotal += Number(entry.totalCost);
      const itemsList = entry.items
        .map((item) => `<li>${item.itemName} = ₹${item.price}</li>`)
        .join("");

      return `
      <tr>
        <td style="font-weight:700;white-space:nowrap">${entry.date}/${data.month}/${data.year}</td>
        <td>${entry.mealType}</td>
        <td style="text-align:left;padding-left:16px">
          <ul style="list-style:disc;padding-left:16px;margin:0;line-height:1.8">
            ${itemsList}
          </ul>
        </td>
        <td class="num" style="font-weight:700">₹${entry.totalCost}</td>
        <td>${entry.bazaarBy}</td>
      </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    ${baseStyles}
    .grand { margin-top:24px; font-size:17px; font-weight:700; text-align:right; padding:14px 20px; background:white; border:1px solid #ccc; border-radius:8px; }
    td { vertical-align:top; }
  </style>
  </head><body>
  <h1>Daily Bazaar Ledger</h1>
  <p style="text-align:center;margin-bottom:24px;font-size:15px;font-weight:600">
    ${data.month} ${data.year}
  </p>
  <table>
    <colgroup>
      <col style="width:12%"/>
      <col style="width:10%"/>
      <col style="width:52%"/>
      <col style="width:14%"/>
      <col style="width:12%"/>
    </colgroup>
    <thead>
      <tr>
        <th>Date</th>
        <th>Meal</th>
        <th style="text-align:left;padding-left:16px">Items</th>
        <th>Total Cost</th>
        <th>Bazaar By</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  <div class="grand">Grand Total Bazaar Cost : ₹${grandTotal}</div>
  </body></html>`;

  return await htmlToPdf(html, {
    format: "A4",
    margin: { top: "30px", bottom: "30px", left: "30px", right: "30px" },
  });
};
