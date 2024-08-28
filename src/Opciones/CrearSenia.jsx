import React, { useEffect, useRef, useState } from "react";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import axios from "axios";
import { Button, Card, Collapse, Form, Spinner } from "react-bootstrap";
import { BsPlusCircle, BsFileText, BsGear, BsFilm } from "react-icons/bs";

const DefaultLoader = () => (
  <div className="d-flex justify-content-center align-items-center h-24">
    <Spinner animation="border" variant="primary" />
  </div>
);

export default function CrearSenia({ id_seccion }) {
  const webcamRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openRecursos, setOpenRecursos] = useState(false);
  const [openCalculadora, setOpenCalculadora] = useState(false);
  const [imgBase64, setImgBase64] = useState([]);
  const [nombreModelo, setNombreModelo] = useState("");
  const [canvasIsReady, setCanvasIsReady] = useState(false);
  const [canvasHaveLandmarks, setCanvasHaveLandmarks] = useState(false);
  const [canvasCtx, setCanvasCtx] = useState(null);
  const [canvasElement, setCanvasElement] = useState(null);
  const [handsLoaded, setHandsLoaded] = useState(false);

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
    }

    if (handsLoaded) {
      Simon();
    }
  }, [handsLoaded]);

  const toggleOpen = () => setOpen((cur) => !cur);
  const toggleOpenRecursos = () => setOpenRecursos((cur) => !cur);
  const toggleOpenCalculadora = () => setOpenCalculadora((cur) => !cur);

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

  const Simon = () => {
    if (!window.Hands) {
      console.error("Hands library not loaded");
      return;
    }

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    setCanvasCtx(canvasCtx);
    setCanvasElement(canvasElement);

    function setCanvasMediaVideoSize() {
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
      setCanvasMediaVideoSize();
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
          const baseAutosizeFactor = 5;
          const movementAutosizeFactor = 5;
          const lineWidth =
            baseAutosizeFactor + movementDirection * movementAutosizeFactor;

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

  const eliminarDato = (id) => {
    const nuevosDatos = imgBase64.filter((dato) => dato.id !== id);
    setImgBase64(nuevosDatos);
  };

  const GuardarModelo = async () => {
    console.log({ Nombre: nombreModelo, imagenes: imgBase64 });

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:4000", {
        jsonrpc: "2.0",
        method: "recibirJsonSenias",
        params: [nombreModelo, imgBase64],
        id: 1,
      });

      setLoading(false);
      alert("Modelo Guardado en el RPC");
      setNombreModelo("");
      setImgBase64([]);
    } catch (error) {
      setLoading(false);
      alert("Error");
      console.log(error);
    }
  };

  return (
    <Card className="h-full w-full mt-2 bg-transparent shadow-none">
      {loading && <DefaultLoader />}
      <Card.Header className="rounded-none mb-0 bg-transparent">
        <div className="d-flex justify-content-between gap-8">
          <div className="p-1 rounded-xl">
            <h2 className="text-primary">Guardar Modelo</h2>
          </div>
        </div>
      </Card.Header>
      <Card.Body className="overflow-scroll p-0">
        <Button
          onClick={toggleOpen}
          variant="primary"
          className="w-100 text-white d-flex align-items-center justify-content-center"
        >
          <BsFileText className="me-2" />
          Nombre Modelo
        </Button>
        <Collapse in={open}>
          <Card className="my-4 mx-auto w-full">
            <Card.Body>
              <Form.Control
                type="text"
                placeholder="Nombre"
                value={nombreModelo}
                onChange={(e) => setNombreModelo(e.target.value)}
                required
              />
            </Card.Body>
          </Card>
        </Collapse>
        <Button
          onClick={toggleOpenRecursos}
          variant="primary"
          className="w-100 text-white d-flex align-items-center justify-content-center mt-3"
        >
          <BsFilm className="me-2" />
          Procesado de imagen
        </Button>
        <Collapse in={openRecursos}>
          <Card className="my-4 mx-auto w-full">
            <Card.Body>
              <div className="d-flex gap-2">
                <div className="rounded-2xl shadow-2xl">
                  <h3>Cámara</h3>
                  <video className="input_video" ref={videoRef}></video>
                </div>
                <div className="rounded-2xl shadow-2xl">
                  <h3>Procesado</h3>
                  <canvas
                    className="output_canvas border border-dark"
                    ref={canvasRef}
                  />
                </div>
              </div>
              <Button
                className="d-flex gap-1 mt-4"
                variant="success"
                onClick={capture}
              >
                <BsPlusCircle />
                Agregar imagen
              </Button>
            </Card.Body>
          </Card>
        </Collapse>
        <Button
          onClick={toggleOpenCalculadora}
          variant="primary"
          className="w-100 text-white d-flex align-items-center justify-content-center mt-3"
        >
          <BsGear className="me-2" />
          Imágenes
        </Button>
        <Collapse in={openCalculadora}>
          <Card className="my-4">
            <Card.Body>
              <Card className="shadow-sm">
                <Card.Body>
                  {imgBase64.length ? (
                    <div className="row g-3">
                      {imgBase64.map(({ img, id }, index) => (
                        <div key={id} className="col-6 col-md-3">
                          <Card className="shadow-sm">
                            <Card.Img variant="top" src={img} />
                            <Card.Body>
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
      <Card.Footer className="d-flex justify-content-between align-items-center border-top">
        <div></div>
        <Button
          className="d-flex align-items-center gap-1"
          variant="success"
          onClick={GuardarModelo}
        >
          <BsPlusCircle />
          Guardar
        </Button>
      </Card.Footer>
    </Card>
  );
}
