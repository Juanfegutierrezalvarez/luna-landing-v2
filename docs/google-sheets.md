# Google Sheets para Luna Landing V2

La fuente operativa desde ahora es una sola hoja:

- `Usuarios V4`

Una fila representa un intento de una usuaria en la landing. Si la usuaria vuelve desde el mismo navegador, conserva el mismo `usuario_id`, pero se crea otro `intento_id`.

## Columnas

- `fecha_entrada`
- `ultima_actualizacion`
- `usuario_id`
- `intento_id`
- `nombre`
- `email`
- `whatsapp`
- `dejo_contacto`
- `llego_a_whatsapp`
- `fecha_whatsapp`
- `senales_respondidas`
- `ritual_completo`
- `resultado_id`
- `resultado_fase`
- `resultado_nombre`
- `confianza`
- `senal_1`
- `senal_2`
- `senal_3`
- `senal_4`
- `senal_5`
- `senal_6`
- `senal_7`
- `url_origen`

## Como se actualiza la fila

- Al entrar a la landing se crea una fila con `usuario_id` e `intento_id`.
- Cada respuesta llena o actualiza `senal_1` a `senal_7` en esa misma fila.
- Al terminar el ritual se llenan resultado y confianza.
- Al dejar contacto se llenan nombre, correo y WhatsApp.
- Al tocar el boton de WhatsApp se marca `llego_a_whatsapp`.

Las hojas anteriores quedan como historico parcial. Se pueden ocultar para evitar ruido.
