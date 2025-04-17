document.addEventListener('DOMContentLoaded', function () {
    console.log('全畫面波浪動畫已載入！');

    // 建立 canvas 元素並插入 body
    let canvas = document.getElementById('waveCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'waveCanvas';
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');

    // 設定基本參數
    const verticalCenters = [
        window.innerHeight * (0.3 + Math.random() * 0.4),
        window.innerHeight * (0.3 + Math.random() * 0.4)
    ];
    const baseAmplitude = 97.5 + Math.random() * 39;

    const waveGroups = [
        {
            frequency: 0.0013 + Math.random() * 0.00195,
            phase: Math.random() * Math.PI * 2,
            speed: 0.01 + Math.random() * 0.02,
            horizontalSpeed: 1 + Math.random() * 0.5,
            floatSpeed: 0.0008 + Math.random() * 0.0004,
            floatAmplitude: 30 + Math.random() * 20,
            color: 'black'
        },
        {
            frequency: 0.0013 + Math.random() * 0.00195,
            phase: Math.random() * Math.PI * 2,
            speed: 0.01 + Math.random() * 0.02,
            horizontalSpeed: 1 + Math.random() * 0.5,
            floatSpeed: 0.0008 + Math.random() * 0.0004,
            floatAmplitude: 30 + Math.random() * 20,
            color: 'black'
        }
    ];

    let time = Math.random() * 100;
    let horizontalOffset = 0;
    let previousWavePoints = [];
    const extensionFactor = 0.3;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        previousWavePoints = Array(Math.ceil(canvas.width * (1 + extensionFactor * 2))).fill(verticalCenters[0]);
    }

    function drawSmoothWave(points) {
        if (points.length < 2) return;

        const startX = -canvas.width * extensionFactor;
        ctx.beginPath();
        ctx.moveTo(startX, points[0]);

        for (let i = 1; i < points.length; i++) {
            const x = startX + i;
            ctx.lineTo(x, points[i]);
        }

        ctx.stroke();
    }

    function generateWavePoint(x, time, offset, waveGroup) {
        const adjustedX = x + offset;
        let value = Math.sin(adjustedX * waveGroup.frequency + time * waveGroup.speed + waveGroup.phase) * baseAmplitude;
        return value;
    }

    function drawCircleWithWave(x, baseY, radius, color, waveGroup) {
        const verticalShift = Math.sin(time * waveGroup.floatSpeed) * waveGroup.floatAmplitude;
        const waveValue = generateWavePoint(x, time, horizontalOffset, waveGroup);
        const y = baseY + waveValue + verticalShift;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }

    let balls = [];
    function initializeBalls() {
        const ballCount = Math.floor(Math.random() * 5) + 3;
        balls = [];
        for (let i = 0; i < ballCount; i++) {
            const waveIndex = i % waveGroups.length;
            balls.push({
                x: canvas.width + Math.random() * canvas.width,
                baseY: verticalCenters[waveIndex],
                radius: Math.random() * 20 + 10,
                color: 'red',
                waveGroup: waveGroups[waveIndex]
            });
        }
    }

    let particles = [];
    function initializeParticles() {
        const particleCount = 500;
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 1 + 0.5; // 更小的粒子
            const speed = Math.random() * 0.5 + 0.5;
            const color = 'rgba(255, 255, 255, 0.8)'; // 白色粒子

            particles.push({ x, y, size, speed, color });
        }
    }

    function drawParticles() {
        particles.forEach((particle, index) => {
            particle.x -= particle.speed;

            if (particle.x < 0) {
                particle.x = canvas.width;
                particle.y = Math.random() * canvas.height;
            }

            const waveIndex = index % waveGroups.length;
            const waveGroup = waveGroups[waveIndex];
            const verticalShift = Math.sin(time * waveGroup.floatSpeed) * waveGroup.floatAmplitude;
            const verticalCenter = verticalCenters[waveIndex];
            const waveValue = generateWavePoint(particle.x, time, horizontalOffset, waveGroup);
            particle.y = verticalCenter + waveValue + verticalShift;

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            particle.color = 'rgba(255, 0, 0, 0.8)'; // 修改粒子顏色為紅色
            ctx.fillStyle = particle.color;
            ctx.fill();
        });

        // 新增粒子之間的連線
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i];
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                const maxDistance = 100; // 設定連線的最大距離
                if (distance < maxDistance) {
                    const alpha = 1 - distance / maxDistance; // 透明度隨距離變化
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`; // 修改粒子連線顏色為紅色
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function drawWave() {
        time += 0.01;
        horizontalOffset += waveGroups[0].horizontalSpeed;

        // 填黑色背景
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawParticles();

        waveGroups.forEach((waveGroup, index) => {
            ctx.strokeStyle = 'red'; // 修改波浪線條顏色為紅色
            const wavePoints = [];

            for (let i = 0; i < canvas.width * (1 + extensionFactor * 2); i++) {
                const x = i;
                const value = generateWavePoint(x, time, horizontalOffset, waveGroup);
                const verticalShift = Math.sin(time * waveGroup.floatSpeed) * waveGroup.floatAmplitude;
                const y = verticalCenters[index] + value + verticalShift;

                wavePoints.push(y);
            }

            drawSmoothWave(wavePoints);
        });

        balls.forEach(ball => {
            drawCircleWithWave(ball.x, ball.baseY, ball.radius, ball.color, ball.waveGroup);
        });

        requestAnimationFrame(drawWave);
    }

    window.addEventListener('resize', resizeCanvas);

    resizeCanvas();
    initializeBalls();
    initializeParticles();
    requestAnimationFrame(drawWave);
});