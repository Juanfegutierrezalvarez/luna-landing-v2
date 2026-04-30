# Google Sheets para Luna Landing V2

Esta version guarda solo lo que hoy sirve para negocio y analisis:

- `Personas V2`: una fila por persona que dejo sus datos o entro a WhatsApp.
- `Respuestas V2`: una fila por cada respuesta del ritual, relacionada con la persona.

No guarda una pestana de eventos. La landing solo envia al Sheet:

- `lead_submitted`: cuando la usuaria deja nombre/correo/WhatsApp.
- `whatsapp_private_group_clicked`: cuando toca el boton para entrar al grupo.

## Por que se cambio

La version anterior podia sentirse como si borrara datos porque `Personas` se actualizaba calculando la ultima fila disponible. Si varias usuarias enviaban datos al mismo tiempo, dos escrituras podian intentar usar la misma fila. Esta version usa `LockService`, que pone una fila en espera mientras otra termina de escribirse.

Tambien se redujo el volumen: ya no se mandan todos los eventos del recorrido al Google Sheet.

## Estructura

`Personas V2` incluye:

- datos de contacto,
- resultado lunar,
- nivel de confianza,
- si hizo clic para entrar al grupo de WhatsApp,
- fecha del clic,
- enlace de origen,
- `session_id`.

`Respuestas V2` incluye:

- persona relacionada,
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
2. Completa el ritual con un correo de prueba.
3. Entra al grupo de WhatsApp desde el boton.
4. Revisa:
   - `Personas V2`: debe aparecer una fila.
   - `whatsapp_group_clicked`: debe estar en `TRUE`.
   - `Respuestas V2`: deben aparecer 7 filas asociadas a esa persona.
