/* ═══════════════════════════════════════════
   ShiftLog — app.js
   Clean, modular vanilla JS
   Version: 5.50
═══════════════════════════════════════════ */

'use strict';

const APP_VERSION = '5.50';

/* ───────────────────────────────────────────
   DATA
─────────────────────────────────────────── */
let events      = [];
let disks       = [];
let eventCounter = 0;
let diskCounter  = 0;

const TICKET_FIELDS = ['tkLeader','tkVehicle','tkPlate','tkVwPhone','tkCapPhone','tkLocation','tkTemplate'];

// Подсказки Description в зависимости от Category
const CATEGORY_DESCRIPTIONS = {
  'Measurement System': [
    'Measurement System Issues',
    'ECU — not booting up at startup',
    'ECU — crash in TeraTerm',
    'ECU — errors / dummy in TeraTerm',
    'Recording Tool (VPI) — error at startup',
    'Recording Tool (VPI) — recording stops by itself',
    'Recording Tool (VPI) — cannot stop recording',
    'Recording Tool (VPI) — camera failure',
    'Recording Tool (VPI) — freeze, record button cannot be pressed',
    'Touch Display — disconnecting',
    'Touch Display — not working',
    'Prelabel Tool — annotation tool freezes',
    'Network not initializing after PC boot-up',
    'Disk not available after PC boot-up',
    'Keyboard stopped working',
  ],
  'SSD Issue': [
    'SSD Issue — LIVE displays "no volume" on Seagate device',
    'SSD Issue — disk not recognized',
  ],
  'SSD Logistics': [
    'SSD Logistics — Sending',
    'SSD Logistics — Receiving',
    'SSD Logistics — Sending & Receiving',
  ],
  'Vehicle': [
    'Vehicle Handover',
    'Vehicle Takeover',
    'General vehicle damage',
    'Vehicle involved in accident',
  ],
  'Vehicle Service': [
    'Inspection required',
    'Oil change required',
    'Tire change required',
    'Wrong or worn tires',
  ],
  'Transfer': [
    'Transfer by test car',
    'Transfer by train / plane',
  ],
  'Organisational': [
    'No SSD available — standby',
    'Team member sick leave',
    'Stopped by police',
    'Vehicle burglary',
  ],
  'Backpacks': [
    'Backpack — missing equipment',
    'Backpack — damage',
  ],
  'Logistics': [
    'Backpack handover completed',
    'Backpack takeover completed',
  ],
  'SCRIVE': [
    'SCRIVE — cannot log in',
    'SCRIVE — protocol not submitting',
    'SCRIVE — data missing',
    'SCRIVE — start city missing',
    'SCRIVE — route missing',
    'SCRIVE — SSD missing',
  ],
};

