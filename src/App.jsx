import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Sidebar from "./Sidebar";
import SeniasTexto from "./Opciones/SeniasTexto";
import TextoSenias from "./Opciones/TextoSenias";
import CrearSenia from "./Opciones/CrearSenia";
import GenerarModelo from "./Opciones/GenerarModelo";
import { Container, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/menu/*"
          element={
            <Container fluid className="p-0">
              <Row className="no-gutters">
                <Col xs={12} md={3} className="sidebar-col">
                  <Sidebar />
                </Col>
                <Col xs={12} md={9} className="content-col">
                  <Routes>
                    <Route path="/" element={<Navigate to="/menu/SeniasTexto" />} />
                    <Route path="SeniasTexto" element={<SeniasTexto />} />
                    <Route path="TextoSenias" element={<TextoSenias />} />
                    <Route path="CrearSenia" element={<CrearSenia />} />
                    <Route path="GenerarModelo" element={<GenerarModelo />} />
                  </Routes>
                </Col>
              </Row>
            </Container>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
