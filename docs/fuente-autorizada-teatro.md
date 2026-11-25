# Fuente autorizada de programación del Teatro

En Preview, `REACT_APP_TEATRO_FUENTE_AUTORIZADA` puede apuntar a un servicio HTTPS autorizado por el titular. Sin esa variable, la interfaz permite la carga por texto y la edición manual. La URL configurada es pública y no puede contener credenciales. Para una fuente privada, conectar un adaptador de servidor que gestione las credenciales.

El servicio recibe el identificador de Giglon en el parámetro `evento` y devuelve JSON con `id`, `titulo`, `lugar`, `direccion`, `descripcion`, `cartel` y `pases`. Cada pase incluye `fecha` ISO, `hora` en HH:mm, `tipoPrecio` (pago, desde, gratis o desconocido), `precio` como cadena decimal si se conoce y `compra` como enlace de Giglon si es específico del pase. El identificador devuelto debe coincidir con el solicitado. La sinopsis y el cartel solo se incluyen si la autorización los cubre. El cartel debe servirse desde el mismo origen, como PNG, JPEG o WebP de hasta 750 KB. El servicio debe permitir GET desde el origen del Preview mediante CORS y devolver los recursos directamente.

La interfaz abre una propuesta editable. La carga del fichero en Storage ocurre al guardar el borrador. La publicación se realiza por separado.

Aplicar `supabase/migrations/20261125190000_teatro_precio_desde.sql` antes de desplegar una versión que lea la nueva columna. La migración conserva los importes anteriores como precios fijos o no confirmados. Los clientes anteriores conservan la marca si editan un pase sin cambiar su importe. Para revertir el despliegue, volver primero al código anterior y conservar la columna y los importes guardados.
