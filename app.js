/* ═══════════════════════════════════════════
   ShiftLog — app.js
   Clean, modular vanilla JS
═══════════════════════════════════════════ */

'use strict';

/* ───────────────────────────────────────────
   DATA
─────────────────────────────────────────── */
let events      = [];
let disks       = [];
let eventCounter = 0;
let diskCounter  = 0;

const TICKET_DEFAULTS = {
  tkLeader:   'Bumbac Ilie',
  tkVehicle:  'DC #205',
  tkPlate:    'BSZY 986',
  tkVwPhone:  '-',
  tkCapPhone: '+4917617783147',
  tkLocation: 'Sydhavns Plads 15, 2450 København SV, Danmark',
};

const TICKET_FIELDS = ['tkLeader','tkVehicle','tkPlate','tkVwPhone','tkCapPhone','tkLocation'];

const DT_TYPES = new Set([
  'dt_ssd_issue','dt_ssd_logistics','dt_cleaning','dt_standby','dt_low_speed',
  'dt_vpi','dt_display','dt_prelabel','dt_ecu','dt_ssd_change','dt_measurement',
  'dt_startup','dt_protocol','dt_route_doc','dt_handover','dt_refuelling',
  'dt_transfer','dt_standby_wait','dt_maintenance','dt_service','dt_no_storage',
  'dt_police','dt_other_org',
]);

const DT_LABELS = {
  dt_ssd_issue:     'SSD Issue',
  dt_ssd_logistics: 'SSD Logistics',
  dt_cleaning:      'Sensors Cleaning',
  dt_standby:       'Stand-by System',
  dt_low_speed:     '< 35 km/h',
  dt_vpi:           'Recording Tool (VPI)',
  dt_display:       'Touch Display',
  dt_prelabel:      'Prelabel Tool',
  dt_ecu:           'ECU',
  dt_ssd_change:    'SSD Change',
  dt_measurement:   'Measurement System',
  dt_startup:       'Startup / Shutdown',
  dt_protocol:      'Protocol / Documentation',
  dt_route_doc:     'Driven Route Documentation',
  dt_handover:      'Handover',
  dt_refuelling:    'Refuelling',
  dt_transfer:      'Transfer',
  dt_standby_wait:  'Standby / Waiting',
  dt_maintenance:   'Vehicle Maintenance',
  dt_service:       'Vehicle Service',
  dt_no_storage:    'No Storage Medium',
  dt_police:        'Official / Police',
  dt_other_org:     'Others Org',
};

const DT_COMMENTS = {
  dt_ssd_issue:     ['LIVE displays "no volume" on Seagate device'],
  dt_ssd_logistics: [
    'Sending SSD xxx - tracking number',
    'Receiving SSD xxx',
    'Sending SSD xxx - tracking number. Receiving SSD xxx',
    'SSD handover/takeover to/from Name.Surname at Location',
  ],
  dt_cleaning:      ['All sensors cleaned with special solution'],
  dt_standby:       [
    'Standby due to no test car available',
    'Standby due to measurement system issues',
    'Standby due to no empty SSD Sets available',
  ],
  dt_low_speed:     ['Heavy Traffic','Construction Site','30 Zone'],
  dt_vpi:           [
    'VPI error at Start-up',
    'Recording stops by itself',
    'VPI Restart - Cannot stop recording',
    'VPI Restart - Camera Failure',
    'VPI freeze - Record button cannot be pressed',
  ],
  dt_display:       ['System Display disconnecting','System Touch Screen not working'],
  dt_prelabel:      ['Annotation Tool Freezes'],
  dt_ecu:           [
    'VPI/ECU restart - errors in TeraTerm',
    'ECU not booting up at Start-up',
    'ECU Crash in TeraTerm',
    'VPI/ECU restart - Dummy in TeraTerm',
  ],
  dt_ssd_change:    ['Change SSD from xxx to xxx'],
  dt_measurement:   [
    'Network not initializing after PC boot-up',
    'Disk X not available after PC boot-up',
    'Keyboard stopped working',
  ],
  dt_startup:       ['Basic system startup','Full system shutdown, Smart Storage unmount'],
  dt_protocol:      ['SCRIVE reporting'],
  dt_route_doc:     ['Driven route documentation','Driven route documentation. GPX upload'],
  dt_handover:      [
    'Outside/Inside check, Smart Storage mount',
    'Outside/Inside check. Handover of the car to the second shift',
    'Outside/Inside check. Handover of the car from previous shift',
  ],
  dt_refuelling:    ['Drive to gas station for car refuelling.','Refuelling','Credit card was not accepted.'],
  dt_transfer:      ['Transfer from A to B by test car','Transfer from A to B by train/plane'],
  dt_standby_wait:  ['Waiting for the first shift to arrive'],
  dt_maintenance:   ['Car Wash/Tire Change/Repair'],
  dt_service:       ['Vehicle at VW Service','Making an appointment for Service A/B'],
  dt_no_storage:    ['Standby due to no empty SSD sets available'],
  dt_police:        ['Vehicle stopped by Police','Vehicle stopped by customs for inspection'],
  dt_other_org:     ["Unloading luggage's at the hotel.","Accommodation check-in.","Accommodation check-out."],
};

const TICKET_TEMPLATES = {
  ssd_send: {
    category: 'SSD Logistics',
    description: '',
    body: 'The team has successfully shipped the following cases with SSD storage via UPS:\n• [SSD ID]\nTracking Number: [tracking number]\n\n• [SSD ID]\nTracking Number: [tracking number]',
  },
  ssd_receive: {
    category: 'SSD Logistics',
    description: '',
    body: 'The team has successfully collected the following SSD storage cases from the UPS access point:\n• [SSD ID]\n• [SSD ID]',
  },
  ssd_both: {
    category: 'SSD Logistics',
    description: '',
    body: 'The team has successfully shipped the following cases with SSD storage via UPS:\n• [SSD ID]\nTracking Number: [tracking number]\n\nThe team has also collected the following SSD storage cases from the UPS access point:\n• [SSD ID]\n• [SSD ID]',
  },
};

