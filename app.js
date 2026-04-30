const WEBHOOK_URL = window.LUNA_WEBHOOK_URL || "";
const WHATSAPP_PRIVATE_GROUP_URL = window.WHATSAPP_PRIVATE_GROUP_URL || "";
const TRANSITION_MS = 3000;
const MICRO_FEEDBACK_MS = 1700;

const eventNames = {
  landingViewed: "landing_viewed",
  landingCtaClicked: "landing_cta_clicked",
  introViewed: "experience_intro_viewed",
  ritualStarted: "ritual_started",
  transitionViewed: "ritual_transition_viewed",
  signalViewed: "signal_viewed",
  signalAnswered: "signal_answered",
  signalCompleted: "signal_completed",
  microFeedbackViewed: "micro_feedback_viewed",
  microFeedbackCompleted: "micro_feedback_completed",
  progressMilestoneViewed: "progress_milestone_viewed",
  progressMilestoneCompleted: "progress_milestone_completed",
  signalFlowCompleted: "signal_flow_completed",
  leadCaptureViewed: "lead_capture_viewed",
  leadSubmitted: "lead_submitted",
  revealTransitionViewed: "reveal_transition_viewed",
  resultRevealed: "result_revealed",
  cardViewed: "shareable_card_viewed",
  cardSaved: "shareable_card_saved",
  cardSaveError: "shareable_card_save_error",
  cardShared: "shareable_card_shared",
  guideViewed: "guide_screen_viewed",
  guideDownloadClicked: "guide_download_clicked",
  guideDownloaded: "guide_downloaded",
  guideDownloadError: "guide_download_error",
  waitlistViewed: "course_waitlist_viewed",
  waitlistCtaClicked: "course_waitlist_cta_clicked",
  waitlistJoined: "course_waitlist_joined",
  interestSelected: "interest_topic_selected",
  pilotSelected: "pilot_interest_selected",
  privateGroupClicked: "whatsapp_private_group_clicked",
  closingViewed: "closing_viewed",
  completed: "experience_completed",
};

const sheetEventNames = new Set([
  eventNames.leadSubmitted,
  eventNames.privateGroupClicked,
]);

const quizQuestions = [
  {
    id: "signal_01",
    text: "Cuando nadie te está mirando, ¿qué parte de ti se siente más presente estos días?",
    options: [
      { id: "a", label: "Un deseo chiquito que todavía no le he contado a nadie, pero vuelve cuando estoy en silencio.", weights: { new_moon: 2, waxing_crescent: 1 } },
      { id: "b", label: "Una inquietud en el cuerpo que me dice: ya no puedo seguir esperando a sentirme lista.", weights: { first_quarter: 2, waxing_crescent: 1 } },
      { id: "c", label: "Una verdad que aparece en momentos random y me deja sin tantas excusas.", weights: { full_moon: 2, waning_gibbous: 1 } },
      { id: "d", label: "Un cansancio profundo, como si necesitara cerrar una puerta antes de intentar abrir otra.", weights: { waning_crescent: 2, last_quarter: 1 } },
    ],
  },
  {
    id: "signal_02",
    text: "¿Qué situación te está ocupando más espacio mental últimamente?",
    options: [
      { id: "a", label: "Algo que ya empecé, pero sigo ajustando porque una parte de mí teme mostrarlo imperfecto.", weights: { waxing_gibbous: 2, first_quarter: 1 } },
      { id: "b", label: "Una carga que sigo sosteniendo para no decepcionar, aunque por dentro ya me está drenando.", weights: { last_quarter: 2, waning_crescent: 1 } },
      { id: "c", label: "Una posibilidad que me emociona, pero que todavía trato como si fuera demasiado frágil.", weights: { waxing_crescent: 2, new_moon: 1 } },
      { id: "d", label: "Algo que pasó y sigo repasando en mi cabeza, intentando entender qué me quiso mostrar.", weights: { waning_gibbous: 2, full_moon: 1 } },
    ],
  },
  {
    id: "signal_03",
    text: "Cuando el día se pone pesado, ¿cuál es tu movimiento más automático?",
    options: [
      { id: "a", label: "Me apago un poco. Necesito menos ruido, menos mensajes, menos tener que responderle a todo.", weights: { waning_crescent: 2, last_quarter: 1 } },
      { id: "b", label: "Intento resolver rápido, tomar control o hacer algo para no quedarme sintiendo tanto.", weights: { first_quarter: 2, waxing_gibbous: 1 } },
      { id: "c", label: "Me pongo más honesta de golpe: veo lo que venía evitando y ya no me sale hacerme la loca.", weights: { full_moon: 2, waning_gibbous: 1 } },
      { id: "d", label: "Me voy a imaginar una vida distinta, pero todavía me cuesta decir en voz alta qué quiero.", weights: { new_moon: 2, waxing_crescent: 1 } },
    ],
  },
  {
    id: "signal_04",
    text: "Si fueras brutalmente honesta contigo, ¿qué admitirías hoy?",
    options: [
      { id: "a", label: "Que ya sé algo importante, aunque todavía no quiera actuar como si lo supiera.", weights: { full_moon: 2, waning_gibbous: 1 } },
      { id: "b", label: "Que estoy cargando una expectativa, una relación o una responsabilidad más por culpa que por verdad.", weights: { last_quarter: 2, waning_crescent: 1 } },
      { id: "c", label: "Que lo que estoy construyendo necesita simplificarse; no más presión, sino más verdad.", weights: { waxing_gibbous: 2, first_quarter: 1 } },
      { id: "d", label: "Que algo en mí quiere crecer, pero necesita que yo deje de abandonarlo cuando dudo.", weights: { waxing_crescent: 2, new_moon: 1 } },
    ],
  },
  {
    id: "signal_05",
    text: "¿Qué te cuesta pedir o darte permiso de pedir?",
    options: [
      { id: "a", label: "Tiempo para entenderme sin tener que explicarlo bonito ni decidir ya.", weights: { new_moon: 2, waning_crescent: 1 } },
      { id: "b", label: "Apoyo para cuidar algo que me importa, aunque todavía esté en versión pequeña.", weights: { waxing_crescent: 2, waxing_gibbous: 1 } },
      { id: "c", label: "Espacio para tomar una decisión sin pedir permiso ni convencer a todo el mundo.", weights: { first_quarter: 2, full_moon: 1 } },
      { id: "d", label: "Tiempo para procesar lo que me dolió, en vez de brincar rápido a estar bien.", weights: { waning_gibbous: 2, waning_crescent: 1 } },
    ],
  },
  {
    id: "signal_06",
    text: "Si esta semana hicieras un solo movimiento honesto, ¿cuál sería?",
    options: [
      { id: "a", label: "Mandar el mensaje, decir la verdad o tomar esa decisión que llevo rodeando.", weights: { first_quarter: 2, full_moon: 1 } },
      { id: "b", label: "Terminar de ordenar algo que ya empecé para que pueda sostenerse con más calma.", weights: { waxing_gibbous: 2, waxing_crescent: 1 } },
      { id: "c", label: "Poner un límite concreto: dejar de responder, dejar de resolver o dejar de cargar de más.", weights: { last_quarter: 2, waning_gibbous: 1 } },
      { id: "d", label: "Descansar sin compensar después, sin sentir que tengo que ganarme la pausa.", weights: { waning_crescent: 2, last_quarter: 1 } },
    ],
  },
  {
    id: "signal_07",
    text: "¿Qué frase te daría alivio escuchar de verdad ahora mismo?",
    options: [
      { id: "a", label: "No tienes que explicar lo que apenas está naciendo. Primero escúchalo tú.", weights: { new_moon: 2, waxing_crescent: 1 } },
      { id: "b", label: "Puedes mirar la verdad sin resolverla toda hoy. Ver ya es un movimiento.", weights: { waning_gibbous: 2, full_moon: 1 } },
      { id: "c", label: "Lo suficientemente honesto ya puede salir. No tiene que estar perfecto para ser real.", weights: { waxing_gibbous: 2, first_quarter: 1 } },
      { id: "d", label: "Puedes soltar sin demostrar que aguantaste suficiente. Tu cansancio también cuenta.", weights: { last_quarter: 2, waning_crescent: 1 } },
    ],
  },
];

const phaseIds = [
  "new_moon",
  "waxing_crescent",
  "first_quarter",
  "waxing_gibbous",
  "full_moon",
  "waning_gibbous",
  "last_quarter",
  "waning_crescent",
];

const fallbackOrder = [
  "waning_gibbous",
  "waxing_crescent",
  "new_moon",
  "waning_crescent",
  "full_moon",
  "first_quarter",
  "waxing_gibbous",
  "last_quarter",
];

const microFeedbackByStage = {
  opening: [
    "La primera puerta ya se abrió.",
    "Eso también es una señal.",
    "Algo en ti empieza a hablar.",
    "Tu luna empieza a tomar forma.",
  ],
  depth: [
    "Hay una fase tomando fuerza.",
    "Sigue. La lectura se está afinando.",
    "Esa respuesta tiene peso.",
    "La luna está reuniendo tus señales.",
  ],
  reveal: [
    "Ya casi se revela.",
    "Algo acaba de iluminarse.",
    "Tu lectura está cerca.",
    "La última señal está abriendo el camino.",
  ],
};

