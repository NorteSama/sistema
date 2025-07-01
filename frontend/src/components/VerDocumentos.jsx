import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Spinner, Alert, Form } from 'react-bootstrap';

// Usa variable de entorno o por defecto http://localhost:3001
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

function VerDocumentos() {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');

  // Cargar documentos cuando cambia el equipo seleccionado
  useEffect(() => {
    async function fetchDocumentos() {
      setLoading(true);
      try {
        const res = await axios.get('/api/documentos/all');
        setDocumentos(res.data);
        setMensaje('');
      } catch (error) {
        setMensaje('Error al cargar los documentos');
      }
      setLoading(false);
    }
    fetchDocumentos();
  }, []);

  const descargar = (id) => {
    window.open(`${BACKEND_URL}/api/documentos/descargar/${id}`, '_blank');
  };

  const eliminar = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este documento?')) {
      try {
        await axios.delete(`${BACKEND_URL}/api/documentos/${id}`);
        setDocumentos(documentos.filter(doc => doc.id !== id));
      } catch (error) {
        setMensaje('Error al eliminar el documento');
      }
    }
  };

  return (
    <div>
      <h3>Documentos</h3>
      <Form.Group className="mb-3">
        <Form.Label>Filtrar por tipo de documento:</Form.Label>
        <Form.Select value={tipoFiltro} onChange={e => setTipoFiltro(e.target.value)}>
          <option value="">Todos</option>
          <option value="Certificado de Calibración">Certificado de Calibración</option>
          <option value="Fotografía">Fotografía</option>
          <option value="Manual Técnico">Manual Técnico</option>
        </Form.Select>
      </Form.Group>
      {mensaje && <Alert variant="danger">{mensaje}</Alert>}
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Archivo</th>
              <th>Fecha de subida</th>
              <th>Fecha de vencimiento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let documentosFiltrados = documentos.filter(doc => [
                'Certificado de Calibración',
                'Fotografía',
                'Manual Técnico'
              ].includes(doc.tipo));
              if (tipoFiltro) {
                documentosFiltrados = documentosFiltrados.filter(doc => doc.tipo === tipoFiltro);
              }
              if (documentosFiltrados.length === 0) {
                return (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">No hay documentos subidos.</td>
                  </tr>
                );
              }
              return documentosFiltrados.map(doc => (
                <tr key={doc.id}>
                  <td>{doc.id}</td>
                  <td>{doc.tipo}</td>
                  <td>{doc.nombre_original || doc.url_archivo.split('/').pop()}</td>
                  <td>{doc.fecha_subida ? doc.fecha_subida.substring(0, 10) : ''}</td>
                  <td>{doc.fecha_vencimiento ? doc.fecha_vencimiento.substring(0, 10) : 'N/A'}</td>
                  <td>
                    <Button size="sm" variant="success" onClick={() => descargar(doc.id)}>
                      Descargar
                    </Button>{' '}
                    <Button size="sm" variant="danger" onClick={() => eliminar(doc.id)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </Table>
      )}
    </div>
  );
}

export default VerDocumentos; 