const PRESET_LINKS = [
  { name: '✅ Valeo Weekly Service Checklist',             url: 'https://docs.google.com/spreadsheets/d/1fIfvVzMMi6geveWhBDgL2RQMWY9IdwdL1PX7yZ5S4Es/edit?gid=49790384#gid=49790384' },
  { name: '📊 Standby hours Daimler 2/Valeo Capgemini',    url: 'https://docs.google.com/spreadsheets/d/10Kz_hzCU2JgE15kPQvTInlvWIX00e99PgX2BJ5GbSgQ/edit?gid=1765268257#gid=1765268257' },
  { name: '💶 GlobCom tour money request form',            url: 'https://docs.google.com/forms/d/e/1FAIpQLSc37f7uGqGFsccs4orBcpjtB_m9Q_hshRnA3q_jAmx0JBlAAw/viewform' },
  { name: '📖 [Capgemini KSS2.0] Messtechnik All Info',    url: 'https://drive.google.com/file/d/1Z8SUbQOXULfyDbQx9tyRcZajMKAPxJnb/view?usp=sharing' },
  { name: '📖 How to launch a Ticket — Generic ver. 3.4',  url: 'https://drive.google.com/file/d/14nzX_R_Sv1BaRHPf5DVwaWf7NkUkA2n9/view?usp=sharing' },
  { name: '📖 Manual for troubleshooting — KSS2.0',        url: 'https://drive.google.com/file/d/1y_oMQWJN4K8NJYK1A1kT6W5AeM4Tpp8z/view?usp=sharing' },
  { name: '📖 Manual for drivers KSS2.0',                  url: 'https://drive.google.com/file/d/13_0_4rsRu-VWP0pcdrMxx7EU-Rw7fSsZ/view?usp=sharing' },
  { name: '📖 Labeling — Definition of Symbols and Events',url: 'https://drive.google.com/file/d/1P7AOd1jbUQlWxLIiaEkL0ETzYytbvXSK/view?usp=sharing' },
];

const PRESET_DOCS = [
  { name: 'Driver Checklist — Capgemini',         url: 'https://drive.google.com/file/d/1FTl8FAYYB8IsK_j4cDaQ_WLv9p-9Wign/view?usp=sharing' },
  { name: 'SSD Handover Protocol',                url: 'https://drive.google.com/file/d/1sV1eR0CJKBo7hizzodv4LxT5eNDWKhyV/view?usp=sharing' },
  { name: 'Vehicle Handover Protocol — Capgemini',url: 'https://drive.google.com/file/d/16l3yObqaMJ88wV0tGIcFFiIN1M76vGK0/view?usp=sharing' },
];


/* ───────────────────────────────────────────
   HELPERS
─────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const isDT = type => DT_TYPES.has(type);

function nowHM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

function playBeep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch(e) {}
}

/* Enter blur — apply to all inputs/selects on page */
function bindEnterBlur() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) {
      e.preventDefault();
      e.target.blur();
    }
  });
}

/* Auto-height textarea */
function autoHeight(ta) {
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
}


/* ───────────────────────────────────────────
   THEME
─────────────────────────────────────────── */
function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.body.classList.add('dark');
  $('btnTheme').addEventListener('click', toggleTheme);
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}


/* ───────────────────────────────────────────
   LIVE CLOCK & SHIFT BADGE
─────────────────────────────────────────── */
function initClock() {
  tick();
  setInterval(tick, 1000);
}

function tick() {
  const now = new Date();
  $('liveTime').textContent = now.toTimeString().slice(0, 8);
  updateShiftBadge(now);
  updateScheduleHighlight(now);
}

function getShift(now) {
  const h = now.getHours(), m = now.getMinutes();
  const mins = h * 60 + m;
  if (mins >= 7*60  && mins < 15*60) return 'S1';
  if (mins >= 15*60 && mins < 23*60) return 'S2';
  return 'S3';
}

function updateShiftBadge(now) {
  const badge = $('shiftBadge');
  const s = getShift(now);
  badge.textContent = s;
  badge.className = 'shift-badge ' + s.toLowerCase();
}

function updateScheduleHighlight(now) {
  const s = getShift(now);
  const map = { S1: 1, S2: 2, S3: 3 };
  [1,2,3].forEach(i => {
    const row = $(`sched-row-${i}`);
    if (row) row.classList.toggle('active-shift', i === map[s]);
  });
}


/* ───────────────────────────────────────────
   NAVIGATION
─────────────────────────────────────────── */
function initNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      switchPage(page);
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function switchPage(name) {
  if (name === 'history') { openHistory(); return; }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = $(`page-${name}`);
  if (target) target.classList.add('active');
}


/* ───────────────────────────────────────────
   STATE — SAVE / LOAD
─────────────────────────────────────────── */
let _saveTimer = null;

function saveState() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(_doSave, 80);
}

function _doSave() {
  try {
    const state = {
      shiftDate:  $('shiftDate').value,
      vehicleId:  $('vehicleId').value,
      missionId:  $('missionId').value,
      cityField:  $('cityField').value,
      country:    $('country').value,
      driverId:   $('driverId').value,
      operatorId: $('operatorId').value,
      notes:      $('notes').value,
      events,
      disks,
      eventCounter,
      diskCounter,
    };
    localStorage.setItem('shiftState', JSON.stringify(state));
  } catch(e) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem('shiftState');
    if (!raw) return false;
    const s = JSON.parse(raw);
    $('shiftDate').value  = s.shiftDate  || new Date().toISOString().slice(0,10);
    $('vehicleId').value  = s.vehicleId  || 'DC-205';
    $('missionId').value  = s.missionId  || '';
    $('cityField').value  = s.cityField  || '';
    $('country').value    = s.country    || 'Germany';
    $('driverId').value   = s.driverId   || '1009';
    $('operatorId').value = s.operatorId || '1108';
    $('notes').value      = s.notes      || '';
    events       = s.events       || [];
    disks        = s.disks        || [];
    eventCounter = s.eventCounter || 0;
    diskCounter  = s.diskCounter  || 0;
    return true;
  } catch(e) { return false; }
}

function bindAutoSave() {
  document.addEventListener('change', saveState);
  document.addEventListener('input',  saveState);
  setInterval(_doSave, 5000);
}


/* ───────────────────────────────────────────
   EVENTS — RENDER
─────────────────────────────────────────── */
function renderEvents() {
  const list = $('eventsList');
  if (!list) return;

  if (events.length === 0) {
    list.innerHTML = '<div class="events-empty">No events yet — use Quick Add above</div>';
    return;
  }

  list.innerHTML = events.map(ev => buildEventCard(ev)).join('');

  // Bind textarea auto-height
  list.querySelectorAll('.event-desc').forEach(ta => {
    autoHeight(ta);
    ta.addEventListener('input', () => autoHeight(ta));
  });

  startEventTimers();
}