const milestones = {
  3: {
    number: 1,
    title: "Ya hay un patrón tomando forma.",
    body: "Sigue. Tu luna está juntando las partes que sí hablan de ti.",
  },
};

const lunarResults = {
  new_moon: {
    phase: "Luna Nueva",
    name: "La semilla que todavía no se atreve a decir su nombre",
    mirror: "Hay algo en ti que quiere empezar, pero todavía no se siente seguro de ocupar espacio.",
    share: "Estoy en una luna de comienzos silenciosos.",
    secondLine: "No todo lo que nace tiene que explicarse todavía.",
    question: "¿Qué quiere empezar en mí, aunque todavía no sepa cómo explicarlo?",
    practice: "Durante 5 minutos, escribe: “Algo en mí quiere...”. No completes desde lo correcto. Completa desde lo que aparezca. Después elige una sola palabra y guárdala como semilla del ciclo.",
  },
  waxing_crescent: {
    phase: "Luna Creciente",
    name: "Lo que necesita que no lo abandones tan rápido",
    mirror: "Hay algo en ti que sí quiere crecer, pero necesita que dejes de soltarlo cada vez que dudas.",
    share: "Estoy en una luna de crecimiento suave.",
    secondLine: "Lo pequeño también merece que me quede cerca.",
    question: "¿Qué parte de mí necesita que no la abandone esta vez?",
    practice: "Elige una acción de 5 minutos que alimente eso que quiere crecer. Debe ser tan pequeña que no puedas usar la excusa de “no tengo tiempo”.",
  },
  first_quarter: {
    phase: "Cuarto Creciente",
    name: "El umbral donde ya no alcanza con pensarlo",
    mirror: "Hay una parte de ti que sigue esperando claridad, pero otra ya sabe que necesita moverse.",
    share: "Estoy en una luna de decisión valiente.",
    secondLine: "No necesito certeza total para dar un paso honesto.",
    question: "¿Cuál es el movimiento más pequeño que ya sé que necesito hacer?",
    practice: "Elige una frase umbral para no volver al automático: “Déjame pensarlo y te confirmo”, “Hoy no me da”, “Por ahora no puedo comprometerme con eso”.",
  },
  waxing_gibbous: {
    phase: "Luna Gibosa Creciente",
    name: "Lo que ya toma forma, pero necesita dejar de exigirse perfecto",
    mirror: "Algo en ti ya está tomando forma, pero corres el riesgo de corregirlo tanto que nunca lo dejas vivir.",
    share: "Estoy en una luna de ajuste y preparación.",
    secondLine: "Algo en mí está tomando forma con más cuidado y más verdad.",
    question: "¿Qué necesita ajuste real y qué estoy usando para seguir postergando?",
    practice: "Escribe tres columnas: lo que sí necesita ajuste, lo que estoy complicando por miedo y el siguiente paso suficientemente bueno.",
  },
  full_moon: {
    phase: "Luna Llena",
    name: "La verdad que ya encendió la luz",
    mirror: "Hay algo que ya sabes, pero seguirlo negando te está costando demasiada paz.",
    share: "Estoy en una luna de verdad iluminada.",
    secondLine: "No para correr. Para mirar con claridad.",
    question: "¿Qué ya sé, aunque todavía me cueste aceptarlo?",
    practice: "Completa estas frases: “Lo que ya no puedo negar es...”, “Lo que me cuesta mirar es...”, “El primer acto de honestidad conmigo sería...”.",
  },
  waning_gibbous: {
    phase: "Luna Gibosa Menguante",
    name: "Lo que necesitas integrar antes de seguir",
    mirror: "Has vivido algo que todavía no termina de acomodarse dentro de ti.",
    share: "Estoy en una luna de integración profunda.",
    secondLine: "Hay cosas que no se superan rápido. Se entienden con amor.",
    question: "¿Qué me dejó esto que todavía no he terminado de entender?",
    practice: "Escribe: lo que este ciclo me mostró, lo que me dolió admitir, lo que hice distinto, lo que ya no quiero repetir y lo que necesito agradecerme.",
  },
  last_quarter: {
    phase: "Cuarto Menguante",
    name: "Lo que ya no puedes seguir cargando igual",
    mirror: "Hay una carga que sigues sosteniendo más por culpa que por verdad.",
    share: "Estoy en una luna de soltar lo que ya pesa.",
    secondLine: "No todo lo que puedo sostener me toca cargarlo igual.",
    question: "¿Qué estoy sosteniendo más por culpa que por verdad?",
    practice: "Haz dos columnas: lo que sí me toca y lo que he estado cargando de más. Elige una sola cosa para bajar 10%.",
  },
  waning_crescent: {
    phase: "Luna Menguante",
    name: "El cierre que te devuelve energía",
    mirror: "Tu alma no está pidiendo empezar otra cosa; está pidiendo terminar de descansar de lo que ya vivió.",
    share: "Estoy en una luna de cierre, descanso y regreso a mí.",
    secondLine: "No necesito renacer antes de descansar.",
    question: "¿Qué necesita terminar o descansar para que mi energía vuelva a mí?",
    practice: "Antes de dormir, escribe: “Hoy dejo descansar...”. Completa con tres cosas. Después exhala largo tres veces.",
  },
};

