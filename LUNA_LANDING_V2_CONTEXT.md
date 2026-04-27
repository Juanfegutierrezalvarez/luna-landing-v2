# Luna Landing V2 - Contexto para actualizar conocimiento

Este documento resume el estado actual de la version 2 de la landing **La Luna que Estas Viviendo**, para que un GPT que ya conocia V1 pueda actualizar su conocimiento sin tener que inferirlo desde cero.

## Estado del proyecto

- Proyecto original en GitHub: `Juanfegutierrezalvarez/luna-landing`.
- Rama/copia de trabajo V2: `codex/luna-landing-v2`.
- Carpeta local V2: `luna-landing-v2`.
- El original `main` debe permanecer quieto hasta que se decida subir cambios.
- La V2 local ya corre en `http://127.0.0.1:4173`.
- El build local funciona con `node scripts/build.mjs` y genera `dist/`.

## Objetivo principal de V2

V1 tenia buena estructura ritual, pero el feedback mostro tres problemas:

1. El quiz se sentia largo.
2. Algunas preguntas/opciones sonaban genericas o muy parecidas entre si.
3. Muchas usuarias llegaban hasta la pantalla de la carta lunar y no seguian hacia la guia / WhatsApp.

V2 busca:

- Reducir friccion.
- Hacer que la usuaria se sienta mas vista, leida y comprendida.
- Finalizar la experiencia en la pantalla de la carta.
- Convertir desde esa misma pantalla hacia el grupo privado de WhatsApp, donde se entrega la guia lunar.

## Flujo actual

1. Landing inicial.
2. Pantalla "Lo que vas a descubrir".
3. Transicion breve.
4. Quiz de 7 senales.
5. Captura de datos.
6. Reveal / resultado lunar.
7. Carta lunar compartible.
8. Bloque final de conversion hacia WhatsApp.
9. Cierre mensual separado debajo del bloque de WhatsApp.

La pantalla de guia descargable que existia antes ya no debe funcionar como paso principal despues de la carta. La guia se promete y entrega en WhatsApp.

## Landing e introduccion

La landing ahora dice:

- "Responde 7 senales..."

La pantalla "Lo que vas a descubrir" fue reescrita para despertar mas deseo. La promesa actual es:

- La fase lunar que revela que se esta moviendo dentro de la usuaria.
- Una frase para nombrar algo que tal vez venia sintiendo sin poder explicarlo.
- Una practica simple para bajar la lectura al cuerpo.
- Acceso a la guia paso a paso para trabajar la Luna Llena en Escorpio del 1 de mayo.

El tono debe ser intimo, emocional y especifico. No debe sonar a venta agresiva.

## Quiz V2

El quiz paso de 9 a 7 preguntas.

Principio de diseno:

- Las preguntas deben sentirse como escenas internas, no como categorias abstractas.
- Las opciones deben ser claramente distintas entre si.
- Cada opcion debe revelar una tension personal: deseo, miedo, verdad incomoda, carga, cierre, decision, integracion.
- El scoring lunar se mantiene por pesos internos.

Preguntas actuales:

1. "Cuando nadie te esta mirando, que parte de ti se siente mas presente estos dias?"
2. "Que situacion te esta ocupando mas espacio mental ultimamente?"
3. "Cuando el dia se pone pesado, cual es tu movimiento mas automatico?"
4. "Si fueras brutalmente honesta contigo, que admitirias hoy?"
5. "Que te cuesta pedir o darte permiso de pedir?"
6. "Si esta semana hicieras un solo movimiento honesto, cual seria?"
7. "Que frase te daria alivio escuchar de verdad ahora mismo?"

Se dejo un solo hito intermedio:

- Despues de la senal 4.
- Texto: "Ya hay un patron tomando forma."
- Body: "Sigue. Tu luna esta juntando las partes que si hablan de ti."

## Resultados y lectura

Antes la seccion de resultado tenia una **Lectura profunda** dividida en 3 tarjetas numeradas.

Eso se elimino porque el feedback indico que no gustaba. Ahora hay una sola seccion llamada:

**Tu Lectura**

Esta seccion:

- Une las tres ideas anteriores en una lectura corrida.
- Usa la fase final.
- Integra senales del patron de respuestas, incluyendo resultado principal y secundario.
- No debe decir de forma obvia "respondiste X".
- Debe sentirse interpretativa, no como plantilla generica.

La logica esta en `buildPersonalReading(result)`.

Hay un diccionario `personalSignalCopy` que convierte fases lunares en senales interpretativas, por ejemplo:

