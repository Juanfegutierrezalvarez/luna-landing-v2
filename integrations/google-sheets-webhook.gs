const SPREADSHEET_ID = "11xbuVKbFeLIRav0dMg7eHEUjEVLvTDQ-MDpoLudx1uA";
const SHEET_NAME = "Usuarios V4";

const TRACKED_EVENTS = {
  landingViewed: "landing_viewed",
  signalAnswered: "signal_answered",
  signalFlowCompleted: "signal_flow_completed",
  leadSubmitted: "lead_submitted",
  whatsappClicked: "whatsapp_private_group_clicked",
};

const HEADERS = [
  "fecha_entrada",
  "ultima_actualizacion",
  "usuario_id",
  "intento_id",
  "nombre",
  "email",
  "whatsapp",
  "dejo_contacto",
  "llego_a_whatsapp",
  "fecha_whatsapp",
  "senales_respondidas",
  "ritual_completo",
  "resultado_id",
  "resultado_fase",
  "resultado_nombre",
  "confianza",
  "senal_1",
  "senal_2",
  "senal_3",
  "senal_4",
  "senal_5",
  "senal_6",
  "senal_7",
  "url_origen",
];

function setup() {
  const spreadsheet = getSpreadsheet_();
  ensureSheet_(spreadsheet);
}

function doGet() {
  setup();
  return jsonResponse_({
    ok: true,
    message: "Webhook Luna Landing V2 listo. Guarda una fila por usuaria en Usuarios V4.",
  });
}

function doPost(event) {
  const lock = LockService.getDocumentLock();
  lock.waitLock(30000);

  try {
    const payload = parsePayload_(event);
    const eventName = payload.event_name || "";

    if (!Object.values(TRACKED_EVENTS).includes(eventName)) {
      return jsonResponse_({ ok: true, ignored: true });
    }

    const spreadsheet = getSpreadsheet_();
    const sheet = ensureSheet_(spreadsheet);
    upsertUserAttempt_(sheet, payload);

    return jsonResponse_({ ok: true });
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function parsePayload_(event) {
  const contents = event && event.postData && event.postData.contents ? event.postData.contents : "{}";
  try {
    return JSON.parse(contents);
  } catch (error) {
    return { event_name: "parse_error", raw_body: contents, parse_error: String(error) };
  }
}

function ensureSheet_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  const existing = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const sameHeaders = HEADERS.every((header, index) => existing[index] === header);

  if (!sameHeaders && sheet.getLastRow() <= 1) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADERS.length);
  }

  return sheet;
}

function upsertUserAttempt_(sheet, payload) {
  const intentoId = attemptId_(payload);
  if (!intentoId) return;

  const rowNumber = findRowByAttemptId_(sheet, intentoId);
  const existing = rowNumber ? rowToObject_(sheet.getRange(rowNumber, 1, 1, HEADERS.length).getValues()[0]) : {};
  const next = buildUserRow_(existing, payload, intentoId);
  const targetRow = rowNumber || sheet.getLastRow() + 1;

  sheet.getRange(targetRow, 1, 1, HEADERS.length).setValues([objectToRow_(next)]);
}

function buildUserRow_(existing, payload, intentoId) {
  const now = receivedAt_(payload);
  const usuarioId = payload.usuario_id || payload.user_id || existing.usuario_id || payload.visitor_id || payload.persona_key || payload.email || payload.whatsapp || payload.session_id || "";
  const answers = Array.isArray(payload.answers) ? payload.answers : [];
  const answersCount = answers.length || Number(existing.senales_respondidas || 0) || "";
  const hasContact = Boolean(payload.name || normalizeEmail_(payload.email) || normalizePhone_(payload.whatsapp) || existing.nombre || existing.email || existing.whatsapp);
  const clickedWhatsapp = payload.event_name === TRACKED_EVENTS.whatsappClicked || toBool_(payload.whatsapp_group_clicked) || toBool_(existing.llego_a_whatsapp);

  const next = {
    fecha_entrada: existing.fecha_entrada || now,
    ultima_actualizacion: now,
    usuario_id: usuarioId,
    intento_id: intentoId,
    nombre: payload.name || existing.nombre || "",
    email: normalizeEmail_(payload.email) || existing.email || "",
    whatsapp: normalizePhone_(payload.whatsapp) || existing.whatsapp || "",
    dejo_contacto: hasContact,
    llego_a_whatsapp: clickedWhatsapp,
    fecha_whatsapp: payload.whatsapp_group_clicked_at || existing.fecha_whatsapp || (payload.event_name === TRACKED_EVENTS.whatsappClicked ? now : ""),
    senales_respondidas: answersCount,
    ritual_completo: payload.event_name === TRACKED_EVENTS.signalFlowCompleted || toBool_(existing.ritual_completo) || Boolean(payload.result_id || existing.resultado_id),
    resultado_id: payload.result_id || existing.resultado_id || "",
    resultado_fase: payload.result_phase || existing.resultado_fase || "",
    resultado_nombre: payload.result_short_name || existing.resultado_nombre || "",
    confianza: payload.confidence_score || existing.confianza || "",
    senal_1: existing.senal_1 || "",
    senal_2: existing.senal_2 || "",
    senal_3: existing.senal_3 || "",
    senal_4: existing.senal_4 || "",
    senal_5: existing.senal_5 || "",
    senal_6: existing.senal_6 || "",
    senal_7: existing.senal_7 || "",
    url_origen: payload.source_url || existing.url_origen || "",
  };

  answers.forEach((answer, index) => {
    if (index >= 7) return;
    next[`senal_${index + 1}`] = formatAnswer_(answer);
  });

  return next;
}

function attemptId_(payload) {
  return payload.intento_id || payload.attempt_id || payload.session_id || payload.email || payload.whatsapp || "";
}

function findRowByAttemptId_(sheet, intentoId) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return null;

  const intentoColumn = columnNumber_("intento_id");
  const values = sheet.getRange(2, intentoColumn, lastRow - 1, 1).getValues().flat();
  const index = values.findIndex((value) => String(value) === String(intentoId));
  return index >= 0 ? index + 2 : null;
}

function formatAnswer_(answer) {
  const answerText = answer.label || "";
  const answerId = answer.optionId ? `[${answer.optionId}] ` : "";
  return `${answerId}${answerText}`.trim();
}

function rowToObject_(row) {
  return HEADERS.reduce((result, header, index) => {
    result[header] = row[index];
    return result;
  }, {});
}

function objectToRow_(data) {
  return HEADERS.map((header) => data[header] ?? "");
}

function columnNumber_(header) {
  return HEADERS.indexOf(header) + 1;
}

function receivedAt_(payload) {
  return payload.timestamp ? new Date(payload.timestamp) : new Date();
}

function normalizeEmail_(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizePhone_(phone) {
  return String(phone || "").trim();
}

function toBool_(value) {
  return value === true || String(value).toUpperCase() === "TRUE";
}

function jsonResponse_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
