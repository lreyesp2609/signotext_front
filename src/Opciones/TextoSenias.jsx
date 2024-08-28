import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { iniciarTraductor } from "./hetah"; // Ajusta la ruta según tu estructura de archivos

const TextoSenias = () => {
  const [texto, setTexto] = useState("");
  const [puntos, setPuntos] = useState([]);
  const animationRef = useRef(null);

  const handleTraducir = async () => {
    try {
      const responsePuntos = await fetch(
        "http://127.0.0.1:8000/Traduccion/obtener_puntos/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ frase: texto }),
        }
      );

      if (!responsePuntos.ok) {
        throw new Error("Error al obtener puntos");
      }

      const puntosData = await responsePuntos.json();
      const puntosArray = puntosData.resultados.flatMap(
        (result) => result.puntos
      );
      setPuntos(puntosArray);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (puntos.length > 0) {
      // Cancelar cualquier animación en curso
      if (animationRef.current) {
        animationRef.current();
      }

      // Iniciar la animación
      animationRef.current = iniciarTraductor("myCanvas", puntos);
    }
  }, [puntos]);

  return (
    <div className="container p-4">
      <h1 className="mb-4">Traductor de Texto a Señas</h1>
      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="textoInput" className="form-label">
              Introduce el texto
            </label>
            <input
              type="text"
              className="form-control"
              id="textoInput"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribe aquí tu texto"
            />
          </div>
          <button className="btn btn-primary" onClick={handleTraducir}>
            Traducir
          </button>
        </div>
        <div className="col-md-6">
          <div
            className="border p-4 rounded"
            style={{
              minHeight: "480px",
              backgroundColor: "#333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <canvas
              id="myCanvas"
              width="620"
              height="480"
              style={{
                border: "1px solid #ccc",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            ></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextoSenias;
