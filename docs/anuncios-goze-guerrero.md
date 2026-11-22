# Goze Garito Gourmet y Automóviles Guerrero

La rama `revision/anuncios-goze-guerrero` reúne las dos fichas aprobadas. Su despliegue automático está deshabilitado. Las fichas se habilitan con `REACT_APP_ANUNCIOS_COMERCIALES=true` al compilar. Goze se busca en **Hostelería** y Guerrero en **Motor**.

## Qué permite el panel actual

| Requisito | Panel / Supabase actual | Código de esta rama |
| --- | --- | --- |
| Goze en Hostelería, portada, texto, teléfono, dirección, Instagram y galería | La tabla `public.comercios_utrera` admite esos campos. El panel tiene un formulario de ficha normal y sube medios al bucket `comercios`. Una fila nueva aparecería en la guía con la plantilla estándar. | Goze usa el mismo escaparate que La Chana y Bar Alonsi, con «Cómo llegar». |
| Guerrero como ficha básica | Supabase admite una fila con nombre, texto, portada, teléfono, web y galería. La categoría se guarda como texto y el formulario actual carece de la opción Motor. | Añade el filtro Motor a la guía con Guerrero como primer anunciante. |
| Seis vehículos con fotos, enlaces individuales y carrusel táctil | El campo de galería almacena una lista de imágenes. El panel actual no gestiona enlaces por imagen ni una lista de vehículos. | Reutiliza el carrusel de la aplicación con deslizamiento, controles, indicadores y seis enlaces oficiales. |

La guía lee `public.comercios_utrera` mediante el cliente de Supabase. El formulario del panel desbloquea la interfaz con un PIN y usa ese mismo cliente para insertar. Las políticas de inserción de producción que se revisaron corresponden al rol `authenticated`, de modo que el PIN por sí solo no permite guardar si el navegador no tiene una sesión de Supabase. El alta directa mediante una sesión autorizada de Supabase es viable para los datos de una ficha básica. No se hicieron escrituras, subidas a Storage ni pruebas de alta en producción.

Los registros de La Chana y Bar Alonsi conservan sus identificadores y su selección de escaparate. Los dos anuncios nuevos viven en `frontend/src/lib/anunciosComerciales.js`. Evita darlos de alta en paralelo con el mismo nombre en Supabase: si ya existe un registro homónimo en la base, la guía conserva ese registro en vez de mostrar una segunda ficha.

## Antes de publicar

1. Confirma la cobertura del alojamiento para anuncios comerciales sin gasto adicional. La autorización para publicar no está incluida en esta revisión de rama.
2. Comprueba en un entorno autorizado la presentación en navegador de móvil y escritorio, incluida una prueba del gesto táctil y de los destinos externos. La compilación y las comprobaciones DOM verifican la apertura de las fichas y los controles, pero no reproducen un gesto en un dispositivo real.
3. Revisa que sigan vigentes los seis enlaces del concesionario. La lista se actualiza en `anunciosComerciales.js`.
4. Tras autorizar la publicación, integra la rama en `main` y habilita `REACT_APP_ANUNCIOS_COMERCIALES=true` en la compilación de producción aprobada. Las variables `REACT_APP_SUPABASE_TEST_URL` y `REACT_APP_SUPABASE_TEST_KEY` se reservan para pruebas. No se necesitan migraciones ni inserciones. Registra el despliegue vigente antes de la publicación para poder revertir.
