/* ============================================================
   app.js — SOS Venezuela Terremoto 2026
   Lógica principal de la aplicación
   ============================================================ */

'use strict';

/* ==============================
   ESTADO GLOBAL Y CONFIGURACIÓN
   ============================== */
let registros = [];
let anuncios  = [];

// ⚠️ IMPORTANTE: Coloca aquí tus datos para que funcione para todos los usuarios
let config = {
  sheetId:        '15o78St2GHdamibADpirj2XMRXngF0bcKZdNG5m2z96U', // Ej: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms'
  apiKey:         'AIzaSyC2AIGUswWNIwoerA8fqfE3kQJY2cl5xsQ', // Tu API Key de Google
  webAppUrl:      'https://script.google.com/macros/s/AKfycbx8vyiZkddQy1xXip_dWtCcx1F9R4EAo38Aywj56DRrPQpaH4uK_qMxEVEIfzJ0f7AI/exec', // Ej: 'https://script.google.com/macros/s/.../exec'
  sheetRegistros: 'Registros',
  sheetAnuncios:  'Anuncios'
};

let isMockMode = false;

/* ==============================
   INIT
   ============================== */
document.addEventListener('DOMContentLoaded', () => {
  loadConfig();
  populateSelects();
  setupForms();
  loadData();
  updateFooterDate();
});

/* ==============================
   CONFIGURACIÓN
   ============================== */
function loadConfig() {
  // Pre-llenar campos de config en la UI con los datos del código
  setVal('cfgSheetId',        config.sheetId);
  setVal('cfgApiKey',         config.apiKey);
  setVal('cfgWebAppUrl',      config.webAppUrl);
  setVal('cfgSheetRegistros', config.sheetRegistros);
  setVal('cfgSheetAnuncios',  config.sheetAnuncios);
}

function saveConfig() {
  // Esta función ahora solo actualiza la sesión actual para pruebas.
  // Para que sea permanente, debes editar las variables 'config' al inicio de js/app.js
  config.sheetId        = getVal('cfgSheetId').trim();
  config.apiKey         = getVal('cfgApiKey').trim();
  config.webAppUrl      = getVal('cfgWebAppUrl').trim();
  config.sheetRegistros = getVal('cfgSheetRegistros').trim() || 'Registros';
  config.sheetAnuncios  = getVal('cfgSheetAnuncios').trim()  || 'Anuncios';

  showMsg('configMsg', 'success', '✅ Configuración aplicada temporalmente. Para guardarla, pégala en js/app.js.');
  toast('Configuración aplicada', 'success');
  isMockMode = false;
}