const DT_TYPES = new Set([
  'dt_ssd_issue','dt_ssd_logistics','dt_cleaning','dt_standby','dt_low_speed',
  'dt_vpi','dt_display','dt_prelabel','dt_ecu','dt_ssd_change','dt_measurement',
  'dt_startup','dt_protocol','dt_route_doc','dt_handover','dt_refuelling',
  'dt_transfer','dt_standby_wait','dt_maintenance','dt_service','dt_no_storage',
  'dt_police','dt_other_org','dt_other_sys','break',
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
  dt_other_sys:     'Others Sys',
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
  dt_other_sys:     ['Other system event'],
  break:            ['Break'],
};

const TICKET_TEMPLATES = {
  'SSD Logistics — Sending': {
    category: 'SSD Logistics',
    description: 'SSD Logistics — Sending',
    body: 'The team has successfully shipped the following cases with SSD storage via UPS:\n• [SSD ID]\nTracking Number: [tracking number]\n\n• [SSD ID]\nTracking Number: [tracking number]',
  },
  'SSD Logistics — Receiving': {
    category: 'SSD Logistics',
    description: 'SSD Logistics — Receiving',
    body: 'The team has successfully collected the following SSD storage cases from the UPS access point:\n• [SSD ID]\n• [SSD ID]',
  },
  'SSD Logistics — Sending & Receiving': {
    category: 'SSD Logistics',
    description: 'SSD Logistics — Sending & Receiving',
    body: 'The team has successfully shipped the following cases with SSD storage via UPS:\n• [SSD ID]\nTracking Number: [tracking number]\n\nThe team has also collected the following SSD storage cases from the UPS access point:\n• [SSD ID]\n• [SSD ID]',
  },
  'Vehicle Handover': {
    category: 'Vehicle',
    description: 'Vehicle Handover',
    body: 'The team handed over the vehicle at [location] to [person/company].\nThe vehicle was inspected before the handover. All equipment and items inside the vehicle were checked and documented in the handover protocol.\nThe vehicle was also inspected externally. All visible damages, scratches, and tire tread depth were recorded in the handover protocol.\nThe team completed all required handover procedures.\nThe handover protocol is attached.',
  },
  'Vehicle Takeover': {
    category: 'Vehicle',
    description: 'Vehicle Takeover',
    body: 'The team took over the vehicle at [location] from [person/company].\nThe vehicle was inspected during the takeover. All equipment and items inside the vehicle were checked and documented in the handover protocol.\nThe vehicle was also inspected externally. All visible damages, scratches, and tire tread depth were recorded in the handover protocol.\nThe team will proceed with the planned operations.\nThe handover protocol is attached.',
  },
  'Backpack Handover': {
    category: 'Logistics',
    description: 'Backpack handover completed',
    body: 'The team handed over the backpack at [location] to [person/company].\nThe backpack and all included equipment were checked before the handover and documented.\nThe handover protocol is attached.',
  },
  'Backpack Takeover': {
    category: 'Logistics',
    description: 'Backpack takeover completed',
    body: 'The team took over the backpack at [location] from [person/company].\nThe backpack and all included equipment were checked during the takeover and documented.\nThe takeover protocol is attached.',
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
  updateScheduleHighlight(now);
}

function getShift(now) {
  const h = now.getHours(), m = now.getMinutes();
  const mins = h * 60 + m;
  if (mins >= 7*60  && mins < 15*60) return 'Shift 1';
  if (mins >= 15*60 && mins < 23*60) return 'Shift 2';
  return 'Shift 3';
}

function updateScheduleHighlight(now) {
  const s = getShift(now);
  const map = { 'Shift 1': 1, 'Shift 2': 2, 'Shift 3': 3 };
  [1,2,3].forEach(i => {
    const row = $(`sched-row-${i}`);
    if (row) row.classList.toggle('active-shift', i === map[s]);
  });
}


/* ───────────────────────────────────────────
   NAVIGATION
─────────────────────────────────────────── */
/* ───────────────────────────────────────────
   SHIFT PARAMETERS
─────────────────────────────────────────── */
let _spActiveRole = 'driver';
let _spMissions   = [];
let _spMissionCtr = 0;

function spUpdateDateChip() {
  const val = $('shiftDate').value;
  if (!val) return;
  const d = new Date(val + 'T12:00:00');
  $('spDateDay').textContent   = d.getDate();
  $('spDateMonth').textContent = d.toLocaleString('en', { month: 'short' }).toUpperCase();
  $('spDateYear').textContent  = d.getFullYear();
}

function spSetRole(role) {
  _spActiveRole = role;
  const dr = $('spRoleDriver');
  const op = $('spRoleOperator');
  if (dr) dr.classList.toggle('active', role === 'driver');
  if (op) op.classList.toggle('active', role === 'operator');
  spCheckStatus();
  saveState();
}

function spUpdateHasValue() {
  ['vehicleId','driverId','operatorId','cityField','country'].forEach(id => {
    const el = $(id);
    if (el) el.classList.toggle('has-value', !!el.value.trim());
  });
}

function spCheckStatus() {
  const vehicle  = $('vehicleId').value.trim();
  const city     = $('cityField').value.trim();
  const country  = $('country').value.trim();
  const myId     = _spActiveRole === 'driver'
    ? $('driverId')?.value.trim()
    : $('operatorId')?.value.trim();
  const badge = $('shiftStatusBadge');
  if (!badge) return;
  const ready = vehicle && city && country && myId;
  const shift = getShift(new Date());
  badge.textContent = ready ? `${shift} · Ready` : `Fill in · ${shift}`;
  badge.className = 'sp-status ' + (ready ? 'ready' : 'incomplete');
  spUpdateHasValue();
}

function spToggleMissionInput() {
  const row = $('missionInputRow');
  const btn = $('btnAddMission');
  const show = row.style.display === 'none';
  row.style.display = show ? 'flex' : 'none';
  btn.style.display = show ? 'none' : 'flex';
  if (show) setTimeout(() => $('missionInput').focus(), 50);
}

function spAddMission() {
  const inp = $('missionInput');
  const val = inp.value.trim();
  if (!val) return;
  _spMissions.push({ id: ++_spMissionCtr, val });
  inp.value = '';
  spRenderMissions();
  $('missionInputRow').style.display = 'none';
  $('btnAddMission').style.display = 'flex';
  saveState();
}

function spRemoveMission(id) {
  _spMissions = _spMissions.filter(m => m.id !== id);
  spRenderMissions();
  saveState();
}

function spRenderMissions() {
  const list = $('missionList');
  if (!list) return;
  list.innerHTML = _spMissions.map(m => `
    <div class="sp-mission-item">
      <div class="sp-mission-dot"></div>
      <span class="sp-mission-text">${esc(m.val)}</span>
      <button class="sp-mission-del" onclick="spRemoveMission(${m.id})">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>`).join('');
}

function initShiftParams() {
  spUpdateDateChip();
  $('shiftDate').addEventListener('change', () => {
    spUpdateDateChip();
    spCheckStatus();
  });
  $('missionInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') spAddMission();
    if (e.key === 'Escape') spToggleMissionInput();
  });
  spSetRole(_spActiveRole);
  spRenderMissions();
  ['vehicleId','cityField','country','driverId','operatorId'].forEach(id => {
    const el = $(id);
    if (el) {
      el.addEventListener('input', spCheckStatus);
      el.addEventListener('change', spCheckStatus);
    }
  });
  spCheckStatus();
}

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
      cityField:  $('cityField').value,
      country:    $('country').value,
      driverId:   $('driverId').value,
      operatorId: $('operatorId').value,
      activeRole: _spActiveRole,
      missions:   _spMissions,
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
    $('vehicleId').value  = s.vehicleId  || '';
    $('cityField').value  = s.cityField  || '';
    $('country').value    = s.country    || '';
    $('driverId').value   = s.driverId   || '';
    $('operatorId').value = s.operatorId || '';
    $('notes').value      = s.notes      || '';
    _spActiveRole = s.activeRole || 'driver';
    _spMissions   = s.missions   || [];
    _spMissionCtr = _spMissions.length ? Math.max(..._spMissions.map(m => m.id)) : 0;
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
  let cardClass = '';
  if (isSys) cardClass = 'dt-sys';
  if (isOrg) cardClass = 'dt-org';

  const timerHtml = (!ev.timeEnd && ev.timeStart)
    ? `<div class="event-timer" data-start="${ev.timeStart}" id="timer-${ev.id}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> <span>...</span></div>`
    : '';

  const comments = DT_COMMENTS[ev.type] || [];
  const hasComments = isDT(ev.type) && comments.length > 0;
  const isFreeTextDT = isDT(ev.type) && comments.length === 0;

  const commentHtml = hasComments
    ? `<div class="dt-comment-row">
         <select class="dt-comment-select" onchange="applyDTComment(${ev.id}, this.value)">
           <option value="">— select comment —</option>
           ${comments.map(c => `<option value="${esc(c)}" ${ev.description === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
         </select>
         <button class="btn-comment-edit" onclick="toggleDTEdit(${ev.id})" id="edit-toggle-${ev.id}" title="Edit comment"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button>
       </div>`
    : '';

  const descHtml = `<textarea class="event-desc"
    rows="1"
    placeholder="Description…"
    onchange="updateEvent(${ev.id},'description',this.value)"
    oninput="updateEvent(${ev.id},'description',this.value)"
  >${esc(ev.description || '')}</textarea>`;

  return `
  <div class="event-card ${cardClass}" data-eid="${ev.id}">
    <div class="event-bar"></div>
    <div class="event-inner">
      <div class="event-row-main">
        <input type="time" value="${ev.timeStart}" onchange="updateEvent(${ev.id},'timeStart',this.value)" onblur="trySortEvent(${ev.id})">
        <input type="time" value="${ev.timeEnd || ''}" onchange="updateEvent(${ev.id},'timeEnd',this.value)" onblur="trySortEvent(${ev.id})">
        <select onchange="updateEvent(${ev.id},'type',this.value);updateEvent(${ev.id},'description','');renderEvents()">
          ${buildTypeOptions(ev.type)}
        </select>
        <button class="btn-remove" onclick="removeEvent(${ev.id})"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
      ${timerHtml}
      ${hasComments ? `<div id="dt-comment-row-${ev.id}">${commentHtml}</div>` : ''}
      <div id="dt-desc-row-${ev.id}" style="${isFreeTextDT ? '' : 'display:none'}" data-open="${isFreeTextDT ? '1' : '0'}">${descHtml}</div>
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
        <button class="btn-geo" onclick="geoFillEvent(${ev.id}, this)" title="Get address"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></button>
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
    ['dt_other_sys','Others Sys'],
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
    <optgroup label="── System DT ──">${sys.map(opt).join('')}</optgroup>
    <optgroup label="── Org DT ──">${org.map(opt).join('')}</optgroup>
  `;
}


/* ───────────────────────────────────────────
   EVENTS — ACTIONS
─────────────────────────────────────────── */
function addEvent(type = 'dt_other_sys', description = '') {
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
  // Sort only when timeStart field loses focus (user finished entering both times)
}

function trySortEvent(id) {
  const ev = events.find(e => e.id === id);
  if (!ev || !ev.timeStart || !ev.timeEnd) return;
  // Small delay so focus can shift between the two time fields
  setTimeout(() => {
    const card = document.querySelector(`[data-eid="${id}"]`);
    if (!card) return;
    if (card.querySelector('input[type="time"]:focus')) return;
    sortEventsIfNeeded(id);
  }, 50);
}

function sortEventsIfNeeded(changedId) {
  // Events without timeStart go to the end
  const toTime = t => (t && t.length === 5) ? t : '99:99';
  const sorted = [...events].sort((a, b) => toTime(a.timeStart).localeCompare(toTime(b.timeStart)));

  // Check if order actually changed
  const changed = sorted.some((ev, i) => ev.id !== events[i].id);
  if (!changed) return;

  events = sorted;
  saveState();

  // Animate: flash the moved card, then re-render
  const card = document.querySelector(`[data-eid="${changedId}"]`);
  if (card) {
    card.classList.add('event-sorting');
    setTimeout(() => {
      renderEvents();
      // After render, highlight the card in its new position
      const newCard = document.querySelector(`[data-eid="${changedId}"]`);
      if (newCard) {
        newCard.classList.add('event-sorted');
        setTimeout(() => newCard.classList.remove('event-sorted'), 800);
      }
    }, 250);
  } else {
    renderEvents();
  }
}

function applyDTComment(id, val) {
  if (!val) return;
  updateEvent(id, 'description', val);
  const descRow = $(`dt-desc-row-${id}`);
  if (descRow) {
    const ta = descRow.querySelector('textarea');
    if (ta) { ta.value = val; autoHeight(ta); }
  }
}

function toggleDTEdit(id) {
  const row = $(`dt-desc-row-${id}`);
  if (!row) return;
  const isOpen = row.dataset.open === '1';
  if (isOpen) {
    row.style.display = 'none';
    row.dataset.open = '0';
    const btn = $(`edit-toggle-${id}`);
    if (btn) btn.style.opacity = '1';
  } else {
    // Копируем текущее значение select в textarea если textarea пустой
    const sel = document.querySelector(`[data-eid="${id}"] .dt-comment-select`);
    const ta = row.querySelector('textarea');
    if (ta && sel && sel.value && !ta.value) {
      ta.value = sel.value;
      autoHeight(ta);
    }
    row.style.display = '';
    row.dataset.open = '1';
    const btn = $(`edit-toggle-${id}`);
    if (btn) btn.style.opacity = '0.5';
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
    const endInput2 = card.querySelector('.km-end');
    if (endInput2) endInput2.focus();
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
    el.classList.toggle('warning', diff >= 30);
    if (diff >= 30) span.textContent = label + ' ⚠ close event?';
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
    playBeep();
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
  $('btnAddEvent').addEventListener('click', () => addEvent('dt_other_sys', ''));

  // Helper: init one More/Less toggle
  function initMoreToggle(btnId, panelId, iconId, labelId, storageKey) {
    const panel = $(panelId);
    const btn   = $(btnId);
    const icon  = $(iconId);
    const label = $(labelId);
    let open = localStorage.getItem(storageKey) === '1';

    function applyState() {
      panel.style.display = open ? 'block' : 'none';
      btn.classList.toggle('open', open);
      label.textContent = open ? 'Less' : 'More';
      icon.style.transform = open ? 'rotate(45deg)' : 'rotate(0deg)';
      icon.style.transition = 'transform .2s';
    }

    btn.addEventListener('click', () => {
      open = !open;
      localStorage.setItem(storageKey, open ? '1' : '0');
      applyState();
    });

    applyState();
  }

  initMoreToggle('btnQuickMoreSys', 'quickMoreSysPanel', 'quickMoreSysIcon', 'quickMoreSysLabel', 'quickMoreSysOpen');
  initMoreToggle('btnQuickMoreOrg', 'quickMoreOrgPanel', 'quickMoreOrgIcon', 'quickMoreOrgLabel', 'quickMoreOrgOpen');
}


/* ───────────────────────────────────────────
   FIREBASE SYNC — DISK STATUS
─────────────────────────────────────────── */
let _fbRef = null;
let _fbListening = false;
let _fbIgnoreNext = false;

function getFBVehicleId() {
  return ($('vehicleId')?.value || 'default').replace(/[.#$\[\]\/]/g, '_');
}

// Возвращает "Dr. 1009" или "Op. 1108" в зависимости от заполненных полей
function getMyName() {
  if (_spActiveRole === 'driver') {
    const id = $('driverId')?.value.trim();
    if (id) return `Dr. ${id}`;
  } else {
    const id = $('operatorId')?.value.trim();
    if (id) return `Op. ${id}`;
  }
  const d = $('driverId')?.value.trim();
  const o = $('operatorId')?.value.trim();
  if (d) return `Dr. ${d}`;
  if (o) return `Op. ${o}`;
  return 'Unknown';
}

// Хранит метаданные последнего обновления
let _diskMeta = { lastUpdated: '', updatedBy: '' };

function initFirebaseSync() {
  const vehicleId = getFBVehicleId();
  if (!vehicleId || vehicleId === 'default') return;

  // Отписываемся от предыдущего listener
  if (_fbRef && _fbListening) {
    _fbRef.off();
    _fbListening = false;
  }

  try {
    _fbRef = db.ref(`disks/${vehicleId}`);
    _fbListening = true;
    let _firstResponse = true;

    _fbRef.on('value', snapshot => {
      if (_fbIgnoreNext) { _fbIgnoreNext = false; return; }
      const data = snapshot.val();

      // Обратная совместимость: поддерживаем старый формат (массив) и новый (объект)
      let incoming = null;
      if (data && Array.isArray(data)) {
        // Старый формат — просто массив
        incoming = data;
      } else if (data && Array.isArray(data.disks)) {
        // Новый формат — объект с метаданными
        incoming = data.disks;
        _diskMeta.lastUpdated = data.lastUpdated || '';
        _diskMeta.updatedBy   = data.updatedBy   || '';
      }

      if (incoming) {
        disks = incoming;
        diskCounter = disks.length > 0 ? Math.max(...disks.map(d => d.id)) : 0;
        renderDisks();
        if (_firstResponse) {
          showToast(`🔄 Disks synced: ${vehicleId}`);
        }
      }
      _firstResponse = false;
    }, err => {
      console.warn('Firebase sync error:', err);
      showToast('⚠ Sync failed — check connection');
    });

  } catch(e) {
    console.warn('Firebase sync error:', e);
  }
}

function saveDiskToFirebase() {
  const vehicleId = getFBVehicleId();
  if (!vehicleId || vehicleId === 'default' || !_fbRef) return;
  try {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    _diskMeta.lastUpdated = timeStr;
    _diskMeta.updatedBy   = getMyName();
    _fbIgnoreNext = true;
    _fbRef.set({
      disks,
      lastUpdated: _diskMeta.lastUpdated,
      updatedBy:   _diskMeta.updatedBy,
    });
  } catch(e) {
    console.warn('Firebase save error:', e);
  }
}


function renderDisks() {
  const list = $('diskList');
  if (!list) return;
  // Auto-sort: in use → empty → full → faulty
  const order = { 'in use': 0, 'empty': 1, 'full': 2, 'faulty': 3 };
  const sorted = [...disks].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
  list.innerHTML = sorted.map(dk => buildDiskRow(dk)).join('');

  // Строка метаданных — показываем только если есть данные
  const meta = $('diskMeta');
  if (meta) {
    if (_diskMeta.lastUpdated && _diskMeta.updatedBy) {
      meta.textContent = `Last updated: ${_diskMeta.lastUpdated} by ${_diskMeta.updatedBy}`;
      meta.style.display = '';
    } else {
      meta.style.display = 'none';
    }
  }
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
  if (dk.status === 'empty')  barStyle = `width:100%;background:#30d158`;
  else if (dk.status === 'full')   barStyle = `width:100%;background:#ff453a`;
  else if (dk.status === 'faulty') barStyle = `width:100%;background:#8e8e93`;
  else barStyle = `width:${pct}%;background:${gradColor(pct)}`;

  // Цвет для TB input и label совпадает с цветом бара
  const inUseColor = isInUse ? gradColor(pct) : 'var(--sub)';

  const pctInfo = isInUse
    ? `<div class="disk-pct-row">
         <input type="number" value="${dk.percent}" min="0" max="90" step="0.1" class="disk-pct-input"
           style="color:${inUseColor}"
           onchange="updateDisk(${dk.id},'percent',this.value);renderDisks()"
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
    <select onchange="updateDisk(${dk.id},'status',this.value);renderDisks()">
      <option value="empty"  ${dk.status==='empty' ?'selected':''}>empty</option>
      <option value="in use" ${dk.status==='in use'?'selected':''}>in use</option>
      <option value="full"   ${dk.status==='full'  ?'selected':''}>full</option>
      <option value="faulty" ${dk.status==='faulty'?'selected':''}>faulty</option>
    </select>
    <button class="btn-remove" onclick="removeDisk(${dk.id})"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    ${pctInfo}
  </div>`;
}

