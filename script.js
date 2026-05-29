// --- DAFTAR 10 LAGU (DARI FOLDER AUDIO & AUDIO2) ---
const playlist = [
    // Dari folder pertama: audio
    { title: "Selamat Ulang Tahun", artist: "Jamrud", src: "audio/Jamrud - Selamat Ulang Tahun.mp3" },
    { title: "Love Someone", artist: "Lukas Graham", src: "audio/Love Someone - Lukas Graham.mp3" },
    { title: "Memories", artist: "Maroon 5", src: "audio/Maroon V - Memories.mp3" },
    { title: "Just the Way You Are", artist: "Bruno Mars", src: "audio/Just the Way You Are - Bruno Mars.m4a" },

    // Dari folder kedua: audio2
    { title: "Adore You", artist: "Harry Styles", src: "audio2/Adore You - Harry Styles.m4a" },
    { title: "A Sky Full Of Stars", artist: "Coldplay", src: "audio2/Coldplay - A Sky Full Of Stars.mp3" },
    { title: "I Want It That Way", artist: "Backstreet Boys", src: "audio2/I Want It That Way - Backstreet Boys.m4a" },
    { title: "Perfect", artist: "Ed Sheeran", src: "audio2/Perfect - Ed Sheeran.m4a" },
    { title: "Shape of My Heart", artist: "Backstreet Boys", src: "audio2/Shape of My Heart - Backstreet Boys.m4a" },
    { title: "Thinking out Loud", artist: "Ed Sheeran", src: "audio2/Thinking out Loud - Ed Sheeran.m4a" }
];

// Konfigurasi Dasar
let scene, camera, renderer, controls;
let photoGroup, solidPlanet, centerTextSprite, greetingTextSprite;
const ringParticleSystems = []; 
const coreParticleSystems = []; 
let bgStars; 

let isExploded = false;
let isExploding = false;
let isFastCinematic = false; 
let isSlowCinematic = false; 
let explosionProgress = 0;
let canExplode = false; 
let cinematicTL; 
let warningDismissed = false; 

// Elemen UI
const landscapeWarning = document.getElementById('landscape-warning');
const btnDismissWarning = document.getElementById('btn-dismiss-warning');
const loadingScreen = document.getElementById('loading-screen');
const questionModal = document.getElementById('question-modal');
const clickHint = document.getElementById('click-hint');
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const switchContainer = document.getElementById('cinematic-switch-container');
const cinematicToggle = document.getElementById('cinematic-toggle');

// --- ELEMEN MUSIC PLAYER ---
const musicPlayerContainer = document.getElementById('music-player-container');
const explodeSound = document.getElementById('explode-sound');
const bgmPlayer = document.getElementById('bgm-player');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const playBtn = document.getElementById('play-btn');
const playIcon = document.getElementById('play-icon');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const muteBtn = document.getElementById('mute-btn');
const volIcon = document.getElementById('vol-icon');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');

let currentSongIndex = 0;
let isPlaying = false;

// --- 1. LOGIKA UI & MUSIC PLAYER ---

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function loadSong(index) {
    const song = playlist[index];
    songTitle.innerText = song.title;
    songArtist.innerText = song.artist;
    bgmPlayer.src = song.src;
    bgmPlayer.load();
}