async function testConnection() {
  const btn = document.getElementById('btnTestConexion');
  btn.disabled = true;
  btn.textContent = '⏳ Probando…';
  showMsg('configMsg', '', '');
  document.getElementById('configMsg').classList.add('hidden');

  // Leer valores frescos del formulario (pueden no haberse guardado aún)
  const sid  = getVal('cfgSheetId').trim();
  const akey = getVal('cfgApiKey').trim();
  const wurl = getVal('cfgWebAppUrl').trim();

  try {
    // --- Estrategia 1: probar el Web App (si está configurado) ---
    if (wurl) {
      const res  = await fetch(`${wurl}?tipo=registros`);
      if (!res.ok) throw new Error(`Apps Script devolvió HTTP ${res.status}. Verifica que el Web App esté publicado como acceso "Cualquier persona"`);
      const json = await res.json();
      if (json.ok !== undefined) {
        showMsg('configMsg', 'success', `✅ Conexión exitosa con el Web App de Apps Script. ${json.data ? json.data.length + ' registros encontrados.' : 'Hoja lista.'}`);
        toast('Conexión exitosa ✅', 'success');
        return;
      }
      throw new Error('El Apps Script respondió un formato inesperado. Asegúrate de haber pegado el código correcto.');
    }

    // --- Estrategia 2: probar la Sheets API directamente ---
    if (!sid || !akey) {
      throw new Error('Completa el ID de la hoja y la API Key antes de probar.');
    }
    const sheetName = getVal('cfgSheetRegistros').trim() || 'Registros';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sid}/values/${encodeURIComponent(sheetName)}?key=${akey}`;
    const res  = await fetch(url);
    const json = await res.json();

    if (json.error) {
      // Google devuelve {error: {code, message, status}}
      const code = json.error.code || '';
      const msg  = json.error.message || 'Error desconocido';
      if (code === 403) throw new Error(`403 – Acceso denegado. Asegúrate de que la hoja esté compartida públicamente ("Cualquier persona con el enlace puede ver") y que la API Key tenga permiso para Sheets API.`);
      if (code === 400) throw new Error(`400 – ID de hoja inválido. Revisa que copiaste el ID correcto (la parte entre /d/ y /edit en la URL).`);
      if (code === 404) throw new Error(`404 – Hoja "${sheetName}" no encontrada. Verifica que la pestaña de la hoja se llame exactamente "Registros" (con mayúscula).`);
      throw new Error(`Google Sheets API: ${msg} (código ${code})`);
    }

    // values puede no existir si la hoja está vacía — eso es válido
    const count = json.values ? json.values.length - 1 : 0;
    showMsg('configMsg', 'success', `✅ Conexión exitosa con Google Sheets. ${count > 0 ? count + ' registros encontrados.' : 'Hoja vacía, lista para recibir datos.'}`);
    toast('Conexión exitosa ✅', 'success');

  } catch (e) {
    showMsg('configMsg', 'error', '❌ ' + e.message);
    toast('Error de conexión', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '🔌 Probar conexión';
  }
}

function loadMockData() {
  isMockMode = true;
  registros = [...MOCK_REGISTROS];
  anuncios  = [...MOCK_ANUNCIOS];
  updateStats();
  renderAnuncios();
  renderEstadosGrid();
  toast('Datos de ejemplo cargados. Los cambios NO se guardarán.', 'warning');
}

/* ==============================
   CARGA DE DATOS (GOOGLE SHEETS)
   ============================== */
async function loadData() {
  if (!config.sheetId || !config.apiKey) {
    // Sin config → modo demo automático
    loadMockData();
    return;
  }

  setBtnState('btnRegistrar', true, '⏳ Cargando…');
  try {
    const [resReg, resAnun] = await Promise.all([
      fetchSheetData('registros'),
      fetchSheetData('anuncios')
    ]);
    registros = resReg;
    anuncios  = resAnun;
    updateStats();
    renderAnuncios();
    renderEstadosGrid();
    updateFooterDate();
    toast('Datos actualizados', 'success');
  } catch (e) {
    console.error('Error cargando datos:', e);
    toast('Error al cargar datos remotos. Mostrando modo demo.', 'warning');
    loadMockData();
  } finally {
    setBtnState('btnRegistrar', false, '✅ Registrar Persona');
  }
}

async function fetchSheetData(tipo) {
  /* Si tenemos Web App URL, usarla (admite escritura y lectura) */
  if (config.webAppUrl) {
    const url = `${config.webAppUrl}?tipo=${tipo}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Apps Script HTTP ${res.status}`);
    const json = await res.json();
    if (json.ok !== undefined) return normalizeRows(json.data || []);
    throw new Error(json.error || 'Respuesta inesperada del Apps Script');
  }

  /* Lectura pública vía Sheets API v4 */
  const url  = buildReadUrl(tipo);
  const res  = await fetch(url);
  const json = await res.json();

  if (json.error) {
    const code = json.error.code || '';
    const msg  = json.error.message || 'Error de API';
    throw new Error(`Sheets API ${code}: ${msg}`);
  }
  return parseSheetApi(json);
}

function buildReadUrl(tipo) {
  const sheetName = tipo === 'anuncios' ? config.sheetAnuncios : config.sheetRegistros;
  return `https://sheets.googleapis.com/v4/spreadsheets/${config.sheetId}/values/${encodeURIComponent(sheetName)}?key=${config.apiKey}`;
}

function parseSheetApi(json) {
  // json.values puede estar ausente si la hoja está vacía — es válido
  const values = json.values || [];
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i] !== undefined ? String(row[i]) : ''; });
    return obj;
  });
}

function normalizeRows(rows) {
  /* Normaliza claves con mayúsculas/minúsculas inconsistentes */
  return rows.map(row => {
    const out = {};
    Object.keys(row).forEach(k => { out[k] = row[k]; });
    return out;
  });
}

/* ==============================
   SELECTS
   ============================== */
function populateSelects() {
  const selectors = ['estadoUbic', 'anuncioEstado', 'filterEstado'];
  selectors.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    ESTADOS_VENEZUELA.forEach(est => {
      const opt = document.createElement('option');
      opt.value = est;
      opt.textContent = est;
      el.appendChild(opt);
    });
  });
}