const resultEnhancements = {
  new_moon: {
    shortName: "Comienzos silenciosos",
    reading: [
      {
        title: "Lo que quiere nacer",
        body: "Esta luna aparece cuando algo dentro de ti empieza a moverse antes de tener palabras. Puede sentirse pequeño, tímido o incluso confuso, pero no por eso es menos real.",
      },
      {
        title: "Lo que no necesita presión",
        body: "No estás atrasada por no tener claridad completa. Estás en una fase donde la intuición llega en fragmentos: una sensación, una incomodidad, una imagen, una frase que vuelve.",
      },
      {
        title: "Lo que puedes cuidar",
        body: "Tu tarea no es explicar la semilla, sino protegerla del ruido. Mientras menos tengas que justificarla, más fácil será escuchar qué quiere convertirse en vida.",
      },
    ],
    shows: [
      "un deseo que todavía no se deja explicar del todo",
      "la necesidad de silencio antes de tomar decisiones",
      "la presión de tener claridad antes de tiempo",
      "una semilla interna que pide cuidado, no exposición",
    ],
    trapTitle: "Forzarte a nombrarlo todo demasiado pronto",
    trap: "La trampa es creer que, si todavía no puedes explicarlo, entonces no existe. Esta fase te recuerda que muchas cosas verdaderas empiezan como una intuición mínima.",
    closing: "No tienes que actuar hoy. Tal vez solo necesitas dejar de negar que algo nuevo está tocando la puerta.",
  },
  waxing_crescent: {
    shortName: "Crecimiento suave",
    reading: [
      {
        title: "Lo pequeño ya cuenta",
        body: "Esta luna aparece cuando algo en ti sí quiere crecer, aunque todavía no tenga fuerza para sostenerlo todo. No estás en cero: estás en el tramo donde lo pequeño necesita presencia.",
      },
      {
        title: "La duda no cancela el deseo",
        body: "Puede que una parte de ti se emocione y otra quiera abandonar apenas aparece el miedo. Eso no significa que no quieras; significa que necesitas una forma más amable de quedarte cerca.",
      },
      {
        title: "Volver a elegirlo",
        body: "Esta fase te invita a cuidar lo que empieza sin exigirle resultados inmediatos. Una microacción honesta puede alimentar más que una promesa enorme.",
      },
    ],
    shows: [
      "algo que crece cuando lo miras con ternura",
      "tu tendencia a soltarlo cuando no hay garantía",
      "un deseo que necesita constancia pequeña",
      "la posibilidad de empezar sin hacerlo perfecto",
    ],
    trapTitle: "Pedirle a lo pequeño que ya sea grande",
    trap: "La trampa es medir este momento con estándares de algo consolidado. Si lo abandonas cada vez que tiembla, nunca llega a echar raíz.",
    closing: "Quédate cerca de lo que está creciendo. No porque ya sea seguro, sino porque algo en ti sabe que merece una oportunidad real.",
  },
  first_quarter: {
    shortName: "Decisión valiente",
    reading: [
      {
        title: "El umbral",
        body: "Esta luna aparece cuando ya no alcanza con pensar, analizar o esperar una señal más. Hay una parte de ti que sabe que el movimiento también trae claridad.",
      },
      {
        title: "La valentía posible",
        body: "No se trata de hacer un salto gigante. Se trata de elegir un paso honesto que rompa el automático y te devuelva la sensación de dirección.",
      },
      {
        title: "La decisión como práctica",
        body: "Tu luna no te está pidiendo certeza total. Te está pidiendo coherencia suficiente para dejar de aplazar lo que ya sabes que necesita moverse.",
      },
    ],
    shows: [
      "una decisión que estás rodeando hace tiempo",
      "la espera de una señal perfecta",
      "la diferencia entre prudencia y postergación",
      "un paso pequeño que puede cambiar el tono de todo",
    ],
    trapTitle: "Confundir claridad con garantía",
    trap: "La trampa es esperar sentirte completamente segura antes de actuar. A veces la seguridad no llega antes del movimiento: se construye mientras cruzas el umbral.",
    closing: "No necesitas resolver toda tu vida hoy. Necesitas un paso honesto que le diga a tu cuerpo: ya estoy aquí.",
  },
  waxing_gibbous: {
    shortName: "Ajuste y preparación",
    reading: [
      {
        title: "Algo ya tomó forma",
        body: "Esta luna aparece cuando lo que empezaste ya tiene cuerpo, pero todavía pide pulso, ajuste y honestidad. No estás inventando desde cero: estás refinando algo que importa.",
      },
      {
        title: "Ajustar sin castigarte",
        body: "Puede que veas todo lo que falta y olvides mirar lo que ya existe. Esta fase te pide mejorar sin convertir el proceso en una prueba de valor personal.",
      },
      {
        title: "Preparar para sostener",
        body: "No todo ajuste es perfeccionismo. Algunos ajustes son cuidado. La pregunta es si estás acercando la forma a la verdad o usando la corrección para no avanzar.",
      },
    ],
    shows: [
      "algo que ya está más cerca de existir",
      "la diferencia entre cuidado y autoexigencia",
      "los detalles que sí necesitan atención",
      "las vueltas que estás usando para aplazar",
    ],
    trapTitle: "Perfeccionar para no exponerte",
    trap: "La trampa es corregir tanto que nunca permites que algo viva. Esta luna te recuerda que lo suficientemente verdadero suele ser más fértil que lo impecable.",
    closing: "Ajusta lo que necesite ajuste. Pero no castigues lo que ya tuvo el coraje de tomar forma.",
  },
  full_moon: {
    shortName: "Verdad iluminada",
    reading: [
      {
        title: "La luz ya está encendida",
        body: "Esta luna aparece cuando algo se volvió evidente. Tal vez no sea cómodo, pero hay una verdad que ya no quiere seguir escondida debajo de explicaciones.",
      },
      {
        title: "Mirar sin correr",
        body: "La claridad puede sentirse intensa. No tienes que resolverlo todo en el mismo instante en que lo ves. Primero mira. Respira. Deja que la verdad ocupe su lugar.",
      },
      {
        title: "Honestidad como regreso",
        body: "Lo que se ilumina no viene a castigarte. Viene a devolverte una parte de ti que estaba gastando demasiada energía en negar lo que ya sabía.",
      },
    ],
    shows: [
      "una verdad que ya no puedes desver",
      "el cansancio de sostener una negación",
      "la necesidad de honestidad sin drama",
      "una claridad que pide presencia antes que reacción",
    ],
    trapTitle: "Convertir la verdad en urgencia o castigo",
    trap: "La trampa es usar lo que viste para exigirte una respuesta inmediata o para juzgarte por no haberlo visto antes. La claridad también necesita ternura.",
    closing: "Que algo sea claro no significa que tengas que correr. A veces el primer acto de valentía es mirar sin volver a apagar la luz.",
  },
  waning_gibbous: {
    shortName: "Integración profunda",
    secondLine: "Hay cosas que no se superan rápido. Se entienden con amor.",
    reading: [
      {
        title: "Lo vivido todavía se acomoda",
        body: "Esta luna aparece cuando algo ya pasó, pero tu cuerpo y tu corazón todavía están entendiendo lo que significó. No estás quedada: estás integrando.",
      },
      {
        title: "La lección no siempre llega rápido",
        body: "Puede que quieras cerrar, entender y seguir. Pero hay experiencias que necesitan tiempo para revelar qué te dejaron, qué te dolió y qué ya no quieres repetir.",
      },
      {
        title: "Convertir experiencia en sabiduría",
        body: "Integrar no es justificar lo que pasó. Es mirar con suficiente amor para recuperar tu aprendizaje sin quedarte viviendo dentro de la herida.",
      },
    ],
    shows: [
      "algo que todavía estás procesando por dentro",
      "una lección que no quiere volverse prisa",
      "la necesidad de nombrar lo que cambió en ti",
      "un aprendizaje que merece más amor que juicio",
    ],
    trapTitle: "Querer superar sin haber entendido",
    trap: "La trampa es correr a estar bien para no sentir lo que quedó pendiente. Esta fase te recuerda que integrar también es avanzar.",
    closing: "No tienes que convertir todo en respuesta hoy. Algunas verdades se vuelven sabiduría cuando dejas de apurarlas.",
  },
  last_quarter: {
    shortName: "Soltar lo que pesa",
    secondLine: "No todo lo que puedo sostener me toca cargarlo igual.",
    reading: [
      {
        title: "La carga se hizo visible",
        body: "Esta luna aparece cuando algo pesa más de lo que quieres admitir. Tal vez lo has sostenido por amor, culpa, costumbre o miedo a decepcionar.",
      },
      {
        title: "Capacidad no es obligación",
        body: "Que puedas cargar algo no significa que te corresponda cargarlo igual. Esta fase te invita a distinguir entre responsabilidad, lealtad y desgaste.",
      },
      {
        title: "Soltar en porcentaje",
        body: "No siempre se suelta todo de golpe. A veces el primer movimiento es bajar un 10%, decir un no más claro o dejar de compensar en silencio.",
      },
    ],
    shows: [
      "una carga que se volvió demasiado pesada",
      "la culpa que aparece cuando eliges cuidarte",
      "la diferencia entre sostener y sobrecargarte",
      "un límite que puede devolverte energía",
    ],
    trapTitle: "Confundir amor con aguantarlo todo",
    trap: "La trampa es creer que soltar una carga significa dejar de amar, abandonar o fallar. A veces el amor también necesita límites para no convertirse en desgaste.",
    closing: "No tienes que demostrar cuánto puedes soportar. Puedes empezar a elegir qué sí te toca y qué ya necesita otro lugar.",
  },
  waning_crescent: {
    shortName: "Cierre y regreso a mí",
    secondLine: "No necesito renacer antes de descansar.",
    reading: [
      {
        title: "El cuerpo pide cierre",
        body: "Esta luna aparece cuando tu energía no está pidiendo otra meta, otra respuesta ni otro inicio. Está pidiendo terminar de descansar de lo que ya viviste.",
      },
      {
        title: "Descansar también es movimiento",
        body: "Puede incomodar no estar produciendo claridad. Pero esta fase no es vacío: es el espacio donde tu sistema vuelve a sí antes de abrir otra puerta.",
      },
      {
        title: "Regresar sin exigirte renacer",
        body: "No tienes que salir de esta fase convertida en alguien nuevo. Basta con permitir que algo cierre, que algo se calme y que tu energía vuelva a casa.",
      },
    ],
    shows: [
      "un ciclo que necesita cerrar con suavidad",
      "el cansancio de exigirte empezar otra vez",
      "la necesidad de silencio, sueño o retiro",
      "un regreso a ti que no necesita espectáculo",
    ],
    trapTitle: "Obligarte a renacer antes de descansar",
    trap: "La trampa es convertir cada cierre en un plan de reinvención inmediata. Esta luna te recuerda que descansar no es quedarte atrás: es recuperar tu energía.",
    closing: "Permítete cerrar sin prisa. A veces volver a ti empieza por no pedirte nada más por un momento.",
  },
};

Object.entries(resultEnhancements).forEach(([resultId, enhancement]) => {
  Object.assign(lunarResults[resultId], enhancement);
});

const state = {
  screen: "landing",
  sessionId: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
  questionIndex: 0,
  answers: [],
  primaryCounts: Object.fromEntries(phaseIds.map((id) => [id, 0])),
  lead: { name: "", email: "", countryCode: "+57", whatsappNumber: "", whatsapp: "", consent: false },
  result: null,
  error: "",
  isLocked: false,
  selectedOptionId: "",
  feedbackText: "",
  pendingNextIndex: null,
  milestone: null,
  viewedSignals: new Set(),
  guideDownloaded: false,
  guideDownloadMessage: "",
  guideOpenLinkVisible: false,
  waitlistJoined: false,
  waitlistStep: "invite",
  interestTopic: "",
  pilotInterest: "",
  whatsappGroupClicked: false,
  whatsappGroupClickedAt: "",
  cardNotice: "",
  trackedScreens: new Set(),
};

const app = document.getElementById("app");
const brand = {
  dots: "assets/brand/dots_triangle_topbig_black.png",
  wordmark: "assets/brand/nadia_wordmark_black.png",
};

