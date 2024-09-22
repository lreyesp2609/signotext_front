import React, { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Button, Spinner } from "react-bootstrap";
import axios from "axios";

const Loader = () => (
  <div className="d-flex justify-content-center align-items-center h-100">
    <Spinner animation="border" variant="primary" />
  </div>
);

const GenerarModeloPalabra = () => {
  const [loading, setLoading] = useState(false);

  const generarModelo = async () => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:4000", {
        jsonrpc: "2.0",
        method: "GenerarModeloPalabra", // Cambiado para la nueva conexión
        id: 1,
      });
      setLoading(false);
      alert("Modelo de palabra generado con éxito");
    } catch (error) {
      setLoading(false);
      alert("Error al generar el modelo de palabra");
      console.error(error);
    }
  };

  return (
    <Card className="mt-6 w-96 mx-auto">
      {loading && <Loader />}
      <CardHeader className="bg-primary text-white">
        <img
          src="https://d1.awsstatic.com/whatisimg/intro-gluon-1%20(1).ac2f31378926b5f99a4ba9d741c4aebe3b7a29e2.png"
          alt="card-image"
          className="w-100 h-100"
        />
      </CardHeader>
      <CardBody>
        <Card.Title>Generar Modelo de Palabra</Card.Title>
        <Card.Text>
          El modelo se genera a partir de los videos y las imágenes almacenadas en el RPC.
        </Card.Text>
      </CardBody>
      <CardFooter>
        <Button variant="primary" onClick={generarModelo}>
          Generar Modelo
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GenerarModeloPalabra;
