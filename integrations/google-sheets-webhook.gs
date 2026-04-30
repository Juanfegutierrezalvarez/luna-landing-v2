const SPREADSHEET_ID = "11xbuVKbFeLIRav0dMg7eHEUjEVLvTDQ-MDpoLudx1uA";

const SHEET_NAMES = {
  personas: "Personas V2",
  respuestas: "Respuestas V2",
};

const TRACKED_EVENTS = {
  leadSubmitted: "lead_submitted",
  whatsappClicked: "whatsapp_private_group_clicked",
};

const HEADERS = {
  "Personas V2": [
    "persona_key",
    "first_seen_at",
    "last_seen_at",
    "name",
    "email",
    "whatsapp",
    "result_id",
    "result_phase",
    "result_short_name",
    "confidence_score",
    "score_gap",
    "whatsapp_group_clicked",
    "whatsapp_group_clicked_at",
    "source_url",
    "session_id",
  ],
  "Respuestas V2": [
    "received_at",
    "persona_key",
    "session_id",
    "name",
    "email",
    "result_id",
    "result_phase",
    "question_number",
    "question_id",
    "question_text",
    "answer_id",
    "answer_text",
    "primary_phase",
    "weights_json",
  ],
};

function setup() {
  const spreadsheet = getSpreadsheet_();
  ensureSheets_(spreadsheet);
}

function doGet() {
  setup();
  return jsonResponse_({
    ok: true,
    message: "Webhook Luna Landing V2 listo. Solo guarda Personas V2 y Respuestas V2.",
  });
}

function doPost(event) {
  const lock = LockService.getDocumentLock();
  lock.waitLock(30000);

  try {
    const payload = parsePayload_(event);
    const eventName = payload.event_name || "";

    if (![TRACKED_EVENTS.leadSubmitted, TRACKED_EVENTS.whatsappClicked].includes(eventName)) {
      return jsonResponse_({ ok: true, ignored: true });
    }

    const spreadsheet = getSpreadsheet_();
    ensureSheets_(spreadsheet);

    const personResult = upsertPerson_(spreadsheet, payload);

    if (
      personResult &&
      Array.isArray(payload.answers) &&
      payload.answers.length &&
      (eventName === TRACKED_EVENTS.leadSubmitted || personResult.created)
    ) {
      appendAnswers_(spreadsheet, payload, personResult.personaKey);
    }

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

function ensureSheets_(spreadsheet) {
  Object.values(SHEET_NAMES).forEach((name) => {
    const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
    const headers = HEADERS[name];
    const existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    const sameHeaders = headers.every((header, index) => existing[index] === header);

    if (!sameHeaders) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, headers.length);
    }
  });
}

function upsertPerson_(spreadsheet, payload) {
  const email = normalizeEmail_(payload.email);
  const whatsapp = normalizePhone_(payload.whatsapp);
  const sessionId = payload.session_id || "";
  const personaKey = email || whatsapp || sessionId;

  if (!personaKey || !hasPersonSignal_(payload)) return null;

  const sheet = spreadsheet.getSheetByName(SHEET_NAMES.personas);
  const headers = HEADERS[SHEET_NAMES.personas];
  const lastRow = sheet.getLastRow();
  const keys = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat() : [];
  const foundIndex = keys.findIndex((value) => value === personaKey);
  const targetRow = foundIndex >= 0 ? foundIndex + 2 : lastRow + 1;
  const existing = foundIndex >= 0
    ? rowObject_(headers, sheet.getRange(targetRow, 1, 1, headers.length).getValues()[0])
    : {};

  const clickedWhatsapp = payload.event_name === TRACKED_EVENTS.whatsappClicked || toBool_(payload.whatsapp_group_clicked);
  const clickedAt = payload.whatsapp_group_clicked_at || (clickedWhatsapp ? payload.timestamp : "");

  const next = {
    persona_key: personaKey,
    first_seen_at: existing.first_seen_at || receivedAt_(payload),
    last_seen_at: receivedAt_(payload),
    name: payload.name || existing.name || "",
    email: email || existing.email || "",
    whatsapp: whatsapp || existing.whatsapp || "",
    result_id: payload.result_id || existing.result_id || "",
    result_phase: payload.result_phase || existing.result_phase || "",
    result_short_name: payload.result_short_name || existing.result_short_name || "",
    confidence_score: payload.confidence_score || existing.confidence_score || "",
    score_gap: payload.score_gap ?? existing.score_gap ?? "",
    whatsapp_group_clicked: clickedWhatsapp || toBool_(existing.whatsapp_group_clicked),
    whatsapp_group_clicked_at: clickedAt || existing.whatsapp_group_clicked_at || "",
    source_url: payload.source_url || existing.source_url || "",
    session_id: sessionId || existing.session_id || "",
  };

  sheet.getRange(targetRow, 1, 1, headers.length).setValues([headers.map((header) => next[header] ?? "")]);

  return {
    personaKey,
    created: foundIndex < 0,
  };
}

function appendAnswers_(spreadsheet, payload, personaKey) {
  const answers = Array.isArray(payload.answers) ? payload.answers : [];
  if (!answers.length) return;

  const email = normalizeEmail_(payload.email);
  const rows = answers.map((answer, index) => [
    receivedAt_(payload),
    personaKey,
    payload.session_id || "",
    payload.name || "",
    email,
    payload.result_id || "",
    payload.result_phase || "",
    index + 1,
    answer.questionId || "",
    answer.questionLabel || "",
    answer.optionId || "",
    answer.label || "",
    answer.primary || "",
    stringify_(answer.weights),
  ]);

  const sheet = spreadsheet.getSheetByName(SHEET_NAMES.respuestas);
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function hasPersonSignal_(payload) {
  return Boolean(
    payload.name ||
    payload.email ||
    payload.whatsapp ||
    payload.result_id ||
    payload.event_name === TRACKED_EVENTS.whatsappClicked
  );
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

function normalizePhone_(phone) {
  return String(phone || "").trim();
}

function toBool_(value) {
  return value === true || String(value).toUpperCase() === "TRUE";
}

function stringify_(value) {
  return JSON.stringify(value || {});
}

function jsonResponse_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
