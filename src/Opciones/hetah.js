export function iniciarTraductor(canvas, puntos) {
    const ctx = canvas.getContext("2d");
  
    const hand_connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [0, 9], [9, 10], [10, 11], [11, 12],
      [0, 13], [13, 14], [14, 15], [15, 16],
      [0, 17], [17, 18], [18, 19], [19, 20],
      [5, 9], [9, 13], [13, 17]
    ];
  
    let json_points = [];
    let frame_number = 0;
    let intervalId = null;
  
    const hiddenCanvas = document.createElement('canvas');
    const hiddenCtx = hiddenCanvas.getContext('2d');
    hiddenCanvas.width = canvas.width;
    hiddenCanvas.height = canvas.height;
  
    function drawFrame(frame_number) {
      hiddenCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height); // Limpia el canvas oculto en cada frame
  
      const points_in_frame = json_points.filter(p => p.frame === frame_number);
      drawPoints(hiddenCtx, points_in_frame); // Dibuja en el canvas oculto
  
      // Copia el contenido del canvas oculto al canvas visible
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(hiddenCanvas, 0, 0);
    }
  
    function drawPoints(ctx, points) {
      let groups = {};
      for (let point of points) {
        let key = point.type + "-" + point.frame;
        if (!(key in groups)) {
          groups[key] = [];
        }
        groups[key].push(point);
      }
      for (let key in groups) {
        let group = groups[key];
        let group_type = group[0].type;
        let subgroups = group_type === 'H' ? splitIntoSubgroups(group, 21) : [group];
        for (let subgroup of subgroups) {
          for (let point of subgroup) {
            let x = Math.floor(point.x * canvas.width);
            let y = Math.floor(point.y * canvas.height);
            let color = group_type === 'H' ? 'red' : 'blue';
            ctx.beginPath();
            ctx.arc(x, y, group_type === 'F' ? 1.5 : 4, 0, 2 * Math.PI, false);
            ctx.fillStyle = color;
            ctx.fill();
          }
          if (group_type === 'H') {
            drawHandConnections(ctx, subgroup);
          }
        }
      }
    }
  
    function drawHandConnections(ctx, subgroup) {
      for (let [i, j] of hand_connections) {
        if (i < subgroup.length && j < subgroup.length) {
          let x1 = Math.floor(subgroup[i].x * canvas.width);
          let y1 = Math.floor(subgroup[i].y * canvas.height);
          let x2 = Math.floor(subgroup[j].x * canvas.width);
          let y2 = Math.floor(subgroup[j].y * canvas.height);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      }
    }
  
    function splitIntoSubgroups(group, size) {
      let subgroups = [];
      for (let i = 0; i < group.length; i += size) {
        subgroups.push(group.slice(i, i + size));
      }
      return subgroups;
    }
  
    function startCiclo() {
      json_points = [];
      let totalFrames = 0;
      for (let i = 0; i < puntos.length; i++) {
        let punto = puntos[i];
        json_points.push({
          ...punto,
          frame: punto.frame + totalFrames
        });
        totalFrames = Math.max(totalFrames, punto.frame + 1);
      }
  
      // Asegúrate de que no haya animaciones previas en curso
      if (intervalId != null) {
        clearInterval(intervalId);
      }
      intervalId = setInterval(function () {
        if (frame_number >= json_points.length) {
          frame_number = 0; // Reinicia el frame si llegamos al final
        }
        drawFrame(frame_number);
        frame_number++;
      }, 200); // Intervalo cambiado a 200 ms para ralentizar la animación
    }
  
    startCiclo();
  
    return () => {
      clearInterval(intervalId); // Limpiar intervalos al cancelar la animación
    };
  }
  