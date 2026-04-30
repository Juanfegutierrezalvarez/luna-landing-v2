const SPREADSHEET_ID = "11xbuVKbFeLIRav0dMg7eHEUjEVLvTDQ-MDpoLudx1uA";

const SHEET_NAMES = {
  personas: "Personas V2",
  respuestas: "Respuestas V2",
};

const TRACKED_EVENTS = {
  signalAnswered: "signal_answered",
  signalFlowCompleted: "signal_flow_completed",
  leadSubmitted: "lead_submitted",
  whatsappClicked: "whatsapp_private_group_clicked",
};

const HEADERS = {
  "Personas V2": [
    "session_id",
    "first_seen_at",
    "last_seen_at",
    "contact_status",
    "name",
    "email",
    "whatsapp",
    "result_id",
    "result_phase",
    "result_short_name",
    "confidence_score",
    "score_gap",
    "answers_count",
    "last_signal_answered",
    "quiz_completed",
    "quiz_completed_at",
    "whatsapp_group_clicked",
    "whatsapp_group_clicked_at",
    "source_url",
  ],
  "Respuestas V2": [
    "received_at",
    "session_id",
    "contact_status",
    "name",
    "email",
    "whatsapp",
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
    message: "Webhook Luna Landing V2 listo. Guarda Personas V2 y Respuestas V2.",
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

    const sessionResult = upsertSession_(spreadsheet, payload);

    if (sessionResult && Array.isArray(payload.answers) && payload.answers.length) {
      syncAnswers_(spreadsheet, payload, sessionResult.sessionId);
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

function upsertSession_(spreadsheet, payload) {
  const email = normalizeEmail_(payload.email);
  const whatsapp = normalizePhone_(payload.whatsapp);
  const sessionId = payload.session_id || email || whatsapp;
  if (!sessionId || !hasSessionSignal_(payload)) return null;

  const sheet = spreadsheet.getSheetByName(SHEET_NAMES.personas);
  const headers = HEADERS[SHEET_NAMES.personas];
  const lastRow = sheet.getLastRow();
  const keys = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat() : [];
  const foundIndex = keys.findIndex((value) => value === sessionId);
  const targetRow = foundIndex >= 0 ? foundIndex + 2 : lastRow + 1;
  const existing = foundIndex >= 0
    ? rowObject_(headers, sheet.getRange(targetRow, 1, 1, headers.length).getValues()[0])
    : {};

  const eventName = payload.event_name || "";
  const hasContact = Boolean(payload.name || email || whatsapp || existing.email || existing.whatsapp);
  const answersCount = Array.isArray(payload.answers) ? payload.answers.length : Number(existing.answers_count || 0);
  const lastSignal = payload.signal_number || answersCount || existing.last_signal_answered || "";
  const quizCompleted = eventName === TRACKED_EVENTS.signalFlowCompleted || toBool_(existing.quiz_completed) || Boolean(payload.result_id || existing.result_id);
  const quizCompletedAt = existing.quiz_completed_at || (eventName === TRACKED_EVENTS.signalFlowCompleted ? receivedAt_(payload) : "");
  const clickedWhatsapp = eventName === TRACKED_EVENTS.whatsappClicked || toBool_(payload.whatsapp_group_clicked);
  const clickedAt = payload.whatsapp_group_clicked_at || (clickedWhatsapp ? payload.timestamp : "");

  const next = {
    session_id: sessionId,
    first_seen_at: existing.first_seen_at || receivedAt_(payload),
    last_seen_at: receivedAt_(payload),
    contact_status: hasContact ? "contact" : "anonymous",
    name: payload.name || existing.name || "",
    email: email || existing.email || "",
    whatsapp: whatsapp || existing.whatsapp || "",
    result_id: payload.result_id || existing.result_id || "",
    result_phase: payload.result_phase || existing.result_phase || "",
    result_short_name: payload.result_short_name || existing.result_short_name || "",
    confidence_score: payload.confidence_score || existing.confidence_score || "",
    score_gap: payload.score_gap ?? existing.score_gap ?? "",
    answers_count: Math.max(Number(existing.answers_count || 0), Number(answersCount || 0)),
    last_signal_answered: lastSignal,
    quiz_completed: quizCompleted,
    quiz_completed_at: quizCompletedAt,
    whatsapp_group_clicked: clickedWhatsapp || toBool_(existing.whatsapp_group_clicked),
    whatsapp_group_clicked_at: clickedAt || existing.whatsapp_group_clicked_at || "",
    source_url: payload.source_url || existing.source_url || "",
  };

  sheet.getRange(targetRow, 1, 1, headers.length).setValues([headers.map((header) => next[header] ?? "")]);

  return { sessionId };
}

function syncAnswers_(spreadsheet, payload, sessionId) {
  const answers = Array.isArray(payload.answers) ? payload.answers : [];
  if (!answers.length) return;

  const sheet = spreadsheet.getSheetByName(SHEET_NAMES.respuestas);
  const headers = HEADERS[SHEET_NAMES.respuestas];
  const lastRow = sheet.getLastRow();
  const existingRange = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, headers.length) : null;
  const existingRows = existingRange ? existingRange.getValues() : [];
  const existingByKey = {};

  existingRows.forEach((row, index) => {
    const existingSessionId = row[columnIndex_(headers, "session_id")];
    const existingQuestionId = row[columnIndex_(headers, "question_id")];
    if (existingSessionId && existingQuestionId) {
      existingByKey[`${existingSessionId}::${existingQuestionId}`] = {
        rowNumber: index + 2,
        row,
      };
    }
  });

  const email = normalizeEmail_(payload.email);
  const whatsapp = normalizePhone_(payload.whatsapp);
  const contactStatus = payload.name || email || whatsapp ? "contact" : "anonymous";
  const newRows = [];

  answers.forEach((answer, index) => {
    const questionId = answer.questionId || `signal_${String(index + 1).padStart(2, "0")}`;
    const key = `${sessionId}::${questionId}`;
    const existing = existingByKey[key];
    const row = existing ? existing.row : Array(headers.length).fill("");

    setRowValue_(row, headers, "received_at", row[columnIndex_(headers, "received_at")] || receivedAt_(payload));
    setRowValue_(row, headers, "session_id", sessionId);
    setRowValue_(row, headers, "contact_status", contactStatus === "contact" ? "contact" : row[columnIndex_(headers, "contact_status")] || "anonymous");
    setRowValue_(row, headers, "name", payload.name || row[columnIndex_(headers, "name")] || "");
    setRowValue_(row, headers, "email", email || row[columnIndex_(headers, "email")] || "");
    setRowValue_(row, headers, "whatsapp", whatsapp || row[columnIndex_(headers, "whatsapp")] || "");
    setRowValue_(row, headers, "result_id", payload.result_id || row[columnIndex_(headers, "result_id")] || "");
    setRowValue_(row, headers, "result_phase", payload.result_phase || row[columnIndex_(headers, "result_phase")] || "");
    setRowValue_(row, headers, "question_number", index + 1);
    setRowValue_(row, headers, "question_id", questionId);
    setRowValue_(row, headers, "question_text", answer.questionLabel || "");
    setRowValue_(row, headers, "answer_id", answer.optionId || "");
    setRowValue_(row, headers, "answer_text", answer.label || "");
    setRowValue_(row, headers, "primary_phase", answer.primary || "");
    setRowValue_(row, headers, "weights_json", stringify_(answer.weights));

    if (existing) {
      sheet.getRange(existing.rowNumber, 1, 1, headers.length).setValues([row]);
    } else {
      newRows.push(row);
    }
  });

  if (newRows.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, headers.length).setValues(newRows);
  }
}

function hasSessionSignal_(payload) {
  return Boolean(
    payload.session_id ||
    payload.name ||
    payload.email ||
    payload.whatsapp ||
    payload.result_id ||
    Array.isArray(payload.answers) ||
    payload.event_name === TRACKED_EVENTS.whatsappClicked
  );
}

function rowObject_(headers, row) {
  return headers.reduce((result, header, index) => {
    result[header] = row[index];
    return result;
  }, {});
}

function columnIndex_(headers, name) {
  return headers.indexOf(name);
}

function setRowValue_(row, headers, name, value) {
  row[columnIndex_(headers, name)] = value;
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
