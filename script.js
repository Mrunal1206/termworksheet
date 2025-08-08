function startApp() {
  document.getElementById("welcome").classList.remove("active");
  document.getElementById("main").classList.add("active");
}

const experimentSelector = document.getElementById("experimentSelector");
const tablesContainer = document.getElementById("tablesContainer");
const actionButtons = document.getElementById("actionButtons");

const tableMap = {};
let currentExp = "";

function switchExperiment() {
  const selected = experimentSelector.value;
  currentExp = selected;

  tablesContainer.innerHTML = "";

  if (!selected) {
    actionButtons.style.display = "none";
    return;
  }

  actionButtons.style.display = "block";

  if (!tableMap[selected]) {
    const table = document.createElement("table");
    table.id = `table_${selected}`;
    table.innerHTML = `
      <thead>
        <tr>
          <th>Roll No</th>
          <th>T.S. (4)</th>
          <th>Pres. (6)</th>
          <th>Under. (10)</th>
          <th>Total (20)</th>
          <th>Teacher Sign</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    tableMap[selected] = table;
  }

  tablesContainer.appendChild(tableMap[selected]);
}

function validateMarks(input, maxValue, label) {
  const value = parseFloat(input.value);
  if (!isNaN(value) && value > maxValue) {
    alert(`⚠️ ${label} marks should not exceed ${maxValue}.`);
    input.value = "";
    input.focus();
  }
}

function addRow() {
  if (!currentExp) return;

  const table = tableMap[currentExp];
  const tbody = table.querySelector("tbody");
  const row = document.createElement("tr");

  // Roll No
  const rollTd = document.createElement("td");
  const rollInput = document.createElement("input");
  rollInput.type = "text";
  rollInput.placeholder = "Roll No";
  rollTd.appendChild(rollInput);
  row.appendChild(rollTd);

  // T.S. (4)
  const ts = createMarkInput(0, 4, "T.S.");
  row.appendChild(ts.td);

  // Pres. (6)
  const pres = createMarkInput(0, 6, "Pres.");
  row.appendChild(pres.td);

  // Under. (10)
  const under = createMarkInput(0, 10, "Under.");
  row.appendChild(under.td);

  // Total (20)
  const totalTd = document.createElement("td");
  const totalInput = document.createElement("input");
  totalInput.type = "number";
  totalInput.readOnly = true;
  totalTd.appendChild(totalInput);
  row.appendChild(totalTd);

  // Auto-calculate total
  [ts.input, pres.input, under.input].forEach(input => {
    input.addEventListener("input", () => {
      const total =
        (parseFloat(ts.input.value) || 0) +
        (parseFloat(pres.input.value) || 0) +
        (parseFloat(under.input.value) || 0);
      totalInput.value = total;
    });
  });

  // Teacher Sign
  const signTd = document.createElement("td");
  const signInput = document.createElement("input");
  signInput.type = "text";
  signInput.placeholder = "Sign";
  signTd.appendChild(signInput);
  row.appendChild(signTd);

  tbody.appendChild(row);
}

function createMarkInput(min, max, label) {
  const td = document.createElement("td");
  const input = document.createElement("input");
  input.type = "number";
  input.min = min;
  input.max = max;
  input.placeholder = `0-${max}`;
  input.style.width = "50px";
  input.addEventListener("input", () => validateMarks(input, max, label));
  td.appendChild(input);
  return { td, input };
}

function downloadCurrentTable() {
  if (!currentExp) return;

  const table = tableMap[currentExp];
  const rows = table.querySelectorAll("tbody tr");

  const data = [["Roll No", "T.S.", "Pres.", "Under.", "Total", "Sign"]];
  rows.forEach(tr => {
    const values = Array.from(tr.querySelectorAll("input")).map(inp => inp.value);
    data.push(values);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, currentExp.toUpperCase());
  XLSX.writeFile(wb, `Assessment_${currentExp.toUpperCase()}.xlsx`);
}