const countryCodes = [
  { code: "+57", label: "CO +57" },
  { code: "+52", label: "MX +52" },
  { code: "+1", label: "US/CA +1" },
  { code: "+34", label: "ES +34" },
  { code: "+54", label: "AR +54" },
  { code: "+56", label: "CL +56" },
  { code: "+51", label: "PE +51" },
  { code: "+593", label: "EC +593" },
  { code: "+58", label: "VE +58" },
  { code: "+507", label: "PA +507" },
  { code: "+598", label: "UY +598" },
  { code: "+55", label: "BR +55" },
];

const guideContent = {
  eyebrow: "Recurso descargable",
  title: "Tu Guía Ritual de la Próxima Luna",
  date: "Luna Llena en Escorpio · 1 de mayo",
  intro: [
    "Esta luna no viene a darte paz de mentira.",
    "Viene a mostrarte qué emoción, apego o verdad ya no puedes seguir maquillando.",
    "Descarga la guía para trabajar esta Luna Llena con escritura, cuerpo y ritual.",
  ],
  cardTitle: "Guía Ritual de la Próxima Luna",
  cardCopy: "Una práctica escrita y ritual para mirar lo que esta luna mueve en ti, soltar lo que ya pesa y volver a tu centro sin exigirte hacerlo perfecto.",
  listLabel: "Vas a encontrar:",
  items: [
    "Qué viene a mostrarte esta Luna en Escorpio.",
    "En qué área de tu vida puede sentirse más fuerte.",
    "Qué sí hacer y qué evitar estos días.",
    "Una práctica de cuerpo para bajar intensidad.",
    "3 rituales para escribir, soltar y cerrar.",
    "Tips de cristales, chakras y descarga emocional.",
  ],
  downloadPath: "/assets/downloads/tu-guia-lunar-escorpio-01-05-2026.pdf",
  downloadFileName: "tu-guia-lunar-escorpio.pdf",
};

function trackEvent(eventName, extra = {}) {
  const resultDetails = state.result?.resultId ? lunarResults[state.result.resultId] : null;
  const payload = {
    session_id: state.sessionId,
    timestamp: new Date().toISOString(),
    event_name: eventName,
    name: state.lead.name,
    email: state.lead.email,
    whatsapp: state.lead.whatsapp,
    answers: state.answers,
    result_id: state.result?.resultId || "",
    result_phase: resultDetails?.phase || "",
    result_short_name: resultDetails?.shortName || "",
    secondary_result_id: state.result?.secondaryResultId || "",
    score_gap: state.result?.scoreGap ?? "",
    confidence_score: state.result?.confidenceScore || "",
    phase_scores: state.result?.phaseScores || {},
    guide_downloaded: state.guideDownloaded,
    waitlist_joined: state.waitlistJoined,
    whatsapp_group_clicked: state.whatsappGroupClicked,
    whatsapp_group_clicked_at: state.whatsappGroupClickedAt,
    interest_topic: state.interestTopic,
    pilot_interest: state.pilotInterest,
    source_url: window.location.href,
    ...extra,
  };

  const localEvents = JSON.parse(localStorage.getItem("luna_events") || "[]");
  localEvents.push(payload);
  localStorage.setItem("luna_events", JSON.stringify(localEvents));

  if (WEBHOOK_URL && sheetEventNames.has(eventName)) {
    sendWebhookPayload(payload);
  }
}

function sendWebhookPayload(payload) {
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
    if (navigator.sendBeacon(WEBHOOK_URL, blob)) return;
  }

  fetch(WEBHOOK_URL, {
    method: "POST",
    mode: "no-cors",
    keepalive: true,
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body,
  }).catch(() => undefined);
}

window.exportLocalEventsForDebug = function exportLocalEventsForDebug() {
  return JSON.parse(localStorage.getItem("luna_events") || "[]");
};

function markScreen(screen, eventName) {
  const key = `${screen}:${eventName}`;
  if (!state.trackedScreens.has(key)) {
    state.trackedScreens.add(key);
    trackEvent(eventName);
  }
}

function setScreen(screen) {
  state.screen = screen;
  state.error = "";
  render();
  scrollToScreenTop();
}

function scrollToScreenTop() {
  requestAnimationFrame(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  });
}

function panel(content, compact = false) {
  return `<section class="screen"><div class="ritual-panel ${compact ? "compact" : ""}">${content}</div></section>`;
}

function render() {
  if (state.screen === "landing") return renderLanding();
  if (state.screen === "intro") return renderIntro();
  if (state.screen === "transition") return renderTransition();
  if (state.screen === "quiz") return renderQuiz();
  if (state.screen === "milestone") return renderMilestone();
  if (state.screen === "capture") return renderCapture();
  if (state.screen === "reveal") return renderReveal();
  if (state.screen === "result") return renderResult();
  if (state.screen === "card") return renderCard();
  if (state.screen === "guide") return renderGuide();
  if (state.screen === "waitlist") return renderWaitlist();
  if (state.screen === "closing") return renderClosing();
}

function renderLanding() {
  markScreen("landing", eventNames.landingViewed);
  app.innerHTML = panel(`
    <div class="moon-mark"></div>
    <p class="eyebrow">Ritual interactivo</p>
    <h1>La Luna que Estás Viviendo</h1>
    <p class="lead">Responde 7 señales y descubre qué fase lunar refleja el momento interno que estás viviendo ahora.</p>
    <button class="primary-btn" id="startBtn">Entrar al ritual</button>
    <p class="small-note">Al final recibes tu lectura, una práctica y tu Guía Ritual de la Próxima Luna.</p>
    <img class="brand-wordmark footer-wordmark" src="${brand.wordmark}" alt="Nadia Hazte Caso" />
  `);
  document.getElementById("startBtn").onclick = () => {
    trackEvent(eventNames.landingCtaClicked);
    setScreen("intro");
  };
}

function renderIntro() {
  markScreen("intro", eventNames.introViewed);
  app.innerHTML = panel(`
    <p class="eyebrow">Antes de entrar</p>
    <h2>Lo que vas a descubrir</h2>
    <p class="body-copy">En unos minutos vas a mirar tu momento interno con una brújula más clara:</p>
    <ul class="receive-list" aria-label="Lo que recibes al terminar">
      <li>la fase lunar que revela qué se está moviendo dentro de ti,</li>
      <li>una frase para nombrar eso que tal vez venías sintiendo sin poder explicarlo,</li>
      <li>una práctica simple para bajar la lectura al cuerpo,</li>
      <li>y acceso a la guía paso a paso para trabajar la Luna Llena en Escorpio del 1 de mayo.</li>
    </ul>
    <p class="body-copy">Responde desde cómo estás hoy. Al final podrás entrar al grupo privado y llevarte la guía de la próxima luna.</p>
    <button class="primary-btn" id="readyBtn">Estoy lista</button>
  `, true);
  document.getElementById("readyBtn").onclick = () => {
    trackEvent(eventNames.ritualStarted);
    setScreen("transition");
  };
}

function renderTransition() {
  markScreen("transition", eventNames.transitionViewed);
  app.innerHTML = panel(`
    <div class="moon-mark"></div>
    <h2>Respira.</h2>
    <p class="lead">Piensa en cómo estás hoy, no en cómo deberías estar.</p>
    <p class="lead">Tu luna interna se está formando.</p>
    <img class="brand-dots" src="${brand.dots}" alt="" aria-hidden="true" />
  `);
  setTimeout(() => setScreen("quiz"), TRANSITION_MS);
}

function renderQuiz() {
  const q = quizQuestions[state.questionIndex];
  const signalNumber = state.questionIndex + 1;
  if (!state.viewedSignals.has(q.id)) {
    state.viewedSignals.add(q.id);
    trackEvent(eventNames.signalViewed, { signal_number: signalNumber, question_id: q.id });
  }
  app.innerHTML = panel(`
    <div class="signal-orbit">
      <div class="progress-top">
        <span>Señal ${signalNumber} de ${quizQuestions.length}</span>
        <span>Tu lectura se está formando</span>
      </div>
      <div class="lunar-progress" aria-label="Progreso del ritual">
        ${quizQuestions.map((_, index) => `<span class="lunar-dot ${index < state.questionIndex ? "done" : ""} ${index === state.questionIndex ? "active" : ""} ${state.isLocked && index === state.questionIndex ? "answered" : ""}"></span>`).join("")}
      </div>
    </div>
    <p class="eyebrow">Primero escúchate</p>
    <h2>${q.text}</h2>
    <div class="option-list">
      ${q.options.map((opt) => `<button class="option-btn ${state.selectedOptionId === opt.id ? "selected" : ""} ${state.isLocked ? "locked" : ""}" data-option="${opt.id}" ${state.isLocked ? "disabled" : ""}>${opt.label}</button>`).join("")}
    </div>
    ${state.isLocked ? `<div class="micro-feedback"><span class="spark"></span><p>${state.feedbackText}</p></div>` : ""}
  `, true);
  document.querySelectorAll("[data-option]").forEach((btn) => {
    btn.onclick = () => selectAnswer(btn.dataset.option);
  });
}

