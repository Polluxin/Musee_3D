import * as THREE from 'three';
import {OctreeHelper} from 'three/addons/helpers/OctreeHelper.js';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Capsule} from 'three/addons/math/Capsule.js';
import {Octree} from 'three/addons/math/Octree.js';

const clock = new THREE.Clock();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.Fog(0x000000, 0, 50);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ';

const ambientLight = new THREE.HemisphereLight(0xcccccc, 0x888888, 0.8);
ambientLight.position.set(2, 1, 1);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 0.3);
sunLight.position.set(-5, 25, -1);
sunLight.castShadow = true;
sunLight.shadow.camera.near = 0.01;
sunLight.shadow.camera.far = 500;
sunLight.shadow.camera.right = 30;
sunLight.shadow.camera.left = -30;
sunLight.shadow.camera.top = 30;
sunLight.shadow.camera.bottom = -30;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
sunLight.shadow.radius = 4;
sunLight.shadow.bias = -0.00006;
scene.add(sunLight);

const container = document.getElementById('container');

const renderer = new THREE.WebGLRenderer({antialias : false});
renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setSize(window.innerWidth * 0.95, window.innerHeight * 0.95);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.domElement.style.position = container.appendChild(renderer.domElement);

const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
container.appendChild(stats.domElement);

const GRAVITY = 100;
const SPEED = 100;

const STEPS_PER_FRAME = 5;

const worldOctree = new Octree();

const playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 2, 0), 0.35);

const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();

let playerOnFloor = false;

const keyStates = {};

const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const vector3 = new THREE.Vector3();

document.addEventListener('keydown', (event) => { keyStates[event.code] = true; });

document.addEventListener('keyup', (event) => { keyStates[event.code] = false; });

container.addEventListener('mousedown', () => { document.body.requestPointerLock(); });

document.body.addEventListener('mousemove', (event) => {
  if(document.pointerLockElement === document.body)
  {
    camera.rotation.y -= event.movementX / 500;
    camera.rotation.x -= event.movementY / 500;
  }
});

window.addEventListener('resize', onWindowResize);

onWindowResize()

function onWindowResize()
{
  const margin = 0.02
  const width = window.innerWidth * (1-margin)
  const height = window.innerHeight * (1-margin)

  renderer.setSize(width, height)

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function playerCollisions()
{
  const result = worldOctree.capsuleIntersect(playerCollider);

  playerOnFloor = false;

  if(result)
  {
    playerOnFloor = result.normal.y > 0;

    if(!playerOnFloor)
    {
      playerVelocity.addScaledVector(result.normal, -result.normal.dot(playerVelocity));
    }

    playerCollider.translate(result.normal.multiplyScalar(result.depth));
  }
}

function movePlayer(deltaTime)
{
  let damping = Math.exp(-4 * deltaTime) - 1;

  if(!playerOnFloor)
  {
    playerVelocity.y -= GRAVITY * deltaTime;
  }

  // air resistance
  damping *= 5.0;

  playerVelocity.addScaledVector(playerVelocity, damping);

  const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
  playerCollider.translate(deltaPosition);

  playerCollisions();

  camera.position.copy(playerCollider.end);

  if(camera.position.y <= -25)
  {
    playerCollider.start.set(0, 0.35, 0);
    playerCollider.end.set(0, 2, 0);
    playerCollider.radius = 0.35;
    camera.position.copy(playerCollider.end);
    camera.rotation.set( 0, 0, 0 );
  }
}

function getForwardVector()
{
  camera.getWorldDirection(playerDirection);
  playerDirection.y = 0;
  playerDirection.normalize();

  return playerDirection;
}

function getSideVector()
{
  camera.getWorldDirection(playerDirection);
  playerDirection.y = 0;
  playerDirection.normalize();
  playerDirection.cross(camera.up);

  return playerDirection;
}

function processPlayerControls(deltaTime)
{
  const speedDelta = deltaTime * SPEED;

  if(keyStates['KeyW'])
  {
    playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
  }

  if(keyStates['KeyS'])
  {
    playerVelocity.add(getForwardVector().multiplyScalar(-speedDelta));
  }

  if(keyStates['KeyA'])
  {
    playerVelocity.add(getSideVector().multiplyScalar(-speedDelta));
  }

  if(keyStates['KeyD'])
  {
    playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
  }

  if(playerOnFloor)
  {
    if(keyStates['Space'])
    {
      playerVelocity.y = 40; // jump
    }
  }
}

// const loader = new GLTFLoader().setPath( './' );
const loader = new FBXLoader().setPath('../data/');

loader.load('museum.fbx', (object) => {
  scene.add(object);

  worldOctree.fromGraphNode(object);

  object.traverse(child => {
    if(child.isMesh)
    {
      child.castShadow = true;
      child.receiveShadow = true;

      if(child.material.map)
      {
        child.material.map.anisotropy = 4;
      }
    }
  });

  const helper = new OctreeHelper(worldOctree);
  helper.visible = false;
  scene.add(helper);

  const gui = new GUI({width : 200});
  gui.add({debug : false}, 'debug').onChange(function(value) { helper.visible = value; });

  animate();
});

function animate()
{
  const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

  // we look for collisions in substeps to mitigate the risk of
  // an object traversing another too quickly for detection.

  for(let i = 0; i < STEPS_PER_FRAME; i++)
  {
    processPlayerControls(deltaTime);
    movePlayer(deltaTime);
  }

  renderer.render(scene, camera);

  stats.update();

  requestAnimationFrame(animate);
}