/* ==============================
   FORMULARIO: REGISTRO
   ============================== */
function setupForms() {
  document.getElementById('registroForm').addEventListener('submit', handleRegistroSubmit);
  document.getElementById('anuncioForm').addEventListener('submit', handleAnuncioSubmit);

  // Búsqueda en tiempo real
  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') performSearch();
  });
}

async function handleRegistroSubmit(e) {
  e.preventDefault();
  clearErrors();

  const data = collectForm('registroForm');
  const errors = validateRegistro(data);

  if (errors.length) {
    errors.forEach(err => markError(err.field, err.msg));
    showMsg('formMsg', 'error', '⚠️ Por favor completa los campos obligatorios.');
    return;
  }

  const btn = document.getElementById('btnRegistrar');
  setBtnState('btnRegistrar', true, '⏳ Registrando…');
  showMsg('formMsg', '', '');
  document.getElementById('formMsg').classList.add('hidden');

  try {
    let result;
    if (isMockMode || !config.webAppUrl) {
      result = mockInsert(data, 'registro');
      registros.push(result);
    } else {
      result = await postData({ tipo: 'registro', ...data });
      registros.push({ ...data, ID: result.id, Timestamp: new Date().toISOString() });
    }

    updateStats();
    renderEstadosGrid();
    document.getElementById('registroForm').reset();
    showModal('¡Persona registrada!', 'La información ha sido guardada correctamente. Gracias por ayudar.', result.id || result.ID);
    toast('Registro guardado exitosamente', 'success');
  } catch (err) {
    showMsg('formMsg', 'error', '❌ Error al guardar: ' + err.message);
    toast('Error al guardar registro', 'error');
  } finally {
    setBtnState('btnRegistrar', false, '✅ Registrar Persona');
  }
}

async function handleAnuncioSubmit(e) {
  e.preventDefault();
  clearErrors();

  const data = collectForm('anuncioForm');
  if (!data.anuncioNombre || !data.anuncioDescripcion || !data.anuncioContacto) {
    toast('Completa los campos obligatorios del anuncio.', 'error');
    return;
  }
  if (!document.getElementById('anuncioConsentimiento').checked) {
    toast('Debes confirmar que la información es real.', 'error');
    return;
  }

  const btn = document.getElementById('btnAnuncio');
  setBtnState('btnAnuncio', true, '⏳ Publicando…');

  try {
    let result;
    if (isMockMode || !config.webAppUrl) {
      result = mockInsert(data, 'anuncio');
      anuncios.unshift(result);
    } else {
      result = await postData({ tipo: 'anuncio', ...data });
      anuncios.unshift({ ...data, ID: result.id, Timestamp: new Date().toISOString() });
    }

    document.getElementById('anuncioForm').reset();
    renderAnuncios();
    document.getElementById('anunciosCount').textContent = anuncios.length;
    toast('Anuncio publicado exitosamente', 'success');
  } catch (err) {
    toast('Error al publicar anuncio: ' + err.message, 'error');
  } finally {
    setBtnState('btnAnuncio', false, '📢 Publicar Anuncio');
  }
}

function validateRegistro(data) {
  const errs = [];
  if (!data.nombreCompleto) errs.push({ field: 'nombreCompleto', msg: 'El nombre es obligatorio.' });
  if (!data.tipoPersn)      errs.push({ field: 'tipoPersn',      msg: 'Selecciona el tipo de persona.' });
  if (!data.estadoUbic)     errs.push({ field: 'estadoUbic',     msg: 'Selecciona el estado.' });
  if (!data.municipio)      errs.push({ field: 'municipio',      msg: 'El municipio es obligatorio.' });
  if (!data.estadoSalud)    errs.push({ field: 'estadoSalud',    msg: 'Selecciona el estado de salud.' });
  if (!data.tipoRegistro)   errs.push({ field: 'tipoRegistro',   msg: 'Selecciona el tipo de registro.' });
  if (!data.reporterNombre) errs.push({ field: 'reporterNombre', msg: 'Tu nombre es obligatorio.' });
  if (!data.reporterTelefono) errs.push({ field: 'reporterTelefono', msg: 'Tu contacto es obligatorio.' });
  if (!document.getElementById('consentimiento').checked) {
    errs.push({ field: 'consentimiento', msg: 'Debes confirmar la veracidad de la información.' });
  }
  return errs;
}

