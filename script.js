// Konfigurasi Dasar
let scene, camera, renderer, controls;
let photoGroup, solidPlanet, centerTextSprite, greetingTextSprite;
const ringParticleSystems = []; 
let coreParticleSystem; 
let bgStars; 

let isExploded = false;
let isExploding = false;
let isCinematic = false; 
let explosionProgress = 0;
let canExplode = false; // Sensor penahan sentuhan HP

// Elemen UI
const loadingScreen = document.getElementById('loading-screen');
const questionModal = document.getElementById('question-modal');
const clickHint = document.getElementById('click-hint');
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');

// --- 1. LOGIKA UI & TOMBOL ---

window.addEventListener('load', () => {
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            questionModal.classList.remove('hidden');
        }, 1000);
    }, 3000);
});

btnNo.addEventListener('mouseover', function() {
    const randomX = Math.floor(Math.random() * 200) - 100;
    const randomY = Math.floor(Math.random() * 100) - 50;
    this.style.transform = `translate(${randomX}px, ${randomY}px)`;
});

btnYes.addEventListener('click', (e) => {
    e.stopPropagation(); 
    questionModal.style.opacity = '0';
    setTimeout(() => {
        questionModal.style.display = 'none';
        init3DScene(); 
        
        setTimeout(() => {
            if (!isExploding && !isExploded) {
                clickHint.classList.remove('hidden');
                canExplode = true; // Izinkan layar diketuk
            }
        }, 1500);
    }, 500);
});

// Menggunakan pointerdown agar responsif sempurna di layar HP (Touch) maupun Mouse
window.addEventListener('pointerdown', (e) => {
    // Abaikan jika yang dipencet adalah tombol
    if (e.target.tagName.toLowerCase() === 'button') return;

    if (canExplode && solidPlanet && !isExploded && !isExploding) {
        clickHint.style.animation = 'none'; 
        clickHint.style.display = 'none';   
        isExploding = true; 
        canExplode = false;
    }
});


// --- 2. LOGIKA THREE.JS (DUNIA 3D) ---

function init3DScene() {
    const container = document.getElementById('canvas-container');

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 85; 
    camera.position.y = 30; 
    scene.add(camera); 

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // RAHASIA HP ANTI-LAG: Batasi resolusi maksimal 2x lipat saja (sebelumnya HP bisa memaksakan 3x atau 4x sehingga patah-patah)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 250; 
    controls.minDistance = 15;
    
    // PENGATURAN HP: Matikan fungsi geser paksa (pan) agar planet tidak nyasar saat HP disentuh dua jari
    controls.enablePan = false; 
    controls.rotateSpeed = 0.7; // Putaran dihaluskan untuk layar sentuh
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
    const corePos = new Float32Array(2000 * 3);
    for(let i = 0; i < 2000; i++) {
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
    coreParticleSystem = new THREE.Points(coreGeo, coreMat);
    coreParticleSystem.scale.set(0.001, 0.001, 0.001); 
    coreParticleSystem.visible = false; 
    scene.add(coreParticleSystem);

    for (let g = 0; g < 3; g++) {
        const ringCount = 5000; 
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
    
    ctx.font = 'bold 95px "Brush Script MT", "Comic Sans MS", cursive, "Segoe UI", Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.shadowColor = '#ffb3c6';
    ctx.shadowBlur = 20;
    
    const line1 = 'Alles Gute zum Geburtstag, Jen.';
    const line2 = 'Gott segne dich.';
    const line3 = 'Ich liebe dich so sehr.';

    for(let i = 0; i < 3; i++) {
        ctx.fillText(line1, 1024, 120);
        ctx.fillText(line2, 1024, 256); 
        ctx.fillText(line3, 1024, 392);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const material = new THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true, 
        opacity: 0, 
        depthWrite: false 
    });
    
    greetingTextSprite = new THREE.Sprite(material);
    
    greetingTextSprite.scale.set(56, 14, 1); 
    greetingTextSprite.position.set(0, 11, -40); 
    
    camera.add(greetingTextSprite); 
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
    const material = new THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true, 
        opacity: 0, 
        depthTest: false, 
        depthWrite: false 
    });
    
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
            const material = new THREE.SpriteMaterial({ 
                map: textures[i], 
                transparent: true,
                opacity: 0.9,
                depthWrite: false 
            });
            
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
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


