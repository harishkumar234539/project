/* ===================================
   data.js — Shared Data Store
   All data is saved in localStorage so
   it persists while you use the app.
   =================================== */

// ---- DEFAULT SAMPLE DATA ----
const DEFAULT_EMPLOYEES = [
  { id: 1, code: 'EMP001', name: 'Arun Raj',     dept: 'Operations', role: 'Team Lead',       email: 'arun@company.com',  phone: '+91 98000 00001', join: '2022-01-10', status: 'active' },
  { id: 2, code: 'EMP002', name: 'Priya K.',      dept: 'HR',         role: 'HR Executive',    email: 'priya@company.com', phone: '+91 98000 00002', join: '2021-06-15', status: 'active' },
  { id: 3, code: 'EMP003', name: 'Suresh M.',     dept: 'Finance',    role: 'Finance Analyst', email: 'suresh@company.com',phone: '+91 98000 00003', join: '2020-03-20', status: 'active' },
  { id: 4, code: 'EMP004', name: 'Divya N.',      dept: 'Sales',      role: 'Sales Manager',   email: 'divya@company.com', phone: '+91 98000 00004', join: '2019-08-01', status: 'active' },
  { id: 5, code: 'EMP005', name: 'Ravi V.',       dept: 'IT',         role: 'Developer',       email: 'ravi@company.com',  phone: '+91 98000 00005', join: '2023-02-14', status: 'active' },
  { id: 6, code: 'EMP006', name: 'Meena S.',      dept: 'Sales',      role: 'Sales Executive', email: 'meena@company.com', phone: '+91 98000 00006', join: '2022-07-01', status: 'active' },
  { id: 7, code: 'EMP007', name: 'Karthik R.',    dept: 'IT',         role: 'System Admin',    email: 'karthik@company.com',phone:'+91 98000 00007', join: '2021-11-30', status: 'inactive'},
];

const DEFAULT_KPI = [
  { id: 1, empId: 1, category: 'Task Completion',      target: 100, achieved: 88, period: 'Q1 2026', notes: '' },
  { id: 2, empId: 2, category: 'Training Hours',        target: 40,  achieved: 33, period: 'Q1 2026', notes: '' },
  { id: 3, empId: 3, category: 'Quality Score',         target: 100, achieved: 61, period: 'Q1 2026', notes: '' },
  { id: 4, empId: 4, category: 'Sales Revenue',         target: 100, achieved: 94, period: 'Q1 2026', notes: 'Excellent quarter' },
  { id: 5, empId: 5, category: 'Project Delivery',      target: 10,  achieved: 4,  period: 'Q1 2026', notes: 'Multiple delays' },
  { id: 6, empId: 6, category: 'Customer Satisfaction', target: 100, achieved: 79, period: 'Q1 2026', notes: '' },
  { id: 7, empId: 7, category: 'Task Completion',       target: 100, achieved: 55, period: 'Q1 2026', notes: '' },
];

const DEFAULT_ATTENDANCE = [
  { id: 1, empId: 1, date: '2026-03-17', checkIn: '09:00', checkOut: '18:00', status: 'present' },
  { id: 2, empId: 2, date: '2026-03-17', checkIn: '09:15', checkOut: '18:00', status: 'present' },
  { id: 3, empId: 3, date: '2026-03-17', checkIn: '',      checkOut: '',      status: 'absent'  },
  { id: 4, empId: 4, date: '2026-03-17', checkIn: '09:00', checkOut: '18:30', status: 'present' },
  { id: 5, empId: 5, date: '2026-03-17', checkIn: '10:30', checkOut: '14:00', status: 'half-day'},
  { id: 6, empId: 1, date: '2026-03-18', checkIn: '09:00', checkOut: '18:00', status: 'present' },
  { id: 7, empId: 2, date: '2026-03-18', checkIn: '09:00', checkOut: '18:00', status: 'present' },
  { id: 8, empId: 3, date: '2026-03-18', checkIn: '09:30', checkOut: '18:00', status: 'present' },
  { id: 9, empId: 6, date: '2026-03-18', checkIn: '',      checkOut: '',      status: 'leave'   },
];

