import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Importar componentes
import Alertas from './components/Alertas';
import Reportes from './components/Reportes';
import SubirDocumento from './components/SubirDocumento';
import VerDocumentos from './components/VerDocumentos';
import CrearEquipo from './components/CrearEquipo';
import ListaEquipos from './components/ListaEquipos';

// Componente de navegación
function Navigation() {
  const location = useLocation();

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          🏭 Sistema de Inventario
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/inventario" 
              active={location.pathname === '/inventario'}
            >
              📋 Inventario
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/inventario/crear" 
              active={location.pathname === '/inventario/crear'}
            >
              ➕ Agregar Inventario
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/reportes"
              active={location.pathname === '/reportes'}
            >
              📊 Reportes
            </Nav.Link>
            <NavDropdown title="📁 Documentos" id="documentos-dropdown">
              <NavDropdown.Item as={Link} to="/documentos/subir">
                Subir Documento
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav>
            <Nav.Link href="#about">ℹ️ Ayuda</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

// Página de inicio
function Home() {
  return (
    <Container>
      <div className="text-center py-5">
        <h1 className="display-4 mb-4">Sistema de Gestión de Inventario</h1>
        <p className="lead mb-4">
          Gestiona tu inventario de equipos de manera eficiente y organizada
        </p>
        
        <div className="row mt-5">
          <div className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-body text-center">
                <h3 className="card-title">📋 Inventario</h3>
                <p className="card-text">
                  Gestiona y consulta el inventario de equipos registrados en el sistema
                </p>
                <Link to="/inventario" className="btn btn-primary">
                  Ver Inventario
                </Link>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-body text-center">
                <h3 className="card-title">📊 Reportes</h3>
                <p className="card-text">
                  Genera reportes en Excel y PDF de tu inventario
                </p>
                <Link to="/reportes" className="btn btn-success">
                  Generar Reportes
                </Link>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-body text-center">
                <h3 className="card-title">📁 Documentos</h3>
                <p className="card-text">
                  Sube y gestiona documentos asociados a cada equipo
                </p>
                <Link to="/documentos/subir" className="btn btn-info">
                  Subir Documentos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

// Página para subir documentos (ejemplo con equipo ID 1)
function SubirDocumentosPage() {
  return (
    <Container>
      <h2 className="mb-4">Subir Documentos</h2>
      <p className="text-muted mb-4">
        Selecciona un equipo y sube sus documentos asociados
      </p>
      
      {/* Aquí podrías agregar un selector de equipos */}
      <div className="alert alert-info">
        <strong>Nota:</strong> Este es un ejemplo con el equipo ID 1. 
        En una implementación completa, tendrías un selector de equipos.
      </div>
      
      <SubirDocumento 
        equipoId={1} 
        onDocumentoSubido={() => {
          console.log('Documento subido exitosamente');
        }}
      />
    </Container>
  );
}

// Página para ver documentos
function VerDocumentosPage() {
  return (
    <Container>
      <h2 className="mb-4">Ver Documentos</h2>
      <VerDocumentos equipoId={1} />
    </Container>
  );
}

// Página para crear un nuevo equipo
function CrearEquipoPage() {
  return (
    <Container>
      <h2 className="mb-4">Registrar Nuevo Equipo</h2>
      <CrearEquipo />
    </Container>
  );
}

// Página para visualizar el inventario
function InventarioPage() {
  return (
    <Container>
      <h2 className="mb-4">Inventario de Equipos</h2>
      <ListaEquipos />
    </Container>
  );
}

// Componente principal de la aplicación
function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/documentos/subir" element={<SubirDocumentosPage />} />
          <Route path="/inventario/crear" element={<CrearEquipoPage />} />
          <Route path="/inventario" element={<InventarioPage />} />
        </Routes>
        
        <footer className="bg-light text-center py-4 mt-5">
          <Container>
            <p className="text-muted mb-0">
              © 2024 Sistema de Gestión de Inventario. Desarrollado con React y Node.js
            </p>
          </Container>
        </footer>
      </div>
    </Router>
  );
}

export default App; 