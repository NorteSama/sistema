const mysql = require('mysql2/promise');

// Configuración de la conexión a MySQL
const connectionConfig = {
  host: 'localhost',
  user: 'root', // Cambia por tu usuario de MySQL
  password: 'root', // Cambia por tu contraseña de MySQL
  database: 'crm_inventario', // Cambia por el nombre de tu base de datos
  port: 3306
};

// Función para crear la conexión
async function createConnection() {
  try {
    const connection = await mysql.createConnection(connectionConfig);
    console.log('Conexión a MySQL establecida correctamente');
    return connection;
  } catch (error) {
    console.error('Error al conectar con MySQL:', error);
    throw error;
  }
}

// Script SQL para crear las tablas
const createTablesSQL = `
CREATE TABLE IF NOT EXISTS equipos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  existencia INT DEFAULT 0,
  marca VARCHAR(255),
  modelo VARCHAR(255),
  subcategoria VARCHAR(255),
  ubicacion VARCHAR(255),
  responsable VARCHAR(255),
  fecha_adquisicion DATE,
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  fecha_ultima_calibracion DATE,
  fecha_proxima_calibracion DATE,
  categoria ENUM('laboratorio_central', 'campo', 'consumible_lab_central', 'consumible_seguridad', 'laboratorio_campo') DEFAULT 'campo',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) UNIQUE NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'usuario') DEFAULT 'usuario',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipo_id INT,
  tipo ENUM('certificado', 'foto', 'manual') NOT NULL,
  url_archivo VARCHAR(255) NOT NULL,
  fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_vencimiento DATE,
  FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS historial_calibracion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipo_id INT,
  fecha_calibracion DATE NOT NULL,
  resultado VARCHAR(255),
  observaciones TEXT,
  FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE
);
`;

// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    const connection = await createConnection();
    
    // Crear las tablas
    const statements = createTablesSQL.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }
    
    // Actualizar tabla equipos existente si es necesario
    try {
      await connection.execute('ALTER TABLE equipos ADD COLUMN IF NOT EXISTS existencia INT DEFAULT 0');
      await connection.execute('ALTER TABLE equipos ADD COLUMN IF NOT EXISTS marca VARCHAR(255)');
      await connection.execute('ALTER TABLE equipos ADD COLUMN IF NOT EXISTS modelo VARCHAR(255)');
      await connection.execute('ALTER TABLE equipos ADD COLUMN IF NOT EXISTS subcategoria VARCHAR(255)');
      console.log('Tabla equipos actualizada correctamente');
    } catch (error) {
      console.log('La tabla equipos ya está actualizada o no existe');
    }
    
    console.log('Base de datos inicializada correctamente');
    await connection.end();
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
}

module.exports = {
  createConnection,
  initializeDatabase,
  connectionConfig
}; 