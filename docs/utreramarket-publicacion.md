# Publicación y recuperación de UtreraMarket

## Antes de autorizar

- Confirmar que el despliegue actual de producción sigue siendo el identificado durante la revisión. El despliegue consultado fue `dpl_36KMd71SzSJP5NY7ekwbqRCx8Ju6`, commit `18a779bfaac06acfa8968ddb4699ddaf0e0830be`.
- Verificar la copia de seguridad disponible de Supabase y el historial de migraciones. Comprobar que existen `public.comercios_utrera(id)` y `public.es_admin_comercios_utrera()`.
- Identificar las fichas que deben participar y el material autorizado. La primera activación se hace desde el administrador habitual. Los datos locales del preview quedan fuera de la publicación.
- Mantener `REACT_APP_UTRERAMARKET_PREVIEW` y `REACT_APP_UTRERAMARKET_HOSTED_PREVIEW` desactivadas en producción.

## Después de autorizar

1. Aplicar únicamente las tres migraciones de UtreraMarket, en orden, mediante el procedimiento habitual de Supabase. Si el historial difiere, detener la aplicación y reconciliarlo antes de seguir.
   - `20261126120000_utreramarket.sql`
   - `20261126143000_utreramarket_patrocinio.sql`
   - `20261126170000_utreramarket_promociones.sql`
2. Comprobar lectura anónima de contenido visible y escritura solo con el permiso administrativo existente. Comprobar que el proyecto expone estas tablas a su API de datos.
3. Preparar el despliegue de la rama con `REACT_APP_UTRERAMARKET=true` y las variables vigentes de UtrerApp. Revisar la portada, Conso, los servicios y el administrador antes de promoverlo a producción.
4. Activar desde el administrador solo los comercios, promociones, campañas y patrocinios acordados. Para el iframe, registrar la autorización y la compatibilidad de cada URL. Confirmar la apertura externa de las demás webs.

## Recuperación

- Si falla una migración, su transacción revierte los cambios de ese archivo. Identificar las migraciones anteriores que sí quedaron aplicadas antes de reintentar.
- Si falla la aplicación publicada, restaurar el despliegue de producción anterior o recompilar con `REACT_APP_UTRERAMARKET` desactivada. Verificar portada, acceso a servicios y panel.
- Dejar las tablas nuevas en su sitio al revertir la aplicación. La versión anterior no depende de ellas y así se preservan los datos registrados. Cualquier corrección de esquema debe hacerse con una migración posterior, tras revisar la copia de seguridad.

[Documentación de recuperación de despliegues](https://vercel.com/docs/instant-rollback)
