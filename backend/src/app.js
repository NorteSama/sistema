const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./db');

// Importar rutas
const documentosRoutes = require('./routes/documentos');
const alertasRoutes = require('./routes/alertas');
const reportesRoutes = require('./routes/reportes');
const equiposRoutes = require('./routes/equipos');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/documentos', documentosRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/equipos', equiposRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API del Sistema de Gestión de Inventario de Equipos',
    version: '1.0.0',
    endpoints: {
      documentos: '/api/documentos',
      alertas: '/api/alertas',
      reportes: '/api/reportes'
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Inicializar base de datos y arrancar servidor
async function startServer() {
  try {
    await initializeDatabase();
    console.log('Base de datos inicializada correctamente');
    
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log('Endpoints disponibles:');
      console.log('- GET  /api/alertas');
      console.log('- POST /api/documentos/:equipoId');
      console.log('- GET  /api/reportes/inventario/excel');
      console.log('- GET  /api/reportes/inventario/pdf');
    });
  } catch (error) {
    console.error('Error al inicializar el servidor:', error);
    process.exit(1);
  }
}

startServer(); 