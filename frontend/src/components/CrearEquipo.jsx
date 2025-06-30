import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

function CrearEquipo({ onEquipoCreado }) {
  const [form, setForm] = useState({
    categoria: '',
    subcategoria: '',
    existencia: '',
    nombre: '',
    descripcion: '',
    marca: '',
    modelo: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [exito, setExito] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje('');
    setExito('');
    try {
      await axios.post(`${BACKEND_URL}/api/equipos`, form);
      setExito('¡Equipo creado correctamente!');
      setForm({
        categoria: '',
        subcategoria: '',
        existencia: '',
        nombre: '',
        descripcion: '',
        marca: '',
        modelo: ''
      });
      if (onEquipoCreado) onEquipoCreado();
      setTimeout(() => {
        setExito('');
        navigate('/inventario');
      }, 1200);
    } catch (error) {
      setMensaje('Error al crear el equipo');
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Registrar Nuevo Equipo</h5>
      </Card.Header>
      <Card.Body>
        {exito && <Alert variant="success">{exito}</Alert>}
        {mensaje && <Alert variant="danger">{mensaje}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Label>Categoría (Área de trabajo)</Form.Label>
            <Form.Select name="categoria" value={form.categoria} onChange={handleChange} required>
              <option value="">Selecciona una categoría</option>
              <option value="laboratorio_central">Laboratorio Central</option>
              <option value="campo">Inventario de Campo</option>
              <option value="consumible_lab_central">Consumible en Laboratorio Central</option>
              <option value="consumible_seguridad">Consumible por Equipo de Seguridad</option>
              <option value="laboratorio_campo">Laboratorio de Campo</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Subcategoría</Form.Label>
            <Form.Control name="subcategoria" value={form.subcategoria} onChange={handleChange} placeholder="Ej: eléctrico, mecánico, etc." />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Existencia</Form.Label>
            <Form.Control name="existencia" type="number" value={form.existencia} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Equipo</Form.Label>
            <Form.Control name="nombre" value={form.nombre} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Descripción</Form.Label>
            <Form.Control name="descripcion" value={form.descripcion} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Marca</Form.Label>
            <Form.Control name="marca" value={form.marca} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Modelo</Form.Label>
            <Form.Control name="modelo" value={form.modelo} onChange={handleChange} />
          </Form.Group>
          <Button type="submit" variant="primary">Registrar Equipo</Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default CrearEquipo; 