/* ==============================
   ENVÍO A GOOGLE APPS SCRIPT
   ============================== */
async function postData(data) {
  if (!config.webAppUrl) throw new Error('URL del Web App no configurada.');

  // Google Apps Script requiere que los datos se envíen como texto plano
  // (Content-Type: text/plain) para evitar el preflight CORS que bloquea el navegador.
  const res = await fetch(config.webAppUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    throw new Error(`El servidor respondió con error HTTP ${res.status}. Verifica que el Web App esté publicado con acceso "Cualquier persona".`);
  }

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error('La respuesta del Apps Script no es JSON válido. Verifica el código del Web App.');
  }

  if (!json.ok) throw new Error(json.error || 'Error en el servidor.');
  return json;
}

/* ==============================
   MOCK INSERT (modo demo)
   ============================== */
function mockInsert(data, tipo) {
  const id = (tipo === 'registro' ? 'R' : 'A') + Date.now();
  const base = { ID: id, Timestamp: new Date().toISOString() };

  if (tipo === 'registro') {
    return {
      ...base,
      Nombre: data.nombreCompleto, Edad: data.edad, TipoPersn: data.tipoPersn,
      Genero: data.genero, Cedula: data.cedula, Telefono: data.telefono,
      Estado: data.estadoUbic, Municipio: data.municipio, Direccion: data.direccion,
      EstadoSalud: data.estadoSalud, TipoRegistro: data.tipoRegistro,
      DescSalud: data.descripcionSalud, ReporterNombre: data.reporterNombre,
      ReporterContacto: data.reporterTelefono, Notas: data.notasAdicionales
    };
  } else {
    return {
      ...base,
      NombreBuscado: data.anuncioNombre, Edad: data.anuncioEdad,
      Estado: data.anuncioEstado, Ubicacion: data.anuncioUbicacion,
      Descripcion: data.anuncioDescripcion, Contacto: data.anuncioContacto,
      NombreReporter: data.anuncioNombreReporter
    };
  }
}

/* ==============================
   ESTADÍSTICAS
   ============================== */
function updateStats() {
  const total    = registros.length;
  const found    = registros.filter(r => ['encontrado','en_refugio'].includes(r.TipoRegistro)).length;
  const missing  = registros.filter(r => r.TipoRegistro === 'buscado').length;
  const children = registros.filter(r => r.TipoPersn === 'nino').length;

  animateCount('statTotal',    total);
  animateCount('statFound',    found);
  animateCount('statMissing',  missing);
  animateCount('statChildren', children);
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  const diff  = target - start;
  const steps = 20;
  let step = 0;
  const timer = setInterval(() => {
    step++;
    el.textContent = Math.round(start + (diff * step / steps));
    if (step >= steps) { el.textContent = target; clearInterval(timer); }
  }, 25);
}

/* ==============================
   RENDER: TARJETAS DE PERSONA
   ============================== */
function renderRecordCard(r) {
  const tipo  = TIPO_PERSONA_MAP[r.TipoPersn]  || TIPO_PERSONA_MAP.adulto;
  const salud = SALUD_MAP[r.EstadoSalud]        || SALUD_MAP.desconocido;
  const treg  = TIPO_REGISTRO_MAP[r.TipoRegistro] || { label: r.TipoRegistro, css: '' };
  const ts    = r.Timestamp ? formatDate(r.Timestamp) : '';

  const edad    = r.Edad ? ` · ${r.Edad} años` : '';
  const cedula  = r.Cedula ? ` · ${r.Cedula}` : '';

  return `
    <div class="record-card">
      <div class="record-avatar ${tipo.avatarCss}" aria-hidden="true">${tipo.icon}</div>
      <div class="record-info">
        <div class="record-name">
          <span>${escHtml(r.Nombre || 'Sin nombre')}</span>
          <span class="record-tag ${treg.css}">${treg.label}</span>
        </div>
        <div class="record-meta">
          <span class="record-tag ${salud.css}">${salud.label}</span>
          <span class="record-tag ${tipo.css}">${tipo.label}${edad}</span>
          ${cedula ? `<span class="record-tag tag-tipo-adulto">📄 ${escHtml(cedula)}</span>` : ''}
        </div>
        <div class="record-location">
          <span>📍 ${escHtml(r.Estado || '')}${r.Municipio ? `, ${escHtml(r.Municipio)}` : ''}</span>
          ${r.Direccion ? `<span>🏠 ${escHtml(r.Direccion)}</span>` : ''}
        </div>
        ${r.DescSalud ? `<div class="record-location" style="margin-top:0.3rem">💬 ${escHtml(r.DescSalud)}</div>` : ''}
        ${r.ReporterContacto ? `<div class="record-location">📞 Contacto: <strong>${escHtml(r.ReporterContacto)}</strong></div>` : ''}
      </div>
      <div class="record-actions">
        <span class="record-timestamp">${ts}</span>
      </div>
    </div>`;
}