function addDisk() {
  disks.push({ id: ++diskCounter, diskId: '', status: 'empty', percent: '' });
  saveState();
  saveDiskToFirebase();
  renderDisks();
}

function removeDisk(id) {
  showConfirm('Delete this disk?', () => {
    disks = disks.filter(d => d.id !== id);
    saveState();
    saveDiskToFirebase();
    renderDisks();
  });
}

function updateDisk(id, field, value) {
  const dk = disks.find(d => d.id === id);
  if (dk) { dk[field] = value; saveState(); saveDiskToFirebase(); }
}

function copyDiskStatus() {
  const vehicle = $('vehicleId').value || 'N/A';
  const city    = $('cityField').value  || $('country').value;
  let out = `Please find below the Storage Box status for vehicle ${vehicle} in ${city}:\n\n`;
  const diskOrder = { 'in use': 0, 'empty': 1, 'full': 2, 'faulty': 3 };
  const sorted = [...disks].sort((a, b) => (diskOrder[a.status] ?? 9) - (diskOrder[b.status] ?? 9));
  sorted.forEach(dk => {
    if (!dk.diskId) return;
    let s = dk.status;
    if (dk.status === 'in use' && dk.percent) {
      const pct = Math.round((1 - parseFloat(dk.percent) / 90) * 100);
      s = `in use (${pct}% full, ${dk.percent} TB available)`;
    }
    out += `${dk.diskId} - ${s};\n`;
  });
  navigator.clipboard.writeText(out.trimEnd()).then(() => showToast('Disk report copied'));
}


