# Publicación del Teatro Enrique de la Cuadra

La aplicación de producción es UtrerApp en Vercel y el destino Supabase es `gzvybwvrkplbipkzkjwg`. La prueba aislada usa `bkpusgqsatyymqbisjcv`. El despliegue base probado en producción se construyó desde `fc3f2d5030fe5fbcc1dfed0873e9adff1843f839`.

## Tras recibir autorización

1. Confirmar el destino, el estado de producción y la ausencia de colisiones. Registrar el despliegue de Vercel vigente, las políticas existentes de Storage y el valor previo (incluida su ausencia) de `app_metadata.cultural_editor` de la cuenta administradora confirmada. Conservar ese respaldo de alcance reducido fuera de GitHub. La migración no modifica filas existentes ni objetos físicos de Storage.
2. Aplicar `supabase/migrations/20261125163000_programacion_teatro.sql` en la transacción incluida. Contiene únicamente DDL, permisos para los objetos nuevos y el alta del bucket privado y vacío. Comprobar que las tres tablas y el bucket están vacíos y que se mantienen las políticas preexistentes.
3. En una operación separada, conceder `app_metadata.cultural_editor=true` únicamente a la cuenta actual del administrador confirmado y miembro de `admin_comercios_utrera`. Identificarla de forma inequívoca y conservar los demás metadatos. Renovar la sesión para que el JWT refleje el permiso. El gestor usa esa misma sesión.
4. Configurar en Vercel para Production la URL y la clave publicable de ese mismo Supabase en `REACT_APP_CULTURA_SUPABASE_URL` y `REACT_APP_CULTURA_SUPABASE_ANON_KEY`, y habilitar `REACT_APP_TEATRO_PUBLICADO=true`. No usar una clave administrativa ni valores del proyecto de pruebas. Publicar solo desde una comparación actualizada con main.
5. Comprobar el despliegue, la ruta /admin, el permiso de editor, la ruta pública y su estado vacío inicial usando solo lecturas. El primer espectáculo real se crea desde Agenda.

## Reversión

Una migración fallida se revierte dentro de su transacción. Tras confirmarla, la reversión de la aplicación consiste en volver al despliegue base vigente y retirar el indicador de activación en Vercel.

Si hace falta aislar también los datos culturales, revocar la ejecución de `guardar_programacion_teatro(jsonb,bigint,jsonb,jsonb,uuid[])` a `authenticated` y añadir políticas restrictivas de lectura para anon y authenticated en las tres tablas culturales. Añadir a storage.objects políticas restrictivas de lectura e inserción limitadas a impedir el uso de `carteles-cultura`. Mantener disponibles los demás buckets. Restaurar exclusivamente el valor previo de `cultural_editor` en la cuenta a la que se concedió. Conservar las tablas, el historial y los carteles. Los enlaces a imágenes ya firmados vencen en un máximo de cinco minutos.