function selectAnswer(optionId) {
  if (state.isLocked) return;
  const q = quizQuestions[state.questionIndex];
  const option = q.options.find((item) => item.id === optionId);
  const primary = Object.entries(option.weights).find(([, value]) => value === 2)?.[0];
  if (primary) state.primaryCounts[primary] += 1;
  const signalNumber = state.questionIndex + 1;
  state.answers.push({
    questionId: q.id,
    questionLabel: q.text,
    optionId: option.id,
    label: option.label,
    weights: option.weights,
    primary,
  });
  state.selectedOptionId = option.id;
  state.feedbackText = getMicroFeedback(state.questionIndex);
  state.isLocked = true;
  trackEvent(eventNames.signalAnswered, {
    question_id: q.id,
    option_id: option.id,
    primary_phase: primary,
    signal_number: signalNumber,
  });
  trackEvent(eventNames.microFeedbackViewed, {
    signal_number: signalNumber,
    selected_option_id: option.id,
    feedback_text: state.feedbackText,
  });
  renderQuiz();

  setTimeout(() => {
    trackEvent(eventNames.microFeedbackCompleted, { signal_number: signalNumber });
    trackEvent(eventNames.signalCompleted, { signal_number: signalNumber, question_id: q.id });
    state.isLocked = false;
    state.selectedOptionId = "";
    state.feedbackText = "";

    if (state.questionIndex === quizQuestions.length - 1) {
      state.result = calculateResult();
      trackEvent(eventNames.signalFlowCompleted);
      setScreen("capture");
      return;
    }

    if (milestones[state.questionIndex]) {
      state.milestone = milestones[state.questionIndex];
      state.pendingNextIndex = state.questionIndex + 1;
      setScreen("milestone");
      return;
    }

    state.questionIndex += 1;
    renderQuiz();
    scrollToScreenTop();
  }, MICRO_FEEDBACK_MS);
}

function getMicroFeedback(index) {
  const stage = index < 3 ? "opening" : index < 6 ? "depth" : "reveal";
  const bank = microFeedbackByStage[stage];
  return bank[index % bank.length];
}

function renderMilestone() {
  const milestone = state.milestone;
  if (!milestone) {
    state.questionIndex = state.pendingNextIndex ?? state.questionIndex + 1;
    setScreen("quiz");
    return;
  }
  trackEvent(eventNames.progressMilestoneViewed, {
    milestone_number: milestone.number,
    after_signal_number: state.pendingNextIndex,
    milestone_text: milestone.title,
  });
  app.innerHTML = panel(`
    <div class="milestone-pulse">
      <div class="moon-mark"></div>
      <div class="lunar-progress milestone-dots">
        ${quizQuestions.map((_, index) => `<span class="lunar-dot ${index < state.pendingNextIndex ? "done glow" : ""}"></span>`).join("")}
      </div>
      <h2>${milestone.title}</h2>
      <p class="lead">${milestone.body}</p>
      <img class="brand-dots" src="${brand.dots}" alt="" aria-hidden="true" />
    </div>
  `);
  setTimeout(() => {
    trackEvent(eventNames.progressMilestoneCompleted, {
      milestone_number: milestone.number,
      after_signal_number: state.pendingNextIndex,
    });
    state.questionIndex = state.pendingNextIndex;
    state.pendingNextIndex = null;
    state.milestone = null;
    setScreen("quiz");
  }, TRANSITION_MS);
}

function calculateResult() {
  const scores = Object.fromEntries(phaseIds.map((id) => [id, 0]));
  state.answers.forEach((answer) => {
    Object.entries(answer.weights).forEach(([phase, value]) => {
      scores[phase] += value;
    });
  });

  const maxScore = Math.max(...Object.values(scores));
  let tied = phaseIds.filter((phase) => scores[phase] === maxScore);
  if (tied.length > 1) {
    const maxPrimary = Math.max(...tied.map((phase) => state.primaryCounts[phase]));
    tied = tied.filter((phase) => state.primaryCounts[phase] === maxPrimary);
  }
  if (tied.length > 1) {
    const lastPrimary = state.answers[state.answers.length - 1].primary;
    if (tied.includes(lastPrimary)) tied = [lastPrimary];
  }
  if (tied.length > 1) {
    tied = [fallbackOrder.find((phase) => tied.includes(phase))];
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const gap = sorted[0][1] - sorted[1][1];
  const confidenceScore = gap >= 4 ? "high" : gap >= 2 ? "medium" : "low";
  return {
    resultId: tied[0],
    phaseScores: scores,
    scoreGap: gap,
    confidenceScore,
    secondaryResultId: sorted.find(([phase]) => phase !== tied[0])?.[0] || "",
  };
}

function renderCapture() {
  markScreen("capture", eventNames.leadCaptureViewed);
  app.innerHTML = panel(`
    <p class="eyebrow">Tu lectura lunar ya se formó</p>
    <h2>Hay una fase esperando mostrarse</h2>
    <p class="body-copy">Queremos enviarte tu lectura y la guía ritual para que puedas volver a ellas después. Cuéntanos cómo quieres recibirlas.</p>
    ${state.error ? `<p class="error">${state.error}</p>` : ""}
    <form id="leadForm">
      <div class="field">
        <label for="name">Nombre</label>
        <input id="name" autocomplete="name" placeholder="¿Cómo te llamas?" value="${escapeAttr(state.lead.name)}" />
      </div>
      <div class="field">
        <label for="email">Correo</label>
        <input id="email" autocomplete="email" inputmode="email" placeholder="¿A qué correo te escribimos?" value="${escapeAttr(state.lead.email)}" />
      </div>
      <div class="field">
        <label for="whatsapp">WhatsApp opcional</label>
        <div class="phone-row">
          <select id="countryCode" aria-label="Código de país">
            ${countryCodes.map((country) => `<option value="${country.code}" ${state.lead.countryCode === country.code ? "selected" : ""}>${country.label}</option>`).join("")}
          </select>
          <input id="whatsapp" autocomplete="tel" inputmode="tel" placeholder="Tu número" value="${escapeAttr(state.lead.whatsappNumber)}" />
        </div>
      </div>
      <label class="check-row">
        <input id="consent" type="checkbox" ${state.lead.consent ? "checked" : ""} />
        <span>Acepto recibir mi lectura, la guía ritual y comunicaciones relacionadas con esta experiencia.</span>
      </label>
      <button class="primary-btn" type="submit">Revelar mi luna interna</button>
      <p class="small-note">Cero spam. Puedes salirte cuando quieras.</p>
    </form>
  `, true);
  document.getElementById("leadForm").onsubmit = (event) => {
    event.preventDefault();
    const whatsappNumber = document.getElementById("whatsapp").value.trim();
    const countryCode = document.getElementById("countryCode").value;
    const normalizedWhatsapp = normalizeWhatsapp(countryCode, whatsappNumber);
    state.lead = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      countryCode,
      whatsappNumber,
      whatsapp: normalizedWhatsapp,
      consent: document.getElementById("consent").checked,
    };
    if (!state.lead.name) return showCaptureError("Cuéntanos tu nombre para abrir tu lectura.");
    if (!state.lead.email) return showCaptureError("Cuéntanos a qué correo podemos enviarte tu lectura.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.lead.email)) return showCaptureError("Revisa tu correo. Parece que falta algo.");
    if (whatsappNumber && !normalizedWhatsapp) return showCaptureError("Revisa tu número de WhatsApp. Incluimos el código del país para guardarlo bien.");
    if (!state.lead.consent) return showCaptureError("Acepta recibir tu lectura y la guía ritual para continuar.");
    trackEvent(eventNames.leadSubmitted);
    setScreen("reveal");
  };
}

function showCaptureError(message) {
  state.error = message;
  renderCapture();
  scrollToScreenTop();
}

function normalizeWhatsapp(countryCode, value) {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length < 6) return "";
  const cleanCountry = String(countryCode || "").replace(/\D/g, "");
  if (!cleanCountry) return "";
  const withoutInternationalPrefix = digits.startsWith("00") ? digits.slice(2) : digits;
  const withoutCountry = withoutInternationalPrefix.startsWith(cleanCountry)
    ? withoutInternationalPrefix.slice(cleanCountry.length)
    : withoutInternationalPrefix;
  return `+${cleanCountry}${withoutCountry}`;
}

function renderReveal() {
  markScreen("reveal", eventNames.revealTransitionViewed);
  app.innerHTML = panel(`
    <div class="moon-mark"></div>
    <h2>Tu luna interna ya está clara.</h2>
    <p class="lead">Ahora vamos a revelarla.</p>
  `);
  setTimeout(() => {
    trackEvent(eventNames.resultRevealed);
    setScreen("result");
  }, TRANSITION_MS);
}

