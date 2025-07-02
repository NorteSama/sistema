const express = require('express');
const { createConnection } = require('../db');
const router = express.Router();

// Obtener todos los equipos
router.get('/', async (req, res) => {
  try {
    const connection = await createConnection();
    const [equipos] = await connection.execute('SELECT * FROM equipos ORDER BY nombre ASC');
    await connection.end();
    res.json(equipos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los equipos' });
  }
});

// Obtener equipos por tipo (campo o central)
router.get('/por-tipo/:tipo', async (req, res) => {
  const { tipo } = req.params;
  try {
    const connection = await createConnection();
    const [equipos] = await connection.execute(
      'SELECT * FROM equipos WHERE categoria = ?',
      [tipo]
    );
    await connection.end();
    res.json(equipos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener equipos por tipo' });
  }
});

// Crear un nuevo equipo
router.post('/', async (req, res) => {
  try {
    const { categoria, existencia, nombre, descripcion, marca, modelo, subcategoria } = req.body;
    if (!categoria || !existencia || !nombre) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const connection = await createConnection();
    await connection.execute(
      `INSERT INTO equipos (categoria, existencia, nombre, descripcion, marca, modelo, subcategoria)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [categoria, existencia, nombre, descripcion, marca, modelo, subcategoria]
    );
    await connection.end();
    res.json({ mensaje: 'Equipo creado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el equipo' });
  }
});

// Eliminar un equipo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await createConnection();
    const [result] = await connection.execute('DELETE FROM equipos WHERE id = ?', [id]);
    await connection.end();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    
    res.json({ mensaje: 'Equipo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el equipo' });
  }
});

// Actualizar un equipo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { categoria, existencia, nombre, descripcion, marca, modelo, subcategoria } = req.body;
    
    if (!categoria || !existencia || !nombre) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    const connection = await createConnection();
    const [result] = await connection.execute(
      `UPDATE equipos 
       SET categoria = ?, existencia = ?, nombre = ?, descripcion = ?, marca = ?, modelo = ?, subcategoria = ?
       WHERE id = ?`,
      [categoria, existencia, nombre, descripcion, marca, modelo, subcategoria, id]
    );
    await connection.end();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    
    res.json({ mensaje: 'Equipo actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el equipo' });
  }
});

module.exports = router; 