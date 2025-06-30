const express = require('express');
const ExcelJS = require('exceljs');
const { jsPDF } = require('jspdf');
const { createConnection } = require('../db');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// GET - Exportar inventario completo a Excel
router.get('/inventario/excel', async (req, res) => {
  try {
    const connection = await createConnection();
    const [equipos] = await connection.execute(`
      SELECT 
        id,
        categoria,
        subcategoria,
        existencia,
        nombre,
        descripcion,
        marca,
        modelo
      FROM equipos 
      ORDER BY nombre ASC
    `);
    await connection.end();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventario de Equipos');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Categoría', key: 'categoria', width: 15 },
      { header: 'Subcategoría', key: 'subcategoria', width: 15 },
      { header: 'Existencia', key: 'existencia', width: 10 },
      { header: 'Equipo', key: 'nombre', width: 25 },
      { header: 'Descripción', key: 'descripcion', width: 30 },
      { header: 'Marca', key: 'marca', width: 15 },
      { header: 'Modelo', key: 'modelo', width: 15 }
    ];

    equipos.forEach(equipo => {
      worksheet.addRow(equipo);
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=inventario_completo.xlsx');
    const buffer = await workbook.xlsx.writeBuffer();
    res.end(Buffer.from(buffer));

  } catch (error) {
    console.error('Error al exportar Excel:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Exportar inventario filtrado a Excel
router.get('/inventario/excel/filtrado', async (req, res) => {
  try {
    const { categoria, existencia, equipo, marca, modelo } = req.query;
    const connection = await createConnection();

    let query = `SELECT * FROM equipos WHERE 1=1`;
    const params = [];

    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }
    if (existencia) {
      query += ' AND existencia = ?';
      params.push(existencia);
    }
    if (equipo) {
      query += ' AND nombre LIKE ?';
      params.push(`%${equipo}%`);
    }
    if (marca) {
      query += ' AND marca LIKE ?';
      params.push(`%${marca}%`);
    }
    if (modelo) {
      query += ' AND modelo LIKE ?';
      params.push(`%${modelo}%`);
    }

    const [equipos] = await connection.execute(query, params);
    await connection.end();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventario Filtrado');

    worksheet.columns = [
      { header: 'Categoría', key: 'categoria', width: 15 },
      { header: 'Existencia', key: 'existencia', width: 10 },
      { header: 'Equipo', key: 'nombre', width: 25 },
      { header: 'Descripción', key: 'descripcion', width: 30 },
      { header: 'Marca', key: 'marca', width: 15 },
      { header: 'Modelo', key: 'modelo', width: 15 }
    ];

    equipos.forEach(eq => worksheet.addRow(eq));
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=inventario_filtrado.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Error al exportar Excel filtrado' });
  }
});

// GET - Exportar inventario a PDF
router.get('/inventario/pdf', async (req, res) => {
  try {
    const connection = await createConnection();
    const [equipos] = await connection.execute(`
      SELECT id, categoria, subcategoria, existencia, nombre, descripcion, marca, modelo
      FROM equipos 
      ORDER BY nombre ASC
    `);
    await connection.end();

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Inventario de Equipos', 10, 15);
    doc.setFontSize(10);
    let y = 25;
    doc.text('ID', 10, y);
    doc.text('Categoría', 25, y);
    doc.text('Subcategoría', 55, y);
    doc.text('Existencia', 85, y);
    doc.text('Equipo', 110, y);
    doc.text('Descripción', 140, y);
    doc.text('Marca', 180, y);
    doc.text('Modelo', 210, y);
    y += 7;
    equipos.forEach(eq => {
      if (y > 270) {
        doc.addPage();
        y = 15;
      }
      doc.text(String(eq.id || ''), 10, y);
      doc.text(String(eq.categoria || ''), 25, y);
      doc.text(String(eq.subcategoria || ''), 55, y);
      doc.text(String(eq.existencia || ''), 85, y);
      doc.text(String(eq.nombre || ''), 110, y);
      doc.text(String(eq.descripcion || ''), 140, y);
      doc.text(String(eq.marca || ''), 180, y);
      doc.text(String(eq.modelo || ''), 210, y);
      y += 7;
    });
    const pdf = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=inventario_completo.pdf');
    res.end(Buffer.from(pdf));
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Exportar inventario filtrado a PDF
router.get('/inventario/pdf/filtrado', async (req, res) => {
  try {
    const { categoria, existencia, equipo, marca, modelo } = req.query;
    const connection = await createConnection();

    let query = `SELECT * FROM equipos WHERE 1=1`;
    const params = [];

    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }
    if (existencia) {
      query += ' AND existencia = ?';
      params.push(existencia);
    }
    if (equipo) {
      query += ' AND nombre LIKE ?';
      params.push(`%${equipo}%`);
    }
    if (marca) {
      query += ' AND marca LIKE ?';
      params.push(`%${marca}%`);
    }
    if (modelo) {
      query += ' AND modelo LIKE ?';
      params.push(`%${modelo}%`);
    }

    const [equipos] = await connection.execute(query, params);
    await connection.end();

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Inventario de Equipos (Filtrado)', 10, 15);
    doc.setFontSize(10);
    let y = 25;
    doc.text('Categoría', 10, y);
    doc.text('Existencia', 35, y);
    doc.text('Equipo', 60, y);
    doc.text('Descripción', 100, y);
    doc.text('Marca', 150, y);
    doc.text('Modelo', 180, y);
    y += 7;
    equipos.forEach(eq => {
      if (y > 270) {
        doc.addPage();
        y = 15;
      }
      doc.text(String(eq.categoria || ''), 10, y);
      doc.text(String(eq.existencia || ''), 35, y);
      doc.text(String(eq.nombre || ''), 60, y);
      doc.text(String(eq.descripcion || ''), 100, y);
      doc.text(String(eq.marca || ''), 150, y);
      doc.text(String(eq.modelo || ''), 180, y);
      y += 7;
    });
    const pdf = doc.output();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=inventario_filtrado.pdf');
    res.send(Buffer.from(pdf, 'binary'));
  } catch (error) {
    res.status(500).json({ error: 'Error al exportar PDF filtrado' });
  }
});

// GET - Reporte de equipos por ubicación
router.get('/por-ubicacion/excel', async (req, res) => {
  try {
    const connection = await createConnection();
    const [equipos] = await connection.execute(`
      SELECT 
        ubicacion,
        COUNT(*) as total_equipos,
        SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as equipos_activos,
        SUM(CASE WHEN estado = 'inactivo' THEN 1 ELSE 0 END) as equipos_inactivos
      FROM equipos 
      GROUP BY ubicacion
      ORDER BY total_equipos DESC
    `);
    await connection.end();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Equipos por Ubicación');

    worksheet.columns = [
      { header: 'Ubicación', key: 'ubicacion', width: 30 },
      { header: 'Total Equipos', key: 'total_equipos', width: 15 },
      { header: 'Equipos Activos', key: 'equipos_activos', width: 15 },
      { header: 'Equipos Inactivos', key: 'equipos_inactivos', width: 15 }
    ];

    equipos.forEach(equipo => {
      worksheet.addRow(equipo);
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=equipos_por_ubicacion.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error al exportar reporte por ubicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Reporte de equipos sin calibración
router.get('/sin-calibracion/excel', async (req, res) => {
  try {
    const connection = await createConnection();
    const [equipos] = await connection.execute(`
      SELECT 
        id, nombre, descripcion, ubicacion, responsable,
        fecha_ultima_calibracion, fecha_proxima_calibracion,
        DATEDIFF(CURDATE(), fecha_ultima_calibracion) as dias_sin_calibracion
      FROM equipos 
      WHERE fecha_ultima_calibracion IS NULL 
        OR DATEDIFF(CURDATE(), fecha_ultima_calibracion) > 365
        AND estado = 'activo'
      ORDER BY dias_sin_calibracion DESC
    `);
    await connection.end();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Equipos Sin Calibración');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Ubicación', key: 'ubicacion', width: 20 },
      { header: 'Responsable', key: 'responsable', width: 25 },
      { header: 'Última Calibración', key: 'fecha_ultima_calibracion', width: 15 },
      { header: 'Días Sin Calibración', key: 'dias_sin_calibracion', width: 20 }
    ];

    equipos.forEach(equipo => {
      worksheet.addRow(equipo);
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=equipos_sin_calibracion.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error al exportar equipos sin calibración:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Descargar todas las fotos .jpg en un ZIP
router.get('/fotos/zip', async (req, res) => {
  try {
    const fotosDir = path.join(__dirname, '../../uploads');
    const output = archiver('zip', { zlib: { level: 9 } });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=fotos.zip');

    output.pipe(res);

    fs.readdirSync(fotosDir).forEach(file => {
      if (file.toLowerCase().endsWith('.jpg')) {
        // Renombrar dentro del zip si es necesario
        output.file(path.join(fotosDir, file), { name: path.basename(file, path.extname(file)) + '.jpg' });
      }
    });

    output.finalize();
  } catch (error) {
    console.error('Error al generar el ZIP de fotos:', error);
    res.status(500).json({ error: 'Error al generar el ZIP de fotos' });
  }
});

module.exports = router; 