function renderResult() {
  const result = currentResult();
  const personalReading = buildPersonalReading(result);
  app.innerHTML = panel(`
    <div class="result-reveal-hero">
      <div class="result-moon-symbol"></div>
      <p class="eyebrow">Tu luna interna actual es</p>
      <p class="result-phase">${result.phase}</p>
      <h2>${result.shortName}</h2>
      <p class="result-emotional-name">${result.name}</p>
    </div>
    <div class="private-mirror">
      <span>Frase espejo</span>
      <p>${result.mirror}</p>
    </div>
    <div class="reading-flow">
      <p class="eyebrow left">Tu Lectura</p>
      <article class="personal-reading">
        ${personalReading.map((paragraph) => `<p class="body-copy">${paragraph}</p>`).join("")}
      </article>
    </div>
    <div class="mini-section insight-section">
      <h3>Qué está mostrando esta luna</h3>
      <ul class="insight-list">
        ${result.shows.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>
    <div class="trap-card">
      <p class="eyebrow left">La trampa de esta fase</p>
      <h3>${result.trapTitle}</h3>
      <p class="body-copy">${result.trap}</p>
    </div>
    <div class="mini-section">
      <h3>Pregunta guía</h3>
      <p class="body-copy">${result.question}</p>
    </div>
    <div class="mini-section">
      <h3>Ritual de hoy</h3>
      <p class="body-copy">${result.practice}</p>
    </div>
    <div class="result-closing">${result.closing}</div>
    <div class="card-transition">
      <p class="body-copy">Creamos una versión breve y bella de tu luna para que puedas guardarla o compartirla.</p>
      <button class="primary-btn" id="createCard">Ver mi carta lunar</button>
    </div>
    <img class="brand-wordmark footer-wordmark" src="${brand.wordmark}" alt="Nadia Hazte Caso" />
  `, true);
  document.getElementById("createCard").onclick = () => setScreen("card");
}

const personalSignalCopy = {
  new_moon: "una parte tuya que necesita silencio antes de nombrar lo que quiere nacer",
  waxing_crescent: "un deseo pequeño que pide cuidado constante, no presión",
  first_quarter: "un impulso de moverte sin esperar a sentirte completamente segura",
  waxing_gibbous: "algo que ya tomó forma, pero que estás midiendo con demasiada exigencia",
  full_moon: "una verdad que ya se dejó ver, aunque todavía incomode mirarla completa",
  waning_gibbous: "una experiencia que todavía estás acomodando por dentro",
  last_quarter: "una carga que pide límite, alivio o menos peso sobre tus hombros",
  waning_crescent: "una necesidad real de cerrar, descansar y volver a ti",
};

function buildPersonalReading(result) {
  const resultId = state.result?.resultId;
  const secondaryId = state.result?.secondaryResultId;
  const mainSignal = personalSignalCopy[resultId];
  const secondarySignal = secondaryId && state.result?.phaseScores?.[secondaryId] > 0
    ? personalSignalCopy[secondaryId]
    : "";
  const [opening, middle, closing] = result.reading;
  const signalReading = secondarySignal
    ? `Tu lectura no sale de una respuesta aislada. Se forma por el patrón que apareció entre tus señales: ${mainSignal}, y también ${secondarySignal}. Por eso esta fase no llega como una etiqueta fija, sino como una manera de nombrar dónde parece estar tu energía hoy.`
    : `Tu lectura no sale de una respuesta aislada. Se forma por el patrón que apareció entre tus señales: ${mainSignal}. Por eso esta fase no llega como una etiqueta fija, sino como una manera de nombrar dónde parece estar tu energía hoy.`;

  return [
    signalReading,
    `${opening.body} ${middle.body}`,
    `${closing.body} Si algo de esto te toca, no es para que lo resuelvas todo ahora; es para que tengas un lenguaje más preciso para mirarte sin exigirte tanto.`,
  ];
}

function renderCard() {
  markScreen("card", eventNames.cardViewed);
  const result = currentResult();
  app.innerHTML = panel(`
    <p class="eyebrow">Tu carta lunar está lista</p>
    <h2>Una versión breve y bella de tu luna</h2>
    <p class="body-copy">Esta es la parte compartible de tu lectura: menos íntima, más simbólica, hecha para guardar como recordatorio.</p>
    <div class="altar-card" id="altarCard">
      <div class="altar-top">
        <div class="altar-moon"></div>
        <p class="card-title">Tu luna hoy es</p>
      </div>
      <div class="altar-center">
        <p class="card-phase">${result.phase}</p>
        <h2>${result.shortName}</h2>
      </div>
      <div>
        <p class="share-line">${result.share}</p>
        <p class="second-line">${result.secondLine}</p>
      </div>
      <div class="card-signature">
        <span class="signature-dot-cluster" aria-hidden="true"><i></i><i></i><i></i></span>
        <img class="brand-wordmark" src="${brand.wordmark}" alt="Nadia Hazte Caso" />
      </div>
    </div>
    <p class="small-note">Puedes guardarla solo para ti o mandársela a alguien que también esté viviendo algo parecido.</p>
    ${state.cardNotice ? `<p class="notice">${state.cardNotice}</p>` : ""}
    <div class="card-actions">
      <button class="utility-btn" id="copyCard" aria-label="Guardar mi carta">
        <span aria-hidden="true">↓</span>
        Guardar
      </button>
      <button class="utility-btn" id="shareCard" aria-label="Compartir mi carta">
        <span aria-hidden="true">↗</span>
        Compartir
      </button>
    </div>
    <div class="guide-offer">
      <p class="eyebrow left">Luna Llena en Escorpio · 1 de mayo</p>
      <h3>Tu lectura no termina aquí.</h3>
      <p class="body-copy">La próxima luna viene a mover lo que ya no puedes seguir maquillando: emociones, apegos, verdades incómodas y cierres pendientes.</p>
      <p class="body-copy">Preparé una guía ritual para acompañarte con escritura, cuerpo y un cierre simple para soltar lo que esta Luna Llena en Escorpio despierte en ti.</p>
      <div class="offer-promise">
        <span aria-hidden="true">↓</span>
        <p>La voy a entregar dentro del grupo privado de WhatsApp antes del 1 de mayo.</p>
      </div>
      <button class="primary-btn" id="openGuideGroup">Quiero recibir mi guía lunar</button>
      <p class="small-note">Entras al grupo privado y ahí recibirás tu primera guía de luna.</p>
    </div>
    <div class="monthly-return">
      <p class="eyebrow left">Vuelve a tu brújula</p>
      <h3>Esta lectura puede cambiar contigo.</h3>
      <p class="body-copy">Guarda tu carta y vuelve a hacer este ritual cuando empiece otro ciclo, cuando algo se mueva en ti o cuando necesites mirarte con más claridad.</p>
      <p class="body-copy">Tu luna interna no es una sentencia. Es una forma de escucharte mejor, una vez al mes, desde el lugar donde estés.</p>
    </div>
  `, true);
  document.getElementById("copyCard").onclick = saveCardImage;
  document.getElementById("shareCard").onclick = shareCardImage;
  document.getElementById("openGuideGroup").onclick = openGuideGroup;
}

function cardText() {
  const result = currentResult();
  return `Tu luna hoy es\n${result.phase} - ${result.shortName}\n${result.share}\n${result.secondLine}\nNadia Hazte Caso`;
}

function openGuideGroup() {
  state.whatsappGroupClicked = true;
  state.whatsappGroupClickedAt = new Date().toISOString();
  trackEvent(eventNames.privateGroupClicked, { source: "card_guide_offer", guide: "luna_llena_escorpio_2026_05_01" });
  if (WHATSAPP_PRIVATE_GROUP_URL) {
    window.open(WHATSAPP_PRIVATE_GROUP_URL, "_blank", "noopener,noreferrer");
    return;
  }
  window.alert("Todavía falta pegar aquí el enlace real del grupo privado de WhatsApp.");
}

async function saveCardImage() {
  try {
    const blob = await buildCardImageBlob();
    downloadBlob(blob, cardFileName());
    trackEvent(eventNames.cardSaved, { method: "download" });
    state.cardNotice = "Tu carta se descargó como imagen PNG.";
  } catch (error) {
    trackEvent(eventNames.cardSaveError, { message: String(error) });
    state.cardNotice = "No pudimos generar la imagen en este navegador. Intenta de nuevo cuando esté publicada o desde otro navegador.";
  }
  renderCard();
}

async function shareCardImage() {
  try {
    const blob = await buildCardImageBlob();
    const file = new File([blob], cardFileName(), { type: "image/png" });
    if (navigator.canShare?.({ files: [file] }) && navigator.share) {
      await navigator.share({
        title: "Tu luna hoy es",
        text: cardText(),
        files: [file],
      });
      trackEvent(eventNames.cardShared, { method: "native_file_share" });
      state.cardNotice = "";
    } else if (navigator.share) {
      await navigator.share({
        title: "Tu luna hoy es",
        text: cardText(),
      });
      trackEvent(eventNames.cardShared, { method: "native_text_share" });
      state.cardNotice = "Se abrió el menú de compartir. Si quieres la imagen, usa Guardar mi carta.";
    } else {
      downloadBlob(blob, cardFileName());
      trackEvent(eventNames.cardShared, { method: "download_fallback" });
      state.cardNotice = "Este navegador no abrió el menú de compartir, así que descargamos tu carta como imagen.";
    }
  } catch (error) {
    if (error?.name === "AbortError") return;
    trackEvent(eventNames.cardSaveError, { action: "share", message: String(error) });
    state.cardNotice = "No pudimos abrir el menú de compartir. Usa Guardar mi carta para descargar la imagen.";
    renderCard();
    return;
  }
  renderCard();
}

