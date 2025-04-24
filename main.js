document.addEventListener('DOMContentLoaded', function() {
    console.log('全畫面波浪動畫已載入！');
    
    // 建立 canvas 元素
    const canvas = document.getElementById('waveCanvas');
    const ctx = canvas.getContext('2d');
    
    // 設定基本參數
    const verticalCenter = window.innerHeight * 0.5;
    const horizontalCenter = window.innerWidth * 0.5;
    let baseAmplitude = 100;
    const particleColor = 'white';
    let maxParticleCount = 200; // 主要波浪粒子數量
    let randomParticleCount = 50; // 隨機粒子數量
    let currentParticleCount = maxParticleCount;
    let targetParticleCount = maxParticleCount; // 目標粒子數量
    const smoothingFactor = 0.1; // 平滑因子
    let particleGroups = [[], [], []];
    let randomParticleGroups = [[], [], []];
    let particleSize = 1;
    
    // 設定三條線的垂直位置
    const verticalPositions = [
        window.innerHeight * 0.25,  // 上方
        window.innerHeight * 0.5,   // 中間
        window.innerHeight * 0.75   // 下方
    ];
    
    // 為每條線設定不同的波形參數
    const waveParamsList = [
        {
            frequency: 0.002,
            phase: Math.random() * Math.PI * 2,
            speed: 0.015,
            horizontalSpeed: 1.2
        },
        {
            frequency: 0.0018,
            phase: Math.random() * Math.PI * 2,
            speed: 0.012,
            horizontalSpeed: 1.4
        },
        {
            frequency: 0.0022,
            phase: Math.random() * Math.PI * 2,
            speed: 0.018,
            horizontalSpeed: 1.0
        }
    ];

    let time = 0;
    let horizontalOffset = 0;
    let isConnected = false;
    let port = null;
    let lastSensorValue = 0; // 初始值設為最小值

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
            
    function initializeParticles() {
        // 初始化三組主要波浪粒子
        particleGroups = waveParamsList.map((_, groupIndex) => {
            const particles = [];
            for (let i = 0; i < Math.floor(currentParticleCount / 3); i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const speed = Math.random() * 0.5 + 0.5;
                particles.push({ 
                    x, 
                    y, 
                    size: particleSize,
                    speed
                });
            }
            return particles;
        });

        // 初始化三組隨機粒子
        randomParticleGroups = waveParamsList.map((_, groupIndex) => {
            const randomParticles = [];
            for (let i = 0; i < Math.floor(randomParticleCount / 3); i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const speed = Math.random() * 0.3 + 0.2;
                const offsetY = (Math.random() - 0.5) * 40;
                const wanderSpeed = (Math.random() - 0.5) * 0.02;
                randomParticles.push({
                    x,
                    y,
                    size: particleSize,
                    speed,
                    offsetY,
                    wanderSpeed,
                    phase: Math.random() * Math.PI * 2
                });
            }
            return randomParticles;
        });
    }

    function generateWavePoint(x, time, waveParams) {
        const adjustedX = x + horizontalOffset;
        return Math.sin(adjustedX * waveParams.frequency + time * waveParams.speed + waveParams.phase) * baseAmplitude;
    }

    function drawParticles() {
        // 繪製三組主要波浪粒子
        particleGroups.forEach((particles, groupIndex) => {
            const centerY = verticalPositions[groupIndex];
            const waveParams = waveParamsList[groupIndex];

            particles.forEach(p => {
                p.x -= p.speed;
                if (p.x < 0) p.x = canvas.width;
                const waveValue = generateWavePoint(p.x, time, waveParams);
                p.y = centerY + waveValue;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = particleColor;
                ctx.fill();
            });
        });

        // 繪製三組隨機粒子
        randomParticleGroups.forEach((randomParticles, groupIndex) => {
            const centerY = verticalPositions[groupIndex];
            const waveParams = waveParamsList[groupIndex];

            randomParticles.forEach(p => {
                p.x -= p.speed;
                if (p.x < 0) p.x = canvas.width;
                
                const baseWaveY = centerY + generateWavePoint(p.x, time, waveParams);
                p.y = baseWaveY + p.offsetY + Math.sin(time * 2 + p.phase) * 10;
                p.offsetY += p.wanderSpeed;
                
                if (Math.abs(p.offsetY) > 40) {
                    p.wanderSpeed *= -1;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, 0.7)`;
                ctx.fill();
            });
        });

        // 為每組粒子繪製連接線
        particleGroups.forEach((particles) => {
            if (particles.length > 1) {
                const maxDist = 60;
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        if (dist < maxDist) {
                            const alpha = (1 - dist / maxDist) * 0.5;
                            ctx.beginPath();
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                        }
                    }
                }
            }
        });

        // 繪製隨機粒子之間的連接線
        randomParticleGroups.forEach((randomParticles, groupIndex) => {
            const maxDist = 80; // 隨機粒子之間的最大連線距離
            for (let i = 0; i < randomParticles.length; i++) {
                // 與同組的其他隨機粒子連線
                for (let j = i + 1; j < randomParticles.length; j++) {
                    const dx = randomParticles[i].x - randomParticles[j].x;
                    const dy = randomParticles[i].y - randomParticles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < maxDist && Math.random() < 0.3) { // 30% 的機率生成連線
                        const alpha = (1 - dist / maxDist) * 0.3; // 較淡的連線
                        ctx.beginPath();
                        ctx.moveTo(randomParticles[i].x, randomParticles[i].y);
                        ctx.lineTo(randomParticles[j].x, randomParticles[j].y);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                        ctx.lineWidth = 0.3; // 較細的線條
                        ctx.stroke();
                    }
                }

                // 與主要粒子的連線
                const mainParticles = particleGroups[groupIndex];
                mainParticles.forEach(mainP => {
                    const dx = randomParticles[i].x - mainP.x;
                    const dy = randomParticles[i].y - mainP.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < maxDist && Math.random() < 0.2) { // 20% 的機率生成連線
                        const alpha = (1 - dist / maxDist) * 0.2; // 更淡的連線
                        ctx.beginPath();
                        ctx.moveTo(randomParticles[i].x, randomParticles[i].y);
                        ctx.lineTo(mainP.x, mainP.y);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                        ctx.lineWidth = 0.2; // 更細的線條
                        ctx.stroke();
                    }
                });
            }
        });
    }

    function updateParticleCount() {
        // 平滑過渡到目標數量
        const targetPerGroup = Math.floor(targetParticleCount / 3);
        
        particleGroups.forEach((particles, groupIndex) => {
            const diff = targetPerGroup - particles.length;
            if (Math.abs(diff) > 1) {
                if (diff > 0) {
                    // 需要增加粒子
                    for (let i = 0; i < Math.ceil(diff * smoothingFactor); i++) {
                        const x = Math.random() * canvas.width;
                        const y = verticalPositions[groupIndex];
                        const speed = Math.random() * 0.5 + 0.5;
                        particles.push({ x, y, size: particleSize, speed });
                    }
                } else {
                    // 需要減少粒子
                    const removeCount = Math.ceil(Math.abs(diff) * smoothingFactor);
                    particles.splice(particles.length - removeCount, removeCount);
                }
            }
        });
    }

    function animate() {
        time += 0.01;
        horizontalOffset += waveParamsList[0].horizontalSpeed;
        updateParticleCount(); // 在每一幀更新粒子數量
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawParticles();
        requestAnimationFrame(animate);
    }

    async function connectToArduino() {
        if (isConnected) {
            console.log('[Serial] 已經連接到 Arduino');
            return;
        }

        try {
            port = await navigator.serial.requestPort();
            await port.open({ baudRate: 9600 });
            isConnected = true;
            console.log('[Serial] 串口已打開');

            const decoder = new TextDecoderStream();
            const inputDone = port.readable.pipeTo(decoder.writable);
            const inputStream = decoder.readable;
            const reader = inputStream.getReader();

            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    console.log('[Serial] 連接已關閉');
                    break;
                }
                if (value) {
                    const sensorValue = parseInt(value.trim(), 10);
                    if (!isNaN(sensorValue)) {
                        const minParticles = 10;
                        targetParticleCount = Math.floor(maxParticleCount - ((sensorValue / 200) * (maxParticleCount - minParticles)));
                        console.log(`[Serial] 新數值: ${sensorValue}, 目標粒子數量: ${targetParticleCount}`);
                    }
                }
            }
        } catch (error) {
            console.error('[Serial] 連接錯誤:', error);
            isConnected = false;
        }
    }

    window.addEventListener('resize', resizeCanvas);
    document.getElementById('connectButton').addEventListener('click', connectToArduino);
    
    resizeCanvas();
    initializeParticles();
    animate();
});