/* ───────────────────────────────────────────
   REPORT GENERATION
─────────────────────────────────────────── */
function generateReport() {
  const date     = $('shiftDate').value;
  const vehicle  = $('vehicleId').value  || 'N/A';
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

  if (_spMissions.length) {
    _spMissions.forEach(m => { out += `Mission ID: ${m.val}\n`; });
    out += '\n';
  }
  if (city) out += `City: ${city}.\n`;

  if (disks.length) {
    const diskOrder = { 'in use': 0, 'empty': 1, 'full': 2, 'faulty': 3 };
    const sortedDisks = [...disks].sort((a, b) => (diskOrder[a.status] ?? 9) - (diskOrder[b.status] ?? 9));
    out += `Please find below the Storage Box status for vehicle ${vehicle}`;
    if (city || country) out += ` in ${city || country}`;
    out += ':\n';
    sortedDisks.forEach(dk => {
      if (!dk.diskId) return;
      let s = dk.status;
      if (dk.status === 'in use' && dk.percent) {
        const pct = Math.round((1 - parseFloat(dk.percent) / 90) * 100);
        s += ` (${pct}% full, ${dk.percent} TB available)`;
      }
      out += `${dk.diskId} - ${s};\n`;
    });
    out += '\n';
  }

  // Shift Summary
  let dtMins = 0;
  let shiftStart = '', shiftEnd = '';
  events.forEach(ev => {
    if (!ev.timeStart || !ev.timeEnd) return;
    const [sh,sm] = ev.timeStart.split(':').map(Number);
    const [eh,em] = ev.timeEnd.split(':').map(Number);
    let diff = (eh*60+em) - (sh*60+sm);
    if (diff < 0) diff += 1440;
    if (isDT(ev.type)) dtMins += diff;
  });
  if (events.length) shiftStart = events[0].timeStart || '';
  for (let i = events.length-1; i >= 0; i--) {
    if (events[i].timeEnd) { shiftEnd = events[i].timeEnd; break; }
  }

  const fmt = min => min >= 60 ? `${Math.floor(min/60)}h ${min%60}min` : `${min}min`;

  if (dtMins > 0 || shiftStart) {
    out += '\n── Shift Summary ──\n';
    if (shiftStart) out += `Shift: ${shiftStart}${shiftEnd ? ' - '+shiftEnd : ''}\n`;
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
  const savedVehicle     = $('vehicleId').value;
  const savedDriver      = $('driverId').value;
  const savedOperator    = $('operatorId').value;
  const savedCountry     = $('country').value;
  localStorage.removeItem('shiftState');
  events = []; eventCounter = 0;
  disks = savedDisks; diskCounter = savedDiskCounter;
  $('shiftDate').value   = new Date().toISOString().slice(0,10);
  $('vehicleId').value   = savedVehicle;
  spUpdateDateChip();
  spRenderMissions();
  $('cityField').value   = '';
  $('country').value     = savedCountry;
  $('driverId').value    = savedDriver;
  $('operatorId').value  = savedOperator;
  $('notes').value       = '';
  renderEvents();
  renderDisks();
  spCheckStatus();
  saveState();
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
          <button class="btn-history-del"  onclick="deleteHistory(${i})"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
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

// Возвращает актуальное значение Category (select или input)
function getCategoryValue() {
  const input = $('tkCategoryInput');
  if (input && input.style.display !== 'none') return input.value.trim();
  return $('tkCategorySelect')?.value || '';
}

// Возвращает актуальное значение Description (select или textarea)
function getDescriptionValue() {
  const input = $('tkDescriptionInput');
  if (input && input.style.display !== 'none') return input.value.trim();
  return $('tkDescriptionSelect')?.value || '';
}

// Переключает Category между select и input режимами
function toggleCategoryEdit() {
  const sel   = $('tkCategorySelect');
  const inp   = $('tkCategoryInput');
  const btn   = $('btnCategoryEdit');
  const isEdit = inp.style.display !== 'none';

  if (isEdit) {
    // Закрываем edit — сохраняем значение
    sel.style.display = '';
    inp.style.display = 'none';
    btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>';
    btn.classList.remove('active');
    // Если введённое значение совпадает с опцией в select — выбираем её
    const val = inp.value.trim();
    const opt = Array.from(sel.options).find(o => o.value === val);
    if (opt) { sel.value = val; }
    updateDescriptionSelect();
  } else {
    // Открываем edit — копируем текущее значение
    inp.value = sel.value;
    sel.style.display = 'none';
    inp.style.display = '';
    btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    btn.classList.add('active');
    inp.focus();
  }
  updatePhotoName();
}

// Переключает Description между select и textarea режимами
function toggleDescriptionEdit() {
  const sel   = $('tkDescriptionSelect');
  const inp   = $('tkDescriptionInput');
  const btn   = $('btnDescriptionEdit');
  const isEdit = inp.style.display !== 'none';

  if (isEdit) {
    // Закрываем edit
    sel.style.display = '';
    inp.style.display = 'none';
    btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>';
    btn.classList.remove('active');
    // Если введённое значение совпадает с опцией — выбираем её
    const val = inp.value.trim();
    const opt = Array.from(sel.options).find(o => o.value === val);
    if (opt) { sel.value = val; }
  } else {
    // Открываем edit — копируем текущее значение
    inp.value = sel.value;
    sel.style.display = 'none';
    inp.style.display = '';
    btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    btn.classList.add('active');
    inp.focus();
  }
  updatePhotoName();
}

// Обновляет options в Description select при смене Category
function updateDescriptionSelect() {
  const category = getCategoryValue();
  const sel = $('tkDescriptionSelect');
  if (!sel) return;
  const descriptions = CATEGORY_DESCRIPTIONS[category] || [];
  if (!descriptions.length) {
    sel.innerHTML = '<option value="">— no options for this category —</option>';
  } else {
    sel.innerHTML = '<option value="">— select description —</option>' +
      descriptions.map(d => `<option value="${esc(d)}">${esc(d)}</option>`).join('');
  }
  updatePhotoName();
}

function openBottomSheet(title, items, onSelect) {
  $('bottomSheetTitle').textContent = title;
  $('bottomSheetList').innerHTML = items.map(item =>
    `<div class="sheet-item" onclick="selectSheetItem(this, '${esc(item)}')">${esc(item)}</div>`
  ).join('');
  $('bottomSheetList')._onSelect = onSelect;
  $('bottomSheetOverlay').classList.add('open');
}

function selectSheetItem(el, val) {
  const cb = $('bottomSheetList')._onSelect;
  if (cb) cb(val);
  $('bottomSheetOverlay').classList.remove('open');
}

// Helpers — принудительно устанавливают режим select/edit
function _setCategoryMode(mode) {
  const sel = $('tkCategorySelect');
  const inp = $('tkCategoryInput');
  const btn = $('btnCategoryEdit');
  if (!sel || !inp || !btn) return;
  if (mode === 'select') {
    sel.style.display = ''; inp.style.display = 'none';
    btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>'; btn.classList.remove('active');
  } else {
    sel.style.display = 'none'; inp.style.display = '';
    btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'; btn.classList.add('active');
  }
}

function _setDescriptionMode(mode) {
  const sel = $('tkDescriptionSelect');
  const inp = $('tkDescriptionInput');
  const btn = $('btnDescriptionEdit');
  if (!sel || !inp || !btn) return;
  if (mode === 'select') {
    sel.style.display = ''; inp.style.display = 'none';
    btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>'; btn.classList.remove('active');
  } else {
    sel.style.display = 'none'; inp.style.display = '';
    btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'; btn.classList.add('active');
  }
}

function applyTicketTemplate(val) {
  if (!val) return;
  const t = TICKET_TEMPLATES[val];
  if (!t) return;
  // Сбрасываем edit режимы
  _setCategoryMode('select');
  _setDescriptionMode('select');
  // Устанавливаем значения
  $('tkCategorySelect').value = t.category;
  updateDescriptionSelect();
  $('tkDescriptionSelect').value = t.description;
  $('tkBody').value = t.body;
  saveTicketSettings();
  updatePhotoName();
  showToast('Template applied');
}

function initTicket() {
  loadTicketSettings();
  $('btnClearTicket').addEventListener('click', clearTicketFields);
  $('btnCopyTicket').addEventListener('click', copyTicket);
  $('btnCopyUpdate').addEventListener('click', copyUpdate);
  $('btnCategoryEdit').addEventListener('click', toggleCategoryEdit);
  $('btnDescriptionEdit').addEventListener('click', toggleDescriptionEdit);

  const btnClearUpdate = $('btnClearUpdate');
  if (btnClearUpdate) {
    btnClearUpdate.addEventListener('click', () => {
      $('tkUpdate').value = '';
      saveTicketSettings();
    });
  }

  // Кнопка Manual
  const btnManual = $('btnTicketManual');
  if (btnManual) {
    btnManual.addEventListener('click', () => {
      openHelp();
      setTimeout(() => {
        const helpContent = $('helpContent');
        if (!helpContent) return;
        const sections = helpContent.querySelectorAll('.help-section-title');
        for (const el of sections) {
          if (el.textContent.includes('Ticket Rules') || el.textContent.includes('Reguli') || el.textContent.includes('Правила')) {
            el.closest('.help-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
            break;
          }
        }
      }, 150);
    });
  }

  // Инициализируем Description select
  updateDescriptionSelect();

  TICKET_FIELDS.forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('change', saveTicketSettings);
  });

  // Photo naming
  initPhotoName();
}

/* ───────────────────────────────────────────
   PHOTO NAMING
─────────────────────────────────────────── */
let _photoCount = 1;

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // убираем спецсимволы
    .replace(/\s+/g, '-')            // пробелы → дефисы
    .replace(/-+/g, '-')             // множественные дефисы → один
    .replace(/^-|-$/g, '');          // убираем дефисы по краям
}