/* ==============================
   RENDER: ANUNCIOS
   ============================== */
function renderAnuncios(filter = '') {
  const list = document.getElementById('anunciosList');
  const filtered = anuncios.filter(a =>
    !filter || normalize(a.NombreBuscado + ' ' + a.Descripcion + ' ' + a.Estado + ' ' + a.Ubicacion).includes(normalize(filter))
  );

  document.getElementById('anunciosCount').textContent = anuncios.length;

  if (!filtered.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p>No hay anuncios${filter ? ' con ese criterio' : ' publicados aún'}.</p></div>`;
    return;
  }

  list.innerHTML = filtered.map(a => {
    const ts = a.Timestamp ? formatDate(a.Timestamp) : '';
    return `
      <div class="anuncio-card">
        <div class="anuncio-header">
          <span class="anuncio-nombre">🔍 ${escHtml(a.NombreBuscado || '')}${a.Edad ? ` (${a.Edad} años)` : ''}</span>
          <span class="anuncio-ts">${ts}</span>
        </div>
        <p class="anuncio-desc">${escHtml(a.Descripcion || '')}</p>
        <div class="anuncio-footer">
          <span class="anuncio-contacto">📞 ${escHtml(a.Contacto || '')}</span>
          ${a.Estado || a.Ubicacion ? `<span class="anuncio-ubicacion">📍 ${escHtml(a.Estado || '')}${a.Ubicacion ? ` · ${escHtml(a.Ubicacion)}` : ''}</span>` : ''}
        </div>
        ${a.NombreReporter ? `<div style="font-size:0.72rem;color:var(--gray-400);margin-top:0.4rem">Publicado por: ${escHtml(a.NombreReporter)}</div>` : ''}
      </div>`;
  }).join('');
}

function filterAnuncios(query) {
  renderAnuncios(query);
}

/* ==============================
   RENDER: ESTADOS GRID
   ============================== */
function renderEstadosGrid() {
  const grid = document.getElementById('estadosGrid');
  if (!grid) return;

  const counts = {};
  ESTADOS_VENEZUELA.forEach(e => { counts[e] = 0; });
  registros.forEach(r => { if (r.Estado && counts[r.Estado] !== undefined) counts[r.Estado]++; });

  grid.innerHTML = ESTADOS_VENEZUELA.map(est => {
    const c = counts[est] || 0;
    const hasData = c > 0;
    return `
      <button class="estado-btn${hasData ? ' has-data' : ''}" onclick="showEstado('${escHtml(est)}')" aria-label="${escHtml(est)}: ${c} registros">
        <span class="estado-btn-count">${c}</span>
        <span class="estado-btn-name">${escHtml(est)}</span>
        <span class="estado-btn-label">${c === 1 ? 'registro' : 'registros'}</span>
      </button>`;
  }).join('');
}

function showEstado(estado) {
  const estadoRecords = registros.filter(r => r.Estado === estado);

  const grid     = document.getElementById('estadosGrid');
  const detalles = document.getElementById('estadoDetalles');
  const nombre   = document.getElementById('estadoNombre');
  const count    = document.getElementById('estadoCount');
  const records  = document.getElementById('estadoRecords');

  grid.style.display = 'none';
  detalles.classList.remove('hidden');
  detalles.classList.add('visible');
  nombre.textContent = `📍 ${estado}`;
  count.textContent  = `${estadoRecords.length} ${estadoRecords.length === 1 ? 'persona' : 'personas'}`;

  if (!estadoRecords.length) {
    records.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p>No hay registros para este estado aún.</p></div>`;
    return;
  }

  records.innerHTML = estadoRecords.map(renderRecordCard).join('');
}

function clearEstadoView() {
  const grid     = document.getElementById('estadosGrid');
  const detalles = document.getElementById('estadoDetalles');
  grid.style.display = '';
  detalles.classList.add('hidden');
  detalles.classList.remove('visible');
}