async function buildCardImageBlob() {
  if (document.fonts?.ready) {
    await document.fonts.ready.catch(() => undefined);
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  await drawLunarCard(ctx, currentResult());
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("No se pudo generar la imagen de la carta."));
    }, "image/png");
  });
}

async function drawLunarCard(ctx, result) {
  const width = 1080;
  const height = 1920;
  const cream = "#fbf5e8";
  const creamMuted = "#d7ccb8";
  const gold = "#d7b873";
  const night = "#080913";

  ctx.clearRect(0, 0, width, height);
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#17162c");
  bg.addColorStop(0.52, "#0d0d1d");
  bg.addColorStop(1, night);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(540, 210, 0, 540, 210, 760);
  glow.addColorStop(0, "rgba(215, 184, 115, 0.24)");
  glow.addColorStop(0.46, "rgba(116, 98, 145, 0.13)");
  glow.addColorStop(1, "rgba(8, 9, 19, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  drawStars(ctx);
  drawRoundedStroke(ctx, 68, 58, 944, 1804, 64, "rgba(215, 184, 115, 0.42)", 2);
  drawMoon(ctx, 540, 210, 80);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  drawLetterSpacedText(ctx, "TU LUNA HOY ES", 540, 368, 4.8, {
    font: "700 30px Inter, Arial, sans-serif",
    color: gold,
  });

  drawLetterSpacedText(ctx, result.phase.toUpperCase(), 540, 535, 4.5, {
    font: "700 31px Inter, Arial, sans-serif",
    color: gold,
  });

  ctx.fillStyle = cream;
  ctx.font = "700 104px Georgia, 'Times New Roman', serif";
  const afterTitle = drawWrappedCanvasText(ctx, result.shortName, 540, 640, 760, 108);

  ctx.font = "700 57px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = cream;
  const afterShare = drawWrappedCanvasText(ctx, result.share, 540, Math.max(afterTitle + 170, 940), 730, 69);

  ctx.font = "500 42px Inter, Arial, sans-serif";
  ctx.fillStyle = creamMuted;
  drawWrappedCanvasText(ctx, result.secondLine, 540, afterShare + 56, 690, 55);

  await drawBrandSignature(ctx, 540, 1492, 390);
}

function drawStars(ctx) {
  let seed = 17;
  for (let i = 0; i < 62; i += 1) {
    seed = (seed * 16807) % 2147483647;
    const x = 95 + (seed % 890);
    seed = (seed * 16807) % 2147483647;
    const y = 120 + (seed % 1640);
    seed = (seed * 16807) % 2147483647;
    const size = 1.2 + (seed % 22) / 10;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = i % 7 === 0 ? "rgba(215, 184, 115, 0.5)" : "rgba(251, 245, 232, 0.42)";
    ctx.fill();
  }
}

function drawMoon(ctx, x, y, radius) {
  const moon = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
  moon.addColorStop(0, "rgba(251, 245, 232, 0.96)");
  moon.addColorStop(0.46, "rgba(251, 245, 232, 0.58)");
  moon.addColorStop(1, "rgba(215, 184, 115, 0.08)");
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = moon;
  ctx.fill();
  ctx.strokeStyle = "rgba(215, 184, 115, 0.58)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x + 22, y, radius + 6, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(8, 9, 19, 0.64)";
  ctx.fill();

  const light = ctx.createRadialGradient(x - 30, y - 34, 0, x - 30, y - 34, 46);
  light.addColorStop(0, "rgba(251, 245, 232, 0.96)");
  light.addColorStop(1, "rgba(251, 245, 232, 0)");
  ctx.beginPath();
  ctx.arc(x - 30, y - 34, 46, 0, Math.PI * 2);
  ctx.fillStyle = light;
  ctx.fill();
}

async function drawBrandSignature(ctx, centerX, y, maxWidth) {
  drawSignatureDots(ctx, centerX, y);
  try {
    const image = await loadImage(brand.wordmark);
    const width = maxWidth;
    const height = width * (image.naturalHeight / image.naturalWidth);
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.filter = "invert(94%) sepia(15%) saturate(388%) hue-rotate(342deg) brightness(105%) contrast(95%)";
    ctx.drawImage(image, centerX - width / 2, y + 48, width, height);
    ctx.restore();
  } catch {
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(251, 245, 232, 0.72)";
    ctx.font = "700 42px Georgia, 'Times New Roman', serif";
    ctx.fillText("NADIA", centerX, y + 90);
    ctx.font = "italic 34px Georgia, 'Times New Roman', serif";
    ctx.fillText("hazte caso", centerX, y + 142);
    ctx.restore();
  }
}

function drawSignatureDots(ctx, centerX, y) {
  ctx.save();
  ctx.fillStyle = "rgba(251, 245, 232, 0.42)";
  ctx.beginPath();
  ctx.arc(centerX, y + 4, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX - 24, y + 32, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX + 24, y + 32, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRoundedStroke(ctx, x, y, width, height, radius, color, lineWidth) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.restore();
}

function drawWrappedCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  lines.forEach((item, index) => {
    ctx.fillText(item, x, y + index * lineHeight);
  });
  return y + Math.max(lines.length - 1, 0) * lineHeight;
}

function drawLetterSpacedText(ctx, text, x, y, spacing, options) {
  ctx.save();
  ctx.font = options.font;
  ctx.fillStyle = options.color;
  ctx.textAlign = "left";
  const characters = Array.from(text);
  const totalWidth = characters.reduce((sum, char) => sum + ctx.measureText(char).width, 0) + spacing * (characters.length - 1);
  let cursor = x - totalWidth / 2;
  characters.forEach((char) => {
    ctx.fillText(char, cursor, y);
    cursor += ctx.measureText(char).width + spacing;
  });
  ctx.restore();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function cardFileName() {
  const result = currentResult();
  return `carta-lunar-${slugify(result.shortName)}.png`;
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function renderGuide() {
  markScreen("guide", eventNames.guideViewed);
  app.innerHTML = panel(`
    <p class="eyebrow">${guideContent.eyebrow}</p>
    <h2>${guideContent.title}</h2>
    <p class="guide-date">${guideContent.date}</p>
    <div class="guide-intro">
      ${guideContent.intro.map((line) => `<p>${line}</p>`).join("")}
    </div>
    <img class="brand-dots" src="${brand.dots}" alt="" aria-hidden="true" />
    <div class="resource-card">
      <h3>${guideContent.cardTitle}</h3>
      <p class="body-copy">${guideContent.cardCopy}</p>
      <p class="list-label">${guideContent.listLabel}</p>
      <ul class="guide-list">
        ${guideContent.items.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>
    <div class="stack">
      <button class="primary-btn" id="downloadGuide">Descargar mi guía</button>
      ${state.guideOpenLinkVisible ? `<a class="secondary-btn guide-open-link" href="${guideContent.downloadPath}" target="_blank" rel="noopener noreferrer">Abrir guía en pestaña nueva</a>` : ""}
      <button class="ghost-btn" id="continueWaitlist">Continuar</button>
    </div>
    ${state.guideDownloadMessage ? `<p class="small-note">${state.guideDownloadMessage}</p>` : ""}
  `, true);
  document.getElementById("downloadGuide").onclick = handleGuideDownload;
  document.getElementById("continueWaitlist").onclick = () => setScreen("waitlist");
}

async function handleGuideDownload() {
  trackEvent(eventNames.guideDownloadClicked, { guide_download_clicked: true });
  const guideUrl = guideContent.downloadPath;
  const absoluteGuideUrl = new URL(guideUrl, window.location.origin).href;
  const fileName = guideContent.downloadFileName;
  state.guideOpenLinkVisible = false;
  try {
    if (isAppleMobile() && navigator.share) {
      await navigator.share({
        title: "Tu guía lunar",
        url: absoluteGuideUrl,
      });
      state.guideDownloaded = true;
      state.guideDownloadMessage = "Listo. Se abrió la hoja de compartir de tu iPhone. Vuelve aquí para continuar.";
      trackEvent(eventNames.guideDownloaded, {
        guide_path: guideUrl,
        guide_file_name: fileName,
        method: "web_share_url_ios",
      });
      renderGuide();
      return;
    }

    const response = await fetch(guideUrl);
    if (!response.ok) throw new Error(`No se pudo cargar el PDF: ${response.status}`);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: "application/pdf" });

    if (navigator.canShare && navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "Tu guía lunar",
      });
      state.guideDownloaded = true;
      state.guideDownloadMessage = "Listo. Tu guía se abrió en las opciones de tu iPhone. Vuelve aquí para continuar.";
      trackEvent(eventNames.guideDownloaded, {
        guide_path: guideUrl,
        guide_file_name: fileName,
        method: "web_share_file",
      });
      renderGuide();
      return;
    }

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    state.guideDownloaded = true;
    state.guideDownloadMessage = "Listo. Tu guía se está descargando. Vuelve aquí para continuar.";
    trackEvent(eventNames.guideDownloaded, {
      guide_path: guideUrl,
      guide_file_name: fileName,
      method: "blob_download",
    });
    renderGuide();
  } catch (error) {
    trackEvent(eventNames.guideDownloadError, { message: String(error), guide_path: guideUrl });
    state.guideOpenLinkVisible = true;
    state.guideDownloadMessage = "No pudimos descargarla automáticamente. Puedes continuar el flujo o abrir la guía en una pestaña nueva.";
    renderGuide();
  }
}

