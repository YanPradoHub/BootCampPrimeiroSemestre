/**
 * app.js — AutoMail XP
 *
 * Lógica principal da aplicação:
 * - Gerenciamento de estado das operações
 * - Renderização dinâmica do formulário
 * - Geração do HTML do e-mail
 * - Exportação como .eml
 */

// =============================================
// ESTADO
// =============================================

let opCounter = 0;
let operations = [];       // Array de { id, type, assetType, fields }
let generatedHTML = '';
let generatedSubject = '';

// =============================================
// TEMA
// =============================================

function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : '');
  document.getElementById('btn-dark').classList.toggle('active', t === 'dark');
  document.getElementById('btn-light').classList.toggle('active', t === 'light');
}

// =============================================
// DEFINIÇÃO DE CAMPOS POR TIPO DE OPERAÇÃO
// =============================================

const FIELDS = {
  'RESGATE|RENDA FIXA': [
    { key: 'emissor',    label: 'Emissor' },
    { key: 'ativo',      label: 'Ativo' },
    { key: 'vencimento', label: 'Vencimento' },
    { key: 'taxa',       label: 'Taxa' },
    { key: 'pu',         label: 'P.U.',      default: CFG.rrfDefaultPu },
    { key: 'quantidade', label: 'Quantidade' },
    { key: 'valor',      label: 'Valor (R$)' },
  ],
  'RESGATE|FUNDO': [
    { key: 'fundo',      label: 'Fundo' },
    { key: 'cotizacao',  label: 'Cotização' },
    { key: 'liquidacao', label: 'Liquidação' },
    { key: 'valor',      label: 'Valor (R$)' },
  ],
  'RESGATE|TESOURO': [
    { key: 'titulo',     label: 'Título' },
    { key: 'vencimento', label: 'Vencimento' },
    { key: 'valor',      label: 'Valor (R$)' },
  ],
  'RESGATE|COMPROMISSADA': [
    { key: 'vencimento',   label: 'Vencimento' },
    { key: 'taxa',         label: 'Taxa' },
    { key: 'valorLiquido', label: 'Valor Líquido (R$)' },
  ],
  'APLICAÇÃO|RENDA FIXA': [
    { key: 'emissor',    label: 'Emissor' },
    { key: 'ativo',      label: 'Ativo' },
    { key: 'carencia',   label: 'Carência' },
    { key: 'vencimento', label: 'Vencimento' },
    { key: 'taxa',       label: 'Taxa' },
    { key: 'pu',         label: 'P.U.',      default: CFG.arfDefaultPu },
    { key: 'valor',      label: 'Valor (R$)' },
  ],
  'APLICAÇÃO|LCA LIQUIDEZ DIÁRIA': [
    { key: 'taxa',       label: 'Taxa de Negociação', default: CFG.alcaDefaultTaxa },
    { key: 'valorTotal', label: 'Valor Total Aprox. (R$)' },
  ],
  'APLICAÇÃO|FUNDO': [
    { key: 'fundo',      label: 'Fundo' },
    { key: 'cotizacao',  label: 'Cotização' },
    { key: 'liquidacao', label: 'Liquidação' },
    { key: 'valor',      label: 'Valor (R$)' },
  ],
  'APLICAÇÃO|TESOURO': [
    { key: 'titulo',         label: 'Título' },
    { key: 'rentabilidade',  label: 'Rent. a.a.' },
    { key: 'vencimento',     label: 'Vencimento' },
    { key: 'pagamentoJuros', label: 'Pagamento de Juros' },
    { key: 'quantidade',     label: 'Quantidade' },
    { key: 'valor',          label: 'Valor a ser aplicado (R$)' },
  ],
  'APLICAÇÃO|COMPROMISSADA': [
    { key: 'vencimento',   label: 'Vencimento' },
    { key: 'taxa',         label: 'Taxa' },
    { key: 'valorLiquido', label: 'Valor Líquido (R$)' },
  ],
  'TRANSFERÊNCIA|': [
    { key: 'valor',   label: 'Valor Aprox. (R$)' },
    { key: 'banco',   label: 'Banco' },
    { key: 'agencia', label: 'Agência' },
    { key: 'conta',   label: 'Conta' },
  ],
};

// =============================================
// GERENCIAMENTO DE OPERAÇÕES
// =============================================

function addOperation() {
  opCounter++;
  operations.push({ id: opCounter, type: '', assetType: '', fields: {} });
  renderOperations();
  onFormChange();
}

function removeOperation(id) {
  operations = operations.filter(o => o.id !== id);
  renderOperations();
  onFormChange();
}

