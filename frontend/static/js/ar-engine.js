/**
 * Enhanced AR Engine & 3D Spatial Simulator v2.2
 * Features: True Web Camera AR with live camera stream anchoring, Touch/Mouse Reticle Placement,
 * Orbit Drag Controls, Multi-Vision Filters, Oscilloscope Waveforms, Snapshot Photo Evidence, Sound Synthesizer.
 */

class AREngine {
  constructor(canvasId, videoId) {
    this.canvas = document.getElementById(canvasId);
    this.video = document.getElementById(videoId);
    this.isCameraAR = false;
    this.activeModule = 'roof_strata';
    this.visionMode = 'normal';
    this.cameraStream = null;
    
    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.interactiveObjects = [];
    this.animatedMeshes = [];
    this.roofBoltAnimations = [];
    this.roofIndicators = [];
    this.lotoConveyor = null;
    this.beltSpeed = 0;
    this.animId = null;

    // AR Spatial Reticle & Anchor
    this.arReticle = null;
    this.arAnchorGroup = new THREE.Group();

    // Orbit Drag Controls
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0 };
    this.currentRotation = { x: 0, y: 0 };
    
    // Lighting & Atmosphere
    this.ambientLight = null;
    this.capLamp = null;
    this.hazardLight = null;
    this.dustParticles = null;
    
    // Audio Context
    this.audioCtx = null;
    this.isMuted = false;

    // Oscilloscope Hook
    this.oscilloscopeCanvas = null;
    this.oscilloscopeAnimId = null;

    // Callbacks
    this.onObjectClick = null;
    this.onObjectDrop = null;
    this.onDrillUpdate = null;

