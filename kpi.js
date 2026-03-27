/* ===================================
   kpi.js — KPI Records CRUD Logic
   =================================== */

window.onload = function () {
  populateEmployeeDropdown('kpiEmployee');
  renderKpiMetrics();
  renderKpiTable(getKpiRecords());
};

// Fill employee dropdown from employee data
function populateEmployeeDropdown(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const employees = getEmployees().filter(e => e.status === 'active');
  select.innerHTML = employees.map(e =>
    `<option value="${e.id}">${e.name} (${e.dept})</option>`
  ).join('');
}

// --- SUMMARY METRIC CARDS ---
function renderKpiMetrics() {
  const records = getKpiRecords();
  const scores  = records.map(r => calcScore(r.target, r.achieved));
  const avg     = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const high    = scores.filter(s => s >= 75).length;
  const med     = scores.filter(s => s >= 55 && s < 75).length;
  const low     = scores.filter(s => s < 55).length;

  const metrics = [
    { label: 'Total KPI Entries', value: records.length, sub: 'All periods'     },
    { label: 'Avg Score',         value: avg + '%',       sub: 'Across all staff'},
    { label: 'High Performers',   value: high,            sub: 'Score >= 75%'   },
    { label: 'Needs Improvement', value: low,             sub: 'Score < 55%'    },
  ];

  document.getElementById('kpi-metrics').innerHTML = metrics.map(m => `
    <div class="metric-card">
      <div class="metric-label">${m.label}</div>
      <div class="metric-value">${m.value}</div>
      <div class="metric-sub">${m.sub}</div>
    </div>
  `).join('');
}

// --- RENDER KPI TABLE ---
function renderKpiTable(records) {
  const tbody = document.getElementById('kpiTableBody');

  if (!records.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#94a3b8;padding:2rem">No KPI records found.</td></tr>';
    return;
  }

  tbody.innerHTML = records.map(r => {
    const score = calcScore(r.target, r.achieved);
    return `
      <tr>
        <td><strong>${getEmpName(r.empId)}</strong></td>
        <td>${getEmpDept(r.empId)}</td>
        <td>${r.category}</td>
        <td>${r.target}</td>
        <td>${r.achieved}</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="score-bar" style="width:60px">
              <div class="score-fill ${scoreClass(score)}" style="width:${score}%"></div>
            </div>
            <span style="font-size:13px;font-weight:500">${score}%</span>
          </div>
        </td>
        <td>${r.period}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn btn-sm btn-secondary" onclick="editKpi(${r.id})">Edit</button>
            <button class="btn btn-sm btn-danger"    onclick="deleteKpi(${r.id})">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// --- FILTER ---
function filterKpi() {
  const dept = document.getElementById('kpiDeptFilter').value;
  let records = getKpiRecords();
  if (dept) {
    const empIds = getEmployees().filter(e => e.dept === dept).map(e => e.id);
    records = records.filter(r => empIds.includes(r.empId));
  }
  renderKpiTable(records);
}

// --- OPEN ADD MODAL ---
function openKpiModal() {
  document.getElementById('kpiModalTitle').textContent = 'Add KPI Entry';
  document.getElementById('kpiId').value       = '';
  document.getElementById('kpiTarget').value   = '';
  document.getElementById('kpiAchieved').value = '';
  document.getElementById('kpiPeriod').value   = 'Q1 2026';
  document.getElementById('kpiNotes').value    = '';
  document.getElementById('kpiCategory').value = 'Sales Revenue';
  document.getElementById('kpi-form-error').style.display = 'none';
  document.getElementById('kpiModal').style.display = 'flex';
}

// --- OPEN EDIT MODAL ---
function editKpi(id) {
  const r = getKpiRecords().find(x => x.id === id);
  if (!r) return;
  document.getElementById('kpiModalTitle').textContent  = 'Edit KPI Entry';
  document.getElementById('kpiId').value       = r.id;
  document.getElementById('kpiEmployee').value = r.empId;
  document.getElementById('kpiCategory').value = r.category;
  document.getElementById('kpiTarget').value   = r.target;
  document.getElementById('kpiAchieved').value = r.achieved;
  document.getElementById('kpiPeriod').value   = r.period;
  document.getElementById('kpiNotes').value    = r.notes;
  document.getElementById('kpi-form-error').style.display = 'none';
  document.getElementById('kpiModal').style.display = 'flex';
}

// --- SAVE KPI ---
function saveKpi() {
  const id       = document.getElementById('kpiId').value;
  const empId    = parseInt(document.getElementById('kpiEmployee').value);
  const category = document.getElementById('kpiCategory').value;
  const target   = parseFloat(document.getElementById('kpiTarget').value);
  const achieved = parseFloat(document.getElementById('kpiAchieved').value);
  const period   = document.getElementById('kpiPeriod').value.trim();
  const notes    = document.getElementById('kpiNotes').value.trim();
  const errEl    = document.getElementById('kpi-form-error');

  if (!empId || !target || isNaN(achieved) || !period) {
    showError(errEl, 'Please fill in Employee, Target, Achieved value and Period.');
    return;
  }

  let records = getKpiRecords();

  if (id) {
    records = records.map(r =>
      r.id === parseInt(id) ? { ...r, empId, category, target, achieved, period, notes } : r
    );
  } else {
    records.push({ id: nextId(records), empId, category, target, achieved, period, notes });
  }

  saveKpiRecords(records);
  closeKpiModal();
  renderKpiMetrics();
  renderKpiTable(getKpiRecords());
}

// --- DELETE KPI ---
function deleteKpi(id) {
  if (!confirm('Delete this KPI record?')) return;
  const records = getKpiRecords().filter(r => r.id !== id);
  saveKpiRecords(records);
  renderKpiMetrics();
  renderKpiTable(records);
}

function closeKpiModal() { document.getElementById('kpiModal').style.display = 'none'; }
