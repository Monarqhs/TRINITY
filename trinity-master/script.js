console.log("connected");

import * as THREE from "./Three JS/build/three.module.js";
import { GLTFLoader } from "./Three JS/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "./Three JS/examples/jsm/controls/OrbitControls.js";
import { TessellateModifier } from "./Three JS/examples/jsm/modifiers/TessellateModifier.js";
import { vertShader, fragShader, uniforms } from "./shader.js";

const canvas = document.querySelector("canvas.webgl");

var raycast = new THREE.Raycaster();
var pointer = new THREE.Vector2();

const scene = new THREE.Scene();
let fatman, littleBoy, skybox, explosion;

const gltfLoader = new GLTFLoader();

// Fatman
gltfLoader.load("./fatman/scene.gltf", function (gltf) {
  fatman = gltf.scene;
  fatman.rotation.y = Math.PI / -5;
  fatman.rotation.x = Math.PI / 5;
  fatman.position.set(0, 2, -10);
  fatman.scale.set(2, 2, 2);
  scene.add(fatman);

  // Animate fatman appearance
  const targetPosition = new THREE.Vector3(0, 0, 0);
  new TWEEN.Tween(fatman.position)
    .to(targetPosition, 3000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start();

  animate();
});

// Little Boy
gltfLoader.load("./little boy/scene.gltf", function (gltf) {
  littleBoy = gltf.scene;
  littleBoy.rotation.y = Math.PI / 4;
  littleBoy.rotation.x = Math.PI / 8;
  littleBoy.position.set(0, 2, -400);
  littleBoy.scale.set(1, 1, 1);
  // scene.add(littleBoy);

  // Animate littleboy appearance
  const targetPosition = new THREE.Vector3(0, 0, 0);
  new TWEEN.Tween(littleBoy.position)
    .to(targetPosition, 3000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start();

  animate();
});

function createExplosion() {
  gltfLoader.load("./explosionII/scene.gltf", function (gltf) {
    explosion = gltf.scene;
    explosion.position.z = -300;
    explosion.position.y = -10;
    scene.add(explosion);
  });
}

function createSkybox() {
  const boxGeo = new THREE.BoxGeometry(1000, 1000, 1000);

  const textureLoader = new THREE.TextureLoader();
  // kanan - kiri - atas - bawah - depan - belakang
  const boxMaterialArray = [
    new THREE.MeshBasicMaterial({
      map: textureLoader.load("./Assets/daylight_box_right.jpg"),
      side: THREE.DoubleSide,
    }),
    new THREE.MeshBasicMaterial({
      map: textureLoader.load("./Assets/daylight_box_left.jpg"),
      side: THREE.DoubleSide,
    }),
    new THREE.MeshBasicMaterial({
      map: textureLoader.load("./Assets/daylight_box_top.jpg"),
      side: THREE.DoubleSide,
    }),
    new THREE.MeshBasicMaterial({
      map: textureLoader.load("./Assets/daylight_box_bottom.jpg"),
      side: THREE.DoubleSide,
    }),
    new THREE.MeshBasicMaterial({
      map: textureLoader.load("./Assets/daylight_box_front.jpg"),
      side: THREE.DoubleSide,
    }),
    new THREE.MeshBasicMaterial({
      map: textureLoader.load("./Assets/daylight_box_back.jpg"),
      side: THREE.DoubleSide,
    }),
  ];

  skybox = new THREE.Mesh(boxGeo, boxMaterialArray);

  scene.add(skybox);
}

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / innerHeight);

camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 5;
camera.lookAt(0, 0, 0);
scene.add(camera);

let scrollY = window.scrollY;
let currentSection = 0;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  const newSection = Math.random(scrollY / window.innerHeight);
  console.log(newSection);
});

const ambientLight = new THREE.AmbientLight(0xffffff, 4);
scene.add(ambientLight);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("#222222");
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener("change", renderer);

let isRayIntersected = false;

function onMouseDown(event) {
  event.preventDefault();

  if (isRayIntersected) {
    return;
  }

  const canvasZIndex = parseInt(canvas.style.zIndex);

  // Check if canvas is above HTML
  if (canvasZIndex > 0) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycast.setFromCamera(pointer, camera);
    const intersects = raycast.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      console.log("text clicked!");
      // make bomb explosion animation
      scene.remove(fatman);
      scene.remove(littleBoy);
      createExplosion();

      isRayIntersected = true;
    }
  }
}

document.addEventListener("click", onMouseDown, false);

function animate() {
  requestAnimationFrame(animate);

  TWEEN.update();

  if (fatman) {
    fatman.rotation.y += 0.001;
  }

  if (littleBoy) {
    littleBoy.rotation.y += 0.001;
  }

  if (explosion) {
    explosion.rotation.y += 0.001;
  }

  if (fatman && fatman.position.z < -2) {
    fatman.position.z += 0.0009;
  }

  if (littleBoy && littleBoy.position.z < -25) {
    littleBoy.position.z += 0.01;
  }

  if (explosion && explosion.position.z < -2) {
    explosion.position.z += 1;
  }

  if (explosion && explosion.position.y < -5) {
    explosion.position.y += 0.01;
  }

  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.onresize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);
  const aspect = width / height;
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
};

let isOrbitMode = false;
let isSkyboxInScene = false;

function handleSpaceKeyPress(event) {
  event.preventDefault();
  const zIndexMain = -1;
  const zIndexCanvas = 1;

  if (isOrbitMode) {
    scene.remove(skybox);
    fatman.position.set(0, 2, -10);
    littleBoy.position.set(0, 2, -40);
    canvas.style.zIndex = zIndexMain;
    document.querySelector(".main").style.zIndex = zIndexCanvas;
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 5;
    camera.lookAt(0, 0, 0);
    let guide = document.querySelector(".guideContent");
    guide.innerHTML = 'Press "Space" to Enter Orbit Mode';
  } else {
    createSkybox();
    fatman.position.set(0, 0, 0);
    fatman.scale.set(2, 2, 2);
    littleBoy.position.set(0, 0, 0);

    var audio = document.getElementById("backgroundAudio");

    if (!audio.paused) {
      audio.pause();
    }

    let guide = document.querySelector(".guideContent");
    guide.innerHTML = 'Press "Space" to Enter View Mode';
    console.log("changed");
    canvas.style.zIndex = zIndexCanvas;
    document.querySelector(".main").style.zIndex = zIndexMain;
  }

  isOrbitMode = !isOrbitMode;
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    handleSpaceKeyPress(event);
  }
});

function showLittleBoy() {
  if (littleBoy) {
    scene.add(littleBoy);
    littleBoy.position.set(-2, 2, -60);
    if (littleBoy && littleBoy.position.z < -25) {
      littleBoy.position.z += 10;
    }
    scene.remove(fatman);
    // orbitMode()
  }
}

function showFatman() {
  if (fatman) {
    scene.add(fatman);
    littleBoy.position.set(0, 0, -60);
    if (littleBoy && littleBoy.position.z < -2) {
      littleBoy.position.z += 0.01;
    }
    scene.remove(littleBoy);
    // orbitMode()
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const littleBoyElement = document.querySelector(".little_boy");
  const fatmanElement = document.querySelector(".fatman");

  littleBoyElement.addEventListener("click", showLittleBoy);
  fatmanElement.addEventListener("click", showFatman);
});
