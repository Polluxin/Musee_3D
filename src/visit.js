import * as MUSEUM from "../lib/museum.js";
import * as THREE from "three";
import {Capsule} from 'three/addons/math/Capsule.js';
import {Octree} from 'three/addons/math/Octree.js';
import {OrbitControls} from "three/addons/controls/OrbitControls.js";


/**********************************************************************************
 * Scene, camera and light
 **********************************************************************************/

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0,0,2);
camera.rotation.order = 'ZXY';
camera.up.set(0,0,1);
camera.lookAt(0,10,0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild( renderer.domElement );

const ambientLight = new THREE.HemisphereLight(0xcccccc, 0x888888, 0.8);
ambientLight.position.set(1,1,1);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 0.3);
sunLight.position.set(0, 0, 25);
sunLight.castShadow = true;

scene.add(sunLight);

/**********************************************************************************
 * Animation code taken from
 *  https://github.com/mrdoob/three.js/blob/master/examples/games_fps.html
 *  (three.js library)
 **********************************************************************************/

const GRAVITY = 100;
const SPEED = 100;

const STEPS_PER_FRAME = 5;

const clock = new THREE.Clock();

const worldOctree = new Octree();

const playerCollider = new Capsule(new THREE.Vector3(0, 0, 0.35), new THREE.Vector3(0, 0, 2), 0.35);

const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();

let playerOnFloor = false;

const keyStates = {};

const debug = false;

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
            playerVelocity.z = 40; // jump
        }
    }
}

function playerCollisions()
{
    const result = worldOctree.capsuleIntersect(playerCollider);

    playerOnFloor = false;

    if(result)
    {
        playerOnFloor = result.normal.z > 0;

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
        playerVelocity.z -= GRAVITY * deltaTime;
    }

    // air resistance
    damping *= 5.0;

    playerVelocity.addScaledVector(playerVelocity, damping);

    const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
    playerCollider.translate(deltaPosition);

    playerCollisions();

    camera.position.copy(playerCollider.end);

    if(camera.position.z <= -10)
    {
        playerCollider.start.set(0, 0, 0.35);
        playerCollider.end.set(0, 0, 2);
        playerCollider.radius = 0.35;
        camera.position.copy(playerCollider.end);
        camera.lookAt( 0, 10, 0 );
    }
}

function getForwardVector()
{
    camera.getWorldDirection(playerDirection);
    playerDirection.z = 0;
    playerDirection.normalize();

    return playerDirection;
}

function getSideVector()
{
    camera.getWorldDirection(playerDirection);
    playerDirection.z = 0;
    playerDirection.normalize();
    playerDirection.cross(camera.up);

    return playerDirection;
}

function animate() {

    const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

    if (!debug)
    {
        for (let i = 0; i < STEPS_PER_FRAME; i++) {
            processPlayerControls(deltaTime);
            movePlayer(deltaTime);
        }
    }

    if (debug) {
        controls.update();
    }

    renderer.render( scene, camera );

    requestAnimationFrame( animate );
}

/**********************************************************************************
 * Museum installation
 **********************************************************************************/

let controls;

if (debug){
    const axesHelper = new THREE.AxesHelper( 15 );
    scene.add( axesHelper );
    camera.position.set(4,0,6);
    controls = new OrbitControls( camera, renderer.domElement );

// Number of objets to expose

}
const n = 7;

// Image of protagonist
const protagonist = "/data/rooms/wozniak/wozniak.jpg";

// Images of exposed objects
const images = [ "/data/rooms/wozniak/139.jpg", "/data/rooms/wozniak/979.jpg", "/data/rooms/wozniak/1034.jpg", "/data/rooms/wozniak/2245.jpg",
                 "/data/rooms/wozniak/2247.jpg", "/data/rooms/wozniak/2250.jpg", "/data/rooms/wozniak/2308.jpg" ];

// Creation of a room
let room = MUSEUM.createRoom( n, images, protagonist, MUSEUM.Simple);

// Collisions
worldOctree.fromGraphNode(room);

scene.add(room);

animate();

var modal = document.querySelector(".modal");
var closeButton = document.querySelector(".close-button");

function toggleModal() {
    modal.classList.toggle("show-modal");
}

function addListeners(){
    toggleModal();
    document.addEventListener('keydown', (event) => {
        keyStates[event.code] = true;
    });

    document.addEventListener('keyup', (event) => {
        keyStates[event.code] = false;
    });

    document.addEventListener('mousedown', () => {
    document.body.requestPointerLock();
    });

    document.body.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === document.body) {
            camera.rotation.x -= event.movementY / 500;
            camera.rotation.z -= event.movementX / 500;
        }
    });
}

closeButton.addEventListener("click", addListeners);

toggleModal();