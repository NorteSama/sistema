import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Card } from 'react-bootstrap';

function SubirDocumento({ equipoId, onDocumentoSubido }) {
  const [archivo, setArchivo] = useState(null);
  const [tipo, setTipo] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!archivo || !tipo) {
      setMensaje({ tipo: 'danger', texto: 'Por favor selecciona un archivo y tipo de documento' });
      return;
    }

    setLoading(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('tipo', tipo);
      formData.append('fecha_vencimiento', fechaVencimiento);

      const response = await axios.post(`/api/documentos/${equipoId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMensaje({ tipo: 'success', texto: 'Documento subido correctamente' });
      
      // Limpiar formulario
      setArchivo(null);
      setTipo('');
      setFechaVencimiento('');
      
      // Notificar al componente padre
      if (onDocumentoSubido) {
        onDocumentoSubido();
      }

    } catch (error) {
      console.error('Error al subir documento:', error);
      setMensaje({ 
        tipo: 'danger', 
        texto: error.response?.data?.error || 'Error al subir el documento' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-3">
      <Card.Header>
        <h5 className="mb-0">Subir Documento</h5>
      </Card.Header>
      <Card.Body>
        {mensaje.texto && (
          <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje({ tipo: '', texto: '' })}>
            {mensaje.texto}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Tipo de documento *</Form.Label>
            <Form.Select 
              value={tipo} 
              onChange={(e) => setTipo(e.target.value)}
              required
            >
              <option value="">Selecciona el tipo</option>
              <option value="certificado">Certificado de Calibración</option>
              <option value="foto">Fotografía</option>
              <option value="manual">Manual Técnico</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha de vencimiento (opcional)</Form.Label>
            <Form.Control
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
            />
            <Form.Text className="text-muted">
              Solo para documentos que tienen fecha de vencimiento
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Archivo *</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => setArchivo(e.target.files[0])}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
              required
            />
            <Form.Text className="text-muted">
              Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF
            </Form.Text>
          </Form.Group>

          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading}
          >
            {loading ? 'Subiendo...' : 'Subir Documento'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default SubirDocumento; 