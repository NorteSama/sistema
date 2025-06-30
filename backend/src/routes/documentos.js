const express = require('express');
const multer = require('multer');
const path = require('path');
const { createConnection } = require('../db');

const router = express.Router();

// Configuración de Multer para subir archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Permitir solo ciertos tipos de archivo
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen, PDF y documentos de Office'));
    }
  }
});

// POST - Subir documento para un equipo
router.post('/:equipoId', upload.single('archivo'), async (req, res) => {
  try {
    const { equipoId } = req.params;
    const { tipo, fecha_vencimiento } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const url_archivo = req.file.path;
    const nombre_original = req.file.originalname;
    const connection = await createConnection();

    await connection.execute(
      `INSERT INTO documentos (equipo_id, tipo, url_archivo, fecha_vencimiento, nombre_original)
       VALUES (?, ?, ?, ?, ?)`,
      [equipoId, tipo, url_archivo, fecha_vencimiento || null, nombre_original]
    );

    await connection.end();
    res.json({ 
      mensaje: 'Documento subido correctamente',
      archivo: req.file.filename,
      nombre_original
    });

  } catch (error) {
    console.error('Error al subir documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener documentos de un equipo
router.get('/equipo/:equipoId', async (req, res) => {
  try {
    const { equipoId } = req.params;
    const connection = await createConnection();

    const [documentos] = await connection.execute(
      `SELECT * FROM documentos WHERE equipo_id = ? ORDER BY fecha_subida DESC`,
      [equipoId]
    );

    await connection.end();
    res.json(documentos);

  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Descargar documento
router.get('/descargar/:documentoId', async (req, res) => {
  try {
    const { documentoId } = req.params;
    const connection = await createConnection();

    const [documentos] = await connection.execute(
      'SELECT * FROM documentos WHERE id = ?',
      [documentoId]
    );

    await connection.end();

    if (documentos.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const documento = documentos[0];
    res.download(documento.url_archivo);

  } catch (error) {
    console.error('Error al descargar documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE - Eliminar documento
router.delete('/:documentoId', async (req, res) => {
  try {
    const { documentoId } = req.params;
    const connection = await createConnection();

    // Obtener información del documento antes de eliminarlo
    const [documentos] = await connection.execute(
      'SELECT * FROM documentos WHERE id = ?',
      [documentoId]
    );

    if (documentos.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    // Eliminar el archivo físico
    const fs = require('fs');
    if (fs.existsSync(documentos[0].url_archivo)) {
      fs.unlinkSync(documentos[0].url_archivo);
    }

    // Eliminar registro de la base de datos
    await connection.execute(
      'DELETE FROM documentos WHERE id = ?',
      [documentoId]
    );

    await connection.end();
    res.json({ mensaje: 'Documento eliminado correctamente' });

  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener todos los documentos con información de equipo
router.get('/all', async (req, res) => {
  try {
    const connection = await createConnection();
    const [documentos] = await connection.execute(`
      SELECT d.*, e.nombre as equipo_nombre
      FROM documentos d
      LEFT JOIN equipos e ON d.equipo_id = e.id
      ORDER BY d.fecha_subida DESC
    `);
    await connection.end();
    res.json(documentos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los documentos' });
  }
});

module.exports = router; 