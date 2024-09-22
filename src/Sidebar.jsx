import React from "react";
import { Nav, Navbar } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getLinkClass = (path) => location.pathname === path ? "bg-primary text-white" : "text-dark";

  return (
    <div className="sidebar bg-light d-flex flex-column">
      <Navbar bg="primary" variant="dark" className="mb-3">
        <Navbar.Brand className="mx-auto">Menú de SignoText</Navbar.Brand>
      </Navbar>
      <Nav className="flex-column px-3">
        <Nav.Link
          onClick={() => navigate("/menu/SeniasTexto")}
          className={`py-2 px-3 rounded mb-2 ${getLinkClass("/menu/SeniasTexto")}`}
        >
          Señas a texto
        </Nav.Link>
        <Nav.Link
          onClick={() => navigate("/menu/PalabrasTexto")}
          className={`py-2 px-3 rounded mb-2 ${getLinkClass("/menu/PalabrasTexto")}`}
        >
          Señas a palabras
        </Nav.Link>
        <Nav.Link
          onClick={() => navigate("/menu/TextoSenias")}
          className={`py-2 px-3 rounded mb-2 ${getLinkClass("/menu/TextoSenias")}`}
        >
          Texto a señas
        </Nav.Link>
        <Nav.Link
          onClick={() => navigate("/menu/CrearSenia")}
          className={`py-2 px-3 rounded mb-2 ${getLinkClass("/menu/CrearSenia")}`}
        >
          Crear Seña
        </Nav.Link>
        <Nav.Link
          onClick={() => navigate("/menu/GenerarModelo")}
          className={`py-2 px-3 rounded mb-2 ${getLinkClass("/menu/GenerarModelo")}`}
        >
          Generar Modelo
        </Nav.Link>
        <Nav.Link
          onClick={() => navigate("/menu/CrearVideo")}
          className={`py-2 px-3 rounded mb-2 ${getLinkClass("/menu/CrearVideo")}`}
        >
          Crear Palabra
        </Nav.Link>
        <Nav.Link
          onClick={() => navigate("/menu/GenerarModeloPalabra")}
          className={`py-2 px-3 rounded mb-2 ${getLinkClass("/menu/GenerarModeloPalabra")}`}
        >
          Generar Modelo Palabra
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;
