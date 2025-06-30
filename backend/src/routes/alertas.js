const express = require('express');
const { createConnection } = require('../db');

const router = express.Router();

// GET - Obtener todas las alertas
router.get('/', async (req, res) => {
  try {
    const connection = await createConnection();
    
    // Equipos con calibración próxima (menos de 15 días)
    const [equiposCalibracion] = await connection.execute(`
      SELECT 
        id, 
        nombre, 
        descripcion, 
        ubicacion, 
        responsable,
        fecha_proxima_calibracion,
        DATEDIFF(fecha_proxima_calibracion, CURDATE()) as dias_restantes
      FROM equipos 
      WHERE fecha_proxima_calibracion IS NOT NULL 
        AND DATEDIFF(fecha_proxima_calibracion, CURDATE()) <= 15
        AND estado = 'activo'
      ORDER BY fecha_proxima_calibracion ASC
    `);

    // Documentos vencidos
    const [documentosVencidos] = await connection.execute(`
      SELECT 
        d.id,
        d.tipo,
        d.fecha_vencimiento,
        d.fecha_subida,
        COALESCE(e.nombre, 'Equipo eliminado') as equipo_nombre,
        e.id as equipo_id,
        DATEDIFF(CURDATE(), d.fecha_vencimiento) as dias_vencido
      FROM documentos d
      LEFT JOIN equipos e ON d.equipo_id = e.id
      WHERE d.fecha_vencimiento < CURDATE()
      ORDER BY d.fecha_vencimiento ASC
    `);

    // Equipos sin calibración reciente (más de 1 año)
    const [equiposSinCalibracion] = await connection.execute(`
      SELECT 
        id,
        nombre,
        descripcion,
        ubicacion,
        responsable,
        fecha_ultima_calibracion,
        DATEDIFF(CURDATE(), fecha_ultima_calibracion) as dias_sin_calibracion
      FROM equipos 
      WHERE fecha_ultima_calibracion IS NULL 
        OR DATEDIFF(CURDATE(), fecha_ultima_calibracion) > 365
        AND estado = 'activo'
      ORDER BY fecha_ultima_calibracion ASC
    `);

    await connection.end();

    res.json({
      equiposCalibracion,
      documentosVencidos,
      equiposSinCalibracion,
      resumen: {
        totalCalibracion: equiposCalibracion.length,
        totalDocumentosVencidos: documentosVencidos.length,
        totalSinCalibracion: equiposSinCalibracion.length
      }
    });

  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener alertas por tipo específico
router.get('/tipo/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;
    const connection = await createConnection();

    let resultado;

    switch (tipo) {
      case 'calibracion':
        const [equipos] = await connection.execute(`
          SELECT 
            id, 
            nombre, 
            descripcion, 
            ubicacion, 
            responsable,
            fecha_proxima_calibracion,
            DATEDIFF(fecha_proxima_calibracion, CURDATE()) as dias_restantes
          FROM equipos 
          WHERE fecha_proxima_calibracion IS NOT NULL 
            AND DATEDIFF(fecha_proxima_calibracion, CURDATE()) <= 15
            AND estado = 'activo'
          ORDER BY fecha_proxima_calibracion ASC
        `);
        resultado = equipos;
        break;

      case 'documentos':
        const [documentos] = await connection.execute(`
          SELECT 
            d.id,
            d.tipo,
            d.fecha_vencimiento,
            d.fecha_subida,
            e.nombre as equipo_nombre,
            e.id as equipo_id,
            DATEDIFF(CURDATE(), d.fecha_vencimiento) as dias_vencido
          FROM documentos d
          JOIN equipos e ON d.equipo_id = e.id
          WHERE d.fecha_vencimiento < CURDATE()
          ORDER BY d.fecha_vencimiento ASC
        `);
        resultado = documentos;
        break;

      case 'sin-calibracion':
        const [sinCalibracion] = await connection.execute(`
          SELECT 
            id,
            nombre,
            descripcion,
            ubicacion,
            responsable,
            fecha_ultima_calibracion,
            DATEDIFF(CURDATE(), fecha_ultima_calibracion) as dias_sin_calibracion
          FROM equipos 
          WHERE fecha_ultima_calibracion IS NULL 
            OR DATEDIFF(CURDATE(), fecha_ultima_calibracion) > 365
            AND estado = 'activo'
          ORDER BY fecha_ultima_calibracion ASC
        `);
        resultado = sinCalibracion;
        break;

      default:
        await connection.end();
        return res.status(400).json({ error: 'Tipo de alerta no válido' });
    }

    await connection.end();
    res.json(resultado);

  } catch (error) {
    console.error('Error al obtener alertas por tipo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST - Marcar alerta como vista (opcional, para futuras funcionalidades)
router.post('/marcar-vista/:tipo/:id', async (req, res) => {
  try {
    const { tipo, id } = req.params;
    // Aquí podrías implementar lógica para marcar alertas como vistas
    // Por ejemplo, crear una tabla de alertas_vistas
    
    res.json({ mensaje: 'Alerta marcada como vista' });
  } catch (error) {
    console.error('Error al marcar alerta como vista:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 