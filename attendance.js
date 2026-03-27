/* ===================================
   attendance.js — Attendance CRUD Logic
   =================================== */

window.onload = function () {
  populateEmpDropdown();
  renderAttMetrics();
  renderAttTable(getAttendance());
  // Set today's date as default in date filter
  document.getElementById('attDate') && (document.getElementById('attDate').value = todayStr());
};

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function populateEmpDropdown() {
  const select = document.getElementById('attEmployee');
  if (!select) return;
  select.innerHTML = getEmployees()
    .filter(e => e.status === 'active')
    .map(e => `<option value="${e.id}">${e.name} (${e.dept})</option>`)
    .join('');
}

// --- METRIC CARDS ---
function renderAttMetrics() {
  const records = getAttendance();
  const total   = records.length;
  const present = records.filter(r => r.status === 'present').length;
  const absent  = records.filter(r => r.status === 'absent').length;
  const half    = records.filter(r => r.status === 'half-day').length;
  const leave   = records.filter(r => r.status === 'leave').length;
  const rate    = total ? Math.round(((present + half) / total) * 100) : 0;

  const metrics = [
    { label: 'Total Records',   value: total,       sub: 'All entries'     },
    { label: 'Present',         value: present,     sub: 'Full day'        },
    { label: 'Absent',          value: absent,      sub: 'No show'         },
    { label: 'Overall Rate',    value: rate + '%',  sub: 'Present + half', cls: rate >= 85 ? 'up' : 'down' },
  ];

  document.getElementById('att-metrics').innerHTML = metrics.map(m => `
    <div class="metric-card">
      <div class="metric-label">${m.label}</div>
      <div class="metric-value">${m.value}</div>
      <div class="metric-sub ${m.cls || ''}">${m.sub}</div>
    </div>
  `).join('');
}

// --- RENDER TABLE ---
function renderAttTable(records) {
  const tbody = document.getElementById('attTableBody');

  if (!records.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:2rem">No attendance records found.</td></tr>';
    return;
  }

  tbody.innerHTML = records.map(r => `
    <tr>
      <td><strong>${getEmpName(r.empId)}</strong></td>
      <td>${getEmpDept(r.empId)}</td>
      <td>${r.date}</td>
      <td>${r.checkIn  || '—'}</td>
      <td>${r.checkOut || '—'}</td>
      <td>${attBadge(r.status)}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm btn-secondary" onclick="editAtt(${r.id})">Edit</button>
          <button class="btn btn-sm btn-danger"    onclick="deleteAtt(${r.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// --- FILTER ---
function filterAtt() {
  const date = document.getElementById('dateFilter').value;
  const dept = document.getElementById('attDeptFilter').value;
  let records = getAttendance();
  if (date) records = records.filter(r => r.date === date);
  if (dept) {
    const empIds = getEmployees().filter(e => e.dept === dept).map(e => e.id);
    records = records.filter(r => empIds.includes(r.empId));
  }
  renderAttTable(records);
}

// --- OPEN ADD MODAL ---
function openAttModal() {
  document.getElementById('attModalTitle').textContent = 'Mark Attendance';
  document.getElementById('attId').value      = '';
  document.getElementById('attDate').value    = todayStr();
  document.getElementById('attCheckIn').value = '';
  document.getElementById('attCheckOut').value= '';
  document.getElementById('attStatus').value  = 'present';
  document.getElementById('att-form-error').style.display = 'none';
  document.getElementById('attModal').style.display = 'flex';
}

// --- OPEN EDIT MODAL ---
function editAtt(id) {
  const r = getAttendance().find(a => a.id === id);
  if (!r) return;
  document.getElementById('attModalTitle').textContent = 'Edit Attendance';
  document.getElementById('attId').value       = r.id;
  document.getElementById('attEmployee').value = r.empId;
  document.getElementById('attDate').value     = r.date;
  document.getElementById('attCheckIn').value  = r.checkIn;
  document.getElementById('attCheckOut').value = r.checkOut;
  document.getElementById('attStatus').value   = r.status;
  document.getElementById('att-form-error').style.display = 'none';
  document.getElementById('attModal').style.display = 'flex';
}

// --- SAVE ATTENDANCE ---
function saveAttendance() {
  const id       = document.getElementById('attId').value;
  const empId    = parseInt(document.getElementById('attEmployee').value);
  const date     = document.getElementById('attDate').value;
  const checkIn  = document.getElementById('attCheckIn').value;
  const checkOut = document.getElementById('attCheckOut').value;
  const status   = document.getElementById('attStatus').value;
  const errEl    = document.getElementById('att-form-error');

  if (!empId || !date || !status) {
    showError(errEl, 'Please select an employee, date and status.');
    return;
  }

  let records = getAttendance();

  if (id) {
    records = records.map(r =>
      r.id === parseInt(id) ? { ...r, empId, date, checkIn, checkOut, status } : r
    );
  } else {
    records.push({ id: nextId(records), empId, date, checkIn, checkOut, status });
  }

  saveAttendance(records);
  closeAttModal();
  renderAttMetrics();
  renderAttTable(getAttendance());
}

// --- DELETE ---
function deleteAtt(id) {
  if (!confirm('Delete this attendance record?')) return;
  const records = getAttendance().filter(r => r.id !== id);
  saveAttendance(records);
  renderAttMetrics();
  renderAttTable(records);
}

function closeAttModal() { document.getElementById('attModal').style.display = 'none'; }
