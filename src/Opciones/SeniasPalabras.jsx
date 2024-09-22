import React, { useEffect, useRef, useState } from "react";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import axios from "axios";
import { Button, Card, Collapse, Form, Spinner } from "react-bootstrap";
import { BsPlusCircle, BsFileText, BsGear, BsStopFill, BsFilm } from "react-icons/bs";

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
  const [videoBase64, setVideoBase64] = useState([]);
  const [canvasIsReady, setCanvasIsReady] = useState(false);
  const [canvasHaveLandmarks, setCanvasHaveLandmarks] = useState(false);
  const [canvasCtx, setCanvasCtx] = useState(null);
  const [canvasElement, setCanvasElement] = useState(null);
  const [handsLoaded, setHandsLoaded] = useState(false);
  const [modelList, setModelList] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [oracion, setOracion] = useState("");
  const [openNombreModelo, setOpenNombreModelo] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videosBase64, setVideosBase64] = useState([]); // Videos grabados
  const [processedVideos, setProcessedVideos] = useState([]); // Videos procesados
  const chunksRef = useRef([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [openRecursos, setOpenRecursos] = useState(false);
  const [openCalculadora, setOpenCalculadora] = useState(false);

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

  const startRecording = () => {
    if (canvasElement && !isRecording) {
      chunksRef.current = [];
      const stream = canvasElement.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;
          setVideosBase64((prev) => [
            ...prev,
            { video: base64data, id: prev.length },
          ]);
        };
        reader.readAsDataURL(blob);
      };

      recorder.onerror = (e) => {
        console.error("Error in MediaRecorder: ", e);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const processVideos = async () => {
    if (!selectedModel) {
      alert("Por favor, seleccione un modelo.");
      return;
    }

    setLoading(true);
    try {
      const processedResults = [];
      for (const videoData of videosBase64) {
        const splitString = videoData.video.split("data:video/webm;base64,");
        const response = await axios.post("http://localhost:4000", {
          jsonrpc: "2.0",
          method: "PredecirVideo",
          params: [splitString[1], selectedModel],
          id: 1,
        });
        const result = response.data.result;
        processedResults.push({ video: videoData.video, result });
        setPrediction(result);
        setOracion((prev) => `${prev} ${result}`);
        speak(result);
      }
      setProcessedVideos(processedResults); // Almacenar los videos procesados
    } catch (error) {
      console.error("Error processing videos:", error);
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
        method: "listar_modelos_videos",
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

  const limpiarOracion = () => {
    setOracion("");
  };

  const eliminarUltimaPalabra = () => {
    const palabras = oracion.trim().split(" ");
    palabras.pop(); // Elimina la última palabra
    setOracion(palabras.join(" "));
  };

  const eliminarDato = (id) => {
    const nuevosDatos = videosBase64.filter((dato) => dato.id !== id);
    setVideosBase64(nuevosDatos);
  };

  const toggleOpen = () => setOpen((cur) => !cur);
  const toggleOpenRecursos = () => setOpenRecursos((cur) => !cur);
  const toggleOpenCalculadora = () => setOpenCalculadora((cur) => !cur);

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
                    {modelo.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
        </Collapse>
        <Button
          onClick={toggleOpenRecursos}
          variant="primary"
          className="w-100 text-white d-flex align-items-center justify-content-center mt-3"
        >
          <BsFilm className="me-2" />
          Procesado de video
        </Button>
        <Collapse in={openRecursos}>
          <Card className="my-4 mx-auto w-full">
            <Card.Body>
              <div className="d-flex gap-2">
                <div className="rounded-2xl shadow-2xl">
                  <h3>Cámara</h3>
                  <video
                    className="input_video"
                    ref={videoRef}
                    autoPlay
                    muted
                  ></video>
                </div>
                <div className="rounded-2xl shadow-2xl">
                  <h3>Procesado</h3>
                  <canvas
                    className="output_canvas border border-dark"
                    ref={canvasRef}
                  />
                </div>
              </div>
              {!isRecording ? (
                <Button
                  className="d-flex gap-1 mt-4"
                  variant="success"
                  onClick={startRecording}
                >
                  <BsPlusCircle />
                  Iniciar grabación
                </Button>
              ) : (
                <Button
                  className="d-flex gap-1 mt-4"
                  variant="danger"
                  onClick={stopRecording}
                >
                  <BsStopFill />
                  Detener grabación
                </Button>
              )}
            </Card.Body>
          </Card>
        </Collapse>
        <Button
          onClick={processVideos}
          variant="primary"
          className="mt-3 d-flex align-items-center"
        >
          <BsFileText className="me-2" />
          Procesar Videos
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

        <Collapse in={videosBase64.length > 0}>
          <Card className="my-4">
            <Card.Body>
              <Card className="shadow-sm">
                <Card.Body>
                  {videosBase64.length ? (
                    <div className="row g-3">
                      {videosBase64.map(({ video, id }) => (
                        <div key={id} className="col-6 col-md-3">
                          <Card className="shadow-sm">
                            <video
                              className="card-img-top"
                              src={video}
                              controls
                            />
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
                    "No hay videos"
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
