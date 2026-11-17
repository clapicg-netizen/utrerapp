# UtrerApp 2.0 · Portada móvil

## Incidencias pendientes

- **Agenda Cultural.** En producción, Inicio → Agenda Cultural → Eventos Culturales devuelve a la portada. `MenuAgenda.jsx` envía a `eventos` y el selector de vistas de `App.js` cae en su rama por defecto. La tarjeta de portada mantiene el destino existente `menu-agenda`. La reparación de la navegación interna se reserva para su misión.
- **Titulares y TV Utrera.** La vista abre, pero los titulares están definidos en el código y enlazan a las portadas de los medios. La integración de actualidad y la validación de la emisión quedan pendientes.
- **PWA.** El manifiesto publicado usa `standalone` y tiene `icons: []`. La entrada de React no registra un service worker y la URL pública `/service-worker.js` devuelve HTML. Queda por confirmar la instalación en Safari/iOS y Chrome/Android, definir iconos de instalación y validar el funcionamiento sin conexión. Esta misión solo amplía el soporte de zoom y áreas seguras.
- **Aparcamientos.** El acceso existente abre HolaUtrera. En la auditoría, el proveedor mostraba cero plazas sensorizadas. La portada y Conso dirigen al mapa sin prometer datos de disponibilidad.
- **Salud pública.** La separación entre servicios públicos y publicidad se aplica a la portada. La página de Salud conserva su acceso anterior al cuadro privado.
- **Conso IA.** La tarjeta sustituye la promoción anterior de Conso en la portada. La conexión con Gemini y los cambios en el panel de administración quedan para sus misiones previstas.

## Vista previa local

En `frontend`, ejecutar `npm ci --legacy-peer-deps` y `npm start`. Abrir la URL local del frontend y usar un ancho inferior a 1024 px. El servidor local de CRA no ejecuta por sí mismo las funciones de Vercel. Las páginas que consultan Supabase conservan su conexión existente. Para una comprobación contra producción, limitarse a flujos de lectura.

La rama de revisión desactiva el despliegue automático de Vercel por nombre de rama. La revisión visual se hace con el servidor local.