function playSong() {
    isPlaying = true;
    bgmPlayer.play().catch(e => console.log("Auto-play dicegah:", e));
    playIcon.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`;
}

function pauseSong() {
    isPlaying = false;
    bgmPlayer.pause();
    playIcon.innerHTML = `<path d="M8 5v14l11-7z"/>`;
}

function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(currentSongIndex);
    if (isPlaying) {
        setTimeout(() => playSong(), 50); 
    }
}

function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentSongIndex);
    if (isPlaying) {
        setTimeout(() => playSong(), 50);
    }
}

playBtn.addEventListener('click', () => isPlaying ? pauseSong() : playSong());
nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);
bgmPlayer.addEventListener('ended', nextSong); 

bgmPlayer.addEventListener('timeupdate', () => {
    const currentTime = bgmPlayer.currentTime;
    const duration = bgmPlayer.duration;
    if (duration) {
        progressBar.value = (currentTime / duration) * 100;
        currentTimeEl.innerText = formatTime(currentTime);
        totalTimeEl.innerText = "-" + formatTime(duration - currentTime); 
    }
});

progressBar.addEventListener('input', (e) => {
    const duration = bgmPlayer.duration;
    if (duration) {
        bgmPlayer.currentTime = (e.target.value / 100) * duration;
    }
});

muteBtn.addEventListener('click', () => {
    bgmPlayer.muted = !bgmPlayer.muted;
    if (bgmPlayer.muted) {
        volIcon.innerHTML = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;
    } else {
        volIcon.innerHTML = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
    }
});

function checkOrientation() {
    if (!warningDismissed && window.innerWidth <= 768 && window.innerHeight > window.innerWidth) {
        landscapeWarning.classList.remove('hidden');
    } else {
        landscapeWarning.classList.add('hidden');
    }
}

window.addEventListener('load', () => {
    checkOrientation(); 
    loadSong(currentSongIndex); 
    
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            questionModal.classList.remove('hidden');
        }, 1000);
    }, 7000); 
});

btnDismissWarning.addEventListener('click', () => {
    warningDismissed = true;
    landscapeWarning.classList.add('hidden');
});

btnNo.addEventListener('mouseover', function() {
    const randomX = Math.floor(Math.random() * 200) - 100;
    const randomY = Math.floor(Math.random() * 100) - 50;
    this.style.transform = `translate(${randomX}px, ${randomY}px)`;
});

btnYes.addEventListener('click', (e) => {
    e.stopPropagation(); 
    questionModal.style.opacity = '0';
    
    playSong();

    setTimeout(() => {
        questionModal.style.display = 'none';
        init3DScene(); 
        
        setTimeout(() => {
            if (!isExploding && !isExploded) {
                clickHint.classList.remove('hidden');
                canExplode = true; 
            }
        }, 1500);
    }, 500);
});

window.addEventListener('pointerdown', (e) => {
    if (e.target.tagName.toLowerCase() === 'button' || 
        e.target.tagName.toLowerCase() === 'input' || 
        e.target.closest('#music-player-container') ||
        e.target.closest('#cinematic-switch-container') ||
        e.target.closest('#landscape-warning')) return;

    if (canExplode && solidPlanet && !isExploded && !isExploding) {
        clickHint.style.animation = 'none'; 
        clickHint.style.display = 'none';   
        
        isExploding = true; 
        canExplode = false;

        if (explodeSound) {
            explodeSound.volume = 0.8;
            explodeSound.play().catch(err => console.log("Audio dicegah:", err));
        }
    }
});

cinematicToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        if (!isSlowCinematic && !isFastCinematic) startManualCinematic(); 
    } else {
        if (cinematicTL) cinematicTL.kill(); 
        isFastCinematic = false;
        isSlowCinematic = false;
        controls.enabled = true; 
    }
});


// --- 2. LOGIKA THREE.JS (DUNIA 3D) ---

function init3DScene() {
    const container = document.getElementById('canvas-container');

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 85; 
    camera.position.y = 30; 

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 250; 
    controls.minDistance = 15;
    controls.enablePan = false; 
    controls.rotateSpeed = 0.7; 
    controls.zoomSpeed = 1.2;

    createSolidPlanet();
    createParticles(); 
    createGreetingText(); 
    createCenterText(); 
    createScatteredPhotos(); 

    window.addEventListener('resize', onWindowResize, false);
    animate();
}

function createSolidPlanet() {
    const geo = new THREE.SphereGeometry(10, 32, 32);
    const mat = new THREE.MeshBasicMaterial({ color: 0x8a2be2, transparent: true, opacity: 1 });
    solidPlanet = new THREE.Mesh(geo, mat);
    
    const wireGeo = new THREE.SphereGeometry(10.5, 16, 16);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xffb3c6, wireframe: true, transparent: true, opacity: 0.5 });
    const wireSphere = new THREE.Mesh(wireGeo, wireMat);
    
    solidPlanet.add(wireSphere);
    scene.add(solidPlanet);
}

function createParticles() {
    for (let g = 0; g < 5; g++) {
        const coreCount = 400; 
        const corePos = new Float32Array(coreCount * 3);
        for(let i = 0; i < coreCount; i++) {
            const r = 12 + (Math.random() * 3); 
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            corePos[i*3] = r * Math.sin(phi) * Math.cos(theta); 
            corePos[i*3+1] = r * Math.sin(phi) * Math.sin(theta); 
            corePos[i*3+2] = r * Math.cos(phi); 
        }
        const coreGeo = new THREE.BufferGeometry();
        coreGeo.setAttribute('position', new THREE.BufferAttribute(corePos, 3));
        const coreMat = new THREE.PointsMaterial({ size: 0.2, color: 0xffb3c6, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
        const coreMesh = new THREE.Points(coreGeo, coreMat);
        coreMesh.scale.set(0.001, 0.001, 0.001); 
        coreMesh.visible = false; 
        scene.add(coreMesh);
        coreParticleSystems.push(coreMesh);
    }

    for (let g = 0; g < 6; g++) {
        const ringCount = 2500; 
        const ringPos = new Float32Array(ringCount * 3);
        for(let i = 0; i < ringCount; i++) {
            const angle = Math.random() * Math.PI * 2; 
            const radius = 15 + Math.random() * 70; 
            
            ringPos[i*3] = Math.cos(angle) * radius; 
            ringPos[i*3+1] = (Math.random() - 0.5) * 4; 
            ringPos[i*3+2] = Math.sin(angle) * radius; 
        }
        const ringGeo = new THREE.BufferGeometry();
        ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
        const ringMat = new THREE.PointsMaterial({ size: 0.15 + (Math.random()*0.1), color: 0xcc66ff, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
        const ringMesh = new THREE.Points(ringGeo, ringMat);
        ringMesh.scale.set(0.001, 0.001, 0.001); 
        ringMesh.visible = false; 
        scene.add(ringMesh);
        ringParticleSystems.push(ringMesh);
    }

    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(15000 * 3);
    for(let i=0; i<15000; i++) {
        starPos[i*3] = (Math.random() - 0.5) * 400; 
        starPos[i*3+1] = (Math.random() - 0.5) * 400; 
        starPos[i*3+2] = (Math.random() - 0.5) * 400; 
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.6 });
    bgStars = new THREE.Points(starGeo, starMat);
    scene.add(bgStars);
}

function createGreetingText() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048; 
    canvas.height = 512; 
    const ctx = canvas.getContext('2d');
    
    ctx.font = 'bold 100px "Brush Script MT", "Comic Sans MS", cursive, "Segoe UI", Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#ffb3c6';
    ctx.shadowBlur = 20;
    
    const line1 = 'Alles Gute zum Geburtstag, Jenita.';
    const line2 = 'Gott segne dich immer.';
    const line3 = 'Ich liebe dich unendlich.';

    for(let i = 0; i < 3; i++) {
        ctx.fillText(line1, 1024, 120);
        ctx.fillText(line2, 1024, 256); 
        ctx.fillText(line3, 1024, 392);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0, depthWrite: false });
    
    greetingTextSprite = new THREE.Sprite(material);
    greetingTextSprite.position.set(0, 28, 0); 
    scene.add(greetingTextSprite); 
}

function createCenterText() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    ctx.font = 'bold 90px "Segoe UI", Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#ffb3c6';
    ctx.shadowBlur = 20;
    
    ctx.fillText('21 Y.O', 256, 128);
    ctx.fillText('21 Y.O', 256, 128);
    ctx.fillText('21 Y.O', 256, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0, depthTest: false, depthWrite: false });
    
    centerTextSprite = new THREE.Sprite(material);
    centerTextSprite.scale.set(30, 15, 1); 
    centerTextSprite.position.set(0, 0, 0.5); 
    centerTextSprite.renderOrder = 999;
    scene.add(centerTextSprite);
}

function createScatteredPhotos() {
    photoGroup = new THREE.Group();
    const textureLoader = new THREE.TextureLoader();
    const totalPhotos = 20;
    const duplicates = 20; 

    const textures = [];
    for (let i = 0; i < totalPhotos; i++) {
        textures.push(textureLoader.load(`images/foto${i+1}.jpeg`));
    }

    for (let d = 0; d < duplicates; d++) {
        for (let i = 0; i < totalPhotos; i++) {
            const material = new THREE.SpriteMaterial({ map: textures[i], transparent: true, opacity: 0.9, depthWrite: false });
            const sprite = new THREE.Sprite(material);

            const angle = Math.random() * Math.PI * 2; 
            const radius = 20 + Math.random() * 65; 
            const yOffset = (Math.random() - 0.5) * 5; 

            sprite.userData.targetX = Math.cos(angle) * radius;
            sprite.userData.targetY = yOffset;
            sprite.userData.targetZ = Math.sin(angle) * radius;

            const randomScale = 1.2 + Math.random() * 3.0; 
            sprite.userData.targetScaleX = randomScale * 0.75;
            sprite.userData.targetScaleY = randomScale;

            sprite.position.set(0, 0, 0);
            sprite.scale.set(0, 0, 1); 

            photoGroup.add(sprite);
        }
    }
    
    photoGroup.visible = false; 
    scene.add(photoGroup);
}

function onWindowResize() {
    checkOrientation(); 
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


// --- 4. KOREOGRAFI KAMERA ---

function startInitialCinematic() {
    if (cinematicTL) cinematicTL.kill();
    controls.enabled = false;
    isFastCinematic = true; 
    isSlowCinematic = false;
    cinematicToggle.checked = true; 

    cinematicTL = gsap.timeline({
        onUpdate: () => camera.lookAt(0, 0, 0),
        onComplete: () => {
            controls.enabled = true; 
            isFastCinematic = false; 
            cinematicToggle.checked = false; 
        }
    });

    cinematicTL.to(camera.position, { x: 0, y: 5, z: 15, duration: 3, ease: "power2.inOut" })
      .to(camera.position, { x: -55, y: 15, z: 40, duration: 3, ease: "power1.inOut" })
      .to(camera.position, { x: 55, y: 15, z: 40, duration: 4, ease: "power1.inOut" })
      .to(camera.position, { x: 0, y: 35, z: 120, duration: 4, ease: "power2.inOut" })
      .to(camera.position, { x: 0, y: 30, z: 85, duration: 3, ease: "power2.inOut" });
}

function startManualCinematic() {
    if (cinematicTL) cinematicTL.kill();
    controls.enabled = false;
    isSlowCinematic = true; 
    isFastCinematic = false;

    cinematicTL = gsap.timeline({
        onUpdate: () => camera.lookAt(0, 0, 0),
        onComplete: () => {
            if (cinematicToggle.checked) {
                startManualCinematic(); 
            } else {
                controls.enabled = true; 
                isSlowCinematic = false; 
            }
        }
    });

    cinematicTL.to(camera.position, { x: 40, y: 10, z: 60, duration: 6, ease: "sine.inOut" }) 
      .to(camera.position, { x: 0, y: -15, z: 50, duration: 6, ease: "sine.inOut" }) 
      .to(camera.position, { x: -60, y: 25, z: 60, duration: 7, ease: "sine.inOut" }) 
      .to(camera.position, { x: 0, y: 65, z: 40, duration: 7, ease: "sine.inOut" }) 
      .to(camera.position, { x: 0, y: 30, z: 85, duration: 6, ease: "sine.inOut" }); 
}


// --- 5. LOOP ANIMASI UTAMA ---

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001; 

    if (solidPlanet && !isExploded) {
        solidPlanet.rotation.y += 0.005;
        solidPlanet.rotation.x += 0.002;
    }

    if (isExploding) {
        explosionProgress += 0.015; 
        
        if (explosionProgress >= 1) {
            explosionProgress = 1;
            isExploding = false;
            isExploded = true; 
            
            if (solidPlanet) solidPlanet.visible = false; 

            switchContainer.classList.remove('hidden');
            musicPlayerContainer.classList.remove('hidden');
            
            startInitialCinematic();
        }

        const ease = 1 - Math.pow(1 - explosionProgress, 4);

        photoGroup.visible = true; 
        photoGroup.children.forEach(sprite => {
            sprite.position.x = sprite.userData.targetX * ease;
            sprite.position.y = sprite.userData.targetY * ease;
            sprite.position.z = sprite.userData.targetZ * ease;
            sprite.scale.set(sprite.userData.targetScaleX * ease, sprite.userData.targetScaleY * ease, 1);
        });

        ringParticleSystems.forEach(ps => {
            ps.visible = true;
            ps.scale.set(ease, ease, ease);
        });
        
        coreParticleSystems.forEach(ps => {
            ps.visible = true;
            ps.scale.set(ease, ease, ease);
        });

        if (solidPlanet) {
            solidPlanet.scale.set(1 + ease * 3, 1 + ease * 3, 1 + ease * 3);
            solidPlanet.material.opacity = 1 - ease;
            if(solidPlanet.children[0]) solidPlanet.children[0].material.opacity = (1 - ease) * 0.5;
        }

        if (centerTextSprite) {
            centerTextSprite.material.opacity = ease;
        }
    }

    if (isExploded || isExploding) {
        coreParticleSystems.forEach((ps, index) => {
            ps.rotation.y += 0.002 + (index * 0.0001); 
            ps.material.opacity = 0.2 + Math.abs(Math.sin(time * (1.5 + index * 0.4) + index * 2)) * 0.8;
        });

        ringParticleSystems.forEach((ps, index) => {
            ps.rotation.y -= 0.001 + (index * 0.0001); 
            ps.material.opacity = 0.1 + Math.abs(Math.cos(time * (1.2 + index * 0.3) + index * 1.5)) * 0.7;
        });

        if (photoGroup) photoGroup.rotation.y -= 0.001; 

        if (greetingTextSprite && explosionProgress > 0.3) {
            greetingTextSprite.material.opacity = (explosionProgress - 0.3) / 0.7; 
            
            greetingTextSprite.position.y = 28 + Math.sin(time * 2) * 1.5;
            greetingTextSprite.position.x = Math.cos(time * 1.5) * 1.0;
            greetingTextSprite.material.rotation = Math.sin(time * 1.2) * 0.015;

            const dist = camera.position.distanceTo(greetingTextSprite.position);
            const scaleFactor = dist / 85; 
            
            greetingTextSprite.scale.set(120 * scaleFactor, 22 * scaleFactor, 1);
        }
    }

    if (bgStars) {
        if (isFastCinematic) {
            const positions = bgStars.geometry.attributes.position.array;
            for(let i=0; i<positions.length; i+=3) {
                positions[i+2] += 4.0; 
                if (positions[i+2] > camera.position.z + 20) {
                    positions[i+2] = camera.position.z - 200 - (Math.random() * 100);
                }
            }
            bgStars.geometry.attributes.position.needsUpdate = true;
        } else if (isSlowCinematic) {
            const positions = bgStars.geometry.attributes.position.array;
            for(let i=0; i<positions.length; i+=3) {
                positions[i+2] += 0.4; 
                if (positions[i+2] > camera.position.z + 20) {
                    positions[i+2] = camera.position.z - 200 - (Math.random() * 100);
                }
            }
            bgStars.geometry.attributes.position.needsUpdate = true;
        } else {
            bgStars.rotation.y += 0.0002; 
        }
    }

    controls.update(); 
    renderer.render(scene, camera);
}