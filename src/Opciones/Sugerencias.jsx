import React, { useState, useEffect } from "react";

export default function Sugerencias({ oracion, setOracion }) {
  const [sugerencias, setSugerencias] = useState([]);

  const sugerenciasDict = {
    hola: ["Hola, ¿Cómo estás?", "Hola, buen día", "Hola, ¿Qué tal?", "Hola, ¿Cómo te llamas?"],
    ho: ["Hola, ¿Cómo estás?", "Hola, buen día", "Hola, ¿Qué tal?", "Hola, ¿Cómo te llamas?"],
    h: ["Hola, ¿Cómo estás?", "Hola, buen día", "Hola, ¿Qué tal?", "Hola, ¿Cómo te llamas?"],
    adiós: ["Adiós, que tengas un buen día", "Hasta luego", "Nos vemos pronto"],
    a: ["Adiós, que tengas un buen día", "Hasta luego", "Nos vemos pronto"],
    gracias: ["De nada", "¡Con gusto!", "Es un placer"],
    g: ["De nada", "¡Con gusto!", "Es un placer"],
    gr: ["De nada", "¡Con gusto!", "Es un placer"],
  };

  useEffect(() => {
    console.log("Oracion:", oracion);
    const cleanedOracion = oracion.replace(/\s+/g, "").toLowerCase();
    const suggestionKey = Object.keys(sugerenciasDict).find((key) =>
      cleanedOracion.startsWith(key)
    );

    if (suggestionKey) {
      setSugerencias(sugerenciasDict[suggestionKey]);
    } else {
      setSugerencias([]);
    }
  }, [oracion]);

  const seleccionarSugerencia = (sugerencia) => {
    setOracion(sugerencia);
    setSugerencias([]);
  };

  return (
    <div className="mt-3">
      {sugerencias.length > 0 && (
        <div className="card">
          <div className="card-body">
            <h5>Sugerencias:</h5>
            <ul className="list-group">
              {sugerencias.map((sugerencia) => (
                <li
                  key={sugerencia}
                  className="list-group-item list-group-item-action"
                  onClick={() => seleccionarSugerencia(sugerencia)}
                >
                  {sugerencia}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
