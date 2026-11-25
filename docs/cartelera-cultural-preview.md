# Cartelera cultural de UtrerApp
## Alcance del Preview
El prototipo utiliza un repositorio local con tres espectáculos ficticios. El panel existente controla el acceso al módulo de edición. Guardar o publicar cambia solo este navegador. La cartelera y Conso leen el mismo repositorio. La compra se muestra como demostración y el acceso actual a Giglon se conserva en Agenda.

## Base de datos propuesta
La auditoría de solo lectura no encontró una tabla pública dedicada a programación cultural. La propuesta SQL separa la ficha editorial de sus funciones, así cada pase puede tener su propio precio, fecha, enlace y estado. RLS concede lectura de publicaciones al público y limita escrituras a una atribución de rol asignada por el servidor. No ejecutar el SQL en producción hasta aprobar los permisos, auditar las políticas en un entorno aislado y cerrar la publicación segura de carteles. Los borradores de importaciones conservarían la referencia del proveedor. Una actualización externa debe compararse con la versión publicada y pasar por revisión antes de sustituirla.

## Giglon
Está documentada una pasarela para webs de promotores. No se verificó un feed autorizado para el recinto ni condiciones que habiliten la extracción y reutilización de textos y carteles. Pedir a Giglon un endpoint o exportación autorizada, credenciales de solo lectura, alcance de los derechos de imagen, condiciones, coste y entorno de prueba. Emplear ID de evento y de función, fecha de modificación y estado explícito para proponer altas, cambios y cancelaciones. La ausencia de una función en una respuesta incompleta no indica cancelación.

Si solo se dispone de enlaces oficiales, introducirlos manualmente y ofrecer navegación voluntaria al espectáculo en otra pestaña. Conservar UtrerApp abierta. La agenda debe poder consultarse aunque Giglon esté caído. Antes de activar la pasarela, validar consentimiento, rechazo persistente, regreso, selección de butacas y navegación hasta el pago en Android, iPhone y PWA instalada.

## Operación y costes
El Preview no llama a OpenAI para resolver consultas culturales ni usa nuevos servicios. La futura sincronización leerá únicamente la fuente autorizada desde el servidor, con caché, fecha de verificación y límites adecuados a su plan. Los datos se compartirán con Conso mediante lectura pública de Supabase y resolución determinista. Precios o disponibilidad que no se puedan verificar se omiten o se identifican como pendientes. Antes de la activación falta confirmar cuotas de almacenamiento y transferencia de carteles, coste de Giglon, permisos de reutilización y capacidad de mantener la agenda actualizada.

## Revisión del teatro
El formulario permite varias funciones y distingue gratuidad, importe confirmado y precio desconocido. Las horas opcionales se muestran como pendientes. El Preview permanece en modo navegador. El adaptador solo admite el proyecto aislado utrerapp-pruebas y requiere configuración explícita. La ejecución de la migración se ha pausado. El archivo SQL se conserva para revisión y no pertenece al directorio de migraciones automáticas.

## Conexión del Preview v2
La rama de Preview usa las variables públicas de conexión de utrerapp-pruebas. La ruta `?vista=gestor-teatro` permite autenticarse directamente en el proyecto aislado sin iniciar sesión contra las cuentas de producción. El cliente público tiene sesión independiente y nunca utiliza la del editor. La edición remota usa revisión optimista y acciones explícitas de retirada y restauración. El almacenamiento cultural conserva las versiones anteriores de carteles. El escaparate y Conso consultan la misma vista de publicaciones en el proyecto aislado.
