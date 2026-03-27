/* ===================================
   reports.js — Reports & Charts
   =================================== */

window.onload = function () {
  renderDeptBarChart();
  renderScoreDistChart();
  renderAttLineChart();
  renderKriReport();
  renderFullReport();
};

// --- DEPARTMENT BAR CHART ---
function renderDeptBarChart() {
  const employees  = getEmployees();
  const kpiRecords = getKpiRecords();
  const depts = ['Sales', 'HR', 'Operations', 'Finance', 'IT'];

  const scores = depts.map(dept => {
    const empIds = employees.filter(e => e.dept === dept).map(e => e.id);
    const recs   = kpiRecords.filter(r => empIds.includes(r.empId));
    if (!recs.length) return 0;
    return Math.round(recs.reduce((a, r) => a + calcScore(r.target, r.achieved), 0) / recs.length);
  });

  new Chart(document.getElementById('deptBarChart'), {
    type: 'bar',
    data: {
      labels: depts,
      datasets: [{ label: 'Avg KPI %', data: scores,
        backgroundColor: ['#3b82f6','#14b8a6','#22c55e','#f59e0b','#ef4444'],
        borderRadius: 5, borderSkipped: false }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 100, ticks: { callback: v => v + '%', font: { size: 11 } }, grid: { color: '#f1f5f9' } },
        x: { ticks: { font: { size: 11 } }, grid: { display: false } }
      }
    }
  });
}

// --- KPI SCORE DISTRIBUTION PIE ---
function renderScoreDistChart() {
  const records = getKpiRecords();
  const high = records.filter(r => calcScore(r.target, r.achieved) >= 75).length;
  const med  = records.filter(r => { const s = calcScore(r.target, r.achieved); return s >= 55 && s < 75; }).length;
  const low  = records.filter(r => calcScore(r.target, r.achieved) < 55).length;

  new Chart(document.getElementById('scoreDistChart'), {
    type: 'doughnut',
    data: {
      labels: ['High (≥75%)', 'Medium (55–74%)', 'Low (<55%)'],
      datasets: [{ data: [high, med, low],
        backgroundColor: ['#22c55e','#f59e0b','#ef4444'],
        borderWidth: 2, borderColor: '#fff' }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 16 } }
      }
    }
  });
}

// --- MONTHLY ATTENDANCE LINE CHART ---
function renderAttLineChart() {
  new Chart(document.getElementById('attLineChart'), {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Attendance %',
        data: [86, 88, 91, 89, 92, 90],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.08)',
        tension: 0.3, fill: true, pointRadius: 5,
        pointBackgroundColor: '#2563eb'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 75, max: 100, ticks: { callback: v => v + '%', font: { size: 11 } }, grid: { color: '#f1f5f9' } },
        x: { ticks: { font: { size: 11 } }, grid: { display: false } }
      }
    }
  });
}

// --- KRI SUMMARY LIST ---
function renderKriReport() {
  const kri = getKri();
  document.getElementById('kri-report-list').innerHTML = kri.map(k => `
    <div class="kri-item">
      <div>
        <div class="kri-label">${k.title}</div>
        <div class="kri-sub">${k.detail}</div>
      </div>
      ${kriBadge(k.level)}
    </div>
  `).join('');
}

// --- FULL EMPLOYEE REPORT TABLE ---
function renderFullReport() {
  const employees  = getEmployees();
  const kpiRecords = getKpiRecords();
  const attendance = getAttendance();
  const tbody      = document.getElementById('reportTableBody');

  tbody.innerHTML = employees.map(emp => {
    // Avg KPI
    const recs = kpiRecords.filter(r => r.empId === emp.id);
    const avgScore = recs.length
      ? Math.round(recs.reduce((a, r) => a + calcScore(r.target, r.achieved), 0) / recs.length)
      : null;

    // Attendance %
    const attRecs = attendance.filter(a => a.empId === emp.id);
    const present = attRecs.filter(a => a.status === 'present' || a.status === 'half-day').length;
    const attPct  = attRecs.length ? Math.round((present / attRecs.length) * 100) : null;

    // KRI status
    const isAtRisk = (avgScore !== null && avgScore < 60) || (attPct !== null && attPct < 75);
    const kriStatus = isAtRisk
      ? '<span class="badge badge-danger">At Risk</span>'
      : '<span class="badge badge-success">Normal</span>';

    // Overall rating
    let rating = 'N/A';
    if (avgScore !== null) {
      if (avgScore >= 85) rating = 'Excellent';
      else if (avgScore >= 70) rating = 'Good';
      else if (avgScore >= 55) rating = 'Average';
      else rating = 'Poor';
    }

    return `
      <tr>
        <td><strong>${emp.name}</strong><br><span style="font-size:12px;color:#94a3b8">${emp.code}</span></td>
        <td>${emp.dept}</td>
        <td>${avgScore !== null ? avgScore + '%' : 'No data'}</td>
        <td>${attPct !== null ? attPct + '%' : 'No data'}</td>
        <td>${kriStatus}</td>
        <td><strong>${rating}</strong></td>
      </tr>
    `;
  }).join('');
}

// --- PRINT ---
function printReport() {
  window.print();
}
