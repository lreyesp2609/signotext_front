import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";

const TextoSenias = () => {
  return (
    <div className="container-fluid p-4">
      <h1 className="mb-4 text-center">Traductor 2D lengua de señas</h1>
      <div className="row">
        <div className="col-md-12">
          <div
            className="border p-4 rounded"
            style={{
              minHeight: "624px",
              backgroundColor: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <iframe
              src="http://localhost:3001/proxy" // Usa el proxy local
              title="Canvas Externo"
              className="w-100" // El iframe ocupará todo el ancho del contenedor
              style={{
                height: "624px",
                border: "none",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextoSenias;