function buildEventCard(ev) {
  const isSys = isDT(ev.type) && !isOrgDT(ev.type);
  const isOrg = isOrgDT(ev.type);
  let cardClass = 'event-card';
  if (isSys) cardClass += ' dt-sys';
  if (isOrg) cardClass += ' dt-org';

  const timerHtml = (!ev.timeEnd && ev.timeStart)
    ? `<div class="event-timer" data-start="${ev.timeStart}" id="timer-${ev.id}">⏱ <span>...</span></div>`
    : '';

  const comments = DT_COMMENTS[ev.type] || [];
  const hasComments = isDT(ev.type) && comments.length > 0;

  const commentHtml = hasComments
    ? `<div class="dt-comment-row">
         <select class="dt-comment-select" onchange="applyDTComment(${ev.id}, this.value)">
           <option value="">— select comment —</option>
           ${comments.map(c => `<option value="${esc(c)}" ${ev.description === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
         </select>
       </div>`
    : '';

  const descHtml = `<textarea class="event-desc"
    rows="1"
    placeholder="Description…"
    onchange="updateEvent(${ev.id},'description',this.value)"
    oninput="updateEvent(${ev.id},'description',this.value)"
  >${esc(ev.description || '')}</textarea>`;

  return `
  <div class="event-card ${cardClass.replace('event-card ','')}" data-eid="${ev.id}">
    <div class="event-bar"></div>
    <div class="event-inner">
      <div class="event-row-main">
        <input type="time" value="${ev.timeStart}" onchange="updateEvent(${ev.id},'timeStart',this.value)">
        <input type="time" value="${ev.timeEnd || ''}" onchange="updateEvent(${ev.id},'timeEnd',this.value)">
        <select onchange="updateEvent(${ev.id},'type',this.value);updateEvent(${ev.id},'description','');renderEvents()">
          ${buildTypeOptions(ev.type)}
        </select>
        <button class="btn-remove" onclick="removeEvent(${ev.id})">✕</button>
      </div>
      ${timerHtml}
      ${hasComments ? `<div id="dt-comment-row-${ev.id}">${commentHtml}</div>` : ''}
      <div id="dt-desc-row-${ev.id}" style="display:none" data-open="0">${descHtml}</div>
      <div class="event-row-km">
        <input type="number" placeholder="start" value="${ev.kmStart || ''}"
          onchange="updateEvent(${ev.id},'kmStart',this.value)"
          onkeydown="if(event.key==='Enter'){this.blur();document.querySelector('[data-eid=\\'${ev.id}\\'] .km-end').focus();}">
        <span class="km-label">km</span>
        <span class="km-arrow">→</span>
        <input type="number" placeholder="end" value="${ev.kmFinish || ''}" class="km-end"
          onchange="updateEvent(${ev.id},'kmFinish',this.value)">
        <span class="km-label">km</span>
      </div>
      <div class="event-row-addr">
        <input type="text" placeholder="Address" value="${esc(ev.address || '')}"
          onchange="updateEvent(${ev.id},'address',this.value)">
        <button class="btn-geo" onclick="geoFillEvent(${ev.id}, this)" title="Get address">📍</button>
      </div>
    </div>
  </div>`;
}

const ORG_DT = new Set([
  'dt_protocol','dt_route_doc','dt_handover','dt_refuelling','dt_transfer',
  'dt_standby_wait','dt_maintenance','dt_service','dt_no_storage','dt_police',
  'dt_other_org','break',
]);
function isOrgDT(type) { return ORG_DT.has(type); }

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/"/g,'&quot;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

function buildTypeOptions(selected) {
  const sys = [
    ['dt_startup','Startup / Shutdown'],['dt_cleaning','Sensors Cleaning'],
    ['dt_vpi','Recording Tool (VPI)'],['dt_ecu','ECU'],
    ['dt_display','Touch Display'],['dt_prelabel','Prelabel Tool'],
    ['dt_measurement','Measurement System'],['dt_low_speed','< 35 km/h'],
    ['dt_ssd_issue','SSD Issue'],['dt_ssd_logistics','SSD Logistics'],
    ['dt_ssd_change','SSD Change'],['dt_standby','Stand-by System'],
  ];
  const org = [
    ['dt_handover','Handover'],['dt_protocol','Protocol / Documentation'],
    ['dt_route_doc','Driven Route Documentation'],['dt_refuelling','Refuelling'],
    ['dt_transfer','Transfer'],['dt_maintenance','Vehicle Maintenance'],
    ['dt_service','Vehicle Service'],['dt_no_storage','No Storage Medium'],
    ['dt_police','Official / Police'],['break','Break'],
    ['dt_standby_wait','Standby / Waiting'],['dt_other_org','Others Org'],
  ];

  const opt = ([v,l]) => `<option value="${v}" ${v===selected?'selected':''}>${l}</option>`;
  return `
    <option value="other" ${selected==='other'?'selected':''}>Other</option>
    <optgroup label="── System DT ──">${sys.map(opt).join('')}</optgroup>
    <optgroup label="── Org DT ──">${org.map(opt).join('')}</optgroup>
  `;
}


/* ───────────────────────────────────────────
   EVENTS — ACTIONS
─────────────────────────────────────────── */
function addEvent(type = 'other', description = '') {
  const id = ++eventCounter;
  events.push({ id, type, timeStart: nowHM(), timeEnd: '', kmStart: '', kmFinish: '', description, address: '' });
  renderEvents();
  saveState();
  playBeep();
  requestNotifPermission();

  setTimeout(() => {
    const card = document.querySelector(`[data-eid="${id}"]`);
    if (card) {
      const rect = card.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const target = scrollTop + rect.top - (window.innerHeight / 2) + (rect.height / 2);
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
    const inp = document.querySelector(`[data-eid="${id}"] input[type="time"]`);
    if (inp) inp.focus();
  }, 150);
}

function removeEvent(id) {
  showConfirm('Delete this event?', () => {
    events = events.filter(e => e.id !== id);
    renderEvents();
    saveState();
  });
}

function updateEvent(id, field, value) {
  const ev = events.find(e => e.id === id);
  if (ev) { ev[field] = value; saveState(); }
  if (field === 'timeEnd') updateTimerDisplay(id);
}

function applyDTComment(id, val) {
  if (!val) return;
  updateEvent(id, 'description', val);
  // Обновляем textarea в фоне, но не показываем его
  const descRow = $(`dt-desc-row-${id}`);
  if (descRow) {
    const ta = descRow.querySelector('textarea');
    if (ta) { ta.value = val; autoHeight(ta); }
  }
  saveState();
}

function toggleDTEdit(id) {
  const row = $(`dt-desc-row-${id}`);
  if (!row) return;
  const hidden = row.style.display === 'none' || row.style.display === '';
  // Определяем текущее состояние через data-атрибут
  const isOpen = row.dataset.open === '1';
  if (isOpen) {
    row.style.display = 'none';
    row.dataset.open = '0';
  } else {
    row.style.display = '';
    row.dataset.open = '1';
    const ta = row.querySelector('textarea');
    if (ta) { autoHeight(ta); ta.focus(); }
  }
}

// KM Enter copy
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (e.target.placeholder === 'start') {
    e.preventDefault();
    const card = e.target.closest('[data-eid]');
    if (!card) return;
    const id = +card.dataset.eid;
    const val = e.target.value;
    updateEvent(id, 'kmStart', val);
    // Copy to km end if empty
    const ev = events.find(ev => ev.id === id);
    if (ev && !ev.kmFinish) {
      updateEvent(id, 'kmFinish', val);
      const endInput = card.querySelector('.km-end');
      if (endInput) endInput.value = val;
    }
    const endInput = card.querySelector('.km-end');
    if (endInput) endInput.focus();
  }
});


/* ───────────────────────────────────────────
   EVENT TIMER
─────────────────────────────────────────── */
let _timerInterval = null;
let _lastReminderAt = 0;

function startEventTimers() {
  if (_timerInterval) clearInterval(_timerInterval);
  _timerInterval = setInterval(updateAllTimers, 10000);
  updateAllTimers();
}

function updateAllTimers() {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  document.querySelectorAll('.event-timer[data-start]').forEach(el => {
    const [h, m] = el.dataset.start.split(':').map(Number);
    let diff = nowMins - (h * 60 + m);
    if (diff < 0) diff += 1440;
    const label = diff >= 60
      ? `${Math.floor(diff/60)}h ${diff%60}min`
      : `${diff}min`;
    const span = el.querySelector('span');
    if (span) span.textContent = label;
    el.classList.toggle('warning', diff >= 45);
    if (diff >= 45) span.textContent = label + ' ⚠ close event?';
  });

  checkOpenEventReminder(nowMins);
}

function updateTimerDisplay(id) {
  const el = $(`timer-${id}`);
  if (!el) return;
  const ev = events.find(e => e.id === id);
  if (ev && ev.timeEnd) el.style.display = 'none';
}

function checkOpenEventReminder(nowMins) {
  const open = events.filter(e => e.timeStart && !e.timeEnd);
  if (!open.length) return;
  const [h, m] = open[0].timeStart.split(':').map(Number);
  let diff = nowMins - (h * 60 + m);
  if (diff < 0) diff += 1440;
  if (diff >= 30 && (Date.now() - _lastReminderAt) > 25 * 60 * 1000) {
    _lastReminderAt = Date.now();
    showToast(`⚠ Event open for ${diff}min — remember to close it!`);
    if (Notification && Notification.permission === 'granted') {
      new Notification('ShiftLog', {
        body: `Event open for ${diff} min`,
      });
    }
  }
}

function requestNotifPermission() {
  if (Notification && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}


/* ───────────────────────────────────────────
   QUICK ADD
─────────────────────────────────────────── */
function initQuickAdd() {
  document.querySelectorAll('.q-btn').forEach(btn => {
    btn.addEventListener('click', () => addEvent(btn.dataset.type, ''));
  });
  $('btnAddEvent').addEventListener('click', () => addEvent('other', ''));
}


/* ───────────────────────────────────────────
   DISK STATUS
─────────────────────────────────────────── */
function renderDisks() {
  const list = $('diskList');
  if (!list) return;
  // Auto-sort: in use → empty → full
  const order = { 'in use': 0, 'empty': 1, 'full': 2 };
  const sorted = [...disks].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
  list.innerHTML = sorted.map(dk => buildDiskRow(dk)).join('');
}

function buildDiskRow(dk) {
  const isInUse = dk.status === 'in use';
  const tbVal = parseFloat(dk.percent) || 0;
  // pct = процент заполненности (0..100)
  let pct = 0;
  if (dk.status === 'empty') pct = 0;
  else if (dk.status === 'full') pct = 100;
  else if (isInUse) pct = dk.percent ? Math.round((1 - tbVal / 90) * 100) : 0;

  // Градиент цвета: зелёный(0%) → жёлтый(50%) → красный(100%)
  function gradColor(p) {
    const clamped = Math.max(0, Math.min(100, p));
    if (clamped <= 50) {
      // зелёный → жёлтый
      const t = clamped / 50;
      const r = Math.round(22 + (234 - 22) * t);
      const g = Math.round(163 + (179 - 163) * t);
      const b = Math.round(74 + 74 * (1 - t));
      return `rgb(${r},${g},${b})`;
    } else {
      // жёлтый → красный
      const t = (clamped - 50) / 50;
      const r = Math.round(234 + (239 - 234) * t);
      const g = Math.round(179 - 179 * t);
      const b = Math.round(8 - 8 * t);
      return `rgb(${r},${g},${b})`;
    }
  }

  let barStyle = '';
  if (dk.status === 'empty') barStyle = `width:100%;background:#30d158`;
  else if (dk.status === 'full') barStyle = `width:100%;background:#ff453a`;
  else barStyle = `width:${pct}%;background:${gradColor(pct)}`;

  // Цвет для TB input и label совпадает с цветом бара
  const inUseColor = isInUse ? gradColor(pct) : 'var(--sub)';

  const pctInfo = isInUse
    ? `<div class="disk-pct-row">
         <input type="number" value="${dk.percent}" min="0" max="90" step="0.1" class="disk-pct-input"
           style="color:${inUseColor}"
           onchange="updateDisk(${dk.id},'percent',this.value);renderDisks();saveState()"
           placeholder="TB">
         <span class="disk-pct-label" style="color:${inUseColor}">TB available · <b>${pct}%</b> full</span>
       </div>`
    : '';

  return `
  <div class="disk-row" data-did="${dk.id}">
    <input type="text" value="${esc(dk.diskId || '')}" placeholder="#xxxxxx"
      onchange="updateDisk(${dk.id},'diskId',this.value)">
    <div class="disk-track">
      <div class="disk-fill" style="${barStyle}"></div>
    </div>
    <select onchange="updateDisk(${dk.id},'status',this.value);renderDisks();saveState()">
      <option value="empty" ${dk.status==='empty'?'selected':''}>empty</option>
      <option value="in use" ${dk.status==='in use'?'selected':''}>in use</option>
      <option value="full" ${dk.status==='full'?'selected':''}>full</option>
    </select>
    <button class="btn-remove" onclick="removeDisk(${dk.id})">✕</button>
    ${pctInfo}
  </div>`;
}

function addDisk() {
  disks.push({ id: ++diskCounter, diskId: '', status: 'empty', percent: '' });
  renderDisks();
  saveState();
}

function removeDisk(id) {
  showConfirm('Delete this disk?', () => {
    disks = disks.filter(d => d.id !== id);
    renderDisks();
    saveState();
  });
}

function updateDisk(id, field, value) {
  const dk = disks.find(d => d.id === id);
  if (dk) { dk[field] = value; saveState(); }
}

function copyDiskStatus() {
  const vehicle = $('vehicleId').value || 'N/A';
  const city    = $('cityField').value  || $('country').value;
  let out = `Please find below the Storage Box status for vehicle ${vehicle} in ${city}:\n\n`;
  disks.forEach(dk => {
    if (!dk.diskId) return;
    let s = dk.status;
    if (dk.status === 'in use' && dk.percent) {
      const pct = Math.round((1 - parseFloat(dk.percent) / 90) * 100);
      s = `in use (${pct}% full, ${dk.percent} TB available)`;
    }
    out += `${dk.diskId} - ${s}\n`;
  });
  navigator.clipboard.writeText(out.trimEnd()).then(() => showToast('Disk report copied'));
}


/* ───────────────────────────────────────────
   REPORT GENERATION
─────────────────────────────────────────── */
function generateReport() {
  const date     = $('shiftDate').value;
  const vehicle  = $('vehicleId').value  || 'N/A';
  const mission  = $('missionId').value;
  const city     = $('cityField').value;
  const country  = $('country').value;
  const driverId = $('driverId').value;
  const operator = $('operatorId').value;
  const notes    = $('notes').value;

  const d = date ? new Date(date) : null;
  const ds = d
    ? `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`
    : '__.__.____';

  let out = `${ds}\n`;
  if (driverId) out += `Driver: ${driverId}\n`;
  if (operator) out += `Operator: ${operator}\n`;
  out += '\n';

  events.forEach(ev => {
    const t1 = ev.timeStart || '--:--';
    const t2 = ev.timeEnd ? ` - ${ev.timeEnd}` : '';
    let km = '';
    if (ev.kmStart && ev.kmFinish)
      km = ev.kmStart === ev.kmFinish ? ` (${ev.kmStart} km)` : ` (${ev.kmStart} - ${ev.kmFinish} km)`;
    else if (ev.kmStart) km = ` (${ev.kmStart} km)`;

    const label    = isDT(ev.type) ? (DT_LABELS[ev.type] || ev.type) : '';
    const descLine = isDT(ev.type)
      ? (label + (ev.description ? `\n${ev.description}` : ''))
      : ev.description;

    out += `${t1}${t2}${km} ${descLine}\n`;
    if (ev.address) out += `${ev.address}\n`;
    out += '\n';
  });

  if (mission) out += `Mission ID ${mission}.\n`;
  if (city)    out += `City: ${city}.\n`;
  if (mission || city) out += '\n';

  if (disks.length) {
    out += `Disk Status — Vehicle ${vehicle}`;
    if (country) out += `, ${country}`;
    out += ':\n\n';
    disks.forEach(dk => {
      let s = dk.status;
      if (dk.status === 'in use' && dk.percent) {
        const pct = Math.round((1 - parseFloat(dk.percent) / 90) * 100);
        s += ` (${pct}% full, ${dk.percent} TB available)`;
      }
      out += `${dk.diskId} - ${s}.\n`;
    });
  }

  // Shift Summary
  let dtMins = 0, recMins = 0;
  let shiftStart = '', shiftEnd = '';
  events.forEach(ev => {
    if (!ev.timeStart || !ev.timeEnd) return;
    const [sh,sm] = ev.timeStart.split(':').map(Number);
    const [eh,em] = ev.timeEnd.split(':').map(Number);
    let diff = (eh*60+em) - (sh*60+sm);
    if (diff < 0) diff += 1440;
    if (isDT(ev.type)) dtMins  += diff;
    if (ev.type === 'recording') recMins += diff;
  });
  if (events.length) shiftStart = events[0].timeStart || '';
  for (let i = events.length-1; i >= 0; i--) {
    if (events[i].timeEnd) { shiftEnd = events[i].timeEnd; break; }
  }

  const fmt = min => min >= 60 ? `${Math.floor(min/60)}h ${min%60}min` : `${min}min`;

  if (dtMins > 0 || recMins > 0 || shiftStart) {
    out += '\n── Shift Summary ──\n';
    if (shiftStart) out += `Shift: ${shiftStart}${shiftEnd ? ' - '+shiftEnd : ''}\n`;
    if (recMins > 0) out += `Recording time: ${fmt(recMins)}\n`;
    if (dtMins  > 0) out += `Total Downtime: ${fmt(dtMins)}\n`;
  }

  if (notes) out += `\nNotes:\n${notes}`;
  return out;
}

function openPreview() {
  $('previewText').textContent = generateReport();
  $('previewOverlay').classList.add('open');
}

function copyReport() {
  navigator.clipboard.writeText(generateReport())
    .then(() => { showToast('Report copied'); closeModal('previewOverlay'); });
}


/* ───────────────────────────────────────────
   NEW SHIFT
─────────────────────────────────────────── */
function newShift() {
  showConfirm('Start new shift? All events will be cleared.', _doNewShift, 'Start');
}

function _doNewShift() {
  saveToHistory();
  const savedDisks       = disks.slice();
  const savedDiskCounter = diskCounter;
  localStorage.removeItem('shiftState');
  events = []; eventCounter = 0;
  disks = savedDisks; diskCounter = savedDiskCounter;
  $('shiftDate').value  = new Date().toISOString().slice(0,10);
  $('missionId').value  = '';
  $('cityField').value  = '';
  $('vehicleId').value  = 'DC-205';
  $('country').value    = 'Germany';
  $('driverId').value   = '1009';
  $('operatorId').value = '1108';
  $('notes').value      = '';
  renderEvents();
  renderDisks();
  showToast('New shift started');
}


/* ───────────────────────────────────────────
   HISTORY
─────────────────────────────────────────── */
function saveToHistory() {
  const report = generateReport();
  if (!report.trim() || events.length === 0) return;
  try {
    const hist  = JSON.parse(localStorage.getItem('shiftHistory') || '[]');
    const date  = $('shiftDate').value || new Date().toISOString().slice(0,10);
    const vehicle = $('vehicleId').value || '';
    hist.unshift({ date, vehicle, report, saved: new Date().toLocaleString() });
    if (hist.length > 14) hist.splice(14);
    localStorage.setItem('shiftHistory', JSON.stringify(hist));
  } catch(e) {}
}

function openHistory() {
  const hist = JSON.parse(localStorage.getItem('shiftHistory') || '[]');
  const list = $('historyList');

  if (hist.length === 0) {
    list.innerHTML = '<div style="text-align:center;color:var(--muted);padding:40px;font-size:13px">No saved shifts yet</div>';
  } else {
    list.innerHTML = hist.map((h, i) => {
      const date = h.date.split('-').reverse().join('.');
      return `
      <div class="history-item">
        <div class="history-info">
          <div class="history-date">${date} &nbsp;·&nbsp; ${h.vehicle}</div>
          <div class="history-saved">Saved: ${h.saved}</div>
        </div>
        <div class="history-btns">
          <button class="btn-history-copy" onclick="copyHistory(${i})">Copy</button>
          <button class="btn-history-del"  onclick="deleteHistory(${i})">✕</button>
        </div>
      </div>`;
    }).join('');
  }
  $('historyOverlay').classList.add('open');
}

function copyHistory(i) {
  const hist = JSON.parse(localStorage.getItem('shiftHistory') || '[]');
  if (hist[i]) navigator.clipboard.writeText(hist[i].report).then(() => showToast('Report copied'));
}

function deleteHistory(i) {
  const hist = JSON.parse(localStorage.getItem('shiftHistory') || '[]');
  if (!hist[i]) return;
  const label = hist[i].date.split('-').reverse().join('.') + ' · ' + hist[i].vehicle;
  showConfirm(`Delete shift ${label}?`, () => {
    hist.splice(i, 1);
    localStorage.setItem('shiftHistory', JSON.stringify(hist));
    openHistory();
    showToast('Shift deleted');
  });
}


/* ───────────────────────────────────────────
   TICKET
─────────────────────────────────────────── */
function initTicket() {
  loadTicketSettings();
  $('tkTemplate').addEventListener('change', e => {
    applyTicketTemplate(e.target.value);
  });
  $('btnClearTicket').addEventListener('click', clearTicketFields);
  $('btnCopyTicket').addEventListener('click', copyTicket);
  $('btnCopyUpdate').addEventListener('click', copyUpdate);
  TICKET_FIELDS.forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('change', saveTicketSettings);
  });
}

function loadTicketSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('ticketSettings') || '{}');
    TICKET_FIELDS.forEach(id => {
      const el = $(id);
      if (el) el.value = (s[id] !== undefined) ? s[id] : (TICKET_DEFAULTS[id] || '');
    });
  } catch(e) {
    TICKET_FIELDS.forEach(id => {
      const el = $(id);
      if (el) el.value = TICKET_DEFAULTS[id] || '';
    });
  }
}

function saveTicketSettings() {
  const s = {};
  TICKET_FIELDS.forEach(id => { const el = $(id); if (el) s[id] = el.value || ''; });
  try { localStorage.setItem('ticketSettings', JSON.stringify(s)); } catch(e) {}
}

function applyTicketTemplate(val) {
  if (!val) return;
  const t = TICKET_TEMPLATES[val];
  if (!t) return;
  $('tkCategory').value    = t.category;
  $('tkDescription').value = t.description;
  $('tkBody').value        = t.body;
  saveTicketSettings();
  showToast('Template applied');
}

function clearTicketFields() {
  $('tkCategory').value    = '';
  $('tkDescription').value = '';
  $('tkBody').value        = '';
  saveTicketSettings();
}

function copyTicket() {
  const v = id => $(id)?.value || '';
  const vehicle = v('tkVehicle') || $('vehicleId').value;
  const NL = '\n';
  let out = '';
  out += `Team Leader Name: ${v('tkLeader')}${NL}`;
  out += `Vehicle Nr.: ${vehicle}${NL}`;
  out += `License Plate: ${v('tkPlate')}${NL}`;
  out += `Category: ${v('tkCategory')}${NL}`;
  out += `Description: ${v('tkDescription').trim()}${NL}`;
  out += `Location, address: ${v('tkLocation')}${NL}`;
  out += `VW Phone: ${v('tkVwPhone') || '-'}${NL}`;
  out += `Capgemini phone: ${v('tkCapPhone')}${NL}`;
  if (v('tkBody')) {
    out += `${NL}Dear Partners,${NL}${NL}${v('tkBody')}${NL}${NL}Best regards,`;
  }
  navigator.clipboard.writeText(out.trim()).then(() => showToast('Ticket copied'));
}

