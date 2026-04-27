const SPREADSHEET_ID = "";

const SHEET_NAMES = {
  personas: "Personas",
  leads: "Leads",
  respuestas: "Respuestas",
  eventos: "Eventos",
};

const HEADERS = {
  Personas: [
    "persona_key",
    "first_seen_at",
    "last_seen_at",
    "name",
    "email",
    "whatsapp",
    "result_id",
    "result_phase",
    "result_short_name",
    "secondary_result_id",
    "confidence_score",
    "score_gap",
    "guide_downloaded",
    "whatsapp_group_clicked",
    "whatsapp_group_clicked_at",
    "whatsapp_click_source",
    "waitlist_joined",
    "interest_topic",
    "pilot_interest",
    "source_url",
    "session_id",
  ],
  Leads: [
    "received_at",
    "session_id",
    "name",
    "email",
    "whatsapp",
    "result_id",
    "result_phase",
    "result_short_name",
    "secondary_result_id",
    "confidence_score",
    "score_gap",
    "phase_scores_json",
    "guide_downloaded",
    "whatsapp_group_clicked",
    "whatsapp_group_clicked_at",
    "waitlist_joined",
    "source_url",
  ],
  Respuestas: [
    "received_at",
    "session_id",
    "name",
    "email",
    "question_id",
    "question_label",
    "answer_id",
    "answer_label",
    "primary_phase",
    "weights_json",
    "result_id",
  ],
  Eventos: [
    "received_at",
    "session_id",
    "event_name",
    "name",
    "email",
    "whatsapp",
    "result_id",
    "guide_downloaded",
    "whatsapp_group_clicked",
    "whatsapp_group_clicked_at",
    "waitlist_joined",
    "interest_topic",
    "pilot_interest",
    "source_url",
    "raw_json",
  ],
};

function setup() {
  const spreadsheet = getSpreadsheet_();
  ensureSheets_(spreadsheet);
}

function doGet() {
  setup();
  return jsonResponse_({ ok: true, message: "Luna landing webhook listo." });
}

function doPost(event) {
  const payload = parsePayload_(event);
  const spreadsheet = getSpreadsheet_();
  ensureSheets_(spreadsheet);

  appendEvent_(spreadsheet, payload);
  upsertPerson_(spreadsheet, payload);

  if (payload.event_name === "lead_submitted") {
    appendLead_(spreadsheet, payload);
    appendAnswers_(spreadsheet, payload);
  }

  return jsonResponse_({ ok: true });
}

function getSpreadsheet_() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  return SpreadsheetApp.getActiveSpreadsheet();
}

function parsePayload_(event) {
  const contents = event && event.postData && event.postData.contents ? event.postData.contents : "{}";
  try {
    return JSON.parse(contents);
  } catch (error) {
    return { event_name: "parse_error", raw_body: contents, parse_error: String(error) };
  }
}

function ensureSheets_(spreadsheet) {
  Object.values(SHEET_NAMES).forEach((name) => {
    const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
    const headers = HEADERS[name];
    if (!headers) return;

    const existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    const hasHeaders = existing.some((value) => value);
    if (!hasHeaders) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, headers.length);
    }
  });
}

function appendLead_(spreadsheet, payload) {
  spreadsheet.getSheetByName(SHEET_NAMES.leads).appendRow([
    receivedAt_(payload),
    payload.session_id || "",
    payload.name || "",
    normalizeEmail_(payload.email),
    payload.whatsapp || "",
    payload.result_id || "",
    payload.result_phase || "",
    payload.result_short_name || "",
    payload.secondary_result_id || "",
    payload.confidence_score || "",
    payload.score_gap ?? "",
    stringify_(payload.phase_scores),
    Boolean(payload.guide_downloaded),
    Boolean(payload.whatsapp_group_clicked),
    payload.whatsapp_group_clicked_at || "",
    Boolean(payload.waitlist_joined),
    payload.source_url || "",
  ]);
}

