import React, { useEffect, useRef, useState } from "react";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import axios from "axios";
import { Button, Card, Collapse, Form, Spinner } from "react-bootstrap";
import { BsPlusCircle, BsFileText, BsGear } from "react-icons/bs";
import Sugerencias from "./Sugerencias";

const DefaultLoader = () => (
  <div className="d-flex justify-content-center align-items-center h-24">
    <Spinner animation="border" variant="primary" />
  </div>
);

export default function SeniasTexto() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [imgBase64, setImgBase64] = useState([]);
  const [openImages, setOpenImages] = useState(false);
  const [canvasIsReady, setCanvasIsReady] = useState(false);
  const [canvasHaveLandmarks, setCanvasHaveLandmarks] = useState(false);
  const [canvasCtx, setCanvasCtx] = useState(null);
  const [canvasElement, setCanvasElement] = useState(null);
  const [handsLoaded, setHandsLoaded] = useState(false);
  const [nombreModelo, setNombreModelo] = useState("");
  const [openNombreModelo, setOpenNombreModelo] = useState(false);
  const [modelList, setModelList] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [oracion, setOracion] = useState(""); // Oración acumulada

  useEffect(() => {
    const loadScript = (src, onLoad) => {
      const script = document.createElement("script");
      script.src = src;
      script.crossOrigin = "anonymous";
      script.onload = onLoad;
      document.body.appendChild(script);
    };

    const handleScriptLoad = () => {
      setHandsLoaded(true);
    };

    if (!handsLoaded) {
      loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js",
        handleScriptLoad
      );
      loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
        handleScriptLoad
      );
      loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js",
        handleScriptLoad
      );
    } else {
      initializeCamera();
    }

    fetchModelList();
  }, [handsLoaded]);

  const initializeCamera = () => {
    if (!window.Hands) {
      console.error("Hands library not loaded");
      return;
    }

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    setCanvasCtx(canvasCtx);
    setCanvasElement(canvasElement);

    function setCanvasSize() {
      const videoWidth = videoElement.videoWidth;
      const videoHeight = videoElement.videoHeight;
      const aspectRatio = videoWidth / videoHeight;

      let canvasWidth = canvasElement.offsetWidth;
      let canvasHeight = canvasWidth / aspectRatio;

      if (canvasHeight > canvasElement.offsetHeight) {
        canvasHeight = canvasElement.offsetHeight;
        canvasWidth = canvasHeight * aspectRatio;
      }

      canvasElement.width = canvasWidth;
      canvasElement.height = canvasHeight;
    }

    function onResults(results) {
      setCanvasSize();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.fillStyle = "#FFFFFF";
      canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

      if (results.multiHandLandmarks) {
        if (results.multiHandLandmarks.length > 0) setCanvasHaveLandmarks(true);

        for (const landmarks of results.multiHandLandmarks) {
          const zCoordinates = landmarks.map((landmark) =>
            Math.abs(landmark.z)
          );
          const minZ = Math.min(...zCoordinates);
          const movementDirection = minZ < 0 ? -1 : 1;
          const lineWidth = 5 + movementDirection * 5;

          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: "#000000",
            lineWidth: lineWidth,
          });

          drawLandmarks(canvasCtx, landmarks, {
            color: "#000000",
            lineWidth: lineWidth / 2,
            radius: lineWidth / 4,
          });
        }
      }

      setCanvasIsReady(true);
    }

    const hands = new window.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    hands.onResults(onResults);

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await hands.send({ image: videoElement });
      },
      width: 300,
      height: 300,
    });

    camera.start();

    videoElement.addEventListener("loadedmetadata", () => {
      const videoDimensions = videoElement.getBoundingClientRect();
      canvasElement.style.width = videoDimensions.width + "px";
      canvasElement.style.height = videoDimensions.height + "px";
    });
  };

  const capture = () => {
    if (canvasCtx && canvasIsReady && canvasHaveLandmarks) {
      setCanvasHaveLandmarks(false);

      const dataURL = canvasElement.toDataURL();
      const img = new Image();
      img.src = dataURL;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = 512;
        canvas.height = 512;
        ctx.drawImage(img, 0, 0, 512, 512);

        const resizedDataURL = canvas.toDataURL();
        setImgBase64([
          ...imgBase64,
          { img: resizedDataURL, id: imgBase64.length },
        ]);
      };
    }
  };

  const processImages = async () => {
    if (!selectedModel) {
      alert("Por favor, seleccione un modelo.");
      return;
    }

    setLoading(true);
    try {
      for (const imageData of imgBase64) {
        const splitString = imageData.img.split("data:image/png;base64,");
        const response = await axios.post("http://localhost:4000", {
          jsonrpc: "2.0",
          method: "PredecirImagen",
          params: [splitString[1], selectedModel], // Incluye el modelo seleccionado
          id: 1,
        });
        const result = response.data.result;
        setPrediction(result);
        setOracion((prev) => `${prev} ${result}`); // Actualiza la oración acumulada
        speak(result);
      }
    } catch (error) {
      console.error("Error processing images:", error);
      alert("Error");
    } finally {
      setLoading(false);
    }
  };

  const fetchModelList = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:4000", {
        jsonrpc: "2.0",
        method: "listar_modelos",
        id: 1,
      });
      const modelos = JSON.parse(response.data.result);
      setModelList(modelos);
    } catch (error) {
      console.error("Error fetching model list:", error);
      alert("Error");
    } finally {
      setLoading(false);
    }
  };

  const speak = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const selectedVoice = voices.find((voice) => voice.lang === "es-ES");
    utterance.voice = selectedVoice;
    synth.speak(utterance);
  };

  const clearPrediction = () => {
    setPrediction("");
  };

  const eliminarDato = (id) => {
    const nuevosDatos = imgBase64.filter((dato) => dato.id !== id);
    setImgBase64(nuevosDatos);
  };

  const limpiarOracion = () => {
    setOracion("");
  };

  const eliminarUltimaPalabra = () => {
    const palabras = oracion.trim().split(" ");
    palabras.pop(); // Elimina la última palabra
    setOracion(palabras.join(" "));
  };

  return (
    <Card className="h-full w-full mt-2 bg-transparent shadow-none">
      {loading && <DefaultLoader />}
      <Card.Body>
        <Button
          onClick={() => setOpenNombreModelo((prev) => !prev)}
          variant="primary"
          className="d-flex align-items-center"
        >
          <BsGear className="me-2" />
          Modelos
        </Button>
        <Collapse in={openNombreModelo}>
          <div className="mt-3">
            <Form.Group>
              <Form.Label>Seleccione un modelo:</Form.Label>
              <Form.Select
                onChange={(e) => setSelectedModel(e.target.value)}
                value={selectedModel}
              >
                <option value="">Seleccionar</option>
                {modelList.map((modelo, index) => (
                  <option key={index} value={modelo.nombre}>
                    {" "}
                    {/* Suponiendo que `modelo` tiene una propiedad `nombre` */}
                    {modelo.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
        </Collapse>
        <div className="d-flex mt-3">
          <video ref={videoRef} className="border border-secondary" />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 border border-secondary"
          />
        </div>
        <Button
          onClick={capture}
          variant="success"
          className="mt-3 d-flex align-items-center"
        >
          <BsPlusCircle className="me-2" />
          Capturar Imagen
        </Button>
        <Button
          onClick={processImages}
          variant="primary"
          className="mt-3 d-flex align-items-center"
        >
          <BsFileText className="me-2" />
          Procesar Imágenes
        </Button>

        <div className="d-flex justify-content-between">
          <Button onClick={limpiarOracion} variant="danger">
            Limpiar Oración
          </Button>
          <Button onClick={eliminarUltimaPalabra} variant="warning">
            Eliminar Última Palabra
          </Button>
        </div>
        <div className="mt-3">
          <h3>Oración acumulada:</h3>
          <p>{oracion}</p>
        </div>
        <Sugerencias oracion={oracion} setOracion={setOracion} />
        <Collapse in={imgBase64.length > 0}>
          <Card className="my-4">
            <Card.Body>
              <Card className="shadow-sm">
                <Card.Body>
                  {imgBase64.length ? (
                    <div className="row g-3">
                      {imgBase64.map(({ img, id }) => (
                        <div key={id} className="col-6 col-md-3">
                          <Card className="shadow-sm">
                            <Card.Img variant="top" src={img} />
                            <Card.Body className="text-center">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => eliminarDato(id)}
                              >
                                Eliminar
                              </Button>
                            </Card.Body>
                          </Card>
                        </div>
                      ))}
                    </div>
                  ) : (
                    "No hay imágenes"
                  )}
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Collapse>
      </Card.Body>
    </Card>
  );
}
