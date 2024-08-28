export function iniciarTraductor(canvasId, puntos) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");

    const hand_connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
        [5, 9], [9, 13], [13, 17]
    ];

    let frame_number = 0;
    const totalFrames = puntos.length;

    function drawFrame(frame_number) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
        const points_in_frame = puntos.filter(p => p.frame === frame_number);
        drawPoints(points_in_frame);
    }

    function drawPoints(points) {
        points.forEach((point) => {
            const x = Math.floor(point.x * canvas.width);
            const y = Math.floor(point.y * canvas.height);
            const color = point.type === 'H' ? 'red' : 'blue';
            ctx.beginPath();
            ctx.arc(x, y, point.type === 'H' ? 4 : 2, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
        });
        drawHandConnections(points);
    }

    function drawHandConnections(points) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        hand_connections.forEach(([i, j]) => {
            const point_i = points.find(p => p.id === i);
            const point_j = points.find(p => p.id === j);
            if (point_i && point_j) {
                const x1 = Math.floor(point_i.x * canvas.width);
                const y1 = Math.floor(point_i.y * canvas.height);
                const x2 = Math.floor(point_j.x * canvas.width);
                const y2 = Math.floor(point_j.y * canvas.height);
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        });
    }

    function animate() {
        drawFrame(frame_number);
        frame_number = (frame_number + 1) % totalFrames; // Reiniciar frame_number al llegar al final
        requestAnimationFrame(animate);
    }

    // Iniciar animación
    animate();
}
