import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Spinner, Alert, Form, Row, Col, Button } from 'react-bootstrap';
import { saveAs } from 'file-saver';

function ListaEquipos({ reload }) {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [filtros, setFiltros] = useState({
    categoria: '',
    existencia: '',
    equipo: '',
    marca: '',
    modelo: ''
  });

  useEffect(() => {
    async function fetchEquipos() {
      setLoading(true);
      try {
        const res = await axios.get('/api/equipos');
        setEquipos(res.data);
        setMensaje('');
      } catch (error) {
        setMensaje('Error al cargar los equipos');
      }
      setLoading(false);
    }
    fetchEquipos();
  }, [reload]);

  const handleFiltro = e => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const limpiarFiltros = () => {
    setFiltros({ categoria: '', existencia: '', equipo: '', marca: '', modelo: '' });
  };

  const equiposFiltrados = equipos.filter(eq =>
    (filtros.categoria === '' || eq.categoria === filtros.categoria) &&
    (filtros.existencia === '' || String(eq.existencia) === filtros.existencia) &&
    (filtros.equipo === '' || eq.nombre.toLowerCase().includes(filtros.equipo.toLowerCase())) &&
    (filtros.marca === '' || (eq.marca || '').toLowerCase().includes(filtros.marca.toLowerCase())) &&
    (filtros.modelo === '' || (eq.modelo || '').toLowerCase().includes(filtros.modelo.toLowerCase()))
  );

  const exportarExcel = async () => {
    const params = new URLSearchParams(filtros).toString();
    const response = await fetch(`/api/reportes/inventario/excel/filtrado?${params}`);
    const blob = await response.blob();
    saveAs(blob, 'inventario_filtrado.xlsx');
  };

  const exportarPDF = async () => {
    const params = new URLSearchParams(filtros).toString();
    const response = await fetch(`/api/reportes/inventario/pdf/filtrado?${params}`);
    const blob = await response.blob();
    saveAs(blob, 'inventario_filtrado.pdf');
  };

  const exportarExcelCategoria = async (categoria) => {
    const params = new URLSearchParams({ categoria }).toString();
    const response = await fetch(`/api/reportes/inventario/excel/filtrado?${params}`);
    const blob = await response.blob();
    saveAs(blob, `inventario_${categoria}.xlsx`);
  };

  const exportarPDFCategoria = async (categoria) => {
    const params = new URLSearchParams({ categoria }).toString();
    const response = await fetch(`/api/reportes/inventario/pdf/filtrado?${params}`);
    const blob = await response.blob();
    saveAs(blob, `inventario_${categoria}.pdf`);
  };

  // Filtrar equipos por cada categoría específica
  const categorias = [
    { key: 'laboratorio_central', label: 'Laboratorio Central' },
    { key: 'campo', label: 'Inventario de Campo' },
    { key: 'consumible_lab_central', label: 'Consumible en Laboratorio Central' },
    { key: 'consumible_seguridad', label: 'Consumible por Equipo de Seguridad' },
    { key: 'laboratorio_campo', label: 'Laboratorio de Campo' }
  ];

  return (
    <div>
      <h3>Inventario de Equipos</h3>
      <Form className="mb-3">
        <Row>
          <Col md={2}>
            <Form.Select name="categoria" value={filtros.categoria} onChange={handleFiltro}>
              <option value="">Todas las categorías</option>
              <option value="central">Central</option>
              <option value="campo">Campo</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Control
              name="existencia"
              type="number"
              min=""
              placeholder="Existencia"
              value={filtros.existencia}
              onChange={handleFiltro}
            />
          </Col>
          <Col md={2}>
            <Form.Control
              name="equipo"
              placeholder="Equipo"
              value={filtros.equipo}
              onChange={handleFiltro}
            />
          </Col>
          <Col md={2}>
            <Form.Control
              name="marca"
              placeholder="Marca"
              value={filtros.marca}
              onChange={handleFiltro}
            />
          </Col>
          <Col md={2}>
            <Form.Control
              name="modelo"
              placeholder="Modelo"
              value={filtros.modelo}
              onChange={handleFiltro}
            />
          </Col>
          <Col md={2}>
            <Button variant="outline-secondary" onClick={limpiarFiltros} className="w-100">Limpiar</Button>
          </Col>
        </Row>
      </Form>
      {/* Filtros y botones de exportación aquí si lo deseas */}
      {mensaje && <Alert variant="danger">{mensaje}</Alert>}
      {loading ? (
        <Spinner animation="border" />
      ) : equiposFiltrados.length === 0 ? (
        <Alert variant="info">No hay equipos registrados.</Alert>
      ) : (
        categorias.map(cat => {
          const equiposCat = equipos.filter(eq => eq.categoria === cat.key);
          return (
            <div key={cat.key} style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#A86B00', marginTop: '2rem' }}>{cat.label}</h4>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <button onClick={() => exportarExcelCategoria(cat.key)}>Exportar Excel</button>
                <button onClick={() => exportarPDFCategoria(cat.key)}>Exportar PDF</button>
              </div>
              {equiposCat.length === 0 ? (
                <Alert variant="info">No hay equipos registrados en esta sección.</Alert>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr style={{ backgroundColor: '#FFF2B2' }}>
                      <th style={{ color: '#A86B00' }}>CATEGORÍA</th>
                      <th style={{ color: '#A86B00' }}>EXISTENCIA</th>
                      <th style={{ color: '#A86B00' }}>EQUIPO</th>
                      <th style={{ color: '#A86B00' }}>DESCRIPCIÓN</th>
                      <th style={{ color: '#A86B00' }}>MARCA</th>
                      <th style={{ color: '#A86B00' }}>MODELO</th>
                      <th style={{ color: '#A86B00' }}>SUBCATEGORÍA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equiposCat.map(eq => (
                      <tr key={eq.id}>
                        <td>{eq.categoria}</td>
                        <td>{eq.existencia}</td>
                        <td>{eq.nombre}</td>
                        <td>{eq.descripcion}</td>
                        <td>{eq.marca}</td>
                        <td>{eq.modelo}</td>
                        <td>{eq.subcategoria}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default ListaEquipos; 