function moveUp(id) {
  const i = operations.findIndex(o => o.id === id);
  if (i > 0) [operations[i - 1], operations[i]] = [operations[i], operations[i - 1]];
  renderOperations();
}

function moveDown(id) {
  const i = operations.findIndex(o => o.id === id);
  if (i < operations.length - 1) [operations[i], operations[i + 1]] = [operations[i + 1], operations[i]];
  renderOperations();
}

function setOpType(id, val) {
  const op = operations.find(o => o.id === id);
  if (!op) return;
  op.type = val;
  op.assetType = '';
  op.fields = {};
  renderOperations();
  onFormChange();
}

function setOpAsset(id, val) {
  const op = operations.find(o => o.id === id);
  if (!op) return;
  op.assetType = val;
  op.fields = {};
  renderOperations();
  onFormChange();
}

function setOpField(id, key, val) {
  const op = operations.find(o => o.id === id);
  if (!op) return;
  op.fields[key] = val;
  onFormChange();
}

// =============================================
// RENDERIZAÇÃO DO FORMULÁRIO
// =============================================

function renderOperations() {
  const list  = document.getElementById('opsList');
  const empty = document.getElementById('opsEmpty');

  if (operations.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = operations.map((op, idx) => renderOp(op, idx)).join('');
}

function renderOp(op, idx) {
  const isTransfer = op.type === 'TRANSFERÊNCIA';

  const assetOptions = isTransfer ? '' : `
    <select onchange="setOpAsset(${op.id}, this.value)" style="min-width:180px">
      <option value="">— Tipo do Ativo —</option>
      ${getAssetOptions(op.type).map(a =>
        `<option value="${a}" ${op.assetType === a ? 'selected' : ''}>${a}</option>`
      ).join('')}
    </select>`;

  const fieldKey  = op.type === 'TRANSFERÊNCIA' ? 'TRANSFERÊNCIA|' : `${op.type}|${op.assetType}`;
  const fieldDefs = FIELDS[fieldKey] || [];

  const fieldsHtml = fieldDefs.length > 0 ? `
    <div class="op-fields">
      ${fieldDefs.map(f => `
        <div class="op-field">
          <label>${f.label}</label>
          <input type="text"
            placeholder="${f.default || ''}"
            value="${escHtml(op.fields[f.key] || (f.default || ''))}"
            oninput="setOpField(${op.id}, '${f.key}', this.value)">
        </div>`
      ).join('')}
    </div>` : '';

  return `
    <div class="op-item" id="op-${op.id}">
      <div class="op-header">
        <div class="op-num">${idx + 1}</div>
        <div class="op-selects">
          <select onchange="setOpType(${op.id}, this.value)">
            <option value="">— Tipo da Operação —</option>
            <option value="RESGATE"      ${op.type === 'RESGATE'      ? 'selected' : ''}>RESGATE</option>
            <option value="APLICAÇÃO"    ${op.type === 'APLICAÇÃO'    ? 'selected' : ''}>APLICAÇÃO</option>
            <option value="TRANSFERÊNCIA"${op.type === 'TRANSFERÊNCIA'? 'selected' : ''}>TRANSFERÊNCIA</option>
          </select>
          ${assetOptions}
        </div>
        <div class="op-actions">
          <button class="op-btn"        onclick="moveUp(${op.id})"        title="Mover para cima">▲</button>
          <button class="op-btn"        onclick="moveDown(${op.id})"      title="Mover para baixo">▼</button>
          <button class="op-btn danger" onclick="removeOperation(${op.id})" title="Remover">✕</button>
        </div>
      </div>
      ${fieldsHtml}
    </div>`;
}

function getAssetOptions(type) {
  if (type === 'RESGATE')   return ['RENDA FIXA', 'FUNDO', 'TESOURO', 'COMPROMISSADA'];
  if (type === 'APLICAÇÃO') return ['RENDA FIXA', 'LCA LIQUIDEZ DIÁRIA', 'FUNDO', 'TESOURO', 'COMPROMISSADA'];
  return [];
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function onFormChange() {
  const hasOps = operations.some(o => o.type);
  document.getElementById('btnGenerate').disabled = !hasOps;
}

// =============================================
// GERAÇÃO DO ASSUNTO E LISTA DE OPERAÇÕES
// =============================================

function getGreeting() {
  return new Date().getHours() < 12 ? 'Bom dia' : 'Boa tarde';
}

function generateSubject() {
  const types = operations.filter(o => o.type).map(o => o.type);
  if (!types.length) return '';

  const code = document.getElementById('clientCode').value.trim() || 'XXXXX';
  const counts = {};
  types.forEach(t => counts[t] = (counts[t] || 0) + 1);

  const parts = [];
  if (counts['RESGATE'])      parts.push(counts['RESGATE']      > 1 ? 'Resgates'      : 'Resgate');
  if (counts['APLICAÇÃO'])    parts.push(counts['APLICAÇÃO']    > 1 ? 'Aplicações'    : 'Aplicação');
  if (counts['TRANSFERÊNCIA'])parts.push(counts['TRANSFERÊNCIA']> 1 ? 'Transferências': 'Transferência');

  return `${parts.join(' e ')} - ${code}`;
}

function generateOpList() {
  const ops = operations.filter(o => o.type);
  const groups = {};
  ops.forEach(o => {
    const key = o.type === 'TRANSFERÊNCIA' ? 'TRANSFERÊNCIA' : `${o.type}|${o.assetType}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(o);
  });

  const labels = [];
  const typeOrder = ['RESGATE', 'APLICAÇÃO', 'TRANSFERÊNCIA'];

  typeOrder.forEach(type => {
    if (type === 'TRANSFERÊNCIA') {
      if (groups['TRANSFERÊNCIA']) labels.push('transferência');
      return;
    }
    const assets = ['RENDA FIXA', 'LCA LIQUIDEZ DIÁRIA', 'FUNDO', 'TESOURO', 'COMPROMISSADA'];
    assets.forEach(asset => {
      const key = `${type}|${asset}`;
      if (!groups[key]) return;

      const plural   = groups[key].length > 1;
      const typeWord = type === 'RESGATE'
        ? (plural ? 'resgates' : 'resgate')
        : (plural ? 'aplicações' : 'aplicação');
      const assetWord = {
        'RENDA FIXA':          'renda fixa',
        'LCA LIQUIDEZ DIÁRIA': 'LCA de liquidez diária',
        'FUNDO':               'fundo',
        'TESOURO':             'tesouro direto',
        'COMPROMISSADA':       'compromissada',
      }[asset];
      const prep = type === 'RESGATE' ? 'de' : 'em';
      labels.push(`${typeWord} ${prep} ${assetWord}`);
    });
  });

  if (!labels.length) return '';
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(', ')} e ${labels[labels.length - 1]}`;
}

// =============================================
// CONSTRUÇÃO DO HTML DO E-MAIL
// =============================================

// Estilos inline para compatibilidade Outlook Clássico + Novo Outlook
const TS          = 'font-family:Calibri,sans-serif;font-size:11pt;';
const TH_STYLE    = `${TS}padding:4px 8px;mso-padding-alt:4px 8px;font-weight:700;border:1px solid #d1d5db;text-align:center;vertical-align:middle;line-height:1.3;background:#f3f4f6;`;
const TD_STYLE    = `${TS}padding:4px 8px;mso-padding-alt:4px 8px;border:1px solid #e5e7eb;text-align:center;vertical-align:middle;line-height:1.3;`;
const TABLE_STYLE = `border-collapse:collapse;${TS}`;

function b(t) { return `<strong>${t}</strong>`; }

/**
 * Gera uma tabela HTML compatível com Outlook.
 * @param {string}   title - Título mesclado no topo da tabela
 * @param {string[]} cols  - Nomes das colunas
 * @param {Array[]}  rows  - Linhas de dados
 */
function makeTable(title, cols, rows) {
  const n = cols.length;
  let html = `<table border="0" cellpadding="0" cellspacing="0" style="${TABLE_STYLE}">`;
  html += `<thead>`;
  html += `<tr><th colspan="${n}" align="center" valign="middle" style="${TH_STYLE}color:#1a1a2e;">${title}</th></tr>`;
  html += `<tr>${cols.map(c => `<th align="center" valign="middle" style="${TH_STYLE}">${c}</th>`).join('')}</tr>`;
  html += `</thead><tbody>`;
  rows.forEach(row => {
    html += `<tr>${row.map(c => `<td align="center" valign="middle" style="${TD_STYLE}">${c || '—'}</td>`).join('')}</tr>`;
  });
  html += `</tbody></table>`;
  return html;
}

/**
 * Extrai o array de valores de uma operação para uma linha de tabela.
 */
function getOpRow(key, f) {
  if (key === 'RESGATE|RENDA FIXA')   return [f.emissor||'', f.ativo||'', f.vencimento||'', f.pu||CFG.rrfDefaultPu, f.quantidade||'', f.valor||''];
  if (key === 'RESGATE|FUNDO')        return [f.fundo||'', f.cotizacao||'', f.liquidacao||'', f.valor||''];
  if (key === 'RESGATE|TESOURO')      return [f.titulo||'', f.vencimento||'', f.valor||''];
  if (key === 'APLICAÇÃO|RENDA FIXA') return [f.emissor||'', f.ativo||'', f.carencia||'', f.vencimento||'', f.taxa||'', f.pu||CFG.arfDefaultPu, f.valor||''];
  if (key === 'APLICAÇÃO|FUNDO')      return [f.fundo||'', f.cotizacao||'', f.liquidacao||'', f.valor||''];
  if (key === 'APLICAÇÃO|TESOURO')    return [f.titulo||'', f.rentabilidade||'', f.vencimento||'', f.pagamentoJuros||'', f.quantidade||'', f.valor||''];
  return null;
}

/**
 * Gera o bloco HTML de um grupo de operações do mesmo tipo+ativo.
 * Operações agrupáveis em tabela recebem uma linha por operação.
 * Compromissadas e Transferências geram parágrafos separados.
 */
function buildGroupBlock(key, ops) {
  const code = document.getElementById('clientCode').value.trim() || 'XXXXX';

  // Tipos que geram tabela com múltiplas linhas
  const tableMap = {
    'RESGATE|RENDA FIXA':   () => makeTable(CFG.rrfTitle,    CFG.rrfCols,    ops.map(o => getOpRow(key, o.fields))),
    'RESGATE|FUNDO':        () => makeTable(CFG.rfundoTitle, CFG.rfundoCols, ops.map(o => getOpRow(key, o.fields))),
    'RESGATE|TESOURO':      () => makeTable(CFG.rtesTitle,   CFG.rtesCols,  ops.map(o => getOpRow(key, o.fields))),
    'APLICAÇÃO|RENDA FIXA': () => makeTable(CFG.arfTitle,    CFG.arfCols,    ops.map(o => getOpRow(key, o.fields))),
    'APLICAÇÃO|FUNDO':      () => makeTable(CFG.afundoTitle, CFG.afundoCols, ops.map(o => getOpRow(key, o.fields))),
    'APLICAÇÃO|TESOURO':    () => makeTable(CFG.atesTitle,   CFG.atesCols,  ops.map(o => getOpRow(key, o.fields))),
  };
  if (tableMap[key]) return tableMap[key]();

  // LCA — emissores fixos + texto de valor total por operação
  if (key === 'APLICAÇÃO|LCA LIQUIDEZ DIÁRIA') {
    const taxa = ops[0].fields.taxa || CFG.alcaDefaultTaxa;
    const rows = CFG.lcaEmitters.map(e => [e[0], e[1], e[2], e[3], taxa, 'A MERCADO']);
    let html = makeTable(CFG.alcaTitle, CFG.alcaCols, rows);
    ops.forEach(op => {
      const textoPos = CFG.alcaTextoPos.replace('{valorTotal}', op.fields.valorTotal || '—');
      html += `<span style="${TS}line-height:1.5;display:block;">${textoPos}</span>`;
    });
    return html;
  }

  // Resgate Compromissada — parágrafo por operação
  if (key === 'RESGATE|COMPROMISSADA') {
    return ops.map((op, i) => {
      const f   = op.fields;
      const sep = i > 0 ? '<br>' : '';
      return `${sep}<span style="${TS}line-height:1.8;display:block;">`
        + `${b('Operação:')} ${CFG.rcompOperacao}<br>`
        + `${b('Conta XP:')} ${code}<br>`
        + `${b('Tipo:')} ${CFG.rcompTipo}<br>`
        + `${b('Vencimento da compromissada:')} ${f.vencimento || '—'}<br>`
        + `${b('Taxa:')} ${f.taxa || '—'}<br>`
        + `${b('IR:')} ${CFG.rcompIr}<br>`
        + `${b('IOF:')} ${CFG.rcompIof}<br>`
        + `${b('Valor líquido da operação Aproximado:')} ${f.valorLiquido || '—'}`
        + `</span>`;
    }).join('');
  }

  // Aplicação Compromissada — parágrafo por operação
  if (key === 'APLICAÇÃO|COMPROMISSADA') {
    return ops.map((op, i) => {
      const f   = op.fields;
      const sep = i > 0 ? '<br>' : '';
      return `${sep}<span style="${TS}line-height:1.8;display:block;">`
        + `${b('Operação:')} ${CFG.acompOperacao}<br>`
        + `${b('Conta XP:')} ${code}<br>`
        + `${b('Tipo:')} ${CFG.acompTipo}<br>`
        + `${b('Vencimento da compromissada:')} ${f.vencimento || '—'}<br>`
        + `${b('Taxa:')} ${f.taxa || '—'}<br>`
        + `${b('IR:')} ${CFG.acompIr}<br>`
        + `${b('Valor líquido da operação Aproximado:')} ${f.valorLiquido || '—'}`
        + `</span>`;
    }).join('');
  }

  // Transferência — parágrafo por operação
  if (key === 'TRANSFERÊNCIA|') {
    return ops.map((op, i) => {
      const f   = op.fields;
      const sep = i > 0 ? '<br>' : '';
      const txt = CFG.transfTexto
        .replace(/{valor}/g,  b('R$ '   + (f.valor   || '—')))
        .replace('{banco}',   b('Banco ' + (f.banco   || '—')))
        .replace('{agencia}', b(f.agencia || '—'))
        .replace('{conta}',   b(f.conta   || '—'));
      return `${sep}<span style="${TS}line-height:1.5;display:block;">${txt}</span>`;
    }).join('');
  }

  return '';
}

// =============================================
// GERAÇÃO DO E-MAIL
// =============================================

function generateEmail() {
  const name    = document.getElementById('clientName').value.trim()  || 'Cliente';
  const code    = document.getElementById('clientCode').value.trim()  || 'XXXXX';
  const email   = document.getElementById('clientEmail').value.trim();
  const advisor = document.getElementById('advisorName').value.trim() || 'Assessor';

  const greeting = getGreeting();
  const subject  = generateSubject();
  const opList   = generateOpList();

  const validOps = operations.filter(o => o.type && (o.type === 'TRANSFERÊNCIA' || o.assetType));

  // Agrupar preservando a ordem de primeira aparição de cada tipo+ativo
  const orderMap = [];
  const groups   = {};
  validOps.forEach(op => {
    const key = op.type === 'TRANSFERÊNCIA' ? 'TRANSFERÊNCIA|' : `${op.type}|${op.assetType}`;
    if (!groups[key]) { groups[key] = []; orderMap.push(key); }
    groups[key].push(op);
  });

  const blocks = orderMap.map(key => buildGroupBlock(key, groups[key])).filter(Boolean);

  const bodyHtml = [
    `<html><head><meta charset="UTF-8"></head>`,
    `<body style="${TS}color:#1a1a2e;background:#fff;padding:0;margin:0;">`,
    `<div style="${TS}max-width:680px;padding:16px;">`,
    `${b(greeting)}, ${b(name)}. Tudo bem?<br>`,
    `Solicito o ${b('"de acordo"')} para realizar ${opList} em sua conta ${b('XP')} ${b(code)}, conforme abaixo:<br>`,
    blocks.join('<br>'),
    blocks.length ? '<br>' : '',
    `${CFG.fechamento}<br><br>`,
    `${CFG.antesAssinatura}<br>${b(advisor)}`,
    `</div></body></html>`
  ].join('');

  generatedHTML    = bodyHtml;
  generatedSubject = subject;

  document.getElementById('prevTo').textContent      = email || '—';
  document.getElementById('prevSubject').textContent = subject;
  document.getElementById('previewCard').style.display = '';
  document.getElementById('previewFrame').srcdoc = bodyHtml;

  setTimeout(() => document.getElementById('previewCard').scrollIntoView({ behavior: 'smooth' }), 100);
}

// =============================================
// AÇÕES DE EXPORTAÇÃO E CÓPIA
// =============================================

function copySubject() {
  navigator.clipboard.writeText(generatedSubject).then(() => {
    const btn = document.getElementById('btnCopySubject');
    btn.classList.add('copied');
    btn.textContent = '✓ Copiado!';
    showToast('Assunto copiado!');
    setTimeout(() => { btn.classList.remove('copied'); btn.textContent = '📋 Copiar Assunto'; }, 2000);
  });
}

function copyContent() {
  navigator.clipboard.writeText(generatedHTML).then(() => {
    const btn = document.getElementById('btnCopyContent');
    btn.classList.add('copied');
    btn.textContent = '✓ Copiado!';
    showToast('HTML copiado!');
    setTimeout(() => { btn.classList.remove('copied'); btn.textContent = '📄 Copiar HTML'; }, 2000);
  });
}

function exportEml() {
  const email   = document.getElementById('clientEmail').value.trim();
  const subject = generatedSubject;
  const b64     = btoa(unescape(encodeURIComponent(generatedHTML)));

  const eml = [
    'MIME-Version: 1.0',
    'X-Unsent: 1',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    `To: ${email}`,
    `Subject: ${subject}`,
    '',
    b64
  ].join('\r\n');

  const blob = new Blob([eml], { type: 'message/rfc822' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${subject.replace(/[^a-zA-Z0-9 \-]/g, '')}.eml`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Arquivo .eml exportado!');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}
