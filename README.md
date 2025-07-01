# 🏭 Sistema de Gestión de Inventario de Equipos

Sistema completo para la gestión de inventario de equipos con funcionalidades de subida de archivos, alertas automáticas y generación de reportes.

## 📋 Funcionalidades Principales

### 1. **Registro y Administración del Inventario**
- Carga inicial desde archivo Excel
- Registro manual de equipos
- Visualización por categorías (campo/central)
- Gestión de estados (activo/inactivo)

### 2. **Gestión Documental**
- Subida de archivos por equipo
- Tipos de documentos: certificados, fotos, manuales
- Asociación de documentos a equipos individuales
- Descarga y eliminación de documentos

### 3. **Alertas Automáticas**
- Equipos con calibración próxima (≤15 días)
- Documentos vencidos
- Equipos sin calibración reciente (>1 año)
- Visualización en tiempo real

### 4. **Reportes Exportables**
- Inventario completo en Excel y PDF
- Reportes filtrados por ubicación, estado, categoría
- Equipos por ubicación
- Equipos sin calibración

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** + **Express.js**
- **MySQL** (base de datos)
- **Multer** (subida de archivos)
- **ExcelJS** (generación de Excel)
- **jsPDF** (generación de PDF)
- **Nodemailer** (envío de correos)

### Frontend
- **React.js**
- **React Router** (navegación)
- **Bootstrap** (UI)
- **Axios** (comunicación con API)

## 📁 Estructura del Proyecto

```
CRM/
├── backend/
│   ├── uploads/           # Archivos subidos
│   ├── src/
│   │   ├── routes/        # Endpoints de la API
│   │   ├── controllers/   # Lógica de negocio
│   │   ├── db.js          # Configuración de base de datos
│   │   └── app.js         # Servidor principal
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── App.js         # Aplicación principal
│   │   └── index.js       # Punto de entrada
│   └── package.json
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** (versión 14 o superior)
- **MySQL** (versión 5.7 o superior)
- **npm** o **yarn**

### 1. Clonar el proyecto
```bash
git clone <url-del-repositorio>
cd CRM
```

### 2. Configurar la base de datos
1. Crear una base de datos MySQL llamada `crm_inventario`
2. Modificar la configuración en `backend/src/db.js`:
   ```javascript
   const connectionConfig = {
     host: 'localhost',
     user: 'tu_usuario',
     password: 'tu_contraseña',
     database: 'crm_inventario',
     port: 3306
   };
   ```

### 3. Instalar dependencias del backend
```bash
cd backend
npm install
```

### 4. Instalar dependencias del frontend
```bash
cd ../frontend
npm install
```

## 🏃‍♂️ Ejecutar el Proyecto

### 1. Iniciar el backend
```bash
cd backend
npm start
```
El servidor se ejecutará en `http://localhost:3001`

### 2. Iniciar el frontend
```bash
cd frontend
npm start
```
La aplicación se abrirá en `http://localhost:3000`

## 📖 Uso del Sistema

### 1. **Acceso a la aplicación**
- Abrir `http://localhost:3000` en el navegador
- Navegar por las diferentes secciones usando el menú superior

### 2. **Ver Alertas**
- Ir a la sección "🚨 Alertas"
- Ver equipos que requieren atención
- Actualizar alertas en tiempo real

### 3. **Subir Documentos**
- Ir a "📁 Documentos" → "Subir Documento"
- Seleccionar tipo de documento
- Elegir archivo y fecha de vencimiento (opcional)
- Hacer clic en "Subir Documento"

### 4. **Generar Reportes**
- Ir a la sección "📊 Reportes"
- Elegir tipo de reporte
- Aplicar filtros si es necesario
- Descargar en Excel o PDF

## 🔧 Configuración Avanzada

### Variables de entorno
Crear archivo `.env` en la carpeta `backend`:
```env
PORT=3001
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=crm_inventario
DB_PORT=3306
```

### Configurar alertas por correo
En `backend/src/routes/alertas.js`, configurar Nodemailer:
```javascript
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'tu_correo@gmail.com',
    pass: 'tu_contraseña'
  }
});
```

## 📝 Endpoints de la API

### Documentos
- `POST /api/documentos/:equipoId` - Subir documento
- `GET /api/documentos/equipo/:equipoId` - Obtener documentos de un equipo
- `GET /api/documentos/descargar/:documentoId` - Descargar documento
- `DELETE /api/documentos/:documentoId` - Eliminar documento

### Alertas
- `GET /api/alertas` - Obtener todas las alertas
- `GET /api/alertas/tipo/:tipo` - Obtener alertas por tipo

### Reportes
- `GET /api/reportes/inventario/excel` - Inventario en Excel
- `GET /api/reportes/inventario/pdf` - Inventario en PDF
- `GET /api/reportes/por-ubicacion/excel` - Equipos por ubicación
- `GET /api/reportes/sin-calibracion/excel` - Equipos sin calibración

## 🐛 Solución de Problemas

### Error de conexión a MySQL
- Verificar que MySQL esté ejecutándose
- Comprobar credenciales en `backend/src/db.js`
- Asegurar que la base de datos existe

### Error al subir archivos
- Verificar que la carpeta `backend/uploads` existe
- Comprobar permisos de escritura
- Validar formato de archivo

### Error en el frontend
- Verificar que el backend esté ejecutándose en puerto 3001
- Comprobar configuración del proxy en `frontend/package.json`

## 📞 Soporte

Para reportar problemas o solicitar nuevas funcionalidades:
1. Crear un issue en el repositorio
2. Incluir detalles del error y pasos para reproducirlo
3. Especificar versión de Node.js y MySQL utilizadas

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

**¡Disfruta gestionando tu inventario de equipos de manera eficiente! 🎉**

## Instrucciones para abrir y ejecutar el programa

### 1. Requisitos previos
- Tener instalado **Node.js** y **npm**
- Tener instalado **MySQL** (o MariaDB)

### 2. Clonar o copiar el proyecto
Coloca la carpeta en tu computadora.

### 3. Configurar la base de datos
- Crea la base de datos y las tablas necesarias en MySQL (puedes usar un script `.sql` si tienes uno).
- Configura la conexión en `backend/src/db.js` con tus datos de MySQL.

### 4. Instalar dependencias
Abre dos terminales:

#### Terminal 1: Backend
```
cd backend
npm install
npm start
```

#### Terminal 2: Frontend
```
cd frontend
npm install
npm start
```

### 5. Abrir el sistema
- Abre tu navegador y entra a: [http://localhost:3000](http://localhost:3000)

¡Listo! El sistema estará funcionando.

---

**¿Dudas?**
- Si tienes problemas con la base de datos, revisa el archivo `backend/src/db.js`.
- Si necesitas ayuda, contacta al desarrollador. "# CRM" 