/* ==============================
   BÚSQUEDA
   ============================== */
function performSearch() {
  const query       = normalize(getVal('searchInput'));
  const estFilter   = getVal('filterEstado');
  const tipoFilter  = getVal('filterTipoRegistro');
  const saludFilter = getVal('filterSalud');
  const container   = document.getElementById('searchResults');

  if (!query && !estFilter && !tipoFilter && !saludFilter) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><p>Ingresa un término de búsqueda para encontrar registros.</p></div>`;
    return;
  }

  let results = [...registros];

  if (query) {
    results = results.filter(r =>
      normalize(`${r.Nombre} ${r.Cedula} ${r.Estado} ${r.Municipio} ${r.Direccion} ${r.ReporterNombre}`).includes(query)
    );
  }
  if (estFilter)   results = results.filter(r => r.Estado === estFilter);
  if (tipoFilter)  results = results.filter(r => r.TipoRegistro === tipoFilter);
  if (saludFilter) results = results.filter(r => r.EstadoSalud === saludFilter);

  if (!results.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">😔</div><p>No se encontraron coincidencias. Intenta con otros términos.</p></div>`;
    return;
  }

  container.innerHTML = `
    <div style="font-size:0.83rem;color:var(--gray-600);margin-bottom:0.75rem;font-weight:500;">
      ${results.length} resultado${results.length !== 1 ? 's' : ''} encontrado${results.length !== 1 ? 's' : ''}
    </div>
    ${results.map(renderRecordCard).join('')}`;
}

/* ==============================
   NAVEGACIÓN POR PESTAÑAS
   ============================== */
function switchTab(name) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });

  const panel = document.getElementById(`panel-${name}`);
  const tab   = document.getElementById(`tab-${name}`);
  if (panel) panel.classList.add('active');
  if (tab)   { tab.classList.add('active'); tab.setAttribute('aria-selected', 'true'); }

  // Si entramos a estados, re-renderizar
  if (name === 'estados') renderEstadosGrid();
  // Si entramos a anuncios, re-renderizar  
  if (name === 'anuncios') renderAnuncios();
}

/* ==============================
   MODAL
   ============================== */
function showModal(title, msg, id) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalMsg').textContent   = msg;
  document.getElementById('modalId').textContent    = id ? `ID de registro: ${id}` : '';
  document.getElementById('modalExito').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalExito').classList.add('hidden');
}

/* ==============================
   TOAST NOTIFICATIONS
   ============================== */
function toast(msg, type = '') {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast${type ? ' ' + type : ''}`;
  const icon = { success: '✅', error: '❌', warning: '⚠️' }[type] || 'ℹ️';
  el.innerHTML = `<span>${icon}</span><span>${escHtml(msg)}</span>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 4500);
}

/* ==============================
   APPS SCRIPT COPY
   ============================== */
function copyAppsScript() {
  const code = document.getElementById('appsScriptCode').textContent;
  navigator.clipboard.writeText(code.trim()).then(() => {
    const btn = document.getElementById('btnCopyScript');
    btn.textContent = '✅ Copiado!';
    setTimeout(() => { btn.textContent = '📋 Copiar código'; }, 2000);
    toast('Código copiado al portapapeles', 'success');
  }).catch(() => toast('No se pudo copiar. Selecciona el texto manualmente.', 'error'));
}

/* ==============================
   HELPERS
   ============================== */
function collectForm(formId) {
  const form = document.getElementById(formId);
  const data = {};
  new FormData(form).forEach((val, key) => { data[key] = val; });
  return data;
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

function normalize(str) {
  return String(str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function escHtml(str) {
  const map = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#039;' };
  return String(str || '').replace(/[<>&"']/g, m => map[m]);
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

function showMsg(id, type, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!type || !msg) { el.classList.add('hidden'); el.textContent = ''; return; }
  el.className = `form-message ${type}`;
  el.textContent = msg;
}

function markError(field, msg) {
  const el = document.getElementById(field);
  if (el) el.classList.add('error');
}

function clearErrors() {
  document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
}

function setBtnState(id, disabled, text) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled = disabled;
  if (text) btn.innerHTML = text;
}

function updateFooterDate() {
  const el = document.getElementById('lastUpdate');
  if (el) el.textContent = `Última actualización: ${new Date().toLocaleString('es-VE')}`;
}
