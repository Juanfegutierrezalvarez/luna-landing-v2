# Google Sheets para Luna Landing V2

Esta version deja de intentar reparar las pestanas antiguas. `Personas`, `Leads` y `Eventos` quedan como historico parcial, pero no deben usarse como fuente de verdad porque la captura anterior ya venia incompleta.

Desde ahora la captura correcta vive en tres pestanas nuevas y aisladas:

- `Sesiones V3`: cada avance importante de una sesion, incluso si la usuaria no deja contacto.
- `Respuestas V3`: una fila por cada respuesta a las 7 senales, relacionada por `session_id`.
- `Contactos V3`: solo momentos comerciales claros: cuando deja datos o cuando toca el boton para entrar a WhatsApp.

## Que se guarda

La landing solo envia al Google Sheet estos eventos:

- `signal_answered`: cada vez que responde una senal.
- `signal_flow_completed`: cuando responde las 7 senales y ya existe resultado.
- `lead_submitted`: cuando deja nombre, correo o WhatsApp.
- `whatsapp_private_group_clicked`: cuando toca el boton para entrar al grupo.

Esto permite analizar patrones aunque la persona abandone antes de dejar datos.

## Por que se cambio

El sistema anterior no servia como base confiable para el negocio:

- habia filas historicas incompletas;
- muchas usuarias pudieron entrar antes de que el webhook o Vercel estuvieran estables;
- `Personas` y `Leads` mezclaban sesiones anonimas, contactos y resultados;
- algunas filas se actualizaban sobre la misma sesion, lo que hacia dificil auditar el recorrido;
- WhatsApp no puede reconstruirse hacia atras si el clic no fue guardado en el momento.

La version V3 es mas simple: escribe hacia adelante, separa sesiones/respuestas/contactos y usa `LockService` para evitar choques si varias personas responden al mismo tiempo. No reescribe respuestas antiguas; todo se relaciona por `session_id`.

## Estructura

`Sesiones V3` incluye:

- fecha de recepcion,
- `session_id`,
- checkpoint de avance,
- numero de respuestas,
- ultima senal respondida,
- si completo el ritual,
- estado de contacto,
- datos de contacto si existen,
- resultado lunar,
- confianza del resultado,
- si hizo clic a WhatsApp,
- URL de origen.

`Respuestas V3` incluye:

- fecha de recepcion,
- `session_id`,
- numero de pregunta,
- pregunta,
- respuesta,
- fase principal asociada,
- pesos de la respuesta,
- URL de origen.

El resultado y el contacto no se duplican aqui para mantener la hoja liviana. Se cruzan con `Sesiones V3` y `Contactos V3` usando `session_id`.

`Contactos V3` incluye:

- fecha de recepcion,
- `session_id`,
- tipo de evento: `lead_submitted` o `whatsapp_clicked`,
- nombre, correo y WhatsApp si existen,
- resultado lunar,
- fecha del clic a WhatsApp si aplica,
- URL de origen.

## Instalacion

1. Abre el Google Sheet de Luna Landing V2.
2. Ve a `Extensiones > Apps Script`.
3. Reemplaza todo el codigo por `integrations/google-sheets-webhook.gs`.
4. Guarda.
5. Ejecuta `setup`.
6. Acepta permisos si Google los pide.
7. Ve a `Implementar > Gestionar implementaciones`.
8. Edita la implementacion web actual.
9. Crea una nueva version.
10. Mantén:
    - `Ejecutar como`: `Yo`.
    - `Quien tiene acceso`: `Cualquier persona`.
11. Actualiza la implementacion.

La URL del webhook no deberia cambiar si actualizas la implementacion existente.

Al abrir la URL del webhook debe verse este mensaje:

```json
{"ok":true,"message":"Webhook Luna Landing V2 listo. Guarda Sesiones V3, Respuestas V3 y Contactos V3."}
```

## Prueba

1. Abre `https://luna-landing-v2.vercel.app`.
2. Responde una senal.
3. Revisa que aparezca una fila en `Sesiones V3` y una fila en `Respuestas V3`.
4. Completa las 7 senales.
5. Revisa que `Sesiones V3` tenga un checkpoint `quiz_completed`.
6. Deja un contacto de prueba.
7. Revisa que `Contactos V3` tenga una fila `lead_submitted`.
8. Toca el boton de WhatsApp.
9. Revisa que `Contactos V3` tenga una fila `whatsapp_clicked`.

## Nota importante

No se deben borrar ni restaurar las pestanas viejas como parte del arreglo. La fuente confiable empieza desde `Sesiones V3`, `Respuestas V3` y `Contactos V3` despues de implementar esta version del Apps Script y redesplegar Vercel. A partir de ese momento, cada nueva respuesta queda registrada aunque la usuaria no deje datos de contacto.