function updatePhotoName() {
  const display = $('photoNameDisplay');
  if (!display) return;

  const date = ($('shiftDate')?.value || '').replace(/-/g, '');
  const vehicle = ($('tkVehicle')?.value || $('vehicleId')?.value || '')
    .replace(/[#\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const desc = getDescriptionValue();
  const title = slugify(desc);

  if (!date || !vehicle || !title) {
    display.textContent = 'YYYYMMDD_V-number_title_1';
    display.classList.add('photo-name-placeholder');
    return;
  }

  display.textContent = `${date}_${vehicle}_${title}_${_photoCount}`;
  display.classList.remove('photo-name-placeholder');
}

function initPhotoName() {
  // Обновляем при изменении даты и Vehicle
  const watchIds = ['shiftDate', 'tkVehicle', 'vehicleId'];
  watchIds.forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('input', updatePhotoName);
    if (el) el.addEventListener('change', updatePhotoName);
  });

  $('btnPhotoMinus').addEventListener('click', () => {
    if (_photoCount > 1) { _photoCount--; updatePhotoName(); }
  });

  $('btnPhotoPlus').addEventListener('click', () => {
    _photoCount++;
    updatePhotoName();
  });

  $('btnCopyPhotoName').addEventListener('click', () => {
    const name = $('photoNameDisplay')?.textContent;
    if (!name || name.startsWith('—')) { showToast('Fill in Description first'); return; }
    navigator.clipboard.writeText(name).then(() => showToast('File name copied'));
  });

  // Первоначальная генерация
  updatePhotoName();
}

function loadTicketSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('ticketSettings') || '{}');
    TICKET_FIELDS.forEach(id => {
      const el = $(id);
      if (el) el.value = s[id] || '';
    });
    // Восстанавливаем Category
    if (s.tkCategoryValue) {
      const sel = $('tkCategorySelect');
      const inp = $('tkCategoryInput');
      if (s.tkCategoryMode === 'edit' && inp) {
        inp.value = s.tkCategoryValue;
        _setCategoryMode('edit');
      } else if (sel) {
        sel.value = s.tkCategoryValue;
      }
    }
    // Обновляем Description select после загрузки Category
    updateDescriptionSelect();
    // Восстанавливаем Description
    if (s.tkDescriptionValue) {
      const sel = $('tkDescriptionSelect');
      const inp = $('tkDescriptionInput');
      if (s.tkDescriptionMode === 'edit' && inp) {
        inp.value = s.tkDescriptionValue;
        _setDescriptionMode('edit');
      } else if (sel) {
        sel.value = s.tkDescriptionValue;
      }
    }
  } catch(e) {}
}