// --- 4. KOREOGRAFI KAMERA & WARP SPEED ---
function startCinematicCamera() {
    controls.enabled = false;
    isCinematic = true; 

    const tl = gsap.timeline({
        onUpdate: () => {
            camera.lookAt(0, 0, 0); 
        },
        onComplete: () => {
            controls.enabled = true; 
            isCinematic = false; 
        }
    });

    tl.to(camera.position, { 
        x: 0, y: 5, z: 15, 
        duration: 3, 
        ease: "power2.inOut" 
    })
    .to(camera.position, { 
        x: -55, y: 15, z: 40, 
        duration: 3, 
        ease: "power1.inOut" 
    })
    .to(camera.position, { 
        x: 55, y: 15, z: 40, 
        duration: 4, 
        ease: "power1.inOut" 
    })
    .to(camera.position, { 
        x: 0, y: 35, z: 120, 
        duration: 4, 
        ease: "power2.inOut" 
    });
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

            startCinematicCamera();
        }

        const ease = 1 - Math.pow(1 - explosionProgress, 4);

        photoGroup.visible = true; 
        photoGroup.children.forEach(sprite => {
            sprite.position.x = sprite.userData.targetX * ease;
            sprite.position.y = sprite.userData.targetY * ease;
            sprite.position.z = sprite.userData.targetZ * ease;
            
            sprite.scale.set(
                sprite.userData.targetScaleX * ease,
                sprite.userData.targetScaleY * ease,
                1
            );
        });

        ringParticleSystems.forEach(ps => {
            ps.visible = true;
            ps.scale.set(ease, ease, ease);
        });
        
        if (coreParticleSystem) {
            coreParticleSystem.visible = true;
            coreParticleSystem.scale.set(ease, ease, ease);
        }

        if (solidPlanet) {
            solidPlanet.scale.set(1 + ease * 3, 1 + ease * 3, 1 + ease * 3);
            solidPlanet.material.opacity = 1 - ease;
            solidPlanet.children[0].material.opacity = (1 - ease) * 0.5;
        }

        if (centerTextSprite) {
            centerTextSprite.material.opacity = ease;
        }

        if (greetingTextSprite && explosionProgress > 0.3) {
            greetingTextSprite.material.opacity = (explosionProgress - 0.3) / 0.7; 
        }
    }

    if (isExploded || isExploding) {
        if (coreParticleSystem) {
            coreParticleSystem.rotation.y += 0.002;
        }

        if (ringParticleSystems.length === 3) {
            ringParticleSystems[0].rotation.y -= 0.001; 
            ringParticleSystems[1].rotation.y -= 0.0008;
            ringParticleSystems[2].rotation.y -= 0.0012;

            ringParticleSystems[0].material.opacity = 0.3 + Math.abs(Math.sin(time * 0.5)) * 0.5;
            ringParticleSystems[1].material.opacity = 0.3 + Math.abs(Math.cos(time * 0.3)) * 0.5;
            ringParticleSystems[2].material.opacity = 0.3 + Math.abs(Math.sin(time * 0.2)) * 0.5;
        }

        if (photoGroup) {
            photoGroup.rotation.y -= 0.001; 
        }

        if (greetingTextSprite && explosionProgress > 0.3) {
            greetingTextSprite.position.y = 11 + Math.sin(time * 2) * 0.4;
            greetingTextSprite.position.x = Math.cos(time * 1.5) * 0.4;
            greetingTextSprite.material.rotation = Math.sin(time * 1.2) * 0.015;
        }
    }

    if (bgStars) {
        if (isCinematic) {
            const positions = bgStars.geometry.attributes.position.array;
            for(let i=0; i<positions.length; i+=3) {
                positions[i+2] += 4.0; 
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