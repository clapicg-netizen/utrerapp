import React from 'react';

const maxImageLength = 1000000;

async function prepareImage(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
    throw new Error('Selecciona un JPG, PNG o WebP de hasta 10 MB.');
  }
  const inputUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = inputUrl;
    await image.decode();
    const scale = Math.min(1, 960 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('El navegador no pudo preparar la imagen.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL('image/webp', 0.82);
    if (!/^data:image\/(webp|png|jpeg);base64,/.test(data) || data.length > maxImageLength) {
      throw new Error('La imagen es demasiado grande. Prueba con un archivo más ligero.');
    }
    return data;
  } finally {
    URL.revokeObjectURL(inputUrl);
  }
}

export default function MarketImageField({ label, value, onChange, onBusy, onError }) {
  async function upload(event) {
    const input = event.currentTarget;
    const file = input.files[0];
    if (!file) return;
    onBusy(true);
    onError('');
    try {
      onChange(await prepareImage(file));
    } catch (error) {
      onError(error.message || 'No se pudo preparar la imagen.');
    } finally {
      input.value = '';
      onBusy(false);
    }
  }

  return <div className="market-wide">
    <label className="admin-field">{label} <input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} /></label>
    {value && <div className="market-media-preview">
      <img src={value} alt="Vista previa de la imagen" />
      <button type="button" className="admin-button" onClick={() => onChange('')}>Quitar imagen</button>
    </div>}
  </div>;
}