function copyUpdate() {
  const body = $('tkUpdate')?.value || '';
  if (!body.trim()) { showToast('Update body is empty'); return; }
  const out = `Update:\n\n${body.trim()}\n\nBest regards.`;
  navigator.clipboard.writeText(out).then(() => showToast('Update copied'));
}


/* ───────────────────────────────────────────
   DOCS — RENDER
─────────────────────────────────────────── */
function renderDocs() {
  // Quick Links — первые 3
  const linksList = $('quickLinksList');
  if (linksList) {
    linksList.innerHTML = PRESET_LINKS.slice(0, 3).map(l =>
      `<a class="quick-link-item" href="${l.url}" target="_blank" rel="noopener">
        <span>${l.name}</span>
        <span class="quick-link-arrow">↗</span>
      </a>`
    ).join('');
  }

  // Manuals — остальные ссылки (начиная с 4-й)
  const manualsList = $('manualLinksList');
  if (manualsList) {
    manualsList.innerHTML = PRESET_LINKS.slice(3).map(l =>
      `<a class="quick-link-item" href="${l.url}" target="_blank" rel="noopener">
        <span>${l.name}</span>
        <span class="quick-link-arrow">↗</span>
      </a>`
    ).join('');
  }

  // Preset docs
  const docsList = $('presetDocsList');
  if (docsList) {
    docsList.innerHTML = PRESET_DOCS.map(d =>
      `<div class="doc-item">
        <span class="doc-icon">📄</span>
        <div class="doc-info">
          <div class="doc-name">${d.name}</div>
        </div>
        <button class="btn-open" onclick="window.open('${d.url}','_blank')">Open</button>
      </div>`
    ).join('');
  }
}


