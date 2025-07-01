import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Alert, Spinner } from 'react-bootstrap';

function Alertas() {
  const [alertas, setAlertas] = useState({
    equiposCalibracion: [],
    documentosVencidos: [],
    equiposSinCalibracion: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAlertas();
  }, []);

  const fetchAlertas = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/alertas');
      setAlertas(response.data);
      setError('');
    } catch (err) {
      console.error('Error al obtener alertas:', err);
      setError('Error al cargar las alertas');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-2">Cargando alertas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Panel de Alertas</h2>
      <h4 className="mb-3 text-danger">Documentos Vencidos</h4>
      {alertas.documentosVencidos.length === 0 ? (
        <Alert variant="success">No hay documentos vencidos.</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Equipo</th>
              <th>Tipo</th>
              <th>Fecha de vencimiento</th>
              <th>Días vencido</th>
            </tr>
          </thead>
          <tbody>
            {alertas.documentosVencidos.map(doc => (
              <tr key={doc.id}>
                <td>{doc.equipo_nombre}</td>
                <td>{doc.tipo}</td>
                <td>{formatDate(doc.fecha_vencimiento)}</td>
                <td>{doc.dias_vencido}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <div className="mt-3">
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={fetchAlertas}
        >
          Actualizar Alertas
        </button>
      </div>
    </div>
  );
}

export default Alertas; 