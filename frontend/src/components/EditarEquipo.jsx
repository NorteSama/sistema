import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

function EditarEquipo({ show, handleClose, equipo, onEquipoEditado }) {
  const [form, setForm] = useState({
    categoria: '',
    existencia: '',
    nombre: '',
    descripcion: '',
    marca: '',
    modelo: '',
    subcategoria: ''
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (equipo) {
      setForm({
        categoria: equipo.categoria || '',
        existencia: equipo.existencia || '',
        nombre: equipo.nombre || '',
        descripcion: equipo.descripcion || '',
        marca: equipo.marca || '',
        modelo: equipo.modelo || '',
        subcategoria: equipo.subcategoria || ''
      });
    }
  }, [equipo]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    try {
      await axios.put(`/api/equipos/${equipo.id}`, form);
      setMensaje('Equipo actualizado correctamente');
      onEquipoEditado();
      setTimeout(() => {
        handleClose();
        setMensaje('');
      }, 1500);
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al actualizar el equipo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar Equipo</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {mensaje && (
            <Alert variant={mensaje.includes('correctamente') ? 'success' : 'danger'}>
              {mensaje}
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Categoría *</Form.Label>
            <Form.Select name="categoria" value={form.categoria} onChange={handleChange} required>
              <option value="">Selecciona una categoría</option>
              <option value="laboratorio_central">Laboratorio Central</option>
              <option value="campo">Inventario de Campo</option>
              <option value="consumible_lab_central">Consumible en Laboratorio Central</option>
              <option value="consumible_seguridad">Consumible por Equipo de Seguridad</option>
              <option value="laboratorio_campo">Laboratorio de Campo</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Existencia *</Form.Label>
            <Form.Control
              name="existencia"
              type="number"
              min="0"
              value={form.existencia}
              onChange={handleChange}
              placeholder="Cantidad disponible"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nombre del Equipo *</Form.Label>
            <Form.Control
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre del equipo"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              name="descripcion"
              as="textarea"
              rows={3}
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción detallada del equipo"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Marca</Form.Label>
            <Form.Control
              name="marca"
              value={form.marca}
              onChange={handleChange}
              placeholder="Marca del equipo"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Modelo</Form.Label>
            <Form.Control
              name="modelo"
              value={form.modelo}
              onChange={handleChange}
              placeholder="Modelo del equipo"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Subcategoría</Form.Label>
            <Form.Control
              name="subcategoria"
              value={form.subcategoria}
              onChange={handleChange}
              placeholder="Ej: eléctrico, mecánico, etc."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default EditarEquipo; 