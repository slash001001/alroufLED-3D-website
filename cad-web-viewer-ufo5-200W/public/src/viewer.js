// Three.js viewer logic
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.158.0/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f2f5);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 2000);
camera.position.set(3, 2, 4);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
scene.add(hemi);

const dir = new THREE.DirectionalLight(0xffffff, 0.9);
dir.position.set(5,10,7);
dir.castShadow = true;
scene.add(dir);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(200,200), new THREE.MeshStandardMaterial({ color: 0xeeeeee }));
ground.rotation.x = -Math.PI/2;
ground.position.y = -0.01;
scene.add(ground);

let modelRoot = new THREE.Group();
scene.add(modelRoot);

const loader = new GLTFLoader();
const modelSelect = document.getElementById('modelSelect');
let autoRotate = false;
let currentMesh = null;

function clearCurrent(){
  if (modelRoot) {
    scene.remove(modelRoot);
    modelRoot.traverse && modelRoot.traverse(()=>{});
  }
  modelRoot = new THREE.Group();
  scene.add(modelRoot);
  currentMesh = null;
}

function loadModel(path){
  clearCurrent();
  loader.load(path, (gltf)=>{
    const root = gltf.scene || gltf.scenes[0];
    // Fit to view
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    root.position.sub(center);
    modelRoot.add(root);

    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const scale = 2.0 / maxDim;
      modelRoot.scale.setScalar(scale);
    }

    controls.target.set(0,0,0);
    controls.update();

    const downloadA = document.getElementById('download');
    downloadA.href = path;
    downloadA.style.display = 'inline-block';
    currentMesh = root;
  }, undefined, (err)=>{
    console.error('GLTF load error', err);
    alert('Failed to load model (did you generate public/models/ufo5-200W.glb ?).');
  });
}

// UI
document.getElementById('toggleWire').addEventListener('click', ()=>{
  if (!currentMesh) return;
  currentMesh.traverse((c)=>{
    if (c.isMesh && c.material) {
      c.material.wireframe = !c.material.wireframe;
      c.material.needsUpdate = true;
    }
  });
});
document.getElementById('toggleAuto').addEventListener('click', (e)=>{
  autoRotate = !autoRotate;
  e.target.textContent = autoRotate ? 'Auto-rotate: ON' : 'Auto-rotate';
});

modelSelect.addEventListener('change', (e)=>{
  loadModel(e.target.value);
});

loadModel(modelSelect.value);

function animate(){
  requestAnimationFrame(animate);
  if (autoRotate && modelRoot) modelRoot.rotation.y += 0.005;
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
