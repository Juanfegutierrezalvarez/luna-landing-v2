# Google Sheets para Luna Landing V2

Este setup guarda los datos de la landing en un Google Sheet con cuatro pestanas:

- `Personas`: una fila por persona. Es la vista limpia para seguimiento.
- `Leads`: una fila cada vez que alguien deja sus datos.
- `Respuestas`: todas las respuestas del quiz, una fila por respuesta.
- `Eventos`: todo el recorrido de la usuaria para revisar abandono y conversion.

Nota importante: WhatsApp no confirma desde fuera si una persona acepto entrar al grupo. La columna `whatsapp_group_clicked` marca si hizo clic en el boton para entrar a WhatsApp.

## 1. Crear el Google Sheet

1. Crea un Google Sheet llamado `Luna Landing V2 - Datos`.
2. Ve a `Extensiones > Apps Script`.
3. Borra el contenido inicial.
4. Pega el contenido de `integrations/google-sheets-webhook.gs`.
5. Guarda el proyecto.
6. Ejecuta la funcion `setup`.
7. Acepta permisos.

El script crea estas pestanas automaticamente: `Personas`, `Leads`, `Respuestas` y `Eventos`.

## 2. Publicar el webhook

1. En Apps Script, ve a `Deploy > New deployment`.
2. Tipo: `Web app`.
3. Configura:
   - `Execute as`: `Me`.
   - `Who has access`: `Anyone`.
4. Haz deploy.
5. Copia la `Web app URL`.

## 3. Conectar Vercel

En Vercel, abre el proyecto `luna-landing-v2`:

1. Ve a `Settings > Environment Variables`.
2. Crea esta variable:

```text
LUNA_WEBHOOK_URL
```

3. Pega como valor la `Web app URL` de Apps Script.
4. Asegurate de activarla en `Production`, `Preview` y `Development`.
5. Guarda y redeploya.

## 4. Probar

1. Abre `https://luna-landing-v2.vercel.app`.
2. Completa la experiencia hasta dejar nombre y correo.
3. Entra al grupo con el boton de WhatsApp.
4. Revisa el Google Sheet:
   - En `Personas`, la persona debe aparecer una sola vez.
   - `whatsapp_group_clicked` debe quedar en `TRUE`.
   - `whatsapp_group_clicked_at` debe tener fecha/hora.
   - En `Respuestas`, deben aparecer las 7 respuestas.
   - En `Eventos`, debe aparecer el recorrido completo.
