const WEIGHTS = { bag: 135, straw: 81, bottle: 45 };
const THREAT_PER_TURTLE = 405;

function createBubbles() {
  const container = document.getElementById("bubbles-container");
  if (!container || container.children.length) return;

  for (let i = 0; i < 20; i++) {
    const bubble = document.createElement("div");
    const size = Math.random() * 30 + 10;
    bubble.className = "bubble";
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}vw`;
    bubble.style.animationDuration = `${Math.random() * 5 + 5}s`;
    bubble.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(bubble);
  }
}

function updateValue(type, change) {
  const input = document.getElementById(`input-${type}`);
  if (!input) return;
  input.value = Math.max(0, (parseInt(input.value, 10) || 0) + change);
  calculateTurtles();
}

function resetValues() {
  ["bag", "straw", "bottle"].forEach((type) => {
    const input = document.getElementById(`input-${type}`);
    if (input) input.value = 0;
  });
  calculateTurtles();
}

function calculateTurtles() {
  const bagInput = document.getElementById("input-bag");
  const strawInput = document.getElementById("input-straw");
  const bottleInput = document.getElementById("input-bottle");
  if (!bagInput || !strawInput || !bottleInput) return;

  const bags = parseInt(bagInput.value, 10) || 0;
  const straws = parseInt(strawInput.value, 10) || 0;
  const bottles = parseInt(bottleInput.value, 10) || 0;
  const totalScore = bags * WEIGHTS.bag + straws * WEIGHTS.straw + bottles * WEIGHTS.bottle;
  const turtles = Math.floor(totalScore / THREAT_PER_TURTLE);

  document.getElementById("total-score-display").textContent = totalScore.toLocaleString();
  document.getElementById("result-number").textContent = turtles;
  updateTurtleDisplay(turtles);
  document.getElementById("encouragement-text").textContent =
    turtles > 5 ? "不可思議！你們是海洋守護英雄！" :
    turtles > 0 ? "太棒了！化為了實質的生命救援！" :
    totalScore > 0 ? "快了快了！再減少一點就能救下一隻海龜！" :
    "每一個微小的改變，都在拯救生命！";
}

function updateTurtleDisplay(count) {
  const container = document.getElementById("turtle-display-area");
  if (!container) return;
  container.innerHTML = "";

  if (count === 0) {
    container.innerHTML = '<span class="muted-message">（輸入減塑數據，讓海龜重獲新生）</span>';
    return;
  }

  const maxIcons = 15;
  const displayCount = Math.min(count, maxIcons);
  for (let i = 0; i < displayCount; i++) {
    const turtle = document.createElement("div");
    turtle.className = "turtle-icon";
    turtle.style.animationDelay = `${i * 0.06}s`;
    turtle.innerHTML = '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C9.5 2 7.5 4 7 6.5C5 6.5 3 7 2 9C4 9.5 5.5 11 6 13C5.5 15 4 16.5 2 17C3 19 5 19.5 7 19.5C7.5 22 9.5 24 12 24C14.5 24 16.5 22 17 19.5C19 19.5 21 19 22 17C20 16.5 18.5 15 18 13C18.5 11 20 9.5 22 9C21 7 19 6.5 17 6.5C16.5 4 14.5 2 12 2ZM12 4C13.5 4 14.8 5 15.2 6.5C15.4 7.2 15.8 7.8 16.5 8.1C17.5 8.5 18.3 9.2 18.8 10C17.8 10.7 17.2 11.8 17.2 13C17.2 14.2 17.8 15.3 18.8 16C18.3 16.8 17.5 17.5 16.5 17.9C15.8 18.2 15.4 18.8 15.2 19.5C14.8 21 13.5 22 12 22C10.5 22 9.2 21 8.8 19.5C8.6 18.8 8.2 18.2 7.5 17.9C6.5 17.5 5.7 16.8 5.2 16C6.2 15.3 6.8 14.2 6.8 13C6.8 11.8 6.2 10.7 5.2 10C5.7 9.2 6.5 8.5 7.5 8.1C8.2 7.8 8.6 7.2 8.8 6.5C9.2 5 10.5 4 12 4Z" fill="#86efac"/></svg>';
    container.appendChild(turtle);
  }

  if (count > maxIcons) {
    const moreInfo = document.createElement("div");
    moreInfo.className = "muted-message";
    moreInfo.style.width = "100%";
    moreInfo.style.color = "#a5f3fc";
    moreInfo.style.fontWeight = "800";
    moreInfo.textContent = `以及另外 ${count - maxIcons} 隻海龜！`;
    container.appendChild(moreInfo);
  }
}

function parseNumbers(text) {
  const values = text
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map(Number);

  if (values.some((value) => Number.isNaN(value))) {
    throw new Error("請只輸入數字。");
  }
  if (values.length < 2) {
    throw new Error("每一組至少需要兩個數字。");
  }
  return values;
}

function readNumberInput(input) {
  const rawValue = input.value.trim();
  if (rawValue === "") return 0;
  const value = Number(rawValue);
  if (Number.isNaN(value)) {
    throw new Error("表格中有不是數字的內容，請檢查後再執行。");
  }
  return value;
}

function updateTableTotals(table) {
  if (!table) return;
  table.querySelectorAll("tbody tr").forEach((row, index) => {
    const rowNumber = row.querySelector("th");
    if (rowNumber) rowNumber.textContent = index + 1;

    const totalCell = row.querySelector(".row-total");
    const total = [...row.querySelectorAll("input")]
      .reduce((subtotal, input) => subtotal + readNumberInput(input), 0);
    if (totalCell) totalCell.textContent = format(total, 0);
  });
}

function tableTotals(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return null;

  const totals = [];
  table.querySelectorAll("tbody tr").forEach((row) => {
    const inputs = [...row.querySelectorAll("input")];
    if (inputs.length === 0) return;
    const hasValue = inputs.some((input) => input.value.trim() !== "");
    if (!hasValue) return;
    const total = inputs.reduce((subtotal, input) => subtotal + readNumberInput(input), 0);
    totals.push(total);
  });

  updateTableTotals(table);
  if (totals.length < 2) {
    throw new Error("每一組表格至少需要兩列有效資料。");
  }
  return totals;
}

function addDataRow(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const body = table.querySelector("tbody");
  const row = document.createElement("tr");
  row.innerHTML = `
    <th></th>
    <td><input value="0"></td>
    <td><input value="0"></td>
    <td><input value="0"></td>
    <td><input value="0"></td>
    <td><input value="0"></td>
    <td class="row-total">0</td>
    <td><button class="delete-row-button" onclick="deleteDataRow(this)">刪除</button></td>
  `;
  body.appendChild(row);
  bindTableInputs(table);
  updateTableTotals(table);
}

function addWelchRow(tableId) {
  addDataRow(tableId);
}

function deleteDataRow(button) {
  const row = button.closest("tr");
  const table = button.closest("table");
  if (!row || !table) return;

  row.remove();
  updateTableTotals(table);
}

function deleteWelchRow(button) {
  deleteDataRow(button);
}

function bindTableInputs(table) {
  if (!table) return;
  table.querySelectorAll("input").forEach((input) => {
    input.type = "number";
    input.min = "0";
    input.step = "1";
    input.addEventListener("input", () => updateTableTotals(table));
  });
}

function initializeDataTables() {
  [
    "welch-table-1",
    "welch-table-2",
    "mann-table-1",
    "mann-table-2",
  ].forEach((tableId) => {
    const table = document.getElementById(tableId);
    bindTableInputs(table);
    updateTableTotals(table);
  });
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function mean(values) {
  return sum(values) / values.length;
}

function variance(values) {
  const avg = mean(values);
  return sum(values.map((value) => (value - avg) ** 2)) / (values.length - 1);
}

function sd(values) {
  return Math.sqrt(variance(values));
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function format(value, digits = 4) {
  return Number.isFinite(value) ? value.toFixed(digits) : "N/A";
}

function runWelchTest() {
  const output = document.getElementById("welch-result");
  if (!output) return;

  try {
    const group1 = tableTotals("welch-table-1") || parseNumbers(document.getElementById("welch-group-1").value);
    const group2 = tableTotals("welch-table-2") || parseNumbers(document.getElementById("welch-group-2").value);
    const m1 = mean(group1);
    const m2 = mean(group2);
    const v1 = variance(group1);
    const v2 = variance(group2);
    const se = Math.sqrt(v1 / group1.length + v2 / group2.length);
    const t = (m1 - m2) / se;
    const dfNumerator = (v1 / group1.length + v2 / group2.length) ** 2;
    const dfDenominator =
      (v1 / group1.length) ** 2 / (group1.length - 1) +
      (v2 / group2.length) ** 2 / (group2.length - 1);
    const df = dfNumerator / dfDenominator;
    const p = 2 * (1 - studentTCdf(Math.abs(t), df));
    const direction = m1 > m2 ? "第一組平均高於第二組。" : "第一組平均低於第二組。";

    output.textContent =
      `第一組：n=${group1.length}，平均=${format(m1, 2)}，標準差=${format(sd(group1), 2)}\n` +
      `第二組：n=${group2.length}，平均=${format(m2, 2)}，標準差=${format(sd(group2), 2)}\n` +
      `平均差異：${format(m1 - m2, 2)}\n` +
      `t(${format(df, 2)}) = ${format(t, 3)}\n` +
      `p 值 = ${format(p, 4)}\n` +
      `α = 0.05\n` +
      `結論：${p < 0.05 ? "有顯著差異" : "沒有顯著差異"}\n` +
      direction;
  } catch (error) {
    output.textContent = error.message;
  }
}

function runMannWhitneyTest() {
  const output = document.getElementById("mann-result");
  if (!output) return;

  try {
    const group1 = tableTotals("mann-table-1") || parseNumbers(document.getElementById("mann-group-1").value);
    const group2 = tableTotals("mann-table-2") || parseNumbers(document.getElementById("mann-group-2").value);
    const result = mannWhitneyU(group1, group2);
    const p = result.pValue;
    const direction = median(group1) > median(group2)
      ? "第一組中位數高於第二組。"
      : "第一組中位數低於或等於第二組。";

    output.textContent =
      `第一組：n=${group1.length}，中位數=${format(median(group1), 2)}，平均=${format(mean(group1), 2)}\n` +
      `第二組：n=${group2.length}，中位數=${format(median(group2), 2)}，平均=${format(mean(group2), 2)}\n` +
      `U 統計量 = ${format(result.u, 2)}\n` +
      `p 值 = ${format(p, 4)}\n` +
      `α = 0.05\n` +
      `結論：${p < 0.05 ? "有顯著差異" : "沒有顯著差異"}\n` +
      direction;
  } catch (error) {
    output.textContent = error.message;
  }
}

function mannWhitneyU(group1, group2) {
  const combined = [
    ...group1.map((value) => ({ value, group: 1 })),
    ...group2.map((value) => ({ value, group: 2 })),
  ].sort((a, b) => a.value - b.value);

  let rank = 1;
  let rankSum1 = 0;
  let tieCorrection = 0;

  for (let i = 0; i < combined.length;) {
    let j = i + 1;
    while (j < combined.length && combined[j].value === combined[i].value) j++;

    const tieSize = j - i;
    const averageRank = (rank + rank + tieSize - 1) / 2;
    for (let k = i; k < j; k++) {
      if (combined[k].group === 1) rankSum1 += averageRank;
    }
    if (tieSize > 1) tieCorrection += tieSize ** 3 - tieSize;

    rank += tieSize;
    i = j;
  }

  const n1 = group1.length;
  const n2 = group2.length;
  const totalN = n1 + n2;
  const u1 = rankSum1 - (n1 * (n1 + 1)) / 2;
  const u2 = n1 * n2 - u1;
  const u = Math.max(u1, u2);
  const meanU = (n1 * n2) / 2;
  const varianceU = (n1 * n2 / 12) * ((totalN + 1) - tieCorrection / (totalN * (totalN - 1)));
  const z = (Math.abs(u - meanU) - 0.5) / Math.sqrt(varianceU);
  const pValue = 2 * (1 - normalCdf(Math.abs(z)));

  return { u, pValue };
}

function normalCdf(x) {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * absX);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

function studentTCdf(t, df) {
  const x = df / (df + t * t);
  const ib = regularizedIncompleteBeta(x, df / 2, 0.5);
  return t >= 0 ? 1 - 0.5 * ib : 0.5 * ib;
}

function regularizedIncompleteBeta(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betaContinuedFraction(x, a, b)) / a;
  }
  return 1 - (bt * betaContinuedFraction(1 - x, b, a)) / b;
}

function betaContinuedFraction(x, a, b) {
  const maxIterations = 100;
  const epsilon = 1e-12;
  const fpMin = 1e-30;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - qab * x / qap;
  if (Math.abs(d) < fpMin) d = fpMin;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= maxIterations; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpMin) d = fpMin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpMin) c = fpMin;
    d = 1 / d;
    h *= d * c;

    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpMin) d = fpMin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpMin) c = fpMin;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < epsilon) break;
  }
  return h;
}

function logGamma(z) {
  const coefficients = [
    676.5203681218851,
    -1259.1392167224028,
    771.3234287776531,
    -176.6150291621406,
    12.507343278686905,
    -0.13857109526572012,
    9.984369578019572e-6,
    1.5056327351493116e-7,
  ];

  if (z < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  }

  z -= 1;
  let x = 0.9999999999998099;
  for (let i = 0; i < coefficients.length; i++) {
    x += coefficients[i] / (z + i + 1);
  }
  const t = z + coefficients.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

createBubbles();
calculateTurtles();
initializeDataTables();
runWelchTest();
runMannWhitneyTest();