    this.initThree();
    this.initAudio();
    this.setupWindowResize();
    this.setupInteractivity();
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  resumeAudio() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playSound(type) {
    if (this.isMuted || !this.audioCtx) return;
    this.resumeAudio();
    const now = this.audioCtx.currentTime;

    if (type === 'metallic_ring') {
      const osc = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1250, now);
      osc.frequency.exponentialRampToValueAtTime(820, now + 0.35);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(2500, now);
      osc2.frequency.exponentialRampToValueAtTime(1600, now + 0.2);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } else if (type === 'hollow_thud') {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(135, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.45);
      gain.gain.setValueAtTime(0.75, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'gas_alarm') {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2600, now);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'click' || type === 'lock') {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.09);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'horn') {
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(220, now);
      osc2.frequency.setValueAtTime(277, now);
      gain.gain.setValueAtTime(0.55, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.65);
      osc2.stop(now + 0.65);
    } else if (type === 'oxygen_hiss') {
      const bufferSize = this.audioCtx.sampleRate * 0.8;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = buffer;
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1900;
      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);
      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);
      whiteNoise.start(now);
      whiteNoise.stop(now + 0.85);
    }
  }

  initThree() {
    const width = this.canvas.clientWidth || 800;
    const height = this.canvas.clientHeight || 560;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 1000);
    this.camera.position.set(0, 1.6, 3.8);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 800 ? 1.35 : 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.scene.add(this.arAnchorGroup);

    this.setupLighting();
    this.setupDustParticles();
    this.setupARReticle();

    this.animate();
  }

  setupARReticle() {
    const reticleGeo = new THREE.RingGeometry(0.2, 0.24, 32);
    const reticleMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    this.arReticle = new THREE.Mesh(reticleGeo, reticleMat);
    this.arReticle.rotation.x = -Math.PI / 2;
    this.arReticle.position.set(0, 0.05, 0);
    this.arReticle.visible = false;
    this.scene.add(this.arReticle);
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(this.ambientLight);

    this.capLamp = new THREE.SpotLight(0xfffaed, 3.5, 16, Math.PI / 4, 0.4, 1);
    this.capLamp.position.set(0, 2.2, 3.5);
    this.capLamp.target.position.set(0, 1.2, 0);
    this.scene.add(this.capLamp);
    this.scene.add(this.capLamp.target);

    this.hazardLight = new THREE.PointLight(0xef4444, 0, 12);
    this.hazardLight.position.set(0, 2.6, 0);
    this.scene.add(this.hazardLight);
  }

  setupDustParticles() {
    const particleCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = Math.random() * 4;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.04,
      transparent: true,
      opacity: 0.35
    });

    this.dustParticles = new THREE.Points(geometry, material);
    this.scene.add(this.dustParticles);
  }

  setupWindowResize() {
    window.addEventListener('resize', () => {
      this.resizeRenderer();
    });
  }

  resizeRenderer() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const parent = this.canvas.parentElement;
    const width = parent?.clientWidth || window.innerWidth || 800;
    const height = parent?.clientHeight || Math.max(390, Math.min(620, Math.round(width * 0.68)));
    if (!width || !height) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  setupInteractivity() {
    let moved = false;
    let previous = null;
    let dragged = null;
    let dragPlane = null;
    let dragStart = null;
    let canOrbit = true;
    const pointer = (event) => {
      const rect = this.canvas.getBoundingClientRect();
      return new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    };
    const hitObject = (event) => {
      this.mouse.copy(pointer(event));
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const hits = this.raycaster.intersectObjects(this.interactiveObjects, true);
      if (!hits.length) return null;
      let hit = hits[0].object;
      while (hit.parent && !hit.userData.interactive && hit.parent !== this.scene) hit = hit.parent;
      return hit.userData && hit.userData.interactive ? hit : null;
    };
    this.canvas.style.touchAction = 'none';
    this.canvas.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button !== 0 && event.button !== 2) return;
      this.canvas.setPointerCapture && this.canvas.setPointerCapture(event.pointerId);
      previous = { x: event.clientX, y: event.clientY };
      moved = false;
      const hit = hitObject(event);
      if (hit && hit.userData.draggable) {
        dragged = hit;
        dragStart = hit.position.clone();
        const world = hit.getWorldPosition(new THREE.Vector3());
        dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -world.z);
        event.preventDefault();
      } else {
        this.isDragging = true;
        // A click still activates a scene control on pointerup. If the pointer
        // moves, use that same gesture to explore the mine from another angle.
        // Draggable training props take precedence so they remain easy to place.
        canOrbit = true;
      }
    });
    this.canvas.addEventListener('pointermove', (event) => {
      if (!previous) return;
      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;
      // Filter natural finger jitter on phones so a tap on a hazard target does not orbit the model.
      if (Math.abs(dx) + Math.abs(dy) > (event.pointerType === 'touch' ? 10 : 3)) moved = true;
      if (dragged) {
        this.mouse.copy(pointer(event));
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const worldPoint = this.raycaster.ray.intersectPlane(dragPlane, new THREE.Vector3());
        if (worldPoint) {
          const localPoint = dragged.parent ? dragged.parent.worldToLocal(worldPoint.clone()) : worldPoint;
          dragged.position.copy(localPoint);
        }
        event.preventDefault();
      } else if (this.isDragging && canOrbit && !this.isCameraAR) {
        this.targetRotation.y += dx * (event.pointerType === 'touch' ? 0.006 : 0.005);
        this.targetRotation.x = Math.max(-0.55, Math.min(0.55, this.targetRotation.x + dy * 0.003));
      }
      previous = { x: event.clientX, y: event.clientY };
    });
    const finish = (event) => {
      if (dragged) {
        const obj = dragged;
        const rect = this.canvas.getBoundingClientRect();
        const end = pointer(event);
        const target = obj.userData.dropTarget;
        let success = false;
        if (target) {
          target.updateMatrixWorld(true);
          const projected = target.getWorldPosition(new THREE.Vector3()).project(this.camera);
          const px = rect.left + (projected.x + 1) * rect.width / 2;
          const py = rect.top + (1 - projected.y) * rect.height / 2;
          success = Math.hypot(event.clientX - px, event.clientY - py) <= (obj.userData.dropRadius || 54);
          if (success) {
            const targetLocal = target.parent ? target.parent.worldToLocal(target.getWorldPosition(new THREE.Vector3())) : target.getWorldPosition(new THREE.Vector3());
            obj.position.copy(targetLocal);
          } else obj.position.copy(dragStart);
        }
        if (this.onObjectDrop) this.onObjectDrop(obj.userData, obj, success);
        dragged = null;
      } else if (this.isDragging && !moved && event.button === 0) this.handlePointerClick(event);
      this.isDragging = false;
      canOrbit = true;
      previous = null;
    };
    this.canvas.addEventListener('pointerup', finish);
    this.canvas.addEventListener('pointercancel', finish);
  }

  handlePointerClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = event.clientX;
    const clientY = event.clientY;

    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

    if (intersects.length > 0) {
      let hit = intersects[0].object;
      while (hit.parent && !hit.userData.interactive && hit.parent !== this.scene) {
        hit = hit.parent;
      }
      if (hit.userData && hit.userData.interactive && this.onObjectClick) {
        this.onObjectClick(hit.userData, hit);
      }
    }
  }

  setVisionMode(mode) {
    this.visionMode = mode;
    const container = this.canvas.parentElement;
    container.classList.remove('vision-mode-thermal', 'vision-mode-night', 'vision-mode-xray');

    if (mode === 'thermal') {
      container.classList.add('vision-mode-thermal');
    } else if (mode === 'night') {
      container.classList.add('vision-mode-night');
    } else if (mode === 'xray') {
      container.classList.add('vision-mode-xray');
    }
  }

  takeSnapshot() {
    try {
      const dataURL = this.canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = `DGMS_AR_Drill_Evidence_${Date.now()}.png`;
      a.click();
      return true;
    } catch (e) {
      console.warn("Snapshot failed:", e);
      return false;
    }
  }

  drawAcousticWaveform(isLoose) {
    const canvas = document.getElementById('oscilloscopeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    let frame = 0;
    if (this.oscilloscopeAnimId) cancelAnimationFrame(this.oscilloscopeAnimId);

    const renderWave = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.strokeStyle = isLoose ? '#ef4444' : '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const centerY = height / 2;
      for (let x = 0; x < width; x++) {
        let y = centerY;
        if (isLoose) {
          y += Math.sin((x + frame * 4) * 0.08) * 16 + (Math.random() - 0.5) * 14;
        } else {
          y += Math.sin((x + frame * 3) * 0.05) * 22;
        }
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      frame++;
      if (frame < 75) {
        this.oscilloscopeAnimId = requestAnimationFrame(renderWave);
      }
    };

    renderWave();
  }

  async toggleCameraAR(enable) {
    const badge = document.getElementById('spatialTrackingBadge');
    
    if (enable) {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('Camera access requires HTTPS or localhost.');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } });
        if (this.cameraStream) this.cameraStream.getTracks().forEach(track => track.stop());
        this.cameraStream = stream;
        this.video.srcObject = stream;
        await this.video.play();
        this.isCameraAR = true;
        this.cameraFailureReason = null;
        this.video.style.display = 'block';
        this.scene.background = null;
        if (this.arReticle) this.arReticle.visible = false;
        this.scene.rotation.set(0, 0, 0);
        this.currentRotation = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };

        if (badge) {
          badge.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span class="text-white font-bold">LIVE CAMERA OVERLAY • NO WORLD TRACKING</span>
          `;
        }

        window.SurakshaSathi && window.SurakshaSathi.speak(
          "लाइव कैमरा WebAR सक्रिय। 3D सुरक्षा उपकरण आपके वास्तविक कैमरे पर प्रक्षेपित हैं।",
          "ᱞᱟᱭᱤᱵᱷ ᱠᱮᱢᱨᱟ WebAR ᱮᱠᱴᱤᱵᱽ ᱮᱱᱟ᱾"
        );
      } catch (err) {
        console.warn("Camera access failed", err);
        this.isCameraAR = false;
        if (this.cameraStream) this.cameraStream.getTracks().forEach(track => track.stop());
        this.cameraStream = null;
        this.video.srcObject = null;
        this.video.style.display = 'none';
        this.set3DSandboxBackground();
        if (this.arReticle) this.arReticle.visible = false;

        if (badge) {
          badge.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span class="text-amber-300 font-bold">3D SANDBOX • CAMERA UNAVAILABLE</span>
          `;
          const reasons = {
            NotAllowedError: 'Camera permission is blocked. Allow camera access for this site in browser settings, then retry.',
            NotFoundError: 'No camera was found on this device.',
            NotReadableError: 'The camera is busy. Close other camera apps and retry.',
            SecurityError: 'Phone camera requires a secure HTTPS address. Open the installed app from its HTTPS website.',
            OverconstrainedError: 'The rear camera mode is unavailable on this device.'
          };
          this.cameraFailureReason = reasons[err.name] || `Camera could not start: ${err.message || 'check site permissions and retry.'}`;
          badge.title = this.cameraFailureReason;
        }

        window.SurakshaSathi && window.SurakshaSathi.speak(
          "कैमरा चालू नहीं हुआ। ब्राउज़र में इस साइट की कैमरा अनुमति जाँचें। फोन पर HTTPS वेबसाइट से खोलें। 3D अभ्यास जारी है।",
          "ᱥᱯᱮᱥᱤᱭᱟᱞ AR ᱮᱠᱴᱤᱵᱽ ᱮᱱᱟ᱾"
        );
      }
    } else {
      if (this.cameraStream) {
        this.cameraStream.getTracks().forEach(t => t.stop());
        this.cameraStream = null;
      }
      this.video.style.display = 'none';
      this.video.srcObject = null;
      this.isCameraAR = false;
      if (this.arReticle) this.arReticle.visible = false;
      this.set3DSandboxBackground();

      if (badge) {
        badge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span class="text-slate-100">3D MINE SANDBOX</span>
        `;
      }
    }

    this.reloadActiveModule();
  }

  reloadActiveModule() {
    const drill = window.appState && window.appState.activeDrillInstance;
    if (drill && typeof drill.updateEngine === 'function') drill.updateEngine();
    if (drill && typeof drill.updateUI === 'function') drill.updateUI();
  }

  set3DSandboxBackground() {
    this.scene.background = new THREE.Color(0x111827);
  }

  clearScene() {
    // Every drill starts from a known camera orientation so a previous orbit cannot leave the next model out of frame.
    this.targetRotation = { x: 0, y: 0 };
    this.currentRotation = { x: 0, y: 0 };
    this.scene.rotation.set(0, 0, 0);
    const persistent = new Set([this.ambientLight, this.capLamp, this.capLamp?.target, this.hazardLight, this.dustParticles, this.arReticle, this.arAnchorGroup]);
    const disposedGeometries = new Set();
    const disposedMaterials = new Set();
    const disposedTextures = new Set();
    this.scene.children.slice().forEach(obj => {
      if (persistent.has(obj)) return;
      this.scene.remove(obj);
      obj.traverse?.(node => {
        if (node.geometry && !disposedGeometries.has(node.geometry)) {
          disposedGeometries.add(node.geometry);
          node.geometry.dispose?.();
        }
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.filter(Boolean).forEach(material => {
          Object.values(material).forEach(value => {
            if (value && value.isTexture && !disposedTextures.has(value)) {
              disposedTextures.add(value);
              value.dispose();
            }
          });
          if (!disposedMaterials.has(material)) {
            disposedMaterials.add(material);
            material.dispose?.();
          }
        });
      });
    });
    
    this.interactiveObjects = [];
    this.animatedMeshes = [];
    this.roofBoltAnimations = [];
    this.roofIndicators = [];
    this.lotoConveyor = null;
    this.materialTexturesChecked = false;
    // Each newly loaded module has a fresh set of materials and may need its own fallback.
    this.textureFallbackApplied = false;
    this.scene.add(this.ambientLight);
    this.scene.add(this.capLamp);
    this.scene.add(this.capLamp.target);
    this.scene.add(this.hazardLight);
    if (this.dustParticles) this.scene.add(this.dustParticles);
    if (this.arReticle) this.scene.add(this.arReticle);

    if (!this.isCameraAR) {
      this.set3DSandboxBackground();
      this.buildMineGalleryEnvironment();
    }
  }

  buildMineGalleryEnvironment() {
    const strata = this.makeStrataMaterial('#51483d', '#262a26', '#807363');
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x8b8172, roughness: 0.98, map: strata });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 15), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.03, -2); floor.receiveShadow = true; this.scene.add(floor);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.98, map: strata, side: THREE.DoubleSide });
    for (const x of [-2.52, 2.52]) {
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(15, 3.3), rockMat);
      wall.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; wall.position.set(x, 1.65, -2); wall.receiveShadow = true; this.scene.add(wall);
    }
    const ribMat = new THREE.MeshStandardMaterial({ color: 0x738078, metalness: 0.8, roughness: 0.35 });
    const timber = new THREE.MeshStandardMaterial({ color: 0x594637, roughness: 0.91 });
    // Repeating arched steel sets follow the tunnel roof profile.
    for (let z = -7.5; z <= 3; z += 2.1) {
      const points = [new THREE.Vector3(-2.3, 0.05, z), new THREE.Vector3(-2.25, 1.5, z), new THREE.Vector3(-1.75, 2.45, z), new THREE.Vector3(-0.9, 2.85, z), new THREE.Vector3(0, 2.96, z), new THREE.Vector3(0.9, 2.85, z), new THREE.Vector3(1.75, 2.45, z), new THREE.Vector3(2.25, 1.5, z), new THREE.Vector3(2.3, 0.05, z)];
      const arch = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 32, 0.055, 8, false), ribMat);
      arch.castShadow = true; this.scene.add(arch);
      for (const x of [-2.35, 2.35]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.095, 2.9, 10), timber);
        post.position.set(x, 1.43, z); post.castShadow = true; this.scene.add(post);
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.42), ribMat); foot.position.set(x, 0.08, z); this.scene.add(foot);
      }
      // Roof bolts and bearing plates are visible at worker scale.
      for (const x of [-1.1, 0, 1.1]) {
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.48, 8), ribMat); bolt.position.set(x, 2.58, z); this.scene.add(bolt);
        const plate = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.035, 0.14), ribMat); plate.position.set(x, 2.82, z); this.scene.add(plate);
      }
    }
    // Narrow-gauge mine rails, sleepers, cable tray and compressed-air/water lines.
    const railMat = new THREE.MeshStandardMaterial({ color: 0x87928e, metalness: 0.86, roughness: 0.27 });
    for (const x of [-0.72, 0.72]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.12, 15), railMat); rail.position.set(x, 0.08, -2); this.scene.add(rail);
    }
    const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x453b31, roughness: 0.92 });
    for (let z = -9; z <= 5; z += 0.72) { const sleeper = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.09, 0.16), sleeperMat); sleeper.position.set(0, 0.015, z); this.scene.add(sleeper); }
    for (const x of [-2.12, 2.12]) {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 14, 10), new THREE.MeshStandardMaterial({ color: x < 0 ? 0x9a5f40 : 0x477e77, metalness: 0.42, roughness: 0.5 }));
      pipe.rotation.x = Math.PI / 2; pipe.position.set(x, 1.55, -2); this.scene.add(pipe);
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 14, 8), new THREE.MeshStandardMaterial({ color: 0x202723, roughness: 0.7 }));
      cable.rotation.x = Math.PI / 2; cable.position.set(x < 0 ? -1.98 : 1.98, 2.05, -2); this.scene.add(cable);
    }
    for (let z = -6.5; z <= 1.5; z += 4) {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.09, 0.18), new THREE.MeshStandardMaterial({ color: 0xfde9a2, emissive: 0xffc85c, emissiveIntensity: 1.1 }));
      lamp.position.set(0, 2.82, z); this.scene.add(lamp);
      const glow = new THREE.PointLight(0xffc66f, 0.65, 5); glow.position.set(0, 2.55, z); this.scene.add(glow);
    }
    // Mesh panels make the supported roof and the unsupported rock beyond it easy to distinguish.
    const meshMat = new THREE.MeshBasicMaterial({ color: 0x9da59b, wireframe: true, transparent: true, opacity: 0.16 });
    for (const x of [-1.5, 0, 1.5]) { const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.4, 8, 10), meshMat); mesh.rotation.x = -Math.PI / 2; mesh.position.set(x, 2.78, -1.5); this.scene.add(mesh); }
  }

  addSceneLabel(text, position, tone = '#c9f18c') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 112;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(5, 15, 12, .88)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(5, 5, 502, 102, 24);
    else ctx.rect(5, 5, 502, 102);
    ctx.fill();
    ctx.strokeStyle = tone;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = tone;
    ctx.font = '700 31px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 57, 460);
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
    sprite.position.set(position.x, position.y, position.z);
    sprite.scale.set(0.92, 0.2, 1);
    sprite.renderOrder = 10;
    this.scene.add(sprite);
    return sprite;
  }

  makeBox(group, size, position, material, rotation = null) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.set(...position);
    if (rotation) mesh.rotation.set(...rotation);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }

  makeCylinder(group, radiusTop, radiusBottom, length, position, material, rotation = null, segments = 16) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, length, segments), material);
    mesh.position.set(...position);
    if (rotation) mesh.rotation.set(...rotation);
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  }

  makeStrataMaterial(baseColor, darkColor, highlightColor) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);
    // Thin, irregular sediment bedding and mineral flecks give the roof bands a rock-like surface.
    for (let i = 0; i < 48; i++) {
      const y = i * 11 + Math.sin(i * 1.73) * 7;
      ctx.beginPath();
      ctx.moveTo(-10, y);
      ctx.bezierCurveTo(130, y + Math.sin(i) * 9, 310, y - Math.cos(i * 0.6) * 11, 520, y + Math.sin(i * 0.4) * 6);
      ctx.strokeStyle = i % 4 === 0 ? `${highlightColor}65` : `${darkColor}55`;
      ctx.lineWidth = i % 6 === 0 ? 6 : 2;
      ctx.stroke();
    }
    for (let i = 0; i < 1200; i++) {
      ctx.fillStyle = i % 3 ? `${darkColor}30` : `${highlightColor}38`;
      ctx.fillRect((i * 97) % 512, (i * 193) % 512, 1 + (i % 3), 1 + (i % 2));
    }
    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(1.4, 1);
    return new THREE.MeshStandardMaterial({ color: 0xffffff, map, roughness: 0.96 });
  }

  // MODULE 1: ROOF STRATA
  loadRoofStrataModule(state) {
    this.clearScene();
    this.activeModule = 'roof_strata';
    // Frame the overhead strata inside the short mobile AR viewport (the HUD occupies its upper edge).
    this.camera.position.set(0, 1.8, 3.5);
    this.camera.lookAt(0, 2.04, -0.6);

    const roofGroup = new THREE.Group();

    const rock = this.makeStrataMaterial('#746b5e', '#433e38', '#baaa8d');
    const shale = this.makeStrataMaterial('#514b46', '#272a29', '#887b6b');
    const coal = this.makeStrataMaterial('#252d2a', '#111715', '#48504a');
    const steel = new THREE.MeshStandardMaterial({ color: 0xaeb7b2, roughness: 0.28, metalness: 0.82 });
    const support = new THREE.MeshStandardMaterial({ color: 0x9b7750, roughness: 0.88 });

    // Mine face cross-section: visible rock bands, coal seam, and steel roof supports.
    this.makeBox(roofGroup, [3.5, 0.34, 2.7], [0, 2.82, -0.6], rock);
    this.makeBox(roofGroup, [3.34, 0.12, 2.58], [0, 2.59, -0.6], shale);
    this.makeBox(roofGroup, [3.15, 0.1, 2.45], [0, 2.47, -0.6], coal);
    this.makeBox(roofGroup, [3.4, 0.12, 2.8], [0, 0.04, -0.55], new THREE.MeshStandardMaterial({ color: 0x554d40, roughness: 1 }));
    for (const x of [-1.52, 1.52]) {
      this.makeCylinder(roofGroup, 0.07, 0.09, 2.38, [x, 1.27, -0.65], support, null, 12);
      this.makeBox(roofGroup, [0.2, 0.08, 0.22], [x, 2.42, -0.65], steel);
      this.makeBox(roofGroup, [0.22, 0.1, 0.24], [x, 0.16, -0.65], support);
    }
    // Fine dark split lines make the loose shale seam legible at a glance.
    const crackMat = new THREE.LineBasicMaterial({ color: 0xe6ad64, transparent: true, opacity: 0.95 });
    [[[-0.75,2.405,-1.4],[-0.66,2.405,-1.0],[-0.78,2.405,-0.75],[-0.53,2.405,-0.45]],[[0.58,2.405,-1.2],[0.45,2.405,-0.85],[0.68,2.405,-0.55],[0.52,2.405,-0.25]]].forEach(points => {
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p))), crackMat);
      roofGroup.add(line);
    });
    this.makeCylinder(roofGroup, 0.035, 0.035, 2.8, [0, 0.09, -2.0], steel, [Math.PI / 2, 0, 0], 10);
    this.addSceneLabel('MINE ROOF · SOUND BEFORE ENTRY', { x: 0, y: 2.65, z: 0.18 }, '#ffc46d');
    this.addSceneLabel('LOOSE SHALE SEAM · ROCK-FALL RISK', { x: -0.55, y: 2.04, z: 0.18 }, '#ff9b73');

    const spots = [
      { id: 'spot_1', x: -1.15, y: 2.36, z: 0.12, loose: false, name: "Solid Sandstone Strata (ठोस बलुआ पत्थर)" },
      { id: 'spot_2', x: -0.48, y: 2.36, z: 0.12, loose: true, name: "Fractured Shale - Rockfall Hazard! (टूटी हुई परत - भारी खतरा!)" },
      { id: 'spot_3', x: 0.18, y: 2.36, z: 0.12, loose: false, name: "Competent Coal Seam Roof (सुरक्षित कोयला छत)" },
      { id: 'spot_4', x: 0.87, y: 2.36, z: 0.12, loose: true, name: "Separating Roof Layer - Dangerous! (अलग होती परत - खतरा!)" },
      { id: 'spot_5', x: -0.5, y: 2.36, z: -1.05, loose: true, name: "Tension Crack Identified! (तनाव दरार - ढहने का जोखिम)" },
      { id: 'spot_6', x: 0.55, y: 2.36, z: -1.05, loose: false, name: "Stable Bedding Plane (स्थिर परत)" }
    ];

    spots.forEach(sp => {
      const isBolted = state.boltedSpots && state.boltedSpots.includes(sp.id);
      const isTested = state.testedSpots && state.testedSpots[sp.id];
      // Show the physical consequence of a fractured roof until this exact point is bolted.
      if (sp.loose && !isBolted) {
        const fractureRock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.23, 0), new THREE.MeshStandardMaterial({ color: isTested ? 0x8e4936 : 0x625649, roughness: 1, emissive: isTested ? 0x4a130d : 0x000000, emissiveIntensity: 0.48 }));
        fractureRock.scale.set(1.8, 0.72, 0.86);
        fractureRock.position.set(sp.x, 2.27, sp.z);
        roofGroup.add(fractureRock);
        const chip = new THREE.Mesh(new THREE.DodecahedronGeometry(0.095, 0), new THREE.MeshStandardMaterial({ color: 0x786550, roughness: 1 }));
        chip.position.set(sp.x + 0.22, 2.11, sp.z + 0.04);
        roofGroup.add(chip);
      }
      if (isBolted) this.addSceneLabel('BOLTED · ROOF PLATE CLAMPING LOOSE SHALE', { x: sp.x, y: 2.05, z: sp.z + 0.08 }, '#74edb2');
      else if (isTested && sp.loose) this.addSceneLabel('LOOSE SHALE · DRAG BOLT HERE', { x: sp.x, y: 2.05, z: sp.z + 0.08 }, '#ff7368');
      else if (isTested) this.addSceneLabel('SOLID STRATA · SOUND / SAFE', { x: sp.x, y: 2.05, z: sp.z + 0.08 }, '#74edb2');

      const geo = new THREE.SphereGeometry(0.15, 18, 12);
      let color = sp.loose ? 0xd69136 : 0x9b9b83;
      if (isTested) {
        color = sp.loose ? (isBolted ? 0x10b981 : 0xef4444) : 0x18c985;
      }

      const mat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.75,
        emissive: isBolted || (isTested && !sp.loose) ? 0x087448 : (sp.loose && isTested ? 0x8b160e : 0x000000),
        emissiveIntensity: isTested ? 0.85 : 0.16
      });

      const spotMesh = new THREE.Mesh(geo, mat);
      spotMesh.scale.set(1.25, 0.42, 0.95);
      spotMesh.position.set(sp.x, sp.y, sp.z);
      spotMesh.userData = {
        interactive: true,
        type: 'roof_spot',
        spotData: sp,
        isTested: isTested,
        isBolted: isBolted
      };

      const pinGeo = new THREE.TorusGeometry(0.2, 0.027, 8, 28);
      const pinMat = new THREE.MeshBasicMaterial({ color: isTested ? (sp.loose ? (isBolted ? 0x5ee6a8 : 0xff5147) : 0x5ee6a8) : 0xffc46d, transparent: true, opacity: isTested ? 0.96 : 0.72 });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(0, -0.015, 0);
      spotMesh.add(pin);
      this.roofIndicators.push({ mesh: pin, tested: !!isTested });

      if (isBolted) {
        const install = new THREE.Group();
        install.position.set(sp.x, 2.4, sp.z);
        const boltShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.027, 0.58, 12), steel);
        boltShaft.position.y = 0.23;
        install.add(boltShaft);
        const bearingPlate = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.045, 0.24), steel);
        bearingPlate.position.y = 0.015;
        install.add(bearingPlate);
        const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.07, 6), new THREE.MeshStandardMaterial({ color: 0xd59a37, metalness: 0.68, roughness: 0.34 }));
        nut.position.y = 0.06;
        install.add(nut);
        this.scene.add(install);
        this.roofBoltAnimations.push({ group: install, fromY: 2.08, toY: 2.4, startedAt: performance.now() });
      }

      roofGroup.add(spotMesh);
      this.interactiveObjects.push(spotMesh);
    });

    const boltCandidate = spots.find(sp => sp.loose && state.testedSpots?.[sp.id] && !state.boltedSpots?.includes(sp.id));
    if (boltCandidate) {
      const boltTarget = new THREE.Object3D();
      boltTarget.position.set(boltCandidate.x, 2.36, boltCandidate.z);
      roofGroup.add(boltTarget);
      const tool = new THREE.Group();
      tool.position.set(0.92, 1.15, 0.48);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.68, 12), steel);
      shaft.rotation.z = Math.PI / 2;
      tool.add(shaft);
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.16), new THREE.MeshStandardMaterial({ color: 0xd49b38, metalness: 0.55, roughness: 0.34, emissive: 0x57360c, emissiveIntensity: 0.4 }));
      plate.position.x = 0.33;
      tool.add(plate);
      const touchTarget = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
      tool.add(touchTarget);
      tool.userData = { interactive: true, draggable: true, type: 'roof_bolt_tool', spotId: boltCandidate.id, name: 'Drag roof bolt and bearing plate to the red loose-rock point', dropTarget: boltTarget, dropRadius: 76 };
      roofGroup.add(tool);
      this.interactiveObjects.push(tool);
      this.addSceneLabel('ROOF BOLT + BEARING PLATE · DRAG TO RED HAZARD', { x: -0.15, y: 1.5, z: 0.55 }, '#91f0b1');
    }

    this.scene.add(roofGroup);
  }

  // MODULE 2: MULTI-GAS DETECTOR
  loadGasDetectorModule(state) {
    this.clearScene();
    this.activeModule = 'gas_detector';
    // Fit roof, breathing-height and floor samples together in the phone viewport.
    this.camera.position.set(0, 1.7, 4.0);
    this.camera.lookAt(0, 2.2, -0.55);

    const gasGroup = new THREE.Group();

    const zones = [
      { id: 'zone_roof', name: 'Roof Level (छत का स्तर) - CH4 Methane Accumulation Zone', y: 2.4, ch4: state.bratticeAdjusted ? 0.35 : 1.45, co: 8, o2: 19.8, h2s: 0.0 },
      { id: 'zone_mid', name: 'Breathing Zone (श्वास स्तर) - Normal Airway', y: 1.4, ch4: 0.40, co: 5, o2: 20.6, h2s: 0.0 },
      // Raise the near-floor band slightly so its touch target stays clear of
      // the on-screen mentor card on compact phone displays.
      { id: 'zone_floor', name: 'Floor Level (फर्श स्तर) - CO2 / Toxic Sludge Zone', y: 0.62, ch4: 0.10, co: 12, o2: 19.2, h2s: 2.1 }
    ];

    const zonePalette = { zone_roof: 0xffa638, zone_mid: 0x51d99b, zone_floor: 0x62bde8 };
    zones.forEach(z => {
      const isSelected = state.currentZone === z.id;
      const color = zonePalette[z.id];
      // A generously sized, forward-facing hit volume makes each atmospheric
      // band practical to tap on phone screens (the visible ring remains a cue).
      const zoneMesh = new THREE.Mesh(
        new THREE.SphereGeometry(isSelected ? 0.62 : 0.56, 24, 16),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: isSelected ? 0.17 : 0.09, depthWrite: false })
      );
      zoneMesh.scale.set(2.05, 0.52, 1.5);
      zoneMesh.position.set(-0.58, z.y, -0.18);
      zoneMesh.userData = { interactive: true, type: 'gas_zone', zoneData: z };
      gasGroup.add(zoneMesh);
      this.interactiveObjects.push(zoneMesh);
      // Each atmosphere sample is identified by a distinct, labeled height band.
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.67, 0.014, 5, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: isSelected ? 0.85 : 0.45 }));
      ring.rotation.x = Math.PI / 2;
      ring.scale.set(1.55, 0.72, 1);
      ring.position.set(-0.58, z.y, -0.55);
      gasGroup.add(ring);
      const readings = z.id === 'zone_roof' ? `CH₄ ${z.ch4.toFixed(2)}% · TAP TO SAMPLE ROOF` : z.id === 'zone_mid' ? `BREATHING ZONE · O₂ ${z.o2}% · TAP TO SAMPLE` : `LOW LEVEL · H₂S ${z.h2s} ppm · TAP TO SAMPLE`;
      this.addSceneLabel(readings, { x: -0.5, y: z.y + 0.19, z: 0.03 }, `#${color.toString(16).padStart(6, '0')}`);
    });

    // Handheld four-gas meter: molded housing, screen, tactile keys, sensor ports and sampling wand.
    const detectorGroup = new THREE.Group();
    detectorGroup.position.set(0.67, state.currentZone === 'zone_roof' ? 2.12 : (state.currentZone === 'zone_floor' ? 0.48 : 1.23), 0.7);
    const orange = new THREE.MeshStandardMaterial({ color: 0xf0a02d, roughness: 0.54 });
    const rubber = new THREE.MeshStandardMaterial({ color: 0x1d2823, roughness: 0.88 });
    const frame = new THREE.MeshStandardMaterial({ color: 0x303b35, roughness: 0.45, metalness: 0.22 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.62, 0.2), orange);
    body.position.set(0, 0, 0);
    detectorGroup.add(body);
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.405, 0.07, 0.215), rubber);
    bumper.position.y = -0.23;
    detectorGroup.add(bumper);
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.2, 0.018), frame);
    screen.position.set(0, 0.095, 0.108);
    detectorGroup.add(screen);
    const screenFace = new THREE.Mesh(new THREE.PlaneGeometry(0.255, 0.16), new THREE.MeshBasicMaterial({ color: state.alarmTriggered ? 0x681e18 : 0x123e30 }));
    screenFace.position.set(0, 0.098, 0.119);
    detectorGroup.add(screenFace);
    const screenText = this.createInstrumentReadout(
      `CH4 ${(state.ch4Level || 0.4).toFixed(2)}%`, `CO  ${state.currentZone === 'zone_roof' ? 8 : 5} ppm`, `O2  ${state.currentZone === 'zone_floor' ? '19.2' : '20.6'}%`,
      state.alarmTriggered || state.ch4Level >= 1.25
    );
    const readout = new THREE.Mesh(new THREE.PlaneGeometry(0.245, 0.15), new THREE.MeshBasicMaterial({ map: screenText }));
    readout.position.set(0, 0.098, 0.122);
    detectorGroup.add(readout);
    for (const x of [-0.105, 0, 0.105]) {
      const key = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), new THREE.MeshStandardMaterial({ color: x === 0 ? 0x51cf9a : 0x46524c, metalness: 0.3 }));
      key.position.set(x, -0.105, 0.108);
      detectorGroup.add(key);
    }
    for (const x of [-0.12, -0.04, 0.04, 0.12]) {
      const port = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.035, 12), frame);
      port.rotation.x = Math.PI / 2;
      port.position.set(x, 0.3, 0.005);
      detectorGroup.add(port);
    }
    this.makeCylinder(detectorGroup, 0.025, 0.025, 0.44, [0, 0.51, -0.02], rubber, null, 10);
    const sensorSteel = new THREE.MeshStandardMaterial({ color: 0xaeb7b2, roughness: 0.28, metalness: 0.82 });
    this.makeCylinder(detectorGroup, 0.022, 0.022, 0.36, [0, 0.89, -0.02], sensorSteel, null, 10);
    const sensorCap = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), frame);
    sensorCap.position.set(0, 1.08, -0.02);
    detectorGroup.add(sensorCap);
    gasGroup.add(detectorGroup);
    this.addSceneLabel('4-GAS METER · SAMPLE HIGH / MID / LOW', { x: 0.65, y: 2.69, z: 0.2 }, '#bde97d');

    // Suspended methane, breathing-height atmosphere and low-level toxic gas are rendered as soft, distinct plumes.
    zones.forEach(z => {
      const color = zonePalette[z.id];
      for (let i = 0; i < 7; i++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(0.11 + (i % 3) * 0.025, 10, 8), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: z.id === state.currentZone ? 0.19 : 0.075, depthWrite: false }));
        puff.position.set(-1.25 + (i % 4) * 0.43, z.y + ((i % 3) - 1) * 0.09, -0.8 - Math.floor(i / 4) * 0.32);
        puff.scale.set(1.5, 0.72, 1);
        gasGroup.add(puff);
        this.animatedMeshes.push({ mesh: puff, baseY: puff.position.y, baseX: puff.position.x, phase: i * 0.8, amplitude: 0.055, drift: 0.12, speed: 0.0012 });
      }
    });

    // Actual touch targets for the corrective actions: isolate ignition first, then open ventilation.
    const controlCabinet = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.82, 0.16), new THREE.MeshStandardMaterial({ color: 0xb5bcb2, metalness: 0.28, roughness: 0.56 }));
    controlCabinet.position.set(1.42, 1.12, 0.58); gasGroup.add(controlCabinet);
    const isolatorPlate = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.035), new THREE.MeshStandardMaterial({ color: 0x26332c, roughness: 0.72 }));
    isolatorPlate.position.set(1.42, 1.12, 0.68); gasGroup.add(isolatorPlate);
    const powerLever = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.34, 0.1), new THREE.MeshStandardMaterial({ color: state.powerCutOff ? 0x36c982 : 0xe64b3e, metalness: 0.2, roughness: 0.35, emissive: state.powerCutOff ? 0x073d20 : 0x5a100b, emissiveIntensity: 0.8 }));
    powerLever.position.set(1.42, 1.13, 0.75);
    powerLever.rotation.z = state.powerCutOff ? Math.PI / 2 : 0;
    powerLever.userData = { interactive: true, type: 'gas_power_switch', name: 'Tap to isolate electrical power' };
    gasGroup.add(powerLever); this.interactiveObjects.push(powerLever);
    const isolatorTouchTarget = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.9, 0.44), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
    isolatorTouchTarget.position.set(1.42, 1.13, 0.82);
    isolatorTouchTarget.userData = { interactive: true, type: 'gas_power_switch', name: 'Tap the red isolator to cut power' };
    gasGroup.add(isolatorTouchTarget); this.interactiveObjects.push(isolatorTouchTarget);
    this.addSceneLabel(state.powerCutOff ? 'POWER ISOLATED' : 'POWER ON · TAP TO ISOLATE', { x: 1.35, y: 1.62, z: 0.72 }, state.powerCutOff ? '#91f0b1' : '#ff8277');

    const curtain = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 2.1), new THREE.MeshStandardMaterial({ color: 0x3d9b7a, side: THREE.DoubleSide, transparent: true, opacity: state.bratticeAdjusted ? 0.24 : 0.68, roughness: 0.92, emissive: 0x0c3025, emissiveIntensity: 0.28 }));
    curtain.position.set(1.92, 1.27, -1.25);
    curtain.rotation.y = state.bratticeAdjusted ? -0.78 : 0;
    curtain.userData = { interactive: true, type: 'gas_brattice', name: 'Tap ventilation brattice to open airflow' };
    gasGroup.add(curtain); this.interactiveObjects.push(curtain);
    const curtainStripe = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.07, 0.035), new THREE.MeshStandardMaterial({ color: 0xe0b84b, roughness: 0.6 }));
    curtainStripe.position.copy(curtain.position); curtainStripe.position.y += 0.84; curtainStripe.rotation.y = curtain.rotation.y; gasGroup.add(curtainStripe);
    this.addSceneLabel(state.bratticeAdjusted ? 'BRATTICE OPEN · FRESH AIR IN' : 'VENTILATION CURTAIN · TAP AFTER ISOLATION', { x: 1.37, y: 2.45, z: -1.1 }, state.bratticeAdjusted ? '#91f0b1' : '#ffd477');

    this.scene.add(gasGroup);
  }

  createInstrumentReadout(line1, line2, line3, alarm = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = alarm ? '#351b18' : '#08271e';
    ctx.fillRect(0, 0, 512, 300);
    ctx.fillStyle = alarm ? '#ff7062' : '#79f1b0';
    ctx.font = '700 49px monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText(line1, 18, 56);
    ctx.fillStyle = '#d2eadb';
    ctx.font = '600 42px monospace';
    ctx.fillText(line2, 18, 151);
    ctx.fillText(line3, 18, 241);
    return new THREE.CanvasTexture(canvas);
  }

  // MODULE 3: LOTO CONVEYOR BELT
  loadLOTODrillModule(state) {
    this.clearScene();
    this.activeModule = 'loto_drill';
    this.camera.position.set(0, 1.4, 2.6);
    this.camera.lookAt(0, 1.35, -0.45);

    const lotoGroup = new THREE.Group();

    const floor = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 3.0), new THREE.MeshStandardMaterial({ color: 0x29352e, roughness: 0.94 }));
    floor.position.set(0, -0.06, -0.35);
    lotoGroup.add(floor);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x4a5650, metalness: 0.7, roughness: 0.44 });
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x171d1a, roughness: 0.91 });
    const yellow = new THREE.MeshStandardMaterial({ color: 0xe0a52f, roughness: 0.56, metalness: 0.18 });
    const rollerMat = new THREE.MeshStandardMaterial({ color: 0x7d8780, metalness: 0.84, roughness: 0.28 });
    this.makeBox(lotoGroup, [1.35, 0.08, 2.45], [0.28, 0.98, -0.65], beltMat);
    // Raised cross-cleats make belt travel easy to see; their motion follows the rollers.
    const cleats = [];
    for (let i = 0; i < 12; i++) {
      const cleat = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.035, 0.045), new THREE.MeshStandardMaterial({ color: 0x46514b, metalness: 0.24, roughness: 0.76 }));
      cleat.position.set(0.28, 1.04, -1.78 + i * 0.205);
      lotoGroup.add(cleat);
      cleats.push(cleat);
    }
    for (const x of [-0.42, 0.98]) this.makeBox(lotoGroup, [0.09, 0.2, 2.62], [x, 1.03, -0.65], yellow);
    const rollers = [];
    for (const z of [-1.85, -1.48, -1.11, -0.74, -0.37, 0, 0.37, 0.74, 1.0]) rollers.push(this.makeCylinder(lotoGroup, 0.065, 0.065, 1.29, [0.28, 0.92, z - 0.65], rollerMat, [0, 0, Math.PI / 2], 12));
    for (const x of [-0.37, 0.93]) for (const z of [-1.4, -0.3, 0.72]) {
      this.makeBox(lotoGroup, [0.075, 0.74, 0.075], [x, 0.49, z - 0.65], frameMat);
      this.makeBox(lotoGroup, [0.35, 0.065, 0.1], [x, 0.1, z - 0.65], frameMat);
    }
    this.makeCylinder(lotoGroup, 0.18, 0.18, 1.28, [0.28, 0.98, 0.64], rollerMat, [0, 0, Math.PI / 2], 24);
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.53, 20), frameMat);
    motor.rotation.z = Math.PI / 2; motor.position.set(1.02, 0.53, 0.35); lotoGroup.add(motor);
    const cabinet = new THREE.MeshStandardMaterial({ color: 0xc1c8be, metalness: 0.36, roughness: 0.49 });
    const darkPanel = new THREE.MeshStandardMaterial({ color: 0x28332d, metalness: 0.36, roughness: 0.5 });
    this.makeBox(lotoGroup, [0.82, 1.24, 0.3], [-1.12, 1.46, 0.16], cabinet);
    this.makeBox(lotoGroup, [0.66, 0.88, 0.025], [-1.12, 1.53, 0.324], darkPanel);
    this.makeBox(lotoGroup, [0.7, 0.16, 0.035], [-1.12, 2.04, 0.34], yellow);

    const switchHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.31, 12), new THREE.MeshStandardMaterial({ color: state.step >= 1 ? 0x748078 : 0x38c980, metalness: 0.36, roughness: 0.34 }));
    switchHandle.position.set(-1.12, 1.54, 0.41);
    switchHandle.rotation.z = state.step >= 1 ? Math.PI / 2 : 0;
    switchHandle.userData = { interactive: true, type: 'loto_switch', name: 'Main Power Isolator Switch' };
    lotoGroup.add(switchHandle);
    this.interactiveObjects.push(switchHandle);
    this.makeCylinder(lotoGroup, 0.12, 0.12, 0.04, [-1.12, 1.54, 0.37], frameMat, [Math.PI / 2, 0, 0], 20);
    this.addSceneLabel(state.step >= 1 ? 'ISOLATOR OFF · LOCK OUT' : 'LIVE POWER · TURN OFF FIRST', { x: -1.1, y: 2.28, z: 0.5 }, state.step >= 1 ? '#91f0b1' : '#ffc46d');
    this.addSceneLabel('CONVEYOR DRIVE & BELT', { x: 0.2, y: 1.39, z: -1.02 }, '#c4e5c6');

    if (state.step >= 2) {
      const hasp = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 20, Math.PI), new THREE.MeshStandardMaterial({ color: 0xd7dcce, metalness: 0.9, roughness: 0.22 }));
      hasp.position.set(-1.12, 1.42, 0.41);
      hasp.rotation.z = Math.PI;
      lotoGroup.add(hasp);
    } else if (state.step === 1) {
      const haspTarget = new THREE.Object3D(); haspTarget.position.set(-1.12, 1.42, 0.41); lotoGroup.add(haspTarget);
      const hasp = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 10, 24, Math.PI), new THREE.MeshStandardMaterial({ color: 0xd7dcce, metalness: 0.9, roughness: 0.22, emissive: 0x72500c, emissiveIntensity: 0.35 }));
      hasp.position.set(-0.34, 1.62, 0.62);
      hasp.rotation.z = Math.PI;
      hasp.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })));
      hasp.userData = { interactive: true, draggable: true, type: 'loto_hasp', name: 'Drag safety hasp onto the isolator', dropTarget: haspTarget, dropRadius: 78 };
      lotoGroup.add(hasp);
      this.interactiveObjects.push(hasp);
      this.addSceneLabel('PICK UP METAL HASP → FIT OVER SWITCH HANDLE', { x: -0.05, y: 2.04, z: 0.58 }, '#ffd477');
    }

    if (state.step >= 3) {
      const lockBody = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.2, 0.08), new THREE.MeshStandardMaterial({ color: 0xd83e35, roughness: 0.34, metalness: 0.16 }));
      lockBody.position.set(-1.12, 1.34, 0.46);
      const lockShackle = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.02, 8, 18, Math.PI), new THREE.MeshStandardMaterial({ color: 0xcbd3d0, metalness: 0.94, roughness: 0.18 }));
      lockShackle.position.set(-1.12, 1.44, 0.46);
      lockShackle.rotation.z = Math.PI;
      lotoGroup.add(lockBody);
      lotoGroup.add(lockShackle);
    } else if (state.step === 2) {
      const lockTarget = new THREE.Object3D(); lockTarget.position.set(-1.12, 1.34, 0.46); lotoGroup.add(lockTarget);
      const looseLock = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.09), new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.34, metalness: 0.16, emissive: 0x7f1010, emissiveIntensity: 0.55 }));
      looseLock.position.set(-0.34, 1.34, 0.62);
      looseLock.add(new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 10), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })));
      looseLock.userData = { interactive: true, draggable: true, type: 'loto_lock', name: 'Drag personal red padlock onto the hasp', dropTarget: lockTarget, dropRadius: 78 };
      lotoGroup.add(looseLock);
      this.interactiveObjects.push(looseLock);
      const looseShackle = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.02, 8, 18, Math.PI), new THREE.MeshStandardMaterial({ color: 0xcbd3d0, metalness: 0.94, roughness: 0.18 }));
      looseShackle.position.set(0, 0.13, 0.025); looseShackle.rotation.z = Math.PI; looseLock.add(looseShackle);
      this.addSceneLabel('PICK UP RED PADLOCK → HANG ON HASP', { x: -0.05, y: 1.94, z: 0.58 }, '#ff9b90');
    }

    if (state.step >= 4) {
      const tag = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.34, 0.025), new THREE.MeshStandardMaterial({ color: 0xf3eee0, roughness: 0.82 }));
      tag.position.set(-0.82, 1.29, 0.43);
      lotoGroup.add(tag);
      this.addSceneLabel('DANGER · DO NOT START', { x: -0.82, y: 1.29, z: 0.46 }, '#ff7770');
    } else if (state.step === 3) {
      const tagTarget = new THREE.Object3D(); tagTarget.position.set(-0.82, 1.29, 0.43); lotoGroup.add(tagTarget);
      const looseTag = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 0.035), new THREE.MeshStandardMaterial({ color: 0xf3eee0, roughness: 0.82, emissive: 0x624d09, emissiveIntensity: 0.3 }));
      looseTag.position.set(-0.34, 1.22, 0.62);
      looseTag.add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })));
      looseTag.userData = { interactive: true, draggable: true, type: 'loto_tag', name: 'Drag DO NOT OPERATE tag onto lockout point', dropTarget: tagTarget, dropRadius: 82 };
      lotoGroup.add(looseTag);
      this.interactiveObjects.push(looseTag);
      this.addSceneLabel('PICK UP DANGER TAG → HANG BESIDE LOCK', { x: -0.05, y: 1.94, z: 0.58 }, '#ff9b90');
    }

    const testBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.07, 16), new THREE.MeshStandardMaterial({ color: state.step >= 5 ? 0x42d993 : 0xd33c34, metalness: 0.18, roughness: 0.35 }));
    testBtn.rotation.x = Math.PI / 2;
    testBtn.position.set(-0.89, 1.68, 0.37);
    testBtn.userData = { interactive: true, type: 'loto_test_btn', name: 'Test Start Button (Zero Energy Check)' };
    lotoGroup.add(testBtn);
    this.interactiveObjects.push(testBtn);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), new THREE.MeshBasicMaterial({ color: state.step >= 5 ? 0x42d993 : (state.step >= 1 ? 0x66756c : 0xff5146) }));
    lamp.position.set(-0.89, 1.83, 0.38);
    lotoGroup.add(lamp);
    const statusLamp = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 12), new THREE.MeshStandardMaterial({ color: state.step === 0 ? 0x42d993 : 0xf5ac38, emissive: state.step === 0 ? 0x07502a : 0x6b3510, emissiveIntensity: 1.2 }));
    statusLamp.position.set(1.02, 0.53, 0.64);
    lotoGroup.add(statusLamp);
    this.addSceneLabel(state.step >= 5 ? 'ZERO ENERGY VERIFIED' : 'TEST · TRY START AFTER LOTO', { x: -0.88, y: 1.99, z: 0.45 }, state.step >= 5 ? '#91f0b1' : '#ffc46d');

    this.scene.add(lotoGroup);
    this.lotoConveyor = {
      cleats,
      rollers,
      statusLamp,
      targetSpeed: state.step === 0 ? 1 : 0,
      rampRate: state.step === 0 ? 1.1 : 0.62,
      clock: new THREE.Clock()
    };
  }

  // MODULE 4: 100-TON DUMPER BLIND SPOT
  loadDumperBlindSpotModule(state) {
    this.clearScene();
    this.activeModule = 'dumper_blindspot';
    this.camera.position.set(0, 3.2, 6.2);
    this.camera.lookAt(0, 1.1, 0);
    this.camera.lookAt(0, 1.0, 0);

    const dumperGroup = new THREE.Group();
    const truck = new THREE.Group();
    const safetyYellow = new THREE.MeshStandardMaterial({ color: 0xdba52f, roughness: 0.52, metalness: 0.18 });
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x343c38, roughness: 0.7, metalness: 0.58 });
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x62b3c1, roughness: 0.16, metalness: 0.1, transparent: true, opacity: 0.78 });
    const rubber = new THREE.MeshStandardMaterial({ color: 0x161a18, roughness: 0.96 });
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x89918c, roughness: 0.34, metalness: 0.84 });
    const ground = new THREE.Mesh(new THREE.BoxGeometry(11, 0.08, 11), new THREE.MeshStandardMaterial({ color: 0x4a5149, roughness: 0.98 }));
    ground.position.y = -0.08;
    dumperGroup.add(ground);

    // Articulated rigid-frame haul truck: chassis, open dump body, cab, grille, lights and six deep-tread tyres.
    this.makeBox(truck, [1.9, 0.38, 4.25], [0, 1.42, -0.1], chassisMat);
    this.makeBox(truck, [1.65, 0.25, 3.6], [0, 1.67, -0.16], safetyYellow);
    // Open-top rock tray: floor, twin tall side walls, front bulkhead and tailgate.
    this.makeBox(truck, [2.28, 0.16, 2.48], [0, 2.43, -0.55], safetyYellow, [-0.04, 0, 0]);
    this.makeBox(truck, [0.14, 0.82, 2.6], [-1.12, 2.83, -0.55], safetyYellow, [-0.05, 0, 0]);
    this.makeBox(truck, [0.14, 0.82, 2.6], [1.12, 2.83, -0.55], safetyYellow, [-0.05, 0, 0]);
    this.makeBox(truck, [2.28, 0.72, 0.14], [0, 2.78, 0.69], safetyYellow);
    this.makeBox(truck, [2.28, 0.76, 0.14], [0, 2.82, -1.79], safetyYellow);
    const rockLoad = new THREE.MeshStandardMaterial({ color: 0x797a6b, roughness: 1 });
    for (let i = 0; i < 12; i++) {
      const lump = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22 + (i % 3) * 0.035, 0), rockLoad);
      lump.position.set(-0.78 + (i % 4) * 0.5, 2.58 + (i % 2) * 0.12, -1.42 + Math.floor(i / 4) * 0.63);
      lump.rotation.set(i * 0.3, i * 0.7, i * 0.13);
      truck.add(lump);
    }
    // Cab at the front; thick pillars and separate windows read as a driver's cab instead of a white block.
    this.makeBox(truck, [1.12, 0.12, 0.96], [-0.48, 2.93, 1.12], safetyYellow);
    this.makeBox(truck, [0.12, 0.78, 0.12], [-1.0, 2.47, 1.47], safetyYellow);
    this.makeBox(truck, [0.12, 0.78, 0.12], [0.04, 2.47, 1.47], safetyYellow);
    this.makeBox(truck, [1.0, 0.1, 0.12], [-0.48, 2.83, 1.47], safetyYellow);
    this.makeBox(truck, [0.9, 0.62, 0.035], [-0.48, 2.51, 1.52], glass);
    this.makeBox(truck, [0.08, 0.57, 0.04], [-0.48, 2.51, 1.55], safetyYellow);
    this.makeBox(truck, [0.85, 0.12, 0.08], [-0.48, 2.12, 1.4], chassisMat);
    // Front fascia, cooling grille, guard rails and headlamps.
    this.makeBox(truck, [1.28, 0.56, 0.16], [0, 1.93, 2.0], safetyYellow);
    this.makeBox(truck, [0.58, 0.36, 0.035], [0, 1.91, 2.09], chassisMat);
    for (let i = 0; i < 7; i++) this.makeBox(truck, [0.48, 0.025, 0.04], [0, 1.77 + i * 0.047, 2.12], hubMat);
    const lampMat = new THREE.MeshStandardMaterial({ color: 0xffedaf, emissive: 0xffa526, emissiveIntensity: 0.4 });
    for (const x of [-0.76, 0.76]) {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.17, 0.06), lampMat);
      lamp.position.set(x, 2.04, 2.1); truck.add(lamp);
      this.makeBox(truck, [0.06, 0.63, 0.07], [x, 2.42, 1.26], chassisMat);
    }
    // Massive tyres with individual tread lugs and a visible steel hub on each side.
    const wheelPositions = [[-1.12,0.68,1.2],[1.12,0.68,1.2],[-1.12,0.68,-0.48],[1.12,0.68,-0.48],[-1.12,0.68,-1.37],[1.12,0.68,-1.37]];
    wheelPositions.forEach(([x,y,z]) => {
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.61, 0.61, 0.48, 32), rubber);
      tire.rotation.z = Math.PI / 2; tire.position.set(x,y,z); truck.add(tire);
      const outside = x < 0 ? x - 0.25 : x + 0.25;
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,0.045,24), hubMat);
      hub.rotation.z = Math.PI/2; hub.position.set(outside,y,z); truck.add(hub);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.11,0.055,16), chassisMat);
      cap.rotation.z=Math.PI/2;cap.position.set(outside+(x<0?-0.03:0.03),y,z);truck.add(cap);
      for (let lug=0;lug<12;lug++) {
        const angle=lug*Math.PI/6;
        const tread=new THREE.Mesh(new THREE.BoxGeometry(0.52,0.09,0.15),rubber);
        tread.position.set(x+Math.sin(angle)*0.6,y+Math.cos(angle)*0.6,z);tread.rotation.x=angle;truck.add(tread);
      }
    });
    // Exhaust stack, access ladder, mirrors, handrails and hydraulic hoist make the equipment readable at training scale.
    this.makeCylinder(truck,0.065,0.085,1.2,[0.78,2.14,-1.05],chassisMat,null,12);
    for (let rung=0;rung<4;rung++) this.makeBox(truck,[0.42,0.045,0.055],[1.23,0.48+rung*0.23,1.25],hubMat);
    this.makeCylinder(truck,0.045,0.045,0.92,[0.7,1.25,0.65],hubMat,[0.2,0,0.16],12);
    truck.scale.setScalar(0.72);
    dumperGroup.add(truck);
    this.addSceneLabel('100 T CLASS · HAUL TRUCK', { x: 0, y: 3.02, z: 0.2 }, '#ffcf72');

    const fatalZoneGeo = new THREE.RingGeometry(2.3, 4.6, 32, 1, 0, Math.PI * 1.3);
    const fatalZoneMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
    const fatalZone = new THREE.Mesh(fatalZoneGeo, fatalZoneMat);
    fatalZone.rotation.x = -Math.PI / 2;
    fatalZone.position.set(0.4, 0.05, -0.8);
    fatalZone.userData = { interactive: true, type: 'blind_zone_fatal', name: 'FATAL BLIND SPOT (गंभीर अंधा क्षेत्र - चालक को कुछ नहीं दिखता!)' };
    dumperGroup.add(fatalZone);
    this.interactiveObjects.push(fatalZone);
    this.addSceneLabel('NO-GO · REAR BLIND ZONE', { x: 0.1, y: 0.1, z: -3.15 }, '#ff7770');

    const safeZoneGeo = new THREE.CircleGeometry(2.0, 28, Math.PI * 1.3, Math.PI * 0.7);
    const safeZoneMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.72 });
    const safeZone = new THREE.Mesh(safeZoneGeo, safeZoneMat);
    safeZone.rotation.x = -Math.PI / 2;
    safeZone.position.set(2.25, 0.05, -0.1);
    safeZone.userData = { interactive: true, type: 'safe_zone', name: 'SAFE VISIBILITY ZONE (सुरक्षित प्रत्यक्ष दृश्य क्षेत्र)' };
    dumperGroup.add(safeZone);
    this.interactiveObjects.push(safeZone);
    this.addSceneLabel('SAFE STAND · DRIVER EYE CONTACT', { x: 2.25, y: 0.18, z: -0.1 }, '#91f0b1');

    // Horn-code choices are mounted as tappable training controls in the scene itself.
    [1, 2, 3].forEach((answer, index) => {
      const colors = [0xffbf55, 0x53b9e9, 0x4ed697];
      const selected = state.selectedHornAnswer === answer;
      const control = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.32, 0.16, 24), new THREE.MeshStandardMaterial({ color: selected ? 0x55e5a2 : colors[index], emissive: selected ? 0x155a37 : 0x38220b, emissiveIntensity: selected ? 0.75 : 0.3, metalness: 0.28, roughness: 0.4 }));
      control.position.set(-0.72 + index * 0.72, 0.3, 1.95);
      control.add(new THREE.Mesh(new THREE.SphereGeometry(0.37, 12, 10), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })));
      control.userData = { interactive: true, type: 'dumper_horn_answer', answer, name: `${answer} horn blast${answer > 1 ? 's' : ''}` };
      dumperGroup.add(control); this.interactiveObjects.push(control);
      this.addSceneLabel(`${answer}× HORN · ${['START', 'FORWARD', 'REVERSE'][index]}`, { x: -0.72 + index * 0.72, y: 0.56, z: 1.95 }, selected ? '#91f0b1' : '#ffe09a');
    });
    this.addSceneLabel('TAP 3× BEFORE REVERSING', { x: 0, y: 0.92, z: 1.95 }, '#d7eece');

    this.scene.add(dumperGroup);
  }

  // MODULE 5: SCSR ESCAPE DRILL
  loadSCSRDonningModule(state) {
    this.clearScene();
    this.activeModule = 'scsr_donning';
    // Keep the trainee's face, canister and evacuation route inside the phone-sized camera viewport.
    this.camera.position.set(0, 1.65, 3.0);
    this.camera.lookAt(0, 1.55, -0.55);

    const scsrGroup = new THREE.Group();

    if (state.smokeActive) {
      for (let i = 0; i < 18; i++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(0.22 + (i % 4) * 0.07, 12, 10), new THREE.MeshStandardMaterial({ color: i % 3 ? 0x6a716d : 0x929188, transparent: true, opacity: 0.1 + (i % 3) * 0.025, roughness: 1, depthWrite: false }));
        puff.position.set(-1.45 + (i % 6) * 0.58, 0.55 + (i % 4) * 0.42, -1.6 - Math.floor(i / 6) * 0.48);
        scsrGroup.add(puff);
        this.animatedMeshes.push({ mesh: puff, baseY: puff.position.y, baseX: puff.position.x, phase: i * 0.7, amplitude: 0.08, drift: 0.16, speed: 0.0009 });
      }
    }

    const floor = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.08, 7), new THREE.MeshStandardMaterial({ color: 0x363e39, roughness: 1 }));
    floor.position.set(0, -0.06, -1.15); scsrGroup.add(floor);
    const caseMat = new THREE.MeshStandardMaterial({ color: 0xd39a32, roughness: 0.4, metalness: 0.68 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x242b28, roughness: 0.76 });
    const silver = new THREE.MeshStandardMaterial({ color: 0xaeb7b2, roughness: 0.28, metalness: 0.82 });
    const pack = new THREE.Group();
    pack.position.set(-0.7, 0.85, 0.15);
    const canister = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.22, 0.58, 24), caseMat);
    canister.userData = { interactive: false, type: 'scsr_case', name: 'Self-Contained Self-Rescuer (SCSR) Canister' };
    pack.add(canister);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 24), silver);
    if (state.step === 0) {
      lid.position.set(0, 0.34, 0);
      lid.scale.set(1.35, 1, 1.35);
      lid.userData = { interactive: true, type: 'scsr_case_lid', name: 'Open the SCSR lid' };
      lid.add(new THREE.Mesh(new THREE.SphereGeometry(0.27, 12, 10), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })));
    } else {
      lid.position.set(0.2, 0.29, 0.04);
      lid.rotation.z = -Math.PI / 2;
      lid.material = new THREE.MeshStandardMaterial({ color: 0x87928e, roughness: 0.3, metalness: 0.85 });
      const darkOpening = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.15, 0.025, 24), dark);
      darkOpening.position.set(0, 0.31, 0);
      pack.add(darkOpening);
      this.addSceneLabel('CASE OPEN · REMOVE SELF-RESCUER', { x: -0.52, y: 1.18, z: 0.42 }, '#91f0b1');
    }
    pack.add(lid); this.interactiveObjects.push(lid);
    this.makeCylinder(pack, 0.13, 0.15, 0.1, [0, -0.34, 0], dark, null, 20);
    this.makeBox(pack, [0.23, 0.36, 0.035], [0, 0, 0.195], dark);
    this.makeBox(pack, [0.18, 0.27, 0.015], [0, 0.015, 0.219], new THREE.MeshStandardMaterial({ color: 0xe7d9ad, roughness: 0.9 }));
    this.addSceneLabel('SCSR CANISTER · EMERGENCY ONLY', { x: -0.24, y: 1.52, z: 0.48 }, '#ffc46d');
    // Chest harness and adjustable shoulder loops.
    this.makeBox(pack, [0.08, 0.58, 0.04], [-0.23, 0.02, -0.02], dark, [0, 0, -0.22]);
    this.makeBox(pack, [0.08, 0.58, 0.04], [0.23, 0.02, -0.02], dark, [0, 0, 0.22]);
    scsrGroup.add(pack);

    // A head-and-shoulders training mannequin shows where the breathing equipment belongs.
    const trainee = new THREE.Group(); trainee.position.set(0.62, 0, -0.58);
    const suit = new THREE.MeshStandardMaterial({ color: 0xb8782e, roughness: 0.78 });
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0xe3a935, roughness: 0.42 });
    const faceMat = new THREE.MeshStandardMaterial({ color: 0x744c36, roughness: 0.94 });
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.78, 18), suit); torso.position.set(0, 0.94, 0); trainee.add(torso);
    for (const y of [0.55,1.33]) { const cap=new THREE.Mesh(new THREE.SphereGeometry(y<1?0.34:0.3,16,10),suit);cap.position.set(0,y,0);trainee.add(cap); }
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 16), faceMat); head.position.set(0, 1.67, 0.12); trainee.add(head);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x211914 });
    for (const x of [-0.072, 0.072]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 10), eyeMat); eye.position.set(x, 1.7, 0.35); trainee.add(eye);
    }
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 10), faceMat); nose.scale.set(0.8, 1.05, 0.9); nose.position.set(0, 1.63, 0.36); trainee.add(nose);
    const lips = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.018, 0.018), new THREE.MeshBasicMaterial({ color: 0x351f1a })); lips.position.set(0, 1.565, 0.36); trainee.add(lips);
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.52), helmetMat); helmet.position.set(0, 1.79, 0.02); trainee.add(helmet);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.045, 24), helmetMat); brim.position.set(0, 1.7, 0.03); trainee.add(brim);
    this.makeBox(trainee, [0.64, 0.12, 0.1], [0, 1.2, 0.06], new THREE.MeshStandardMaterial({ color: 0xd9c58e, metalness: 0.28 }));
    for (const x of [-0.37, 0.37]) {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.11, 0.66, 12), suit); arm.position.set(x, 0.99, 0.02); arm.rotation.z = x < 0 ? -0.18 : 0.18; trainee.add(arm);
    }
    scsrGroup.add(trainee);

    if (state.step === 1) {
      const mouthTarget = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.018, 8, 24), new THREE.MeshBasicMaterial({ color: 0x55e5c0, transparent: true, opacity: 0.95 }));
      mouthTarget.position.set(0, 1.55, 0.36); trainee.add(mouthTarget);
      const looseMouthpiece = new THREE.Mesh(new THREE.BoxGeometry(0.22,0.1,0.12), new THREE.MeshStandardMaterial({ color: 0x20332e, roughness: 0.42 }));
      looseMouthpiece.position.set(-0.42, 1.12, 0.38);
      looseMouthpiece.add(new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })));
      looseMouthpiece.userData = { interactive: true, draggable: true, type: 'scsr_mouthpiece', name: 'Drag mouthpiece to the trainee mouth', dropTarget: mouthTarget, dropRadius: 62 };
      scsrGroup.add(looseMouthpiece); this.interactiveObjects.push(looseMouthpiece);
      const looseHose = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.7,1.15,0.28),new THREE.Vector3(-0.56,1.35,0.32),new THREE.Vector3(-0.5,1.12,0.38)]);
      scsrGroup.add(new THREE.Mesh(new THREE.TubeGeometry(looseHose, 18, 0.028, 7, false), dark));
      this.addSceneLabel('DRAG MOUTHPIECE TO MOUTH', { x: 0.45, y: 2.08, z: 0.22 }, '#55e5c0');
    }

    if (state.step >= 2) {
      const hoseCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.7,1.22,0.2),new THREE.Vector3(-0.4,1.35,0.28),new THREE.Vector3(0.1,1.5,0.12),new THREE.Vector3(0.62,1.55,-0.32)]);
      const hose = new THREE.Mesh(new THREE.TubeGeometry(hoseCurve, 28, 0.035, 8, false), dark); scsrGroup.add(hose);
      const mouthpiece = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.1), new THREE.MeshStandardMaterial({ color: 0x33453c, roughness: 0.5 }));
      mouthpiece.position.set(0, 1.55, 0.38); trainee.add(mouthpiece);
      const mouthPort = new THREE.Mesh(new THREE.CylinderGeometry(0.028,0.028,0.09,12), silver); mouthPort.rotation.x=Math.PI/2;mouthPort.position.set(0,1.55,0.43);trainee.add(mouthPort);
      this.addSceneLabel('MOUTHPIECE · SEAL YOUR LIPS', { x: 0.62, y: 1.93, z: -0.1 }, '#91f0b1');
      if (state.step >= 5) {
        const flowMat = new THREE.MeshBasicMaterial({ color: 0x75f2b7, transparent: true, opacity: 0.92 });
        for (let i = 0; i < 5; i++) {
          const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), flowMat);
          bubble.position.set(-0.48 + i * 0.23, 1.28 + i * 0.06, 0.22 - i * 0.1);
          scsrGroup.add(bubble);
          this.animatedMeshes.push({ mesh: bubble, baseY: bubble.position.y, baseX: bubble.position.x, phase: i * 1.2, amplitude: 0.05, drift: 0.05, speed: 0.002 });
        }
      }
    }

    if (state.step === 2) {
      const noseTarget = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.018, 8, 20), new THREE.MeshBasicMaterial({ color: 0x55e5c0, transparent: true, opacity: 0.95 }));
      noseTarget.position.set(0, 1.69, 0.37); trainee.add(noseTarget);
      const clip = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.075, 0.08), new THREE.MeshStandardMaterial({ color: 0xed5947, metalness: 0.25, roughness: 0.32 }));
      clip.position.set(0.35, 1.35, 0.38); clip.userData = { interactive: true, draggable: true, type: 'scsr_nose_clip', name: 'Drag nose clip to the nose', dropTarget: noseTarget, dropRadius: 58 };
      clip.add(new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })));
      scsrGroup.add(clip); this.interactiveObjects.push(clip);
      this.addSceneLabel('DRAG NOSE CLIP TO NOSE', { x: 0.45, y: 2.08, z: 0.22 }, '#55e5c0');
    }
    if (state.step >= 3) {
      const noseClamp = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.045, 0.055), new THREE.MeshStandardMaterial({ color: 0xec5849, metalness: 0.18 }));
      noseClamp.position.set(0, 1.69, 0.37); trainee.add(noseClamp);
      this.addSceneLabel('NOSE CLIP · CHECK THE SEAL', { x: 0.62, y: 2.04, z: 0.15 }, '#ffc46d');
    }

    if (state.step === 3) {
      const eyeTarget = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.2, 0.04), new THREE.MeshBasicMaterial({ color: 0x55e5c0, wireframe: true, transparent: true, opacity: 0.95 }));
      eyeTarget.position.set(0, 1.76, 0.33); trainee.add(eyeTarget);
      const looseGoggles = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.2, 0.09), new THREE.MeshPhysicalMaterial({ color: 0x49b9c8, transparent: true, opacity: 0.68, roughness: 0.14, metalness: 0.1 }));
      looseGoggles.position.set(1.1, 1.55, 0.32); looseGoggles.userData = { interactive: true, draggable: true, type: 'scsr_goggles', name: 'Drag protective goggles over the eyes', dropTarget: eyeTarget, dropRadius: 66 };
      looseGoggles.add(new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })));
      scsrGroup.add(looseGoggles); this.interactiveObjects.push(looseGoggles);
      this.addSceneLabel('DRAG GOGGLES OVER EYES', { x: 0.45, y: 2.08, z: 0.22 }, '#55e5c0');
    }

    if (state.step >= 4) {
      const goggles = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.13, 0.06), new THREE.MeshPhysicalMaterial({ color: 0x6cb7bc, transparent: true, opacity: 0.7, roughness: 0.12, metalness: 0.12 }));
      goggles.position.set(0, 1.75, 0.39); trainee.add(goggles);
    }

    if (state.step === 4) {
      const starterLoop = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 8, 16), new THREE.MeshStandardMaterial({ color: 0xd94335, metalness: 0.42, roughness: 0.3 }));
      starterLoop.position.set(-0.47, 0.77, 0.3);
      starterLoop.add(new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })));
      const pinTarget = new THREE.Object3D(); pinTarget.position.set(-0.2, 0.78, 0.38); scsrGroup.add(pinTarget);
      starterLoop.userData = { interactive: true, draggable: true, type: 'scsr_starter_pin', name: 'Pull the oxygen activation ring', dropTarget: pinTarget, dropRadius: 62 };
      scsrGroup.add(starterLoop);
      this.interactiveObjects.push(starterLoop);
    }

    // Floor arrows lead out of the smoke toward a marked emergency egress point.
    for (let i = 0; i < 4; i++) {
      const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.35, 3), new THREE.MeshBasicMaterial({ color: 0x65e3a2, transparent: true, opacity: 0.9 }));
      arrow.rotation.x = -Math.PI / 2;
      arrow.position.set(0.35, 0.05, -0.35 - i * 0.72);
      scsrGroup.add(arrow);
    }
    const exitBoard = new THREE.Mesh(new THREE.BoxGeometry(0.66,0.35,0.06), new THREE.MeshBasicMaterial({ color: 0x165437 }));
    exitBoard.position.set(0,2.3,-3.55);scsrGroup.add(exitBoard);
    if (state.step === 5) {
      exitBoard.userData = { interactive: true, type: 'scsr_exit', name: 'Tap EXIT after following the escape route' };
      this.interactiveObjects.push(exitBoard);
      const exitHalo = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.035, 8, 32), new THREE.MeshBasicMaterial({ color: 0x69f2a4, transparent: true, opacity: 0.9 }));
      exitHalo.position.set(0, 2.3, -3.49); scsrGroup.add(exitHalo);
    }
    this.addSceneLabel('EXIT → FRESH AIR', { x: 0, y: 2.3, z: -3.48 }, '#91f0b1');

    this.scene.add(scsrGroup);
  }

  animate() {
    this.animId = requestAnimationFrame(() => this.animate());

    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.1;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.1;

    if (this.scene) {
      const elapsed = performance.now();
      this.animatedMeshes.forEach(item => {
        item.mesh.position.y = item.baseY + Math.sin(elapsed * item.speed + item.phase) * item.amplitude;
        item.mesh.position.x = item.baseX + Math.sin(elapsed * item.speed * 0.45 + item.phase) * item.drift;
      });
      if (this.isCameraAR) this.scene.rotation.set(0, 0, 0);
      else {
        this.scene.rotation.y = this.currentRotation.y;
        this.scene.rotation.x = this.currentRotation.x;
      }

      if (this.arReticle && this.arReticle.visible) {
        this.arReticle.rotation.z += 0.01;
      }

      if (this.dustParticles && !this.isCameraAR) {
        const positions = this.dustParticles.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 0.002;
          if (positions[i] < 0) positions[i] = 4;
        }
        this.dustParticles.geometry.attributes.position.needsUpdate = true;
      }

      // Conveyor belt cleats translate along the belt; rollers follow the same speed.
      if (this.lotoConveyor) {
        const dt = Math.min(0.05, this.lotoConveyor.clock.getDelta());
        const targetSpeed = this.lotoConveyor.targetSpeed;
        const change = this.lotoConveyor.rampRate * dt;
        this.beltSpeed += Math.max(-change, Math.min(change, targetSpeed - this.beltSpeed));
        this.lotoConveyor.cleats.forEach(cleat => {
          cleat.position.z += this.beltSpeed * dt * 0.92;
          if (cleat.position.z > 0.72) cleat.position.z -= 2.45;
        });
        this.lotoConveyor.rollers.forEach(roller => { roller.rotation.x += this.beltSpeed * dt * 4.2; });
        this.lotoConveyor.statusLamp.material.color.setHex(this.beltSpeed > 0.08 ? 0xf5ac38 : 0x42d993);
        this.lotoConveyor.statusLamp.material.emissive.setHex(this.beltSpeed > 0.08 ? 0x6b3510 : 0x07502a);
      }

      this.roofBoltAnimations = this.roofBoltAnimations.filter(animation => {
        const progress = Math.min(1, (elapsed - animation.startedAt) / 720);
        const eased = 1 - Math.pow(1 - progress, 3);
        animation.group.position.y = animation.fromY + (animation.toY - animation.fromY) * eased;
        animation.group.scale.setScalar(0.65 + eased * 0.35);
        return progress < 1;
      });
      this.roofIndicators.forEach((indicator, index) => {
        const pulse = 1 + Math.sin(elapsed * 0.004 + index * 0.8) * (indicator.tested ? 0.11 : 0.045);
        indicator.mesh.scale.set(pulse, pulse, pulse);
      });
    }

    try {
      this.renderer.render(this.scene, this.camera);
    } catch (error) {
      if (!this.renderErrorReported) {
        this.renderErrorReported = true;
        console.error('AR renderer stopped drawing:', error && error.stack ? error.stack : error);
      }
      // Keep the training scene usable if a browser restores a malformed cached texture.
      // Preserve working maps (including instrument labels); remove only corrupt texture slots.
      if (!this.textureFallbackApplied) {
        const textureSlots = ['map', 'alphaMap', 'aoMap', 'lightMap', 'emissiveMap', 'bumpMap', 'normalMap', 'displacementMap', 'roughnessMap', 'metalnessMap', 'gradientMap', 'envMap'];
        this.scene.traverse(object => {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.filter(Boolean).forEach(material => textureSlots.forEach(slot => {
            const texture = material[slot];
            if (texture && (!texture.matrix || !texture.matrix.elements || texture.matrix.elements.length !== 9)) {
              texture.matrix = new THREE.Matrix3();
              texture.updateMatrix?.();
            }
          }));
        });
        this.textureFallbackApplied = true;
        try { this.renderer.render(this.scene, this.camera); } catch (fallbackError) {
          // Last-resort fallback is scoped to textures only if matrix repair wasn't enough.
          this.scene.traverse(object => {
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.filter(Boolean).forEach(material => textureSlots.forEach(slot => {
              const texture = material[slot];
              if (texture && (!texture.matrix || !texture.matrix.elements)) material[slot] = null;
            }));
          });
          try { this.renderer.render(this.scene, this.camera); } catch (finalError) {
          console.error('AR fallback render failed:', fallbackError && fallbackError.stack ? fallbackError.stack : fallbackError);
          }
        }
      }
    }
  }
}

window.AREngine = AREngine;
