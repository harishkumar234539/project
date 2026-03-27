/* ===================================
   employees.js — Employee CRUD Logic
   CRUD = Create, Read, Update, Delete
   =================================== */

window.onload = function () {
  renderTable(getEmployees());
};

// --- RENDER TABLE ---
function renderTable(employees) {
  const kpiRecords = getKpiRecords();
  const tbody = document.getElementById('empTableBody');

  if (!employees.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:2rem">No employees found.</td></tr>';
    return;
  }

  tbody.innerHTML = employees.map((emp, i) => {
    // Calculate average KPI score for this employee
    const recs = kpiRecords.filter(r => r.empId === emp.id);
    const score = recs.length
      ? Math.round(recs.reduce((a, r) => a + calcScore(r.target, r.achieved), 0) / recs.length)
      : null;

    const scoreHtml = score !== null
      ? `<div style="display:flex;align-items:center;gap:8px">
           <div class="score-bar" style="width:70px">
             <div class="score-fill ${scoreClass(score)}" style="width:${score}%"></div>
           </div>
           <span style="font-size:13px;font-weight:500">${score}%</span>
         </div>`
      : '<span style="color:#94a3b8;font-size:13px">No data</span>';

    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="avatar ${avColor(i)}">${initials(emp.name)}</div>
            <div>
              <div style="font-weight:500">${emp.name}</div>
              <div style="font-size:12px;color:#94a3b8">${emp.code}</div>
            </div>
          </div>
        </td>
        <td>${emp.dept}</td>
        <td>${emp.role}</td>
        <td>${scoreHtml}</td>
        <td>${emp.status === 'active'
          ? '<span class="badge badge-success">Active</span>'
          : '<span class="badge badge-danger">Inactive</span>'}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn btn-sm btn-secondary" onclick="viewEmployee(${emp.id})">View</button>
            <button class="btn btn-sm btn-secondary" onclick="editEmployee(${emp.id})">Edit</button>
            <button class="btn btn-sm btn-danger"    onclick="deleteEmployee(${emp.id})">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// --- SEARCH & FILTER ---
function filterEmployees() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const dept   = document.getElementById('deptFilter').value;
  const status = document.getElementById('statusFilter').value;

  let list = getEmployees();

  if (search) list = list.filter(e =>
    e.name.toLowerCase().includes(search) ||
    e.dept.toLowerCase().includes(search) ||
    e.code.toLowerCase().includes(search)
  );
  if (dept)   list = list.filter(e => e.dept   === dept);
  if (status) list = list.filter(e => e.status === status);

  renderTable(list);
}

// --- OPEN ADD MODAL ---
function openAddModal() {
  document.getElementById('modalTitle').textContent = 'Add Employee';
  document.getElementById('empId').value     = '';
  document.getElementById('empName').value   = '';
  document.getElementById('empCode').value   = '';
  document.getElementById('empRole').value   = '';
  document.getElementById('empEmail').value  = '';
  document.getElementById('empPhone').value  = '';
  document.getElementById('empJoin').value   = '';
  document.getElementById('empDept').value   = 'Sales';
  document.getElementById('empStatus').value = 'active';
  document.getElementById('form-error').style.display = 'none';
  document.getElementById('empModal').style.display = 'flex';
}

// --- OPEN EDIT MODAL ---
function editEmployee(id) {
  const emp = getEmployees().find(e => e.id === id);
  if (!emp) return;

  document.getElementById('modalTitle').textContent = 'Edit Employee';
  document.getElementById('empId').value     = emp.id;
  document.getElementById('empName').value   = emp.name;
  document.getElementById('empCode').value   = emp.code;
  document.getElementById('empRole').value   = emp.role;
  document.getElementById('empEmail').value  = emp.email;
  document.getElementById('empPhone').value  = emp.phone;
  document.getElementById('empJoin').value   = emp.join;
  document.getElementById('empDept').value   = emp.dept;
  document.getElementById('empStatus').value = emp.status;
  document.getElementById('form-error').style.display = 'none';
  document.getElementById('empModal').style.display = 'flex';
}

// --- VIEW EMPLOYEE PROFILE ---
function viewEmployee(id) {
  const emp   = getEmployees().find(e => e.id === id);
  const score = avgKpiScore(id);
  const rate  = attRate(id);
  if (!emp) return;

  document.getElementById('viewModalBody').innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:1.5rem">
      <div class="avatar av-blue" style="width:54px;height:54px;font-size:18px">${initials(emp.name)}</div>
      <div>
        <div style="font-size:18px;font-weight:600">${emp.name}</div>
        <div style="color:#64748b;font-size:13px">${emp.role} — ${emp.dept}</div>
      </div>
    </div>
    <table style="width:100%;font-size:14px;border-collapse:collapse">
      ${row('Employee ID', emp.code)}
      ${row('Email',       emp.email)}
      ${row('Phone',       emp.phone)}
      ${row('Join Date',   emp.join)}
      ${row('Status',      emp.status === 'active' ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>')}
      ${row('Avg KPI Score', score)}
      ${row('Attendance Rate', rate)}
    </table>
  `;
  document.getElementById('viewModal').style.display = 'flex';
}

function row(label, value) {
  return `<tr>
    <td style="padding:8px 0;color:#64748b;width:140px">${label}</td>
    <td style="padding:8px 0;font-weight:500">${value}</td>
  </tr>`;
}

// --- SAVE EMPLOYEE (Add or Edit) ---
function saveEmployee() {
  const id    = document.getElementById('empId').value;
  const name  = document.getElementById('empName').value.trim();
  const code  = document.getElementById('empCode').value.trim();
  const role  = document.getElementById('empRole').value.trim();
  const email = document.getElementById('empEmail').value.trim();
  const phone = document.getElementById('empPhone').value.trim();
  const join  = document.getElementById('empJoin').value;
  const dept  = document.getElementById('empDept').value;
  const status= document.getElementById('empStatus').value;
  const errEl = document.getElementById('form-error');

  // Basic validation
  if (!name || !code || !role || !email) {
    showError(errEl, 'Please fill in all required fields (Name, ID, Role, Email).');
    return;
  }

  let employees = getEmployees();

  if (id) {
    // Edit existing employee
    employees = employees.map(e =>
      e.id === parseInt(id) ? { ...e, name, code, role, email, phone, join, dept, status } : e
    );
  } else {
    // Add new employee
    const newEmp = { id: nextId(employees), code, name, dept, role, email, phone, join, status };
    employees.push(newEmp);
  }

  saveEmployees(employees);
  closeModal();
  renderTable(getEmployees());
}

// --- DELETE EMPLOYEE ---
function deleteEmployee(id) {
  if (!confirm('Are you sure you want to delete this employee?')) return;
  const employees = getEmployees().filter(e => e.id !== id);
  saveEmployees(employees);
  renderTable(employees);
}

// --- CLOSE MODALS ---
function closeModal()     { document.getElementById('empModal').style.display = 'none'; }
function closeViewModal() { document.getElementById('viewModal').style.display = 'none'; }
