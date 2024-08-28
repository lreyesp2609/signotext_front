import React from "react";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/menu");
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Row>
        <Col md={12}>
          <Card className="shadow-lg p-4 mb-5 bg-white rounded" style={{ maxWidth: '400px', margin: 'auto' }}>
            <Card.Body>
              <h3 className="text-center mb-4" style={{ color: '#0d6efd', fontWeight: 'bold' }}>
                Bienvenido
              </h3>
              <p className="text-center text-muted mb-4">
                Inicia sesión para continuar
              </p>
              <Form>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Usuario</Form.Label>
                  <Form.Control type="text" placeholder="Ingresa tu usuario" className="p-3" />
                </Form.Group>

                <Form.Group controlId="formBasicPassword" className="mt-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    className="p-3"
                  />
                </Form.Group>

                <Button variant="primary" type="button" onClick={handleLogin} className="w-100 mt-4 p-2" style={{ fontWeight: 'bold' }}>
                  Iniciar Sesión
                </Button>
                <div className="mt-3 text-center">
                  <a href="#" className="text-primary" style={{ textDecoration: 'underline' }}>
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