function saveTicketSettings() {
  const s = {};
  TICKET_FIELDS.forEach(id => { const el = $(id); if (el) s[id] = el.value || ''; });
  // Сохраняем Category
  const catInp = $('tkCategoryInput');
  s.tkCategoryMode  = catInp?.style.display !== 'none' ? 'edit' : 'select';
  s.tkCategoryValue = getCategoryValue();
  // Сохраняем Description
  const descInp = $('tkDescriptionInput');
  s.tkDescriptionMode  = descInp?.style.display !== 'none' ? 'edit' : 'select';
  s.tkDescriptionValue = getDescriptionValue();
  try { localStorage.setItem('ticketSettings', JSON.stringify(s)); } catch(e) {}
}

function clearTicketFields() {
  $('tkTemplate').value = '';
  _setCategoryMode('select');
  _setDescriptionMode('select');
  $('tkCategorySelect').value    = '';
  $('tkCategoryInput').value     = '';
  $('tkDescriptionSelect').value = '';
  $('tkDescriptionInput').value  = '';
  $('tkBody').value              = '';
  updateDescriptionSelect();
  _photoCount = 1;
  updatePhotoName();
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
  out += `Category: ${getCategoryValue()}${NL}`;
  out += `Description: ${getDescriptionValue()}${NL}`;
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
  const orig = btn.innerHTML;
  btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>';
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
      btn.innerHTML = orig;
    },
    () => { showToast('Location denied'); btn.innerHTML = orig; },
    { timeout: 8000, enableHighAccuracy: true }
  );
}

