import * as MUSEUM from "../lib/museum.js";
import * as THREE from "three";
import {Capsule} from 'three/addons/math/Capsule.js';
import {Octree} from 'three/addons/math/Octree.js';


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
document.body.appendChild( renderer.domElement );

const spotLight = new THREE.DirectionalLight(0xffffff, 0.5);
spotLight.position.set(4,10,5);
scene.add(spotLight);

const sunLight = new THREE.AmbientLight(0xffffff, 0.5);
sunLight.position.set(10,10,10);
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

document.addEventListener('keydown', (event) => { keyStates[event.code] = true; });

document.addEventListener('keyup', (event) => { keyStates[event.code] = false; });

document.addEventListener('mousedown', () => { document.body.requestPointerLock(); });

document.body.addEventListener('mousemove', (event) => {
    if(document.pointerLockElement === document.body)
    {
        camera.rotation.x -= event.movementY / 500;
        camera.rotation.z -= event.movementX / 500;
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

    for(let i = 0; i < STEPS_PER_FRAME; i++)
    {
        processPlayerControls(deltaTime);
        movePlayer(deltaTime);
    }

    renderer.render( scene, camera );

    requestAnimationFrame( animate );
}

/**********************************************************************************
 * Museum installation
 **********************************************************************************/

// Number of objets to expose
const n = 7;

// Images of exposed objects
const images = [ "/data/rooms/wozniak/139.jpg", "/data/rooms/wozniak/979.jpg", "/data/rooms/wozniak/1034.jpg", "/data/rooms/wozniak/2245.jpg",
                 "/data/rooms/wozniak/2247.jpg", "/data/rooms/wozniak/2250.jpg", "/data/rooms/wozniak/2308.jpg" ];

// Creation of a room
let room = MUSEUM.createRoom( n, images, MUSEUM.Simple);

// Collisions
worldOctree.fromGraphNode(room);

scene.add(room);

animate();