- `new_moon`: "una parte tuya que necesita silencio antes de nombrar lo que quiere nacer"
- `first_quarter`: "un impulso de moverte sin esperar a sentirte completamente segura"
- `last_quarter`: "una carga que pide limite, alivio o menos peso sobre tus hombros"

La lectura une:

1. Patron de senales.
2. Los textos del resultado lunar.
3. Un cierre que evita sonar determinista.

Frase clave de enfoque:

> "Tu luna interna no es una sentencia. Es una forma de escucharte mejor."

## Carta lunar

La carta compartible sigue existiendo, pero ahora funciona como el cierre principal de la experiencia.

Cambios aplicados:

- Dentro de la carta, donde decia "La Luna que Estas Viviendo", ahora dice:
  **"Tu luna hoy es"**
- Esto aplica solo al resultado/carta de la usuaria, no a toda la marca ni a todos los titulos.
- Tambien se cambio el texto usado al compartir y en la imagen generada.

Botones:

- "Guardar"
- "Compartir"

Se hicieron mas pequenos, convencionales y secundarios. No deben competir con el CTA de WhatsApp.

## Conversion hacia WhatsApp

Antes habia un boton neutro: "Guia de la proxima luna".

Ahora, debajo de los botones de guardar/compartir, hay un bloque comercial/emocional sobre:

**Luna Llena en Escorpio - 1 de mayo**

Copy actual del bloque:

- "Tu lectura no termina aqui."
- La proxima luna viene a mover lo que ya no puedes seguir maquillando: emociones, apegos, verdades incomodas y cierres pendientes.
- Se preparo una guia ritual con escritura, cuerpo y cierre emocional.
- La guia se entrega dentro del grupo privado de WhatsApp antes del 1 de mayo.

CTA principal:

**"Quiero recibir mi guia lunar"**

Microcopy debajo del CTA:

**"Entras al grupo privado y ahi recibiras tu primera guia de luna."**

Ese microcopy se debe conservar porque refuerza la promesa directa.

El enlace actual del grupo de WhatsApp esta configurado en `config.js`:

`https://chat.whatsapp.com/F9la8u70v9CFr4yAGbIXDh`

Si se despliega en Vercel, lo ideal es revisar si se usara variable de entorno `WHATSAPP_PRIVATE_GROUP_URL` o el valor de `config.js`.

## Cierre mensual

Debajo del bloque de WhatsApp, fuera del recuadro comercial, hay una nueva seccion separada.

Objetivo:

- Recuperar la idea de que puede volver a la lectura una vez al mes.
- No interrumpir el CTA a WhatsApp.
- No competir con el microcopy debajo del boton.

Texto actual:

- "Vuelve a tu brujula"
- "Esta lectura puede cambiar contigo."
- "Guarda tu carta y vuelve a hacer este ritual cuando empiece otro ciclo, cuando algo se mueva en ti o cuando necesites mirarte con mas claridad."
- "Tu luna interna no es una sentencia. Es una forma de escucharte mejor, una vez al mes, desde el lugar donde estes."

## Tono de V2

El tono correcto es:

- Intimo.
- Especifico.
- Sensible.
- Persuasivo sin presionar.
- Comercial solo cuando tiene sentido.
- Mas "te estoy leyendo" que "te estoy vendiendo".

Evitar:

- Urgencia falsa.
- "Cupos limitados" si no es real.
- Lenguaje demasiado generico como "conecta con tu energia".
- Opciones de quiz demasiado parecidas.
- Repetir literalmente las respuestas de la usuaria en la lectura como si eso fuera personalizacion.

## Arquitectura tecnica

El proyecto es una landing estatica sin dependencias externas.

Archivos principales:

- `index.html`
- `styles.css`
- `app.js`
- `config.js`
- `scripts/build.mjs`
- `scripts/serve.mjs`
- `vercel.json`

Assets relevantes:

- `assets/brand/dots_triangle_topbig_black.png`
- `assets/brand/nadia_wordmark_black.png`
- `assets/downloads/tu-guia-lunar-escorpio-01-05-2026.pdf`

Comandos:

```bash
node scripts/serve.mjs .
node scripts/build.mjs
node scripts/serve.mjs dist
```

## Pendientes antes de publicar

- Revisar el flujo completo manualmente en desktop/mobile.
- Confirmar si se suben cambios a `codex/luna-landing-v2` o si se crea repo/proyecto separado.
- Confirmar estrategia de Vercel: preview de rama o proyecto independiente V2.
- Validar que el enlace de WhatsApp abra correctamente desde el CTA.
- Validar que la imagen de carta descargable siga generandose bien despues del cambio de texto.
- Decidir si el formulario de captura sigue siendo necesario antes del resultado, dado que ahora la conversion principal es WhatsApp.