function appendAnswers_(spreadsheet, payload) {
  const answers = Array.isArray(payload.answers) ? payload.answers : [];
  if (!answers.length) return;

  const rows = answers.map((answer) => [
    receivedAt_(payload),
    payload.session_id || "",
    payload.name || "",
    normalizeEmail_(payload.email),
    answer.questionId || "",
    answer.questionLabel || "",
    answer.optionId || "",
    answer.label || "",
    answer.primary || "",
    stringify_(answer.weights),
    payload.result_id || "",
  ]);

  const sheet = spreadsheet.getSheetByName(SHEET_NAMES.respuestas);
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function appendEvent_(spreadsheet, payload) {
  spreadsheet.getSheetByName(SHEET_NAMES.eventos).appendRow([
    receivedAt_(payload),
    payload.session_id || "",
    payload.event_name || "",
    payload.name || "",
    normalizeEmail_(payload.email),
    payload.whatsapp || "",
    payload.result_id || "",
    Boolean(payload.guide_downloaded),
    Boolean(payload.whatsapp_group_clicked),
    payload.whatsapp_group_clicked_at || "",
    Boolean(payload.waitlist_joined),
    payload.interest_topic || "",
    payload.pilot_interest || "",
    payload.source_url || "",
    stringify_(payload),
  ]);
}

function upsertPerson_(spreadsheet, payload) {
  const email = normalizeEmail_(payload.email);
  const sessionId = payload.session_id || "";
  const key = email || sessionId;
  const hasPersonData = Boolean(email || payload.name || payload.whatsapp);
  if (!key || !hasPersonData) return;

  const sheet = spreadsheet.getSheetByName(SHEET_NAMES.personas);
  const headers = HEADERS.Personas;
  const keyColumn = 1;
  const lastRow = sheet.getLastRow();
  const keys = lastRow > 1 ? sheet.getRange(2, keyColumn, lastRow - 1, 1).getValues().flat() : [];
  const foundIndex = keys.findIndex((value) => value === key);
  const targetRow = foundIndex >= 0 ? foundIndex + 2 : lastRow + 1;
  const existing = foundIndex >= 0 ? rowObject_(headers, sheet.getRange(targetRow, 1, 1, headers.length).getValues()[0]) : {};

  const next = {
    persona_key: key,
    first_seen_at: existing.first_seen_at || receivedAt_(payload),
    last_seen_at: receivedAt_(payload),
    name: payload.name || existing.name || "",
    email: email || existing.email || "",
    whatsapp: payload.whatsapp || existing.whatsapp || "",
    result_id: payload.result_id || existing.result_id || "",
    result_phase: payload.result_phase || existing.result_phase || "",
    result_short_name: payload.result_short_name || existing.result_short_name || "",
    secondary_result_id: payload.secondary_result_id || existing.secondary_result_id || "",
    confidence_score: payload.confidence_score || existing.confidence_score || "",
    score_gap: payload.score_gap ?? existing.score_gap ?? "",
    guide_downloaded: Boolean(payload.guide_downloaded || existing.guide_downloaded),
    whatsapp_group_clicked: Boolean(payload.whatsapp_group_clicked || existing.whatsapp_group_clicked),
    whatsapp_group_clicked_at: payload.whatsapp_group_clicked_at || existing.whatsapp_group_clicked_at || "",
    whatsapp_click_source: payload.source || payload.pilot_path || existing.whatsapp_click_source || "",
    waitlist_joined: Boolean(payload.waitlist_joined || existing.waitlist_joined),
    interest_topic: payload.interest_topic || existing.interest_topic || "",
    pilot_interest: payload.pilot_interest || existing.pilot_interest || "",
    source_url: payload.source_url || existing.source_url || "",
    session_id: sessionId || existing.session_id || "",
  };

  sheet.getRange(targetRow, 1, 1, headers.length).setValues([headers.map((header) => next[header] ?? "")]);
}

function rowObject_(headers, row) {
  return headers.reduce((result, header, index) => {
    result[header] = row[index];
    return result;
  }, {});
}

function receivedAt_(payload) {
  return payload.timestamp ? new Date(payload.timestamp) : new Date();
}

function normalizeEmail_(email) {
  return String(email || "").trim().toLowerCase();
}

function stringify_(value) {
  return JSON.stringify(value || {});
}

function jsonResponse_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
