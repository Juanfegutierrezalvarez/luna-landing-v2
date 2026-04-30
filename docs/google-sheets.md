# Google Sheets para Luna Landing V2

Esta version guarda solo lo que hoy sirve para negocio y analisis:

- `Personas V2`: una fila por sesion/persona, incluso si no dejo datos de contacto.
- `Respuestas V2`: una fila por cada respuesta del ritual, relacionada con la persona.

No guarda una pestana de eventos. La landing solo envia al Sheet:

- `lead_submitted`: cuando la usuaria deja nombre/correo/WhatsApp.
- `whatsapp_private_group_clicked`: cuando toca el boton para entrar al grupo.
- `signal_answered`: cada vez que responde una senal.
- `signal_flow_completed`: cuando responde las 7 senales y ya existe resultado.

## Por que se cambio

La version anterior podia sentirse como si borrara datos porque `Personas` se actualizaba calculando la ultima fila disponible. Si varias usuarias enviaban datos al mismo tiempo, dos escrituras podian intentar usar la misma fila. Esta version usa `LockService`, que pone una fila en espera mientras otra termina de escribirse.

Tambien se redujo el volumen: ya no se mandan todos los eventos del recorrido al Google Sheet. Solo guardamos respuestas, sesiones con resultado, contactos y clics de WhatsApp.

## Estructura

`Personas V2` incluye:

- `session_id`,
- estado de contacto: `anonymous` o `contact`,
- datos de contacto,
- resultado lunar,
- nivel de confianza,
- cuantas senales respondio,
- ultima senal respondida,
- si hizo clic para entrar al grupo de WhatsApp,
- fecha del clic,
- enlace de origen.

`Respuestas V2` incluye:

- `session_id` relacionado,
- estado de contacto,
- pregunta,
- respuesta,
- fase principal asociada,
- pesos de la respuesta,
- resultado final.

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

## Prueba

1. Abre `https://luna-landing-v2.vercel.app`.
2. Responde 2 o 3 senales y revisa que aparezca una fila `anonymous` en `Personas V2`.
3. Revisa que `Respuestas V2` tenga una fila por cada senal respondida.
4. Completa las 7 senales sin dejar datos todavia.
5. Revisa que esa misma sesion tenga `answers_count = 7` y `quiz_completed = TRUE`.
6. Ahora deja un correo de prueba.
7. Entra al grupo de WhatsApp desde el boton.
8. Revisa:
   - `Personas V2`: debe seguir existiendo una sola fila para esa sesion.
   - `contact_status`: debe pasar de `anonymous` a `contact`.
   - `whatsapp_group_clicked`: debe estar en `TRUE`.
   - `Respuestas V2`: deben mantenerse 7 filas, ahora con nombre/correo si se capturaron.
