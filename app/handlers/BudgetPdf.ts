export const generateHTMLReportWithStats = ({
  userName,
  monthlyBudget,
  currency,
  shoppingList,
  monthlySavings,
  thisYearSavings,
  lastYearSavings,
  monthName,
  year,
  appLogoBase64,
  categoryChartBase64,
  pendingChartBase64,
  savingsChartBase64,
}) => {
  const wantsItems = shoppingList.filter(i => i.category === "Wants");
  const needsItems = shoppingList.filter(i => i.category === "Needs");

  const generateTableRows = (items) =>
    items.length > 0
      ? items
          .map(
            (i) => `
        <tr>
          <td>${i.title}</td>
          <td>${currency} ${i.amount.toFixed(2)}</td>
          <td>${new Date(i.date).toLocaleDateString()}</td>
        </tr>
      `
          )
          .join("")
      : `<tr><td colspan="3" style="text-align:center;">No items</td></tr>`;

  const spent = shoppingList.reduce((sum, i) => sum + i.amount, 0);
  const remaining = monthlyBudget - spent;
  const projectedSavings = remaining;

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const renderSavings = (s: number | "TBD") => (s === "TBD" ? "TBD" : `${currency}${s.toFixed(2)}`);

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Monthly Finance Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f4f6f8; }
        .header { text-align:center; margin-bottom:20px; }
        .logo { width:80px; height:80px; border-radius:12px; margin-bottom:10px; }
        h1 { margin:0; font-size:28px; color:#333; }
        .subtitle { font-size:16px; color:#888; margin-top:4px; }
        .card { background:white; padding:16px 18px; border-radius:12px; margin-top:16px; box-shadow:0 2px 6px rgba(0,0,0,0.08); }
        .section-title { font-size:18px; margin-bottom:12px; color:#444; font-weight:bold; }
        .summary-grid { display:flex; justify-content:space-between; margin-top:10px; flex-wrap: wrap; }
        .summary-item { width:30%; background:#f8f9fb; border-radius:10px; padding:12px; text-align:center; margin-bottom:10px; }
        .summary-item h3 { margin:0; font-size:16px; color:#222; }
        .summary-item p { margin-top:6px; font-size:14px; color:#666; }
        .chart-img { width:100%; max-height:200px; object-fit:contain; border-radius:12px; margin-top:10px; margin-bottom:10px; }
        table { width:100%; border-collapse:collapse; margin-top:12px; font-size:14px; }
        table th { background:#222; color:white; padding:8px; font-size:13px; }
        table td { padding:8px; border-bottom:1px solid #ddd; font-size:13px; }
        .footer { text-align:center; margin-top:30px; font-size:12px; color:#999; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Monthly Finance Report</h1>
        <div class="subtitle">Prepared for: ${userName}</div>
        <div class="subtitle">Month: ${monthName} ${year}</div>
      </div>

      <div class="card">
        <div class="section-title">Summary Overview</div>
        <div class="summary-grid">
          <div class="summary-item">
            <h3>Total Budget</h3>
            <p>${currency} ${monthlyBudget.toFixed(2)}</p>
          </div>
          <div class="summary-item">
            <h3>Total Expenses</h3>
            <p>${currency} ${spent.toFixed(2)}</p>
          </div>
          <div class="summary-item">
            <h3>Remaining / Projected Savings</h3>
            <p>${currency} ${projectedSavings.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="section-title">Category Breakdown (Needs vs Wants)</div>
        ${categoryChartBase64 ? `<img class="chart-img" src="data:image/png;base64,${categoryChartBase64}" />` : "<p>No chart available</p>"}
      </div>

      <div class="card">
        <div class="section-title">Pending Expenses</div>
        ${pendingChartBase64 ? `<img class="chart-img" src="data:image/png;base64,${pendingChartBase64}" />` : "<p>No chart available</p>"}
      </div>

      ${savingsChartBase64 ? `<div class="card">
        <div class="section-title">Savings Chart</div>
        <img class="chart-img" src="data:image/png;base64,${savingsChartBase64}" />
      </div>` : ""}

      <div class="card">
        <div class="section-title">Monthly Savings</div>
        <table>
          <tr><th>Month</th><th>Savings</th></tr>
          ${monthlySavings.map((s, i) => `<tr><td>${monthNames[i]}</td><td>${renderSavings(s)}</td></tr>`).join("")}
        </table>
      </div>

      <div class="card">
        <div class="section-title">Yearly Savings</div>
        <p>Current Year: ${currency}${thisYearSavings.toFixed(2)}</p>
        <p>Last Year: ${currency}${lastYearSavings.toFixed(2)}</p>
        <p>Difference: ${currency}${(thisYearSavings - lastYearSavings).toFixed(2)}</p>
      </div>

      <div class="card">
        <div class="section-title">Needs Expenses</div>
        <table>
          <tr><th>Title</th><th>Amount</th><th>Date</th></tr>
          ${generateTableRows(needsItems)}
        </table>
      </div>

      <div class="card">
        <div class="section-title">Wants Expenses</div>
        <table>
          <tr><th>Title</th><th>Amount</th><th>Date</th></tr>
          ${generateTableRows(wantsItems)}
        </table>
      </div>

      <div class="card">
        <div class="section-title">Prediction</div>
        <p>Based on current spending trends, projected savings by month-end: ${currency}${projectedSavings.toFixed(2)}</p>
      </div>

      <div class="footer">
        Generated using BudgetSense App • © ${new Date().getFullYear()}
      </div>
    </body>
  </html>
  `;
};
