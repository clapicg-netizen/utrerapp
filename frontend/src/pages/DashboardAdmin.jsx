const handleGuardar = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.categoria) {
      setMensaje({ tipo: 'error', texto: 'Nombre y Categoría requeridos' });
      return;
    }

    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    const datosLimpios = limpiarDatosParaEnviar(formData);

    if (editandoId) {
      // Nos aseguramos de pasar explícitamente el editandoId y el PIN maestro
      const res = await actualizarComercio(editandoId, PIN_ADMIN_MAESTRO, datosLimpios);
      setGuardando(false);
      if (res.success) {
        setMensaje({ tipo: 'exito', texto: '¡Comercio actualizado correctamente con sus fotos y PDF!' });
        cargarLista();
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al actualizar: ' + res.message });
      }
    } else {
      const res = await crearComercio(datosLimpios);
      setGuardando(false);
      if (res.success) {
        setMensaje({ tipo: 'exito', texto: '¡Nuevo comercio creado!' });
        setFormData(formInicial);
        cargarLista();
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al crear: ' + res.message });
      }
    }
  };