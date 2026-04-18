window.onload = function() {
    const canvas = document.getElementById('render-3d');
    const ctx = canvas.getContext('2d');
    const btn = document.getElementById('boton-jugar');
    const pInicio = document.getElementById('pantalla-inicio');
    const pFlash = document.getElementById('flash-disparo');
    const txtPuntos = document.getElementById('puntos');

    const mapa = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,0,1],
        [1,0,0,0,0,1,0,0,0,0,0,0,1,0,1,0,0,0,0,1],
        [1,0,1,1,0,1,1,1,1,0,1,1,1,0,1,0,1,1,0,1],
        [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
        [1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,1,0,1,1],
        [1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
        [1,1,1,0,1,1,1,1,0,1,1,0,1,1,1,1,0,1,1,1],
        [1,0,0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0,0,1],
        [1,0,1,1,1,1,0,1,0,0,0,0,1,0,1,1,1,1,0,1],
        [1,0,0,0,0,1,0,1,1,0,1,1,1,0,1,0,0,0,0,1],
        [1,0,1,1,0,1,0,0,0,0,0,0,0,0,1,0,1,1,0,1],
        [1,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1],
        [1,0,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    let enemigos = [];
    let pj = { x: 1.5, y: 1.5, dir: 0 };
    let teclas = {};
    let activo = false;
    let kills = 0;
    let zBuffer = new Array(canvas.width);
    let audioCtx;
    let bLoop;

    document.addEventListener('keydown', (e) => { 
        teclas[e.key.toLowerCase()] = true; 
        if(e.key.toLowerCase() === 'f' && activo) disparar();
    });
    document.addEventListener('keyup', (e) => { teclas[e.key.toLowerCase()] = false; });

    function generarHorda() {
        enemigos = [];
        for(let k=0; k<15; k++){
            let tx, ty;
            do {
                tx = Math.random() * 18 + 1;
                ty = Math.random() * 18 + 1;
            } while (mapa[Math.floor(ty)][Math.floor(tx)] === 1 || (Math.abs(tx - pj.x) < 3 && Math.abs(ty - pj.y) < 3));
            enemigos.push({
                x: tx,
                y: ty,
                vivo: true,
                speed: 0.008 + Math.random() * 0.012
            });
        }
    }

    function disparar() {
        pFlash.style.display = 'block';
        setTimeout(() => { pFlash.style.display = 'none'; }, 40);
        
        if(audioCtx) {
            let o = audioCtx.createOscillator();
            let g = audioCtx.createGain();
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(120, audioCtx.currentTime);
            o.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.1);
            g.gain.setValueAtTime(0.05, audioCtx.currentTime);
            g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
            o.connect(g);
            g.connect(audioCtx.destination);
            o.start();
            o.stop(audioCtx.currentTime + 0.1);
        }

        for (let e of enemigos) {
            if (!e.vivo) continue;
            let dx = e.x - pj.x, dy = e.y - pj.y;
            let ang = Math.atan2(dy, dx) - pj.dir;
            while (ang < -Math.PI) ang += Math.PI * 2;
            while (ang > Math.PI) ang -= Math.PI * 2;
            let d = Math.sqrt(dx*dx + dy*dy);
            if (Math.abs(ang) < 0.15 && d < 12) {
                e.vivo = false;
                kills++;
                txtPuntos.innerText = kills;
                if (kills >= 15) {
                    activo = false;
                    clearInterval(bLoop);
                    pInicio.style.display = 'flex';
                    pInicio.innerHTML = '<h1 style="color:white; font-size:3rem;">¡GANASTE!</h1><p style="color:white;">HAS LIMPIADO EL AREA DE ZOMBIES</p><button id="btn-restart" style="background:white; border:none; padding:15px 40px; color:#8a2be2; font-family:Orbitron; font-size:1.2rem; cursor:pointer; border-radius:5px; font-weight:900;">VOLVER A JUGAR</button>';
                    document.getElementById('btn-restart').onclick = () => location.reload();
                }
            }
        }
    }

    function sonar8bit() {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        let melo = [146, 174, 196, 174, 220, 196, 174, 146];
        let idx = 0;
        bLoop = setInterval(() => {
            if(!activo) return;
            let o = audioCtx.createOscillator();
            let g = audioCtx.createGain();
            o.type = 'square';
            o.frequency.value = melo[idx % melo.length];
            if(idx % 4 === 0) o.frequency.value *= 0.5;
            g.gain.value = 0.015;
            o.connect(g);
            g.connect(audioCtx.destination);
            o.start();
            o.stop(audioCtx.currentTime + 0.2);
            idx++;
        }, 240);
    }

    function renderizar() {
        if (!activo) return;

        mover();
        actualizarZombies();

        ctx.fillStyle = '#110221';
        ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
        ctx.fillStyle = '#220535';
        ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

        const fov = Math.PI / 3;
        const paso = fov / canvas.width;

        for (let i = 0; i < canvas.width; i++) {
            let ang = (pj.dir - fov / 2) + (i * paso);
            let d = 0, hit = false;
            let cx = Math.cos(ang), sy = Math.sin(ang);

            while (!hit && d < 20) {
                d += 0.05;
                let tx = Math.floor(pj.x + cx * d), ty = Math.floor(pj.y + sy * d);
                if (tx < 0 || tx >= 20 || ty < 0 || ty >= 20 || mapa[ty][tx] === 1) hit = true;
            }

            let realD = d * Math.cos(ang - pj.dir);
            zBuffer[i] = realD;
            let h = canvas.height / (realD + 0.01);
            let c = Math.max(0, 255 - (d * 18));
            ctx.fillStyle = `rgb(${c * 0.4}, 0, ${c})`;
            ctx.fillRect(i, (canvas.height - h) / 2, 1, h);
        }

        dibujarZombies(fov);
        dibujarRadar();
        requestAnimationFrame(renderizar);
    }

    function dibujarRadar() {
        const size = 120;
        const margin = 10;
        const scale = size / 20;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width - size - margin, margin, size, size);
        
        for(let y=0; y<20; y++) {
            for(let x=0; x<20; x++) {
                if(mapa[y][x] === 1) {
                    ctx.fillStyle = '#331144';
                    ctx.fillRect(canvas.width - size - margin + (x * scale), margin + (y * scale), scale, scale);
                }
            }
        }

        for(let e of enemigos) {
            if(e.vivo) {
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(canvas.width - size - margin + (e.x * scale), margin + (e.y * scale), 2, 2);
            }
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(canvas.width - size - margin + (pj.x * scale), margin + (pj.y * scale), 3, 3);
    }

    function dibujarZombies(fov) {
        let list = enemigos.filter(e => e.vivo).sort((a, b) => {
            let da = Math.pow(pj.x - a.x, 2) + Math.pow(pj.y - a.y, 2);
            let db = Math.pow(pj.x - b.x, 2) + Math.pow(pj.y - b.y, 2);
            return db - da;
        });

        for (let e of list) {
            let dx = e.x - pj.x, dy = e.y - pj.y;
            let d = Math.sqrt(dx*dx + dy*dy);
            let ang = Math.atan2(dy, dx) - pj.dir;
            while (ang < -Math.PI) ang += Math.PI * 2;
            while (ang > Math.PI) ang -= Math.PI * 2;

            if (Math.abs(ang) < fov) {
                let h = canvas.height / (d * Math.cos(ang) + 0.01);
                let x = (0.5 * (ang / (fov / 2)) + 0.5) * canvas.width;
                let w = h * 0.4;
                let y = (canvas.height - h) / 2;

                for (let i = Math.floor(x - w/2); i < x + w/2; i++) {
                    if (i >= 0 && i < canvas.width && d < zBuffer[i]) {
                        let relX = (i - (x - w/2)) / w;
                        let b = Math.max(0, 255 - (d * 15));
                        ctx.fillStyle = `rgb(0, ${b * 0.8}, 0)`;
                        if (relX > 0.35 && relX < 0.65) ctx.fillRect(i, y, 1, h * 0.2);
                        if (relX > 0.2 && relX < 0.8) ctx.fillRect(i, y + h * 0.2, 1, h * 0.45);
                        if ((relX > 0.2 && relX < 0.45) || (relX > 0.55 && relX < 0.8)) ctx.fillRect(i, y + h * 0.65, 1, h * 0.35);
                    }
                }
            }
        }
    }

    function actualizarZombies() {
        for (let e of enemigos) {
            if (!e.vivo) continue;
            let dx = pj.x - e.x, dy = pj.y - e.y;
            let d = Math.sqrt(dx*dx + dy*dy);
            if (d < 10) {
                let ang = Math.atan2(dy, dx);
                let nx = e.x + Math.cos(ang) * e.speed, ny = e.y + Math.sin(ang) * e.speed;
                if (mapa[Math.floor(ny)][Math.floor(nx)] === 0) { e.x = nx; e.y = ny; }
            }
        }
    }

    function mover() {
        let v = 0.07, r = 0.045;
        if (teclas['w']) {
            let nx = pj.x + Math.cos(pj.dir) * v, ny = pj.y + Math.sin(pj.dir) * v;
            if (mapa[Math.floor(ny)][Math.floor(nx)] === 0) { pj.x = nx; pj.y = ny; }
        }
        if (teclas['s']) {
            let nx = pj.x - Math.cos(pj.dir) * v, ny = pj.y - Math.sin(pj.dir) * v;
            if (mapa[Math.floor(ny)][Math.floor(nx)] === 0) { pj.x = nx; pj.y = ny; }
        }
        if (teclas['a']) pj.dir -= r;
        if (teclas['d']) pj.dir += r;
    }

    btn.addEventListener('click', () => {
        pInicio.style.display = 'none';
        activo = true;
        generarHorda();
        sonar8bit();
        renderizar();
    });
};