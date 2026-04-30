const SPREADSHEET_ID = "11xbuVKbFeLIRav0dMg7eHEUjEVLvTDQ-MDpoLudx1uA";

const SHEET_NAMES = {
  sesiones: "Sesiones V3",
  respuestas: "Respuestas V3",
  contactos: "Contactos V3",
};

const TRACKED_EVENTS = {
  signalAnswered: "signal_answered",
  signalFlowCompleted: "signal_flow_completed",
  leadSubmitted: "lead_submitted",
  whatsappClicked: "whatsapp_private_group_clicked",
};

const HEADERS = {
  "Sesiones V3": [
    "received_at",
    "session_id",
    "checkpoint",
    "answers_count",
    "last_signal_answered",
    "quiz_completed",
    "contact_status",
    "name",
    "email",
    "whatsapp",
    "result_id",
    "result_phase",
    "result_short_name",
    "confidence_score",
    "score_gap",
    "whatsapp_group_clicked",
    "source_url",
  ],
  "Respuestas V3": [
    "received_at",
    "session_id",
    "question_number",
    "question_id",
    "question_text",
    "answer_id",
    "answer_text",
    "primary_phase",
    "weights_json",
    "source_url",
  ],
  "Contactos V3": [
    "received_at",
    "session_id",
    "contact_event",
    "name",
    "email",
    "whatsapp",
    "result_id",
    "result_phase",
    "result_short_name",
    "confidence_score",
    "score_gap",
    "whatsapp_group_clicked_at",
    "source_url",
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
    message: "Webhook Luna Landing V2 listo. Guarda Sesiones V3, Respuestas V3 y Contactos V3.",
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
    ensureSheets_(spreadsheet);

    appendSessionCheckpoint_(spreadsheet, payload);

    if (eventName === TRACKED_EVENTS.signalAnswered) {
      appendCurrentAnswer_(spreadsheet, payload);
    }

    if (eventName === TRACKED_EVENTS.signalFlowCompleted) {
      return jsonResponse_({ ok: true });
    }

    if (eventName === TRACKED_EVENTS.leadSubmitted) {
      appendContact_(spreadsheet, payload, "lead_submitted");
    }

    if (eventName === TRACKED_EVENTS.whatsappClicked) {
      appendContact_(spreadsheet, payload, "whatsapp_clicked");
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

    if (!sameHeaders && sheet.getLastRow() <= 1) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, headers.length);
    }
  });
}

function appendSessionCheckpoint_(spreadsheet, payload) {
  const headers = HEADERS[SHEET_NAMES.sesiones];
  const sheet = spreadsheet.getSheetByName(SHEET_NAMES.sesiones);
  const answersCount = Array.isArray(payload.answers) ? payload.answers.length : "";
  const hasContact = Boolean(payload.name || normalizeEmail_(payload.email) || normalizePhone_(payload.whatsapp));
  const checkpoint = checkpointName_(payload);

  const row = objectToRow_(headers, {
    received_at: receivedAt_(payload),
    session_id: payload.session_id || "",
    checkpoint,
    answers_count: answersCount,
    last_signal_answered: payload.signal_number || answersCount || "",
    quiz_completed: payload.event_name === TRACKED_EVENTS.signalFlowCompleted,
    contact_status: hasContact ? "contact" : "anonymous",
    name: payload.name || "",
    email: normalizeEmail_(payload.email),
    whatsapp: normalizePhone_(payload.whatsapp),
    result_id: payload.result_id || "",
    result_phase: payload.result_phase || "",
    result_short_name: payload.result_short_name || "",
    confidence_score: payload.confidence_score || "",
    score_gap: payload.score_gap ?? "",
    whatsapp_group_clicked: payload.event_name === TRACKED_EVENTS.whatsappClicked || toBool_(payload.whatsapp_group_clicked),
    source_url: payload.source_url || "",
  });

  sheet.appendRow(row);
}

function appendCurrentAnswer_(spreadsheet, payload) {
  const answers = Array.isArray(payload.answers) ? payload.answers : [];
  const signalNumber = Number(payload.signal_number || answers.length);
  const answer = answers[signalNumber - 1];
  if (!answer || hasResponse_(spreadsheet, payload.session_id, answer.questionId)) return;

  const headers = HEADERS[SHEET_NAMES.respuestas];
  const sheet = spreadsheet.getSheetByName(SHEET_NAMES.respuestas);
  const row = objectToRow_(headers, {
    received_at: receivedAt_(payload),
    session_id: payload.session_id || "",
    question_number: signalNumber,
    question_id: answer.questionId || "",
    question_text: answer.questionLabel || "",
    answer_id: answer.optionId || "",
    answer_text: answer.label || "",
    primary_phase: answer.primary || "",
    weights_json: stringify_(answer.weights),
    source_url: payload.source_url || "",
  });

  sheet.appendRow(row);
}

function appendContact_(spreadsheet, payload, contactEvent) {
  const headers = HEADERS[SHEET_NAMES.contactos];
  const sheet = spreadsheet.getSheetByName(SHEET_NAMES.contactos);
  const row = objectToRow_(headers, {
    received_at: receivedAt_(payload),
    session_id: payload.session_id || "",
    contact_event: contactEvent,
    name: payload.name || "",
    email: normalizeEmail_(payload.email),
    whatsapp: normalizePhone_(payload.whatsapp),
    result_id: payload.result_id || "",
    result_phase: payload.result_phase || "",
    result_short_name: payload.result_short_name || "",
    confidence_score: payload.confidence_score || "",
    score_gap: payload.score_gap ?? "",
    whatsapp_group_clicked_at: payload.whatsapp_group_clicked_at || "",
    source_url: payload.source_url || "",
  });

  sheet.appendRow(row);
}

function hasResponse_(spreadsheet, sessionId, questionId) {
  if (!sessionId || !questionId) return false;

  const sheet = spreadsheet.getSheetByName(SHEET_NAMES.respuestas);
  const headers = HEADERS[SHEET_NAMES.respuestas];
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;

  const rows = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  const sessionIndex = columnIndex_(headers, "session_id");
  const questionIndex = columnIndex_(headers, "question_id");
  return rows.some((row) => row[sessionIndex] === sessionId && row[questionIndex] === questionId);
}

function checkpointName_(payload) {
  if (payload.event_name === TRACKED_EVENTS.signalAnswered) return "signal_answered";
  if (payload.event_name === TRACKED_EVENTS.signalFlowCompleted) return "quiz_completed";
  if (payload.event_name === TRACKED_EVENTS.leadSubmitted) return "lead_submitted";
  if (payload.event_name === TRACKED_EVENTS.whatsappClicked) return "whatsapp_clicked";
  return payload.event_name || "";
}

function objectToRow_(headers, data) {
  return headers.map((header) => data[header] ?? "");
}

function columnIndex_(headers, name) {
  return headers.indexOf(name);
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