/* ───────────────────────────────────────────
   GPS GEOLOCATION
─────────────────────────────────────────── */
async function geoFetch(btn, onResult) {
  if (!navigator.geolocation) { showToast('Geolocation not supported'); return; }
  const orig = btn.textContent;
  btn.textContent = '⏳';
  navigator.geolocation.getCurrentPosition(
    async pos => {
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        onResult(data.address || {});
      } catch(e) { showToast('Could not get location'); }
      btn.textContent = orig;
    },
    () => { showToast('Location denied'); btn.textContent = orig; },
    { timeout: 8000, enableHighAccuracy: true }
  );
}

function initGeo() {
  $('btnGeoCity').addEventListener('click', function() {
    geoFetch(this, a => {
      const city = a.city || a.town || a.village || a.county || '';
      if (city) { $('cityField').value = city; saveState(); showToast('City: ' + city); }
    });
  });

  $('btnGeoTicket').addEventListener('click', function() {
    geoFetch(this, a => {
      const road    = (a.road || '') + (a.house_number ? ' ' + a.house_number : '');
      const city    = (a.postcode || '') + (a.city || a.town || a.village ? ' ' + (a.city || a.town || a.village) : '');
      const country = a.country || '';
      const addr    = [road, city, country].filter(Boolean).join(', ');
      $('tkLocation').value = addr;
      saveTicketSettings();
      showToast('Location updated');
    });
  });
}

function geoFillEvent(id, btn) {
  geoFetch(btn, a => {
    const road    = (a.road || '') + (a.house_number ? ' ' + a.house_number : '');
    const city    = (a.postcode || '') + (a.city || a.town || a.village ? ' ' + (a.city || a.town || a.village) : '');
    const country = a.country || '';
    const addr    = [road, city, country].filter(Boolean).join(', ');
    updateEvent(id, 'address', addr);
    const card = document.querySelector(`[data-eid="${id}"]`);
    if (card) {
      const inp = card.querySelector('.event-row-addr input');
      if (inp) inp.value = addr;
    }
    showToast('Address updated');
  });
}


/* ───────────────────────────────────────────
   CONFIRM MODAL
─────────────────────────────────────────── */
let _confirmCb = null;

function showConfirm(msg, onOk, okLabel = 'Delete') {
  $('confirmText').textContent = msg;
  const btn = $('btnConfirmOk');
  btn.textContent = okLabel;
  const isDestructive = okLabel === 'Delete';
  btn.style.borderColor  = isDestructive ? 'rgba(239,68,68,.4)' : 'rgba(37,99,235,.4)';
  btn.style.background   = isDestructive ? 'rgba(239,68,68,.08)' : 'rgba(37,99,235,.08)';
  btn.style.color        = isDestructive ? '#ef4444' : '#2563eb';
  _confirmCb = onOk;
  const overlay = $('confirmOverlay');
  overlay.classList.add('open', 'centered');
  overlay.style.display = 'flex';
  document.addEventListener('keydown', _confirmKey);
}

function closeConfirm(ok) {
  const overlay = $('confirmOverlay');
  overlay.classList.remove('open', 'centered');
  overlay.style.display = 'none';
  document.removeEventListener('keydown', _confirmKey);
  if (ok && _confirmCb) _confirmCb();
  _confirmCb = null;
}

