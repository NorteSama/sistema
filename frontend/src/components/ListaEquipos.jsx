import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Spinner, Alert, Form, Row, Col, Button, Modal } from 'react-bootstrap';
import { saveAs } from 'file-saver';
import EditarEquipo from './EditarEquipo';

const API_URL = process.env.REACT_APP_API_URL;

function ListaEquipos({ reload }) {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [equipoAEditar, setEquipoAEditar] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [equipoABorrar, setEquipoABorrar] = useState(null);
  const [filtros, setFiltros] = useState({
    categoria: '',
    existencia: '',
    equipo: '',
    marca: '',
    modelo: ''
  });

  useEffect(() => {
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
    const response = await fetch(`${API_URL}/api/reportes/inventario/excel/filtrado?${params}`);
    const blob = await response.blob();
    saveAs(blob, 'inventario_filtrado.xlsx');
  };

  const exportarPDF = async () => {
    const params = new URLSearchParams(filtros).toString();
    const response = await fetch(`${API_URL}/api/reportes/inventario/pdf/filtrado?${params}`);
    const blob = await response.blob();
    saveAs(blob, 'inventario_filtrado.pdf');
  };

  const exportarExcelCategoria = async (categoria) => {
    const params = new URLSearchParams({ categoria }).toString();
    const response = await fetch(`${API_URL}/api/reportes/inventario/excel/filtrado?${params}`);
    const blob = await response.blob();
    saveAs(blob, `inventario_${categoria}.xlsx`);
  };

  const exportarPDFCategoria = async (categoria) => {
    const params = new URLSearchParams({ categoria }).toString();
    const response = await fetch(`${API_URL}/api/reportes/inventario/pdf/filtrado?${params}`);
    const blob = await response.blob();
    saveAs(blob, `inventario_${categoria}.pdf`);
  };

  // Función para abrir modal de editar equipo
  const handleEditarEquipo = (equipo) => {
    setEquipoAEditar(equipo);
    setShowEditModal(true);
  };

  // Función para cerrar modal de editar equipo
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEquipoAEditar(null);
  };

  // Función para confirmar edición de equipo
  const handleEquipoEditado = () => {
    // Recargar la lista de equipos
    fetchEquipos();
  };

  // Función para abrir modal de confirmación de borrado
  const handleBorrarEquipo = (equipo) => {
    setEquipoABorrar(equipo);
    setShowDeleteModal(true);
  };

  // Función para cerrar modal de confirmación de borrado
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setEquipoABorrar(null);
  };

  // Función para confirmar borrado de equipo
  const confirmarBorrarEquipo = async () => {
    try {
      await axios.delete(`${API_URL}/api/equipos/${equipoABorrar.id}`);
      setMensaje('Equipo eliminado correctamente');
      handleCloseDeleteModal();
      // Recargar la lista de equipos
      fetchEquipos();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al eliminar el equipo');
    }
  };

  const fetchEquipos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/equipos`);
      // Validar que la respuesta sea un array
      if (Array.isArray(res.data)) {
        setEquipos(res.data);
        // Guardar en LocalStorage
        localStorage.setItem('equipos', JSON.stringify(res.data));
      } else {
        setEquipos([]);
        setMensaje('La respuesta del servidor no es válida.');
      }
      setMensaje('');
    } catch (error) {
      setMensaje('Error al cargar los equipos. Mostrando datos locales.');
      // Leer de LocalStorage si hay error
      const local = localStorage.getItem('equipos');
      if (local) {
        setEquipos(JSON.parse(local));
      } else {
        setEquipos([]);
      }
    }
    setLoading(false);
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
        <img src="/Logo_GBC.jpg" alt="Logo GBC" style={{ maxWidth: 400, width: '100%', height: 'auto', marginBottom: 8, filter: 'drop-shadow(0 2px 8px #FFD700)' }} />
      </div>
      <Button variant="outline-info" size="sm" style={{ marginBottom: 16 }} onClick={fetchEquipos}>
        Actualizar datos
      </Button>
      {/* <Form className="mb-3">
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
      </Form> */}
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
                <div style={{ maxHeight: '400px', overflowY: 'auto', width: '100%' }}>
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
                        <th style={{ color: '#A86B00' }}>ACCIONES</th>
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
                          <td>
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEditarEquipo(eq)}
                                title="Editar equipo"
                              >
                                ✏️
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleBorrarEquipo(eq)}
                                title="Eliminar equipo"
                              >
                                🗑️
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Modal para editar equipo */}
      <EditarEquipo
        show={showEditModal}
        handleClose={handleCloseEditModal}
        equipo={equipoAEditar}
        onEquipoEditado={handleEquipoEditado}
      />

      {/* Modal de confirmación para borrar equipo */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar el equipo "{equipoABorrar?.nombre}"?
          <br />
          <strong>Esta acción no se puede deshacer.</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarBorrarEquipo}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ListaEquipos; 