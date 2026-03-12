/* ============================================================
   Freelio — Business Dashboard
   app.js
   ============================================================ */

'use strict';

/* ── PAGE CONFIG ─────────────────────────── */
const pageConfig = {
  dashboard: { label: 'Dashboard', cta: 'New Invoice', modal: 'modal-newinvoice' },
  analytics:  { label: 'Analytics', cta: 'Export',      modal: null },
  projects:   { label: 'Projects',  cta: 'New Project', modal: 'modal-newproject' },
  clients:    { label: 'Clients',   cta: 'Add Client',  modal: 'modal-newclient'  },
  invoices:   { label: 'Invoices',  cta: 'New Invoice', modal: 'modal-newinvoice' },
  payments:   { label: 'Payments',  cta: 'Export',      modal: null },
};

/* ── SVG ICON STRINGS ─────────────────────────── */
const plusSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
  stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;flex-shrink:0">
  <path d="M12 5v14M5 12h14"/>
</svg>`;

const downSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
  stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;flex-shrink:0">
  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
</svg>`;

/* ── NAVIGATION ─────────────────────────── */
function navigate(id) {
  // Update sidebar active state
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === id);
  });

  // Show correct page
  document.querySelectorAll('.page').forEach(el => {
    el.classList.toggle('active', el.id === 'page-' + id);
  });

  // Update breadcrumb
  document.getElementById('bc').textContent = pageConfig[id].label;

  // Update top CTA button
  const cta = document.getElementById('topbar-cta');
  const cfg = pageConfig[id];
  const isExport = !cfg.modal;
  cta.innerHTML = (isExport ? downSVG : plusSVG) + cfg.cta;
  cta.onclick = cfg.modal
    ? () => openModal(cfg.modal)
    : () => alert('Exporting report…');

  // Lazy-init charts when those pages are first visited
  if (id === 'analytics') initAnalytics();
  if (id === 'payments')  initPayments();
}

// Attach nav click listeners
document.querySelectorAll('.nav-item[data-page]').forEach(el => {
  el.addEventListener('click', () => navigate(el.dataset.page));
});

// Default CTA action on load
document.getElementById('topbar-cta').onclick = () => openModal('modal-newinvoice');

/* ── MODALS ─────────────────────────── */
function openModal(id)  { document.getElementById(id).classList.add('open');    }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Close modal when clicking the backdrop
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

/* ── CHART GLOBAL DEFAULTS ─────────────────────────── */
const gc  = 'rgba(255,255,255,0.04)';  // grid colour
const tc  = '#6a7090';                 // tick colour
const tip = {
  backgroundColor: '#1c2030',
  borderColor:     'rgba(255,255,255,0.08)',
  borderWidth:     1,
  titleColor:      '#e8eaf0',
  bodyColor:       '#c8a96e',
  padding:         12,
  cornerRadius:    8,
};

Chart.defaults.color       = tc;
Chart.defaults.borderColor = gc;

/* ── DASHBOARD CHARTS (init on page load) ─────────────────────────── */

// Revenue line chart
new Chart(document.getElementById('earningsChart'), {
  type: 'line',
  data: {
    labels:   ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label:            'Revenue',
      data:             [1200, 1800, 1500, 2200, 2600, 3000],
      borderColor:      '#c8a96e',
      backgroundColor:  'rgba(200,169,110,.07)',
      borderWidth:      2,
      pointBackgroundColor: '#c8a96e',
      pointRadius:      4,
      pointHoverRadius: 6,
      fill:             true,
      tension:          0.4,
    }],
  },
  options: {
    responsive: true,
    plugins: {
      legend:  { display: false },
      tooltip: { ...tip, callbacks: { label: c => ' $' + c.parsed.y.toLocaleString() } },
    },
    scales: {
      x: { grid: { color: gc }, ticks: { color: tc, font: { size: 11 } } },
      y: { grid: { color: gc }, ticks: { color: tc, font: { size: 11 }, callback: v => '$' + v } },
    },
  },
});

// Client breakdown doughnut
new Chart(document.getElementById('clientChart'), {
  type: 'doughnut',
  data: {
    labels:   ['ABC Ltd', 'XYZ Corp', 'TechSoft', 'Others'],
    datasets: [{
      data:            [40, 25, 20, 15],
      backgroundColor: ['#c8a96e', '#6e9ec8', '#6ec89e', '#9e6ec8'],
      borderColor:     '#151820',
      borderWidth:     3,
      hoverOffset:     8,
    }],
  },
  options: {
    responsive: true,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: tc, padding: 12, font: { size: 11 }, usePointStyle: true, pointStyleWidth: 8 },
      },
      tooltip: { ...tip, callbacks: { label: c => ` ${c.label}: ${c.parsed}%` } },
    },
  },
});

/* ── ANALYTICS CHARTS (lazy init) ─────────────────────────── */
let analyticsInited = false;

function initAnalytics() {
  if (analyticsInited) return;
  analyticsInited = true;

  // Revenue vs Expenses bar chart
  new Chart(document.getElementById('analyticsRevenue'), {
    type: 'bar',
    data: {
      labels:   ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label:           'Revenue',
          data:            [1200, 1800, 1500, 2200, 2600, 3000],
          backgroundColor: 'rgba(200,169,110,.75)',
          borderRadius:    6,
          borderSkipped:   false,
        },
        {
          label:           'Expenses',
          data:            [400, 600, 500, 700, 800, 900],
          backgroundColor: 'rgba(110,158,200,.5)',
          borderRadius:    6,
          borderSkipped:   false,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend:  { labels: { color: tc, font: { size: 11 } } },
        tooltip: { ...tip },
      },
      scales: {
        x: { grid: { color: gc }, ticks: { color: tc, font: { size: 11 } } },
        y: { grid: { color: gc }, ticks: { color: tc, font: { size: 11 }, callback: v => '$' + v } },
      },
    },
  });

  // Project status pie chart
  new Chart(document.getElementById('analyticsStatus'), {
    type: 'pie',
    data: {
      labels:   ['Completed', 'In Progress', 'Pending'],
      datasets: [{
        data:            [2, 4, 2],
        backgroundColor: ['#6ec89e', '#6e9ec8', '#c8a96e'],
        borderColor:     '#151820',
        borderWidth:     3,
        hoverOffset:     8,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: tc, padding: 12, font: { size: 11 }, usePointStyle: true },
        },
        tooltip: { ...tip },
      },
    },
  });
}

/* ── PAYMENTS CHART (lazy init) ─────────────────────────── */
let paymentsInited = false;

function initPayments() {
  if (paymentsInited) return;
  paymentsInited = true;

  new Chart(document.getElementById('paymentChart'), {
    type: 'doughnut',
    data: {
      labels:   ['Bank Transfer', 'PayPal', 'Stripe', 'Crypto'],
      datasets: [{
        data:            [45, 25, 25, 5],
        backgroundColor: ['#c8a96e', '#6e9ec8', '#6ec89e', '#9e6ec8'],
        borderColor:     '#151820',
        borderWidth:     3,
        hoverOffset:     8,
      }],
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: tc, padding: 12, font: { size: 11 }, usePointStyle: true },
        },
        tooltip: { ...tip, callbacks: { label: c => ` ${c.label}: ${c.parsed}%` } },
      },
    },
  });
}