const DEFAULT_KRI = [
  { id: 1, title: 'High Absenteeism',    detail: 'IT Dept — 3 employees absent frequently', level: 'critical' },
  { id: 2, title: 'Missed Sales Target', detail: 'Sales — Q1 shortfall 18%',                level: 'warning'  },
  { id: 3, title: 'Deadline Overruns',   detail: 'Operations — 4 projects overdue',          level: 'warning'  },
  { id: 4, title: 'Training Completion', detail: 'All Depts — 78% completed',               level: 'normal'   },
  { id: 5, title: 'Employee Turnover',   detail: 'Monthly rate 2.1%',                        level: 'normal'   },
];

// ---- DATA ACCESS HELPERS ----
// These functions read and write data to localStorage (browser storage)

function getData(key, defaults) {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(stored);
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ---- SHORTCUT GETTERS ----
function getEmployees()  { return getData('kpi_employees',  DEFAULT_EMPLOYEES);  }
function getKpiRecords() { return getData('kpi_records',    DEFAULT_KPI);        }
function getAttendance() { return getData('kpi_attendance', DEFAULT_ATTENDANCE); }
function getKri()        { return getData('kpi_kri',        DEFAULT_KRI);        }

function saveEmployees(d)  { saveData('kpi_employees',  d); }
function saveKpiRecords(d) { saveData('kpi_records',    d); }
function saveAttendance(d) { saveData('kpi_attendance', d); }

// ---- UTILITY HELPERS ----

// Get employee name by ID
function getEmpName(id) {
  const emp = getEmployees().find(e => e.id === id);
  return emp ? emp.name : 'Unknown';
}

// Get employee dept by ID
function getEmpDept(id) {
  const emp = getEmployees().find(e => e.id === id);
  return emp ? emp.dept : '';
}

// Calculate KPI score % from target and achieved
function calcScore(target, achieved) {
  if (!target || target === 0) return 0;
  return Math.min(100, Math.round((achieved / target) * 100));
}

// Get colour class based on score
function scoreClass(score) {
  if (score >= 75) return 'fill-green';
  if (score >= 55) return 'fill-amber';
  return 'fill-red';
}

// Get badge HTML for KRI level
function kriBadge(level) {
  if (level === 'critical') return '<span class="badge badge-danger">Critical</span>';
  if (level === 'warning')  return '<span class="badge badge-warning">Warning</span>';
  return '<span class="badge badge-success">Normal</span>';
}

// Get attendance badge HTML
function attBadge(status) {
  const map = {
    present:  '<span class="badge badge-success">Present</span>',
    absent:   '<span class="badge badge-danger">Absent</span>',
    'half-day':'<span class="badge badge-warning">Half Day</span>',
    leave:    '<span class="badge badge-info">On Leave</span>',
  };
  return map[status] || status;
}

// Get initials from full name e.g. "Arun Raj" -> "AR"
function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// Pick avatar colour class based on index
const AV_COLORS = ['av-blue','av-teal','av-coral','av-purple','av-amber','av-green'];
function avColor(i) { return AV_COLORS[i % AV_COLORS.length]; }

// Generate next numeric ID for a list
function nextId(list) {
  return list.length > 0 ? Math.max(...list.map(x => x.id)) + 1 : 1;
}

// Average KPI score for an employee
function avgKpiScore(empId) {
  const records = getKpiRecords().filter(r => r.empId === empId);
  if (!records.length) return 'N/A';
  const scores = records.map(r => calcScore(r.target, r.achieved));
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) + '%';
}

// Attendance rate for an employee (% of present days)
function attRate(empId) {
  const records = getAttendance().filter(r => r.empId === empId);
  if (!records.length) return 'N/A';
  const present = records.filter(r => r.status === 'present' || r.status === 'half-day').length;
  return Math.round((present / records.length) * 100) + '%';
}
