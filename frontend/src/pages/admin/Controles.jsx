import React, { useEffect, useRef } from 'react';
import { AlertCircle, ImageOff, X } from 'lucide-react';

export function Campo({ etiqueta, opciones, multilinea, ancho, ...props }) {
  const lista = opciones?.some(([valor]) => valor === props.value) || !props.value
    ? opciones
    : opciones && [[props.value, props.value], ...opciones];
  return <label className={ancho ? 'admin-field admin-wide' : 'admin-field'}>
    <span>{etiqueta}</span>
    {lista ? <select {...props}>{lista.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}</select>
      : multilinea ? <textarea rows={4} {...props} /> : <input {...props} />}
  </label>;
}

export function Imagen({ src, alt = '', className = '' }) {
  const valida = typeof src === 'string' && src.trim() && !/^(empty|null)$/i.test(src.trim());
  const [fallida, setFallida] = React.useState(null);
  return <span className={`admin-photo ${className}`}>
    {valida && fallida !== src
      ? <img src={src.trim()} alt={alt} loading="lazy" onError={() => setFallida(src)} />
      : <ImageOff size={20} aria-hidden="true" />}
  </span>;
}

export function Aviso({ mensaje }) {
  if (!mensaje) return null;
  return <p className={`admin-notice ${mensaje.error ? 'admin-notice-error' : ''}`}
    role={mensaje.error ? 'alert' : 'status'}><AlertCircle size={17} /> {mensaje.texto}</p>;
}

export function Dialogo({ titulo, cerrar, children, className = '' }) {
  const ref = useRef(null);
  const titleId = React.useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} aria-labelledby={titleId} className={`admin-dialog ${className}`}
    onCancel={event => { event.preventDefault(); cerrar(); }}>
    <header><h2 id={titleId}>{titulo}</h2><button type="button" className="admin-icon" aria-label="Cerrar" onClick={cerrar}><X size={20} /></button></header>
    <div className="admin-dialog-content">{children}</div>
  </dialog>;
}