function initGeo() {
  $('btnGeoCity').addEventListener('click', function() {
    geoFetch(this, a => {
      const city    = a.city || a.town || a.village || a.county || '';
      const country = a.country || '';
      if (city)    { $('cityField').value = city; }
      if (country) { $('country').value   = country; }
      if (city || country) { spCheckStatus(); saveState(); showToast('City & Country updated'); }
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
  btn.style.borderColor  = isDestructive ? 'rgba(239,68,68,.4)' : 'rgba(59,130,246,.4)';
  btn.style.background   = isDestructive ? 'rgba(239,68,68,.08)' : 'rgba(59,130,246,.08)';
  btn.style.color        = isDestructive ? '#EF4444' : '#3B82F6';
  _confirmCb = onOk;
  $('confirmOverlay').classList.add('open');
  document.addEventListener('keydown', _confirmKey);
}

function closeConfirm(ok) {
  $('confirmOverlay').classList.remove('open');
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

  // Bottom Sheet
  $('bottomSheetOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) $('bottomSheetOverlay').classList.remove('open');
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
          ['Fill in Shift Parameters', 'Date · Vehicle ID · Mission ID · City + Country (📍 auto-detect both) · Driver & Operator ID'],
          ['Add events via Quick Add', 'Tap a button → event is created with current time. Orange = System DT, Blue = Org DT'],
          ['Complete each event card', 'Start/End time · KM start→end (Enter copies to end) · Address 📍 · For DT events: pick comment from dropdown, tap ✏️ to edit the text (e.g. replace A→Frankfurt, B→Paris)'],
          ['Preview & Copy', 'Generates a full formatted report and copies it to clipboard — paste in WhatsApp or email'],
          ['New Shift', 'Saves current shift to History, clears events. Vehicle ID, Driver, Operator, Country are kept for the next shift automatically.'],
        ],
        tip: '⏱ After 30 min an open event triggers a visual warning and a beep — close events on time.',
      },
      {
        icon: '💾', title: 'Disk Status',
        items: [
          'Tap <b>+ Add disk</b> for each SSD in the storage box',
          'Status: <b style="color:#30d158">empty</b> — <b style="color:#ff9f0a">in use</b> — <b style="color:#ff453a">full</b> — <b style="color:#8e8e93">faulty</b>',
          'For <b>in use</b>: enter available TB → fill % is calculated from 90 TB total capacity',
          'Progress bar color: green → yellow → red as disk fills up',
          'Disks are sorted automatically: <b>in use → empty → full → faulty</b>',
          '<b>🔄 Real-time sync</b> — disk status is shared between all devices with the same Vehicle ID instantly',
          '<b>Last updated</b> line shows who and when last changed the disk data',
          '<b>📋 Copy report</b> — formatted text ready to paste in WhatsApp',
        ],
      },
      {
        icon: '🎫', title: 'Ticket',
        steps: [
          ['Ticket Settings (once)', 'Fill in Team Leader, Vehicle, Plate, Phones, Location — saved permanently to the device'],
          ['Choose a template', 'SSD Logistics: Sending / Receiving / Both → replace [SSD ID] and [tracking number] placeholders'],
          ['Copy Ticket', 'Tap 📋 Copy Ticket → paste directly into WhatsApp or email. ✕ Clear resets the fields.'],
          ['Copy Update', 'Type update text in the Update block → 📤 Copy Update — "Update:" prefix is added automatically. ✕ Clear resets the field.'],
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
        icon: '📋', title: 'Ticket Rules',
        items: [
          'Write from the <b>third person</b> — use "The team", "They". Never use I, we, us',
          '<b>No signature</b> at the end',
          'Photos only in <b>.jpg / .jpeg</b> format — attach to message, never embed in text',
          'Prepare a ticket if the issue is <b>not solved within 15 min</b> of troubleshooting',
          'Send to the <b>vehicle WhatsApp group</b> and tag: <b>@Nelu Colun, @Kristi Bujor, @Victor Balan</b>',
        ],
        tip: 'After sending — wait for confirmation before further actions. Until instructions arrive, continue troubleshooting according to the existing manual.',
      },
      {
        icon: '📸', title: 'Photo Naming Convention',
        items: [
          'Format: <b>YYYYMMDD_V-number_title_1</b>',
          'Example: <b>20240730_DC-205_measurement-system-issues_1</b>',
          'All photos must be in <b>.jpg / .jpeg</b> format',
          'In the <b>Ticket block</b>, the file name is generated automatically from Date, Vehicle ID and Description — tap 📋 to copy. Use <b>− / +</b> buttons to change the photo number.',
        ],
      },
      {
        icon: '🖥', title: 'SCRIVE — Shift Protocol',
        items: [
          'Web app by Capgemini for filling in the shift protocol',
          'Link: <b>https://dgjlw5mhq5zna.cloudfront.net/login</b>',
          'Login: <b>driver@scrive.com</b>',
          'Password: <b>Capgemini2022!</b>',
        ],
      },
      {
        icon: '🔐', title: 'Valeo — Windows Login',
        highlight: true,
        items: [
          'System: <b>Valeo</b>',
          'Windows password: <b>VW-kss2.0</b>',
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
          '<b>App updates automatically</b> — no need to reinstall. Just open the app and it will update in the background',
          '<b>Install on iPhone:</b> Safari → Share button → "Add to Home Screen" — works like a native app',
          '<b>Install on Android:</b> Chrome → ⋮ menu → "Add to Home Screen"',
          '<b>Change SSD drive letter (Windows):</b> Win+R → <b>diskmgmt.msc</b> → find D: → right-click → Change Drive Letter → select X → OK',
        ],
      },
      {
        icon: '⚖️', title: 'About & Legal',
        highlight: true,
        items: [
          '<b>ShiftLog</b> — developed by <b>Eugeniu Gud</b>',
          'Copyright © 2024–2026 Eugeniu Gud. All rights reserved.',
          'This application is an original work of the Author and is protected by applicable copyright law.',
          '<b>Permitted use:</b> personal and operational use within the ADAS Valeo/VW Capgemini KSS2.0 team only.',
          '<b>Restrictions:</b> copying, redistribution, commercial use, or transfer to third parties without written permission from the Author is strictly prohibited.',
          '<b>Data:</b> shift data is stored locally on your device. Disk status is synced via Firebase Realtime Database for team use only.',
          '<b>Disclaimer:</b> the application is provided without warranties of any kind. The Author is not liable for any damages arising from its use.',
        ],
      },
    ],
  },
  ro: {
    sections: [
      {
        icon: '📋', title: 'Shift Report',
        steps: [
          ['Completați Shift Parameters', 'Dată · ID vehicul · ID misiune · Oraș + Țară (📍 detectare automată ambele) · ID șofer & operator'],
          ['Adăugați evenimente', 'Apăsați buton → eveniment creat cu ora curentă. Portocaliu = System DT, Albastru = Org DT'],
          ['Completați cardul evenimentului', 'Ora start/end · KM start→end (Enter copiază) · Adresă 📍 · Selectați comentariu din dropdown, apăsați ✏️ pentru a edita textul (ex. înlocuiți A→Frankfurt, B→Paris)'],
          ['Preview & Copy', 'Generează raport complet și îl copiază în clipboard — lipiți în WhatsApp sau email'],
          ['New Shift', 'Salvează în History, șterge evenimentele. Vehicle ID, Driver, Operator, Country sunt păstrate automat pentru tura următoare.'],
        ],
        tip: '⏱ După 30 min un eveniment deschis declanșează avertisment vizual și semnal sonor — închideți la timp.',
      },
      {
        icon: '💾', title: 'Disk Status',
        items: [
          'Apăsați <b>+ Add disk</b> pentru fiecare SSD din cutie',
          'Status: <b style="color:#30d158">empty</b> — <b style="color:#ff9f0a">in use</b> — <b style="color:#ff453a">full</b> — <b style="color:#8e8e93">faulty</b>',
          'Pentru <b>in use</b>: introduceți TB disponibili → % se calculează din 90 TB total',
          'Bara de progres: verde → galben → roșu pe măsură ce discul se umple',
          'Discurile sunt sortate automat: <b>in use → empty → full → faulty</b>',
          '<b>🔄 Sincronizare în timp real</b> — statusul discurilor este partajat între toate dispozitivele cu același Vehicle ID instantaneu',
          '<b>Last updated</b> arată cine și când a modificat ultima dată datele discurilor',
          '<b>📋 Copy report</b> — text formatat gata de lipit în WhatsApp',
        ],
      },
      {
        icon: '🎫', title: 'Ticket',
        steps: [
          ['Ticket Settings (o dată)', 'Team Leader, Vehicul, Înmatriculare, Telefoane, Locație — salvate permanent pe dispozitiv'],
          ['Selectați template', 'SSD Logistics: Sending / Receiving / Both → înlocuiți [SSD ID] și [tracking number]'],
          ['Copy Ticket', 'Apăsați 📋 Copy Ticket → lipiți direct în WhatsApp. ✕ Clear resetează câmpurile.'],
          ['Copy Update', 'Scrieți textul în blocul Update → 📤 Copy Update — prefixul "Update:" se adaugă automat. ✕ Clear resetează câmpul.'],
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
        icon: '📋', title: 'Reguli Ticket',
        items: [
          'Scrieți la <b>persoana a treia</b> — folosiți "The team", "They". Nu folosiți I, we, us',
          '<b>Fără semnătură</b> la final',
          'Fotografii doar în format <b>.jpg / .jpeg</b> — atașate la mesaj, niciodată în text',
          'Pregătiți ticket dacă problema nu este rezolvată în <b>15 minute</b> de troubleshooting',
          'Trimiteți în <b>grupul WhatsApp al vehiculului</b> și marcați: <b>@Nelu Colun, @Kristi Bujor, @Victor Balan</b>',
        ],
        tip: 'După trimitere — așteptați confirmarea înainte de acțiuni ulterioare. Până la primirea instrucțiunilor, continuați troubleshooting conform manualului existent.',
      },
      {
        icon: '📸', title: 'Denumire Fotografii',
        items: [
          'Format: <b>YYYYMMDD_V-number_titlu_1</b>',
          'Exemplu: <b>20240730_DC-205_measurement-system-issues_1</b>',
          'Toate fotografiile trebuie să fie în format <b>.jpg / .jpeg</b>',
          'În blocul <b>Ticket</b>, numele fișierului se generează automat din Dată, Vehicle ID și Description — apăsați 📋 pentru copiere. Folosiți butoanele <b>− / +</b> pentru a schimba numărul fotografiei.',
        ],
      },
      {
        icon: '🖥', title: 'SCRIVE — Protocol Tură',
        items: [
          'Aplicație web Capgemini pentru completarea protocolului de tură',
          'Link: <b>https://dgjlw5mhq5zna.cloudfront.net/login</b>',
          'Login: <b>driver@scrive.com</b>',
          'Parolă: <b>Capgemini2022!</b>',
        ],
      },
      {
        icon: '🔐', title: 'Valeo — Autentificare Windows',
        highlight: true,
        items: [
          'Sistem: <b>Valeo</b>',
          'Parolă Windows: <b>VW-kss2.0</b>',
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
          '<b>Aplicația se actualizează automat</b> — nu este nevoie de reinstalare. Deschideți aplicația și se va actualiza în fundal',
          '<b>Instalare pe iPhone:</b> Safari → buton Share → Add to Home Screen — funcționează ca o aplicație nativă',
          '<b>Instalare pe Android:</b> Chrome → meniu ⋮ → Add to Home Screen',
          '<b>Schimbare literă disc (Windows):</b> Win+R → <b>diskmgmt.msc</b> → D: click dreapta → Change Drive Letter → X → OK',
        ],
      },
      {
        icon: '⚖️', title: 'Despre & Legal',
        highlight: true,
        items: [
          '<b>ShiftLog</b> — dezvoltat de <b>Eugeniu Gud</b>',
          'Copyright © 2024–2026 Eugeniu Gud. Toate drepturile rezervate.',
          'Această aplicație este o operă originală a Autorului și este protejată de legislația privind drepturile de autor.',
          '<b>Utilizare permisă:</b> exclusiv pentru uz personal și operațional în cadrul echipei ADAS Valeo/VW Capgemini KSS2.0.',
          '<b>Restricții:</b> copierea, redistribuirea, utilizarea comercială sau transferul către terți fără permisiunea scrisă a Autorului este strict interzisă.',
          '<b>Date:</b> datele turelor sunt stocate local pe dispozitiv. Statusul discurilor este sincronizat prin Firebase Realtime Database exclusiv pentru echipă.',
          '<b>Declinare de responsabilitate:</b> aplicația este furnizată fără garanții de nicio natură. Autorul nu este responsabil pentru niciun prejudiciu rezultat din utilizarea sa.',
        ],
      },
    ],
  },
  ru: {
    sections: [
      {
        icon: '📋', title: 'Shift Report',
        steps: [
          ['Заполни Shift Parameters', 'Дата · Vehicle ID · Mission ID · Город + Страна (📍 автоопределение обоих) · Driver & Operator ID'],
          ['Добавляй события через Quick Add', 'Нажми кнопку → событие с текущим временем. Оранжевый = System DT, Синий = Org DT'],
          ['Заполни карточку события', 'Время start/end · KM start→end (Enter копирует) · Адрес 📍 · Для DT: выбери комментарий из dropdown, нажми ✏️ для редактирования текста (например замени A→Франкфурт, B→Париж)'],
          ['Preview & Copy', 'Генерирует полный отчёт и копирует в буфер — вставляй в WhatsApp или email'],
          ['New Shift', 'Сохраняет смену в историю, очищает события. Vehicle ID, Driver, Operator, Country сохраняются автоматически для следующей смены.'],
        ],
        tip: '⏱ Через 30 мин открытое событие показывает визуальное предупреждение и звуковой сигнал — закрывай вовремя.',
      },
      {
        icon: '💾', title: 'Disk Status',
        items: [
          'Нажми <b>+ Add disk</b> для каждого SSD в боксе',
          'Статус: <b style="color:#30d158">empty</b> — <b style="color:#ff9f0a">in use</b> — <b style="color:#ff453a">full</b> — <b style="color:#8e8e93">faulty</b>',
          'Для <b>in use</b>: введи доступные TB → % заполненности считается от 90 TB',
          'Цвет прогресс-бара: зелёный → жёлтый → красный по мере заполнения',
          'Диски сортируются автоматически: <b>in use → empty → full → faulty</b>',
          '<b>🔄 Синхронизация в реальном времени</b> — статус дисков виден на всех устройствах с одинаковым Vehicle ID мгновенно',
          '<b>Last updated</b> показывает кто и когда последний раз менял данные дисков',
          '<b>📋 Copy report</b> — форматированный текст для вставки в WhatsApp',
        ],
      },
      {
        icon: '🎫', title: 'Ticket',
        steps: [
          ['Ticket Settings (один раз)', 'Тимлидер, Авто, Номер, Телефоны, Адрес — сохраняются навсегда на устройстве'],
          ['Выбери шаблон', 'SSD Logistics: Sending / Receiving / Both → замени [SSD ID] и [tracking number]'],
          ['Copy Ticket', 'Нажми 📋 Copy Ticket → вставляй напрямую в WhatsApp. ✕ Clear сбрасывает поля.'],
          ['Copy Update', 'Введи текст в блоке Update → 📤 Copy Update — префикс "Update:" добавляется автоматически. ✕ Clear сбрасывает поле.'],
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
        icon: '📋', title: 'Правила тикета',
        items: [
          'Пишем от <b>третьего лица</b> — "The team", "They". Не использовать I, we, us',
          '<b>Без подписи</b> в конце',
          'Фото только в формате <b>.jpg / .jpeg</b> — прикреплять к сообщению, не вставлять в текст',
          'Готовить тикет если проблема не решена за <b>15 минут</b> траблшутинга',
          'Отправлять в <b>группу WhatsApp авто</b> и отмечать: <b>@Nelu Colun, @Kristi Bujor, @Victor Balan</b>',
        ],
        tip: 'После отправки — дождись подтверждения перед дальнейшими действиями. До получения инструкций продолжать troubleshooting согласно существующему мануалу.',
      },
      {
        icon: '📸', title: 'Именование фотографий',
        items: [
          'Формат: <b>YYYYMMDD_V-number_title_1</b>',
          'Пример: <b>20240730_DC-205_measurement-system-issues_1</b>',
          'Все фото должны быть в формате <b>.jpg / .jpeg</b>',
          'В блоке <b>Ticket</b> имя файла генерируется автоматически из Даты, Vehicle ID и Description — нажми 📋 чтобы скопировать. Кнопки <b>− / +</b> меняют номер фото.',
        ],
      },
      {
        icon: '🖥', title: 'SCRIVE — Протокол смены',
        items: [
          'Веб-приложение Capgemini для заполнения протокола смены',
          'Ссылка: <b>https://dgjlw5mhq5zna.cloudfront.net/login</b>',
          'Логин: <b>driver@scrive.com</b>',
          'Пароль: <b>Capgemini2022!</b>',
        ],
      },
      {
        icon: '🔐', title: 'Valeo — Вход в Windows',
        highlight: true,
        items: [
          'Система: <b>Valeo</b>',
          'Пароль Windows: <b>VW-kss2.0</b>',
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
          '<b>Приложение обновляется автоматически</b> — удалять и переустанавливать не нужно. Просто открой — обновится в фоне',
          '<b>Установка на iPhone:</b> Safari → кнопка «Поделиться» → «На экран Домой» — работает как нативное приложение',
          '<b>Установка на Android:</b> Chrome → меню ⋮ → «Добавить на главный экран»',
          '<b>Смена буквы диска (Windows):</b> Win+R → <b>diskmgmt.msc</b> → D: правая кнопка → Change Drive Letter → X → OK',
        ],
      },
      {
        icon: '⚖️', title: 'О приложении и правовая информация',
        highlight: true,
        items: [
          '<b>ShiftLog</b> — разработано <b>Eugeniu Gud</b>',
          'Copyright © 2024–2026 Eugeniu Gud. Все права защищены.',
          'Приложение является оригинальным произведением Автора и защищено действующим законодательством об авторском праве.',
          '<b>Разрешённое использование:</b> исключительно для личного и служебного использования в команде ADAS Valeo/VW Capgemini KSS2.0.',
          '<b>Ограничения:</b> копирование, распространение, коммерческое использование или передача третьим лицам без письменного разрешения Автора строго запрещены.',
          '<b>Данные:</b> данные смен хранятся локально на устройстве. Статус дисков синхронизируется через Firebase Realtime Database исключительно для командного использования.',
          '<b>Отказ от ответственности:</b> приложение предоставляется без каких-либо гарантий. Автор не несёт ответственности за любой ущерб, возникший в результате его использования.',
        ],
      },
    ],
  },
};
function openHelp() {
  renderHelp(_helpLang);
  $('helpOverlay').classList.add('open');
}

const HELP_ICONS = {
  '📋': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>',
  '💾': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/></svg>',
  '🎫': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',
  '📁': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  '📸': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
  '🖥': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  '🔐': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  '💡': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
  '⚖️': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>',
};

function renderHelp(lang) {
  _helpLang = lang;
  localStorage.setItem('helpLang', lang);
  const data = HELP_DATA[lang];
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });

  $('helpContent').innerHTML = `<div class="help-version">ShiftLog v${APP_VERSION}</div>` + data.sections.map(sec => {
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
    const highlightClass = sec.highlight ? ' help-section-highlight' : '';
    const iconHtml = HELP_ICONS[sec.icon] || sec.icon;

    return `<div class="help-section${highlightClass}">
      <div class="help-section-header">
        <span class="help-section-icon">${iconHtml}</span>
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
  initShiftParams();
  initNav();
  initQuickAdd();
  initGeo();
  initModals();
  initTicket();
  initHelp();
  bindEnterBlur();
  bindAutoSave();

  startEventTimers();

  // Firebase sync — запускаем когда Vehicle ID заполнен
  setTimeout(() => initFirebaseSync(), 500);

  // Переподключаемся при смене Vehicle ID
  $('vehicleId').addEventListener('change', () => {
    initFirebaseSync();
  });

  if (restored) showToast('Shift data restored');
});
