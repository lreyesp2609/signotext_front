import React, { useEffect, useCallback } from "react";
import leven from "leven";

export default function AutocorreccionFlexible({ oracion, setOracion }) {
  const frasesSugeridas = {
    hola: "Hola",
    "como te llamas": "¿Cómo te llamas?",
    "luis": "Me llamo Luis",
    "rafael": "Me llamo Rafael",
    "josselyn": "Me llamo Josselyn",
    "kerly": "Me llamo Kerly",
    "gleiston": "Me llamo Gleiston",
    "buenos dias": "Buenos días",
    "buenas tardes": "Buenas tardes",
    "buenas noches": "Buenas noches",
    "que tal": "¿Qué tal?",
    adios: "Adiós",
    gracias: "Gracias",
    "de nada": "De nada",
    "por favor": "Por favor",
    "lo siento": "Lo siento",
    disculpa: "Disculpa",
    "como estas": "¿Cómo estás?",
    "estoy bien": "Estoy bien",
    "bien y tu": "Bien, ¿y tú?",
    mal: "Estoy mal",
    "mas o menos": "Más o menos",
    triste: "Estoy triste",
    cansado: "Estoy cansado",
    feliz: "Estoy feliz",
    emocionado: "Estoy emocionado",
    nervioso: "Estoy nervioso",
    preocupado: "Estoy preocupado",
    contento: "Estoy contento",
    "nos vemos": "Nos vemos",
    "hasta luego": "Hasta luego",
    "encantado de conocerte": "Encantado de conocerte",
  };

  const corregirFrase = useCallback((frase) => {
    const fraseLimpia = frase.toLowerCase().replace(/\s+/g, "");
    for (let sugerida in frasesSugeridas) {
      const sugeridaLimpia = sugerida.replace(/\s+/g, "");
      if (
        sugeridaLimpia.startsWith(fraseLimpia) ||
        leven(fraseLimpia, sugeridaLimpia) <=
          Math.max(2, Math.floor(sugeridaLimpia.length / 2))
      ) {
        return frasesSugeridas[sugerida];
      }
    }
    return frase;
  }, []);

  useEffect(() => {
    const fraseSinEspacios = oracion.replace(/\s+/g, "");

    if (fraseSinEspacios.length >= 2) {
      const fraseCorregida = corregirFrase(fraseSinEspacios);

      if (fraseCorregida.toLowerCase() !== fraseSinEspacios.toLowerCase()) {
        setOracion(fraseCorregida);
      }
    }
  }, [oracion, corregirFrase, setOracion]);

  return null;
}