function isAppleMobile() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function renderWaitlist() {
  markScreen("waitlist", eventNames.waitlistViewed);
  if (state.waitlistStep === "invite") renderWaitlistInvite();
  else if (state.waitlistStep === "interest") renderInterest();
  else if (state.waitlistStep === "pilot") renderPilot();
  else renderWaitlistDone();
  scrollToScreenTop();
}

function renderWaitlistInvite() {
  app.innerHTML = panel(`
    <p class="eyebrow">Siguiente ciclo</p>
    <h2>¿Quieres entrar al primer círculo privado?</h2>
    <p class="body-copy">Estamos preparando un recorrido lunar de 28 días para mujeres que quieren dejar de empujar su vida y empezar a moverse con más claridad, ritual e intuición.</p>
    <div class="resource-card">
      <h3>Deja de forzarte: manifiesta con la luna</h3>
      <p class="body-copy">Una experiencia íntima para usar cada fase lunar como brújula: pedir con claridad, sostener sin agotarte, mirar lo que se revela y soltar lo que ya cumplió su ciclo.</p>
    </div>
    <ul class="soft-list">
      <li>Pedir lo que deseas sin convertirlo en presión.</li>
      <li>Escuchar lo que tu cuerpo lleva tiempo mostrando.</li>
      <li>Soltar lo que pesa antes de cargarlo otro ciclo.</li>
      <li>Moverte con la energía de cada fase lunar.</li>
      <li>Crear rituales simples que sí te devuelvan a ti.</li>
    </ul>
    <button class="primary-btn" id="joinWaitlist">Quiero recibir la invitación privada</button>
    <p class="small-note">No estás comprando nada todavía.<br>Solo nos dices que quieres enterarte primero si abrimos el piloto.</p>
  `, true);
  document.getElementById("joinWaitlist").onclick = () => {
    state.waitlistJoined = true;
    trackEvent(eventNames.waitlistCtaClicked);
    trackEvent(eventNames.waitlistJoined);
    state.waitlistStep = "interest";
    renderWaitlist();
  };
}

function renderInterest() {
  const choices = [
    "Dejar de forzarme.",
    "Aprender a guiarme con la luna.",
    "Soltar lo que pesa.",
    "Manifestar con más claridad.",
    "Escuchar más mi cuerpo.",
    "Guiarme con la luna.",
    "Hacer rituales simples.",
    "Escuchar mi intuición.",
    "No sé todavía, pero me interesa.",
  ];
  app.innerHTML = panel(`
    <h2>¿Qué te gustaría trabajar primero?</h2>
    <p class="body-copy">Esto nos ayuda a saber qué incluir si abrimos el círculo privado.</p>
    <div class="choice-grid">
      ${choices.map((choice) => `<button data-interest="${choice}">${choice}</button>`).join("")}
    </div>
  `, true);
  document.querySelectorAll("[data-interest]").forEach((button) => {
    button.onclick = () => {
      state.interestTopic = button.dataset.interest;
      trackEvent(eventNames.interestSelected);
      state.waitlistStep = "pilot";
      renderWaitlist();
    };
  });
}

function renderPilot() {
  const choices = ["Sí, quiero precio y fechas.", "Tal vez, quiero ver más.", "No por ahora."];
  app.innerHTML = panel(`
    <h2>¿Quieres recibir la invitación primero?</h2>
    <p class="body-copy">Si abrimos el primer círculo privado, avisaremos antes por WhatsApp que por redes.</p>
    <div class="choice-grid">
      ${choices.map((choice) => `<button data-pilot="${choice}">${choice}</button>`).join("")}
    </div>
  `, true);
  document.querySelectorAll("[data-pilot]").forEach((button) => {
    button.onclick = () => {
      state.pilotInterest = button.dataset.pilot;
      trackEvent(eventNames.pilotSelected);
      state.waitlistStep = "done";
      renderWaitlist();
    };
  });
}

function renderWaitlistDone() {
  const yesCopy = state.pilotInterest === "Sí, quiero precio y fechas.";
  const maybeCopy = state.pilotInterest === "Tal vez, quiero ver más.";

  if (yesCopy || maybeCopy) {
    const content = yesCopy
      ? {
          title: "Entra al grupo privado.",
          text: "Ahí vamos a avisar primero cuándo abre el círculo, cuánto cuesta y cuántos cupos habrá. La invitación saldrá por WhatsApp antes de publicarla en redes.",
          card: "Si quieres ser de las primeras, entra ahora. Ese será el único lugar donde avisaremos primero.",
          cta: "Entrar al grupo privado de WhatsApp",
        }
      : {
          title: "Mira primero si es para ti.",
          text: "Vamos a compartir por WhatsApp qué incluirá el círculo, cómo funcionará, fechas, precio y para quién tiene sentido entrar. Si después sientes que no es tu momento, no pasa nada.",
          card: "La información completa saldrá primero en el grupo privado. Después decidiremos qué se publica en redes.",
          cta: "Ver la información en WhatsApp",
        };

    app.innerHTML = panel(`
      <h2>${content.title}</h2>
      <p class="body-copy">${content.text}</p>
      <div class="resource-card">
        <p class="body-copy">${content.card}</p>
      </div>
      <div class="stack">
        <button class="primary-btn" id="openPrivateGroup">${content.cta}</button>
        <button class="secondary-btn" id="closeReading">Cerrar mi lectura</button>
      </div>
    `, true);
    document.getElementById("openPrivateGroup").onclick = () => {
      state.whatsappGroupClicked = true;
      state.whatsappGroupClickedAt = new Date().toISOString();
      trackEvent(eventNames.privateGroupClicked, { pilot_path: yesCopy ? "yes" : "maybe" });
      if (WHATSAPP_PRIVATE_GROUP_URL) {
        window.open(WHATSAPP_PRIVATE_GROUP_URL, "_blank", "noopener,noreferrer");
        return;
      }
      window.alert("Todavía falta pegar aquí el enlace real del grupo privado de WhatsApp.");
    };
    document.getElementById("closeReading").onclick = () => setScreen("closing");
    return;
  }

  app.innerHTML = panel(`
    <h2>Gracias por decirnos.</h2>
    <p class="body-copy">El grupo privado será solo para quienes sí quieren recibir primero la invitación, fechas, precio y cupos del círculo.</p>
    <p class="body-copy">Si este no es tu momento, está bien. Quédate con tu lectura y vuelve a tu guía cuando la necesites.</p>
    <div class="resource-card">
      <p class="body-copy">Tal vez este ciclo era solo para mirar algo. Otro será para entrar más profundo.</p>
    </div>
    <button class="primary-btn" id="closeReading">Cerrar mi lectura</button>
  `, true);
  document.getElementById("closeReading").onclick = () => setScreen("closing");
}

function renderClosing() {
  markScreen("closing", eventNames.closingViewed);
  markScreen("complete", eventNames.completed);
  app.innerHTML = panel(`
    <p class="eyebrow">Cierre del ritual</p>
    <h2>Vuelve a tu brújula cada mes</h2>
    <p class="body-copy">Tu luna interna puede cambiar. Por eso esta experiencia no es para hacerla una sola vez, sino para volver cuando empiece otro ciclo, cuando algo se mueva en ti o cuando necesites mirarte con más claridad.</p>
    <div class="mirror">¿qué fase estoy viviendo ahora?</div>
    <p class="body-copy">Hoy te llevas tu carta lunar y tu guía ritual para trabajar la próxima luna.</p>
    <img class="brand-wordmark footer-wordmark" src="${brand.wordmark}" alt="Nadia Hazte Caso" />
    <div class="stack">
      <button class="primary-btn" id="backGuide">Volver a mi guía</button>
      <button class="secondary-btn" id="backCard">Ver mi carta otra vez</button>
      <button class="ghost-btn" id="restart">Cerrar mi lectura</button>
    </div>
    <p class="small-note">Guarda tu carta. Trabaja tu guía. Y cuando llegue un nuevo mes, vuelve a mirar tu luna interna.</p>
    <p class="eyebrow">Hazte caso.</p>
  `, true);
  document.getElementById("backGuide").onclick = () => setScreen("guide");
  document.getElementById("backCard").onclick = () => setScreen("card");
  document.getElementById("restart").onclick = () => window.location.reload();
}

function currentResult() {
  return lunarResults[state.result.resultId];
}

function escapeAttr(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

render();