function _confirmKey(e) {
  if (e.key === 'Enter')  { e.preventDefault(); closeConfirm(true); }
  if (e.key === 'Escape') { e.preventDefault(); closeConfirm(false); }
}


/* ───────────────────────────────────────────
   MODALS — GENERIC
─────────────────────────────────────────── */
function closeModal(id) {
  const el = $(id);
  if (el) el.classList.remove('open');
}

function initModals() {
  // Preview
  $('btnPreview').addEventListener('click', openPreview);
  $('btnCopyReport').addEventListener('click', copyReport);
  $('previewOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal('previewOverlay');
  });

  // History
  $('btnCloseHistory').addEventListener('click', () => closeModal('historyOverlay'));
  $('historyOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal('historyOverlay');
  });

  // Help
  $('btnHelp').addEventListener('click', openHelp);
  $('btnCloseHelp').addEventListener('click', () => closeModal('helpOverlay'));
  $('helpOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal('helpOverlay');
  });

  // Confirm
  $('btnConfirmOk').addEventListener('click', () => closeConfirm(true));
  $('btnConfirmCancel').addEventListener('click', () => closeConfirm(false));
  $('confirmOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeConfirm(false);
  });

  // New shift
  $('btnNewShift').addEventListener('click', newShift);

  // Disk copy
  $('btnCopyDisks').addEventListener('click', copyDiskStatus);
  $('btnAddDisk').addEventListener('click', addDisk);
}


/* ───────────────────────────────────────────
   MANUAL (HELP)
─────────────────────────────────────────── */
let _helpLang = localStorage.getItem('helpLang') || 'en';

