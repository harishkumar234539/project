/* ===================================
   dashboard.js — Dashboard Page Logic
   =================================== */

// Run when the page loads
window.onload = function () {
  showDate();
  renderMetrics();
  renderTopPerformers();
  renderKriList();
  renderDeptChart();
  renderAttendanceChart();
};

// Show today's date in the top bar
function showDate() {
  const el = document.getElementById('today-date');
  if (el) el.textContent = new Date().toDateString();
}

// --- METRIC CARDS ---
function renderMetrics() {
  const employees  = getEmployees();
  const kpiRecords = getKpiRecords();
  const attendance = getAttendance();

  const totalEmp = employees.filter(e => e.status === 'active').length;

  // Average KPI score across all records
  const allScores = kpiRecords.map(r => calcScore(r.target, r.achieved));
  const avgKpi = allScores.length
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : 0;

  // At-risk = employees with avg KPI < 60
  const atRisk = employees.filter(emp => {
    const recs = kpiRecords.filter(r => r.empId === emp.id);
    if (!recs.length) return false;
    const avg = recs.reduce((a, r) => a + calcScore(r.target, r.achieved), 0) / recs.length;
    return avg < 60;
  }).length;

  // Overall attendance rate
  const totalAtt = attendance.length;
  const presentAtt = attendance.filter(a => a.status === 'present' || a.status === 'half-day').length;
  const attRate = totalAtt ? Math.round((presentAtt / totalAtt) * 100) : 0;

  // Goals: how many KPI records are >= 75% score
  const completed = kpiRecords.filter(r => calcScore(r.target, r.achieved) >= 75).length;
  const goalPct = kpiRecords.length ? Math.round((completed / kpiRecords.length) * 100) : 0;

  const metrics = [
    { label: 'Total Employees', value: totalEmp,       sub: 'Active staff',      cls: '' },
    { label: 'Avg KPI Score',   value: avgKpi + '%',   sub: 'All departments',   cls: avgKpi >= 70 ? 'up' : 'down' },
    { label: 'At-Risk Employees',value: atRisk,         sub: 'KRI flagged',       cls: atRisk > 0 ? 'down' : 'up' },
    { label: 'Attendance Rate', value: attRate + '%',   sub: 'This period',       cls: attRate >= 85 ? 'up' : 'down' },
    { label: 'Goals Completed', value: goalPct + '%',   sub: completed + ' of ' + kpiRecords.length, cls: '' },
  ];

  const grid = document.getElementById('metric-grid');
  grid.innerHTML = metrics.map(m => `
    <div class="metric-card">
      <div class="metric-label">${m.label}</div>
      <div class="metric-value">${m.value}</div>
      <div class="metric-sub ${m.cls}">${m.sub}</div>
    </div>
  `).join('');
}

// --- TOP PERFORMERS ---
function renderTopPerformers() {
  const employees  = getEmployees();
  const kpiRecords = getKpiRecords();

  // Build list of employees with their avg score, sorted best first
  const empScores = employees.map((emp, i) => {
    const recs = kpiRecords.filter(r => r.empId === emp.id);
    const avg  = recs.length
      ? Math.round(recs.reduce((a, r) => a + calcScore(r.target, r.achieved), 0) / recs.length)
      : 0;
    return { ...emp, avg, i };
  }).sort((a, b) => b.avg - a.avg).slice(0, 5);

  const container = document.getElementById('top-performers');
  container.innerHTML = empScores.map(emp => `
    <div class="emp-row">
      <div class="avatar ${avColor(emp.i)}">${initials(emp.name)}</div>
      <div class="emp-info">
        <div class="emp-name">${emp.name}</div>
        <div class="emp-dept">${emp.dept}</div>
      </div>
      <div class="score-box">
        <div class="score-num">${emp.avg}%</div>
        <div class="score-bar">
          <div class="score-fill ${scoreClass(emp.avg)}" style="width:${emp.avg}%"></div>
        </div>
      </div>
    </div>
  `).join('');
}

// --- KRI LIST ---
function renderKriList() {
  const kri = getKri();
  const container = document.getElementById('kri-list');
  container.innerHTML = kri.map(k => `
    <div class="kri-item">
      <div>
        <div class="kri-label">${k.title}</div>
        <div class="kri-sub">${k.detail}</div>
      </div>
      ${kriBadge(k.level)}
    </div>
  `).join('');
}

// --- DEPARTMENT KPI BAR CHART ---
function renderDeptChart() {
  const employees  = getEmployees();
  const kpiRecords = getKpiRecords();
  const depts = ['Sales', 'HR', 'Operations', 'Finance', 'IT'];

  const scores = depts.map(dept => {
    const emps = employees.filter(e => e.dept === dept).map(e => e.id);
    const recs  = kpiRecords.filter(r => emps.includes(r.empId));
    if (!recs.length) return 0;
    return Math.round(recs.reduce((a, r) => a + calcScore(r.target, r.achieved), 0) / recs.length);
  });

  new Chart(document.getElementById('deptChart'), {
    type: 'bar',
    data: {
      labels: depts,
      datasets: [{
        label: 'KPI %',
        data: scores,
        backgroundColor: ['#3b82f6','#14b8a6','#22c55e','#f59e0b','#ef4444'],
        borderRadius: 5,
        borderSkipped: false,
      }]
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

// --- ATTENDANCE TREND LINE CHART ---
function renderAttendanceChart() {
  new Chart(document.getElementById('attendChart'), {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [{
        label: 'Attendance %',
        data: [88, 90, 91],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.08)',
        tension: 0.3,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: '#2563eb',
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 80, max: 100, ticks: { callback: v => v + '%', font: { size: 11 } }, grid: { color: '#f1f5f9' } },
        x: { ticks: { font: { size: 11 } }, grid: { display: false } }
      }
    }
  });
}
