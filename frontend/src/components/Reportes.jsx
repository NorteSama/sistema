import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Card, Button, Table, Spinner, Alert, Row, Col, Form, Modal } from 'react-bootstrap';
import { saveAs } from 'file-saver';
import EditarEquipo from './EditarEquipo';

// Usa variable de entorno o por defecto http://localhost:3001
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
const API_URL = process.env.REACT_APP_API_URL;

const categorias = [
  { key: 'laboratorio_central', label: 'Laboratorio Central' },
  { key: 'campo', label: 'Inventario de Campo' },
  { key: 'consumible_lab_central', label: 'Consumible en Laboratorio Central' },
  { key: 'consumible_seguridad', label: 'Consumible por Equipo de Seguridad' },
  { key: 'laboratorio_campo', label: 'Laboratorio de Campo' }
];

function Reportes() {
  const [equipos, setEquipos] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [equipoAEditar, setEquipoAEditar] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [equipoABorrar, setEquipoABorrar] = useState(null);

  useEffect(() => {
    fetchEquipos();
    fetchDocumentos();
  }, []);

  const fetchEquipos = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/equipos`);
      const data = await res.json();
      setEquipos(data);
      localStorage.setItem('equipos_reportes', JSON.stringify(data));
    } catch (error) {
      setMensaje('Error al cargar los equipos. Mostrando datos locales.');
      const local = localStorage.getItem('equipos_reportes');
      if (local) setEquipos(JSON.parse(local));
    }
  };

  const fetchDocumentos = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/documentos/all`);
      const data = await res.json();
      setDocumentos(data);
      localStorage.setItem('documentos_reportes', JSON.stringify(data));
    } catch (error) {
      setMensaje('Error al cargar los documentos. Mostrando datos locales.');
      const local = localStorage.getItem('documentos_reportes');
      if (local) setDocumentos(JSON.parse(local));
    }
  };

  // Exportar inventario por categoría
  const exportarExcelCategoria = async (categoria) => {
    setLoading(true);
    const params = new URLSearchParams({ categoria }).toString();
    const response = await fetch(`${BACKEND_URL}/api/reportes/inventario/excel/filtrado?${params}`);
    const blob = await response.blob();
    saveAs(blob, `inventario_${categoria}.xlsx`);
    setLoading(false);
  };
  const exportarPDFCategoria = async (categoria) => {
    setLoading(true);
    const params = new URLSearchParams({ categoria }).toString();
    const response = await fetch(`${BACKEND_URL}/api/reportes/inventario/pdf/filtrado?${params}`);
    const blob = await response.blob();
    saveAs(blob, `inventario_${categoria}.pdf`);
    setLoading(false);
  };

  // Exportar todos los documentos
  const exportarDocumentosExcel = async () => {
    setLoading(true);
    const response = await fetch(`${BACKEND_URL}/api/reportes/documentos/excel`);
    const blob = await response.blob();
    saveAs(blob, 'documentos.xlsx');
    setLoading(false);
  };
  const exportarDocumentosPDF = async () => {
    setLoading(true);
    const response = await fetch(`${BACKEND_URL}/api/reportes/documentos/pdf`);
    const blob = await response.blob();
    saveAs(blob, 'documentos.pdf');
    setLoading(false);
  };

  // Descargar todas las fotos
  const exportarFotosZIP = async () => {
    setLoading(true);
    const response = await fetch(`${BACKEND_URL}/api/reportes/fotos/zip`);
    const blob = await response.blob();
    saveAs(blob, 'fotos.zip');
    setLoading(false);
  };

  const handleEditarEquipo = (equipo) => {
    setEquipoAEditar(equipo);
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEquipoAEditar(null);
  };
  const handleEquipoEditado = () => {
    fetchEquipos();
  };
  const handleBorrarEquipo = (equipo) => {
    setEquipoABorrar(equipo);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setEquipoABorrar(null);
  };
  const confirmarBorrarEquipo = async () => {
    try {
      await fetch(`${API_URL}/api/equipos/${equipoABorrar.id}`, { method: 'DELETE' });
      setMensaje('Equipo eliminado correctamente');
      handleCloseDeleteModal();
      fetchEquipos();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('Error al eliminar el equipo');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Reportes y Descargas</h2>
      <Button variant="outline-info" size="sm" style={{ marginBottom: 16 }} onClick={() => { fetchEquipos(); fetchDocumentos(); }}>
        Actualizar datos
      </Button>
      {mensaje && <Alert variant="danger">{mensaje}</Alert>}
      <Tabs defaultActiveKey="inventario" className="mb-3" fill>
        <Tab eventKey="inventario" title="Inventario por Categorías">
          <Row>
            {categorias.map(cat => {
              const equiposCat = equipos.filter(eq => eq.categoria === cat.key);
              return (
                <Col md={6} key={cat.key} className="mb-4">
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Header as="h5" className="bg-white border-0" style={{ color: '#A86B00', fontWeight: 700 }}>{cat.label}</Card.Header>
                    <Card.Body>
                      <div className="mb-3 d-flex gap-2">
                        <Button variant="success" style={{ borderRadius: 20, fontWeight: 600 }} onClick={() => exportarExcelCategoria(cat.key)} disabled={loading}>
                          {loading ? <Spinner animation="border" size="sm" /> : 'Descargar Excel'}
                        </Button>
                        <Button variant="danger" style={{ borderRadius: 20, fontWeight: 600 }} onClick={() => exportarPDFCategoria(cat.key)} disabled={loading}>
                          {loading ? <Spinner animation="border" size="sm" /> : 'Descargar PDF'}
                        </Button>
                      </div>
                      <div style={{ maxHeight: '350px', overflowY: 'auto', background: '#fffbe7', borderRadius: 12, boxShadow: '0 2px 12px #ffe08255', padding: 8, marginBottom: 8 }}>
                        <Table responsive bordered hover size="sm" className="mb-0" style={{ borderRadius: 12, borderCollapse: 'separate', borderSpacing: 0 }}>
                          <thead style={{ background: '#FFF2B2' }}>
                            <tr>
                              <th style={{ color: '#A86B00', fontWeight: 700 }}>Categoría</th>
                              <th style={{ color: '#A86B00', fontWeight: 700 }}>Subcategoría</th>
                              <th style={{ color: '#A86B00', fontWeight: 700 }}>Existencia</th>
                              <th style={{ color: '#A86B00', fontWeight: 700 }}>Equipo</th>
                              <th style={{ color: '#A86B00', fontWeight: 700 }}>Descripción</th>
                              <th style={{ color: '#A86B00', fontWeight: 700 }}>Marca</th>
                              <th style={{ color: '#A86B00', fontWeight: 700 }}>Modelo</th>
                              <th style={{ color: '#A86B00', fontWeight: 700 }}>Editar</th>
                              <th style={{ color: '#A86B00', fontWeight: 700 }}>Borrar</th>
                            </tr>
                          </thead>
                          <tbody>
                            {equiposCat.length === 0 ? (
                              <tr><td colSpan={9} className="text-center text-muted">No hay equipos registrados.</td></tr>
                            ) : (
                              equiposCat.map(eq => (
                                <tr key={eq.id}>
                                  <td>{eq.categoria}</td>
                                  <td>{eq.subcategoria}</td>
                                  <td>{eq.existencia}</td>
                                  <td>{eq.nombre}</td>
                                  <td>{eq.descripcion}</td>
                                  <td>{eq.marca}</td>
                                  <td>{eq.modelo}</td>
                                  <td>
                                    <Button variant="warning" size="sm" onClick={() => handleEditarEquipo(eq)} style={{ borderRadius: 20, fontWeight: 600 }}>Editar</Button>
                                  </td>
                                  <td>
                                    <Button variant="danger" size="sm" onClick={() => handleBorrarEquipo(eq)} style={{ borderRadius: 20, fontWeight: 600 }}>Borrar</Button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </Table>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Tab>
        <Tab eventKey="documentos" title="Reportes de Documentos">
          <Card className="shadow-sm border-0">
            <Card.Header as="h5" className="bg-white border-0" style={{ color: '#A86B00', fontWeight: 700 }}>Todos los Documentos</Card.Header>
            <Card.Body>
              <div style={{ overflowX: 'auto' }}>
                <div style={{ maxHeight: '350px', overflowY: 'auto', background: '#fffbe7', borderRadius: 12, boxShadow: '0 2px 12px #ffe08255', padding: 8, marginBottom: 8 }}>
                  <Table responsive bordered hover size="sm" className="mb-0" style={{ borderRadius: 12, borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead style={{ background: '#FFF2B2' }}>
                      <tr>
                        <th style={{ color: '#A86B00', fontWeight: 700 }}>ID</th>
                        <th style={{ color: '#A86B00', fontWeight: 700 }}>Tipo</th>
                        <th style={{ color: '#A86B00', fontWeight: 700 }}>Archivo</th>
                        <th style={{ color: '#A86B00', fontWeight: 700 }}>Fecha de subida</th>
                        <th style={{ color: '#A86B00', fontWeight: 700 }}>Fecha de vencimiento</th>
                        <th style={{ color: '#A86B00', fontWeight: 700 }}>Descargar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentos.length === 0 ? (
                        <tr><td colSpan={6} className="text-center text-muted">No hay documentos registrados.</td></tr>
                      ) : (
                        documentos.map(doc => (
                          <tr key={doc.id}>
                            <td>{doc.id}</td>
                            <td>{doc.tipo}</td>
                            <td>{doc.url_archivo?.split('/').pop()}</td>
                            <td>{doc.fecha_subida ? doc.fecha_subida.substring(0, 10) : ''}</td>
                            <td>{doc.fecha_vencimiento ? doc.fecha_vencimiento.substring(0, 10) : 'N/A'}</td>
                            <td>
                              <Button
                                variant="primary"
                                size="sm"
                                style={{ borderRadius: 20, fontWeight: 600 }}
                                onClick={() => {
                                  window.open(`${BACKEND_URL}/api/documentos/descargar/${doc.id}`, '_blank');
                                }}
                              >
                                Descargar
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="fotos" title="Galería de Fotos">
          <Card className="shadow-sm border-0">
            <Card.Header as="h5" className="bg-white border-0" style={{ color: '#A86B00', fontWeight: 700 }}>Fotos Subidas</Card.Header>
            <Card.Body>
              <div className="mb-3 d-flex gap-2">
                <Button variant="primary" style={{ borderRadius: 20, fontWeight: 600 }} onClick={exportarFotosZIP} disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : 'Descargar Todas (ZIP)'}
                </Button>
              </div>
              <Row>
                {documentos.filter(doc => doc.tipo === 'foto' && (doc.url_archivo.toLowerCase().endsWith('.jpg') || doc.url_archivo.toLowerCase().endsWith('.png'))).length === 0 ? (
                  <Col className="text-muted">No hay fotos .jpg o .png subidas.</Col>
                ) : (
                  documentos.filter(doc => doc.tipo === 'foto' && (doc.url_archivo.toLowerCase().endsWith('.jpg') || doc.url_archivo.toLowerCase().endsWith('.png'))).map(doc => (
                    <Col md={3} key={doc.id} className="mb-3">
                      <Card className="h-100 shadow-sm border-0">
                        <Card.Img variant="top" src={`/${doc.url_archivo}`} style={{ maxHeight: 180, objectFit: 'cover', borderRadius: 12 }} />
                        <Card.Body className="d-flex flex-column align-items-center justify-content-end">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            style={{ borderRadius: 20, fontWeight: 600, marginBottom: 8 }}
                            onClick={() => {
                              setPreviewImg(`/${doc.url_archivo}`);
                              setShowPreview(true);
                            }}
                          >
                            Previsualizar
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            style={{ borderRadius: 20, fontWeight: 600, marginBottom: 8 }}
                            onClick={() => {
                              window.open(`${BACKEND_URL}/api/documentos/descargar/${doc.id}`, '_blank');
                            }}
                          >
                            Descargar
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            style={{ borderRadius: 20, fontWeight: 600 }}
                            onClick={async () => {
                              if (window.confirm('¿Seguro que deseas borrar esta foto?')) {
                                setLoading(true);
                                try {
                                  await fetch(`${BACKEND_URL}/api/documentos/${doc.id}`, { method: 'DELETE' });
                                  setDocumentos(documentos.filter(d => d.id !== doc.id));
                                } catch (e) {
                                  setMensaje('Error al borrar la foto');
                                }
                                setLoading(false);
                              }
                            }}
                          >
                            Borrar
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                )}
              </Row>
              <Modal show={showPreview} onHide={() => setShowPreview(false)} centered size="lg" backdrop="static">
                <Modal.Body style={{ background: '#222', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0 }}>
                  {previewImg && (
                    <img src={previewImg} alt="Previsualización" style={{ maxWidth: '100%', maxHeight: '80vh', margin: 'auto', display: 'block' }} />
                  )}
                </Modal.Body>
                <Modal.Footer style={{ background: '#222', borderTop: 'none' }}>
                  <Button variant="light" onClick={() => setShowPreview(false)} style={{ borderRadius: 20, fontWeight: 600 }}>
                    Cerrar
                  </Button>
                </Modal.Footer>
              </Modal>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      <EditarEquipo
        show={showEditModal}
        handleClose={handleCloseEditModal}
        equipo={equipoAEditar}
        onEquipoEditado={handleEquipoEditado}
      />
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar borrado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas borrar este equipo?
          <br />
          <strong>{equipoABorrar?.nombre}</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>Cancelar</Button>
          <Button variant="danger" onClick={confirmarBorrarEquipo}>Borrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Reportes; 