const HELP_DATA = {
  en: {
    sections: [
      {
        icon: '📋', title: 'Shift Report',
        steps: [
          ['Fill in Shift Parameters', 'Date · Vehicle ID · Mission ID · City (📍 auto-detect) · Country · Driver & Operator ID'],
          ['Add events via Quick Add', 'Tap a button → event is created with current time. Orange = System DT, Blue = Org DT'],
          ['Complete each event card', 'Start/End time · KM start→end (Enter copies to end) · Address 📍 · For DT events: pick comment from dropdown, tap ▾ to edit manually'],
          ['Preview & Copy', 'Generates a full formatted report and copies it to clipboard — paste in WhatsApp or email'],
          ['New Shift', 'Saves current shift to History, clears all events. Disk data is preserved.'],
        ],
        tip: '⏱ Open event timer warns you after 30 min — close events on time.',
      },
      {
        icon: '💾', title: 'Disk Status',
        items: [
          'Tap <b>+ Add disk</b> for each SSD in the storage box',
          'Status: <b style="color:#30d158">empty</b> — <b style="color:#ff9f0a">in use</b> — <b style="color:#ff453a">full</b>',
          'For <b>in use</b>: enter available TB → fill % is calculated from 90 TB total capacity',
          'Progress bar color: green → yellow → red as disk fills up',
          '<b>📋 Copy report</b> — formatted text ready to paste in WhatsApp',
        ],
      },
      {
        icon: '🎫', title: 'Ticket',
        steps: [
          ['Ticket Settings (once)', 'Fill in Team Leader, Vehicle, Plate, Phones, Location — saved permanently to the device'],
          ['Choose a template', 'SSD Logistics: Sending / Receiving / Both → replace [SSD ID] and [tracking number] placeholders'],
          ['Copy Ticket', 'Tap 📋 Copy Ticket → paste directly into WhatsApp or email. ✕ Clear resets the fields.'],
          ['Copy Update', 'Type the update text → 📤 Copy Update — "Update:" prefix is added automatically'],
        ],
      },
      {
        icon: '📁', title: 'Docs',
        items: [
          '<b>Quick Links</b> — fast access to Weekly Checklist, Standby hours sheet, Tour money form',
          '<b>Manuals</b> — KSS2.0 documentation, ticket guides, driver & labeling manuals',
          '<b>Documents</b> — tap Open to view protocol PDFs in Google Drive',
          '<b>Shift Schedule</b> — S1/S2/S3 timetable, current shift is highlighted automatically',
        ],
      },
      {
        icon: '💡', title: 'Tips & Shortcuts',
        items: [
          '<b>S1 / S2 / S3 badge</b> in the header shows your current shift at a glance',
          '<b>Enter</b> in any field confirms input and closes the keyboard on mobile',
          '<b>KM Start → Enter</b> auto-copies the value to KM End field',
          '<b>History</b> — last 14 shifts saved, tap Copy to re-send any report',
          'Page refresh is safe — everything is auto-saved every 5 seconds',
          '<b>Install on iPhone:</b> Safari → Share button → "Add to Home Screen" — works like a native app',
          '<b>Install on Android:</b> Chrome → ⋮ menu → "Add to Home Screen"',
          '<b>Change SSD drive letter (Windows):</b> Win+R → <b>diskmgmt.msc</b> → find D: → right-click → Change Drive Letter → select X → OK',
        ],
      },
    ],
  },
  ro: {
    sections: [
      {
        icon: '📋', title: 'Shift Report',
        steps: [
          ['Completați Shift Parameters', 'Dată · ID vehicul · ID misiune · Oraș (📍 detectare automată) · Țară · ID șofer & operator'],
          ['Adăugați evenimente', 'Apăsați buton → eveniment creat cu ora curentă. Portocaliu = System DT, Albastru = Org DT'],
          ['Completați cardul evenimentului', 'Ora start/end · KM start→end (Enter copiază) · Adresă 📍 · Selectați comentariu din dropdown, ▾ pentru editare'],
          ['Preview & Copy', 'Generează raport complet și îl copiază în clipboard — lipiți în WhatsApp sau email'],
          ['New Shift', 'Salvează în History, șterge evenimentele. Discurile rămân.'],
        ],
        tip: '⏱ Timerul evenimentelor deschise avertizează după 30 min — închideți la timp.',
      },
      {
        icon: '💾', title: 'Disk Status',
        items: [
          'Apăsați <b>+ Add disk</b> pentru fiecare SSD din cutie',
          'Status: <b style="color:#30d158">empty</b> — <b style="color:#ff9f0a">in use</b> — <b style="color:#ff453a">full</b>',
          'Pentru <b>in use</b>: introduceți TB disponibili → % se calculează din 90 TB total',
          'Bara de progres: verde → galben → roșu pe măsură ce discul se umple',
          '<b>📋 Copy report</b> — text formatat gata de lipit în WhatsApp',
        ],
      },
      {
        icon: '🎫', title: 'Ticket',
        steps: [
          ['Ticket Settings (o dată)', 'Team Leader, Vehicul, Înmatriculare, Telefoane, Locație — salvate permanent pe dispozitiv'],
          ['Selectați template', 'SSD Logistics: Sending / Receiving / Both → înlocuiți [SSD ID] și [tracking number]'],
          ['Copy Ticket', 'Apăsați 📋 Copy Ticket → lipiți direct în WhatsApp. ✕ Clear resetează câmpurile.'],
          ['Copy Update', 'Scrieți textul actualizării → 📤 Copy Update — prefixul "Update:" se adaugă automat'],
        ],
      },
      {
        icon: '📁', title: 'Docs',
        items: [
          '<b>Quick Links</b> — acces rapid la Checklist săptămânal, ore standby, formular bani deplasare',
          '<b>Manuals</b> — documentație KSS2.0, ghiduri tickete, manuale șofer & etichetare',
          '<b>Documents</b> — Open deschide PDF-ul protocolului în Google Drive',
          '<b>Shift Schedule</b> — S1/S2/S3, schimbul curent evidențiat automat',
        ],
      },
      {
        icon: '💡', title: 'Sfaturi',
        items: [
          '<b>Badge S1/S2/S3</b> în header arată schimbul curent',
          '<b>Enter</b> confirmă câmpul și închide tastatura pe mobil',
          '<b>KM Start → Enter</b> copiază automat valoarea în KM End',
          '<b>History</b> — ultimele 14 schimburi salvate, Copy retrimite orice raport',
          'Reîncărcarea paginii este sigură — salvare automată la fiecare 5 secunde',
          '<b>Instalare pe iPhone:</b> Safari → buton Share → "Add to Home Screen" — funcționează ca o aplicație nativă',
          '<b>Instalare pe Android:</b> Chrome → meniu ⋮ → "Add to Home Screen"',
          '<b>Schimbare literă disc (Windows):</b> Win+R → <b>diskmgmt.msc</b> → D: click dreapta → Change Drive Letter → X → OK',
        ],
      },
    ],
  },
  ru: {
    sections: [
      {
        icon: '📋', title: 'Shift Report',
        steps: [
          ['Заполни Shift Parameters', 'Дата · Vehicle ID · Mission ID · Город (📍 автоопределение) · Страна · Driver & Operator ID'],
          ['Добавляй события через Quick Add', 'Нажми кнопку → событие с текущим временем. Оранжевый = System DT, Синий = Org DT'],
          ['Заполни карточку события', 'Время start/end · KM start→end (Enter копирует) · Адрес 📍 · Для DT: выбери комментарий из dropdown, ▾ для ручного редактирования'],
          ['Preview & Copy', 'Генерирует полный отчёт и копирует в буфер — вставляй в WhatsApp или email'],
          ['New Shift', 'Сохраняет смену в историю, очищает события. Данные дисков сохраняются.'],
        ],
        tip: '⏱ Таймер открытых событий предупреждает через 30 мин — закрывай вовремя.',
      },
      {
        icon: '💾', title: 'Disk Status',
        items: [
          'Нажми <b>+ Add disk</b> для каждого SSD в боксе',
          'Статус: <b style="color:#30d158">empty</b> — <b style="color:#ff9f0a">in use</b> — <b style="color:#ff453a">full</b>',
          'Для <b>in use</b>: введи доступные TB → % заполненности считается от 90 TB',
          'Цвет прогресс-бара: зелёный → жёлтый → красный по мере заполнения',
          '<b>📋 Copy report</b> — форматированный текст для вставки в WhatsApp',
        ],
      },
      {
        icon: '🎫', title: 'Ticket',
        steps: [
          ['Ticket Settings (один раз)', 'Тимлидер, Авто, Номер, Телефоны, Адрес — сохраняются навсегда на устройстве'],
          ['Выбери шаблон', 'SSD Logistics: Sending / Receiving / Both → замени [SSD ID] и [tracking number]'],
          ['Copy Ticket', 'Нажми 📋 Copy Ticket → вставляй напрямую в WhatsApp. ✕ Clear сбрасывает поля.'],
          ['Copy Update', 'Введи текст обновления → 📤 Copy Update — префикс "Update:" добавляется автоматически'],
        ],
      },
      {
        icon: '📁', title: 'Docs',
        items: [
          '<b>Quick Links</b> — быстрый доступ к недельному чеклисту, таблице standby, форме денег на поездку',
          '<b>Manuals</b> — документация KSS2.0, гайды по тикетам, мануалы для водителей и разметки',
          '<b>Documents</b> — Open открывает PDF протокола в Google Drive',
          '<b>Shift Schedule</b> — расписание S1/S2/S3, текущая смена подсвечивается автоматически',
        ],
      },
      {
        icon: '💡', title: 'Советы',
        items: [
          '<b>Бейдж S1/S2/S3</b> в шапке показывает текущую смену',
          '<b>Enter</b> подтверждает поле и убирает клавиатуру на мобильном',
          '<b>KM Start → Enter</b> автоматически копирует значение в KM End',
          '<b>История</b> — последние 14 смен, Copy повторно отправляет любой отчёт',
          'Перезагрузка страницы безопасна — автосохранение каждые 5 секунд',
          '<b>Установка на iPhone:</b> Safari → кнопка «Поделиться» → «На экран Домой» — работает как нативное приложение',
          '<b>Установка на Android:</b> Chrome → меню ⋮ → «Добавить на главный экран»',
          '<b>Смена буквы диска (Windows):</b> Win+R → <b>diskmgmt.msc</b> → D: правая кнопка → Change Drive Letter → X → OK',
        ],
      },
    ],
  },
};
function openHelp() {
  renderHelp(_helpLang);
  $('helpOverlay').classList.add('open');
}

function renderHelp(lang) {
  _helpLang = lang;
  localStorage.setItem('helpLang', lang);
  const data = HELP_DATA[lang];
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });

  $('helpContent').innerHTML = data.sections.map(sec => {
    const body = sec.steps
      ? `<div class="help-steps">${sec.steps.map((s, i) => `
          <div class="help-step">
            <div class="help-step-num">${i+1}</div>
            <div class="help-step-body">
              <div class="help-step-title">${s[0]}</div>
              <div class="help-step-sub">${s[1]}</div>
            </div>
          </div>`).join('')}</div>`
      : `<div class="help-items">${sec.items.map(it =>
          `<div class="help-item">${it}</div>`).join('')}</div>`;

    const tip = sec.tip ? `<div class="help-tip">${sec.tip}</div>` : '';

    return `<div class="help-section">
      <div class="help-section-header">
        <span class="help-section-icon">${sec.icon}</span>
        <span class="help-section-title">${sec.title}</span>
      </div>
      ${body}${tip}
    </div>`;
  }).join('');
}

function initHelp() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => renderHelp(btn.dataset.lang));
  });
}


/* ───────────────────────────────────────────
   INIT
─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Set today's date
  $('shiftDate').value = new Date().toISOString().slice(0,10);

  // Load saved state
  const restored = loadState();

  // Render UI
  renderEvents();
  renderDisks();
  renderDocs();

  // Init modules
  initTheme();
  initClock();
  initNav();
  initQuickAdd();
  initGeo();
  initModals();
  initTicket();
  initHelp();
  bindEnterBlur();
  bindAutoSave();

  startEventTimers();

  if (restored) showToast('Shift data restored');
});
