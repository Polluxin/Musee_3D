import * as MUSEUM from "../lib/museum.js";
import * as THREE from "three";
import {Capsule} from 'three/addons/math/Capsule.js';
import {Octree} from 'three/addons/math/Octree.js';
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {Simple} from "../lib/museum.js";


/**********************************************************************************
 * Scene, camera and light
 **********************************************************************************/

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0,0,2);
camera.rotation.order = 'ZXY';
camera.up.set(0,0,1);
camera.lookAt(-10,0,0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild( renderer.domElement );

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

// const ambientLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 1);
// scene.add(ambientLight);

// const sunLight = new THREE.DirectionalLight(0xffffff, 0.3);
// sunLight.position.set(0, 0, 25);
// sunLight.castShadow = true;
// scene.add(sunLight);

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

    if(keyStates['KeyW'] || keyStates['ArrowUp'])
    {
        playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
    }

    if(keyStates['KeyS'] || keyStates['ArrowDown'])
    {
        playerVelocity.add(getForwardVector().multiplyScalar(-speedDelta));
    }

    if(keyStates['KeyA'] || keyStates['ArrowLeft'])
    {
        playerVelocity.add(getSideVector().multiplyScalar(-speedDelta));
    }

    if(keyStates['KeyD'] || keyStates['ArrowRight'])
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
 * Listeners
 **********************************************************************************/

// Handlers
function pressHandler(event){
    keyStates[event.code] = true;
}

function releaseHandler(event){
    keyStates[event.code] = false;
}

function mouseLockHandler(){
    document.body.requestPointerLock();
}

function mouseHandler(event){
    if (document.pointerLockElement === document.body) {
        camera.rotation.x -= event.movementY / 500;
        camera.rotation.z -= event.movementX / 500;
    }
}

function clickHandler(event){
    if (document.pointerLockElement === document.body) {
        var position = new THREE.Vector2(0,0);
        var s = getNearest(position);
        if (s && s.position.distanceTo(camera.position) < DIST_TO_POPUP) {
            displayDescription(s.name);
        }
    }
}

function setKeyStatesToFalse(){
    let keys = Object.keys(keyStates);
    for (let i=0; i<keys.length; i++){
        keyStates[keys[i]] = false;
    }
}

function removeListeners(){

    setKeyStatesToFalse();

    document.removeEventListener('keydown', pressHandler);

    document.removeEventListener('keyup', releaseHandler);

    document.removeEventListener('mousedown', mouseLockHandler);
    document.exitPointerLock();

    document.body.removeEventListener('mousemove', mouseHandler);

    document.body.removeEventListener('click', clickHandler);
}

function addListeners(){

    document.addEventListener('keydown', pressHandler);

    document.addEventListener('keyup', releaseHandler);

    document.addEventListener('mousedown', mouseLockHandler);

    document.body.addEventListener('mousemove', mouseHandler);

    setTimeout(() => {
        document.body.addEventListener('click', clickHandler);
    }, 1000);
}

/**********************************************************************************
 * Pop-ups
 **********************************************************************************/

const DIST_TO_POPUP = 2.5;
var modal = document.querySelector(".modal");
var closeButton = document.querySelector(".close-button");

function displayDescription(name){
    document.getElementById("title").innerHTML = name;
    document.getElementById("description").innerHTML = "";
    document.querySelector(".modal").classList.add('modal2');
    toggleModal();
}

function toggleModal() {
    if (modal.classList.toggle("show-modal"))
    {
        removeListeners();
    }
    else {
        addListeners();
    }
}

closeButton.addEventListener("click", toggleModal);

var raycaster = new THREE.Raycaster();

function getNearest(position) {
    // Mise à jour de la position du rayon à lancer.
    raycaster.setFromCamera(position, camera);
    // Obtenir la liste des intersections
    var selected = raycaster.intersectObjects(room.getObjectByName("objects").children);
    if (selected.length) {
        return selected[0].object;
    }
}


/**********************************************************************************
 * Museum installation
 **********************************************************************************/

let controls;

const debug = false;

if (debug){
    const axesHelper = new THREE.AxesHelper( 15 );
    scene.add( axesHelper );
    camera.position.set(4,0,6);
    controls = new OrbitControls( camera, renderer.domElement );
}

// Number of objets to expose
const n = 7;

// Image of protagonist
const protagonist = "/data/rooms/wozniak/wozniak.jpg";

// Images of exposed objects
const images = [ "/data/rooms/wozniak/obj1.jpg", "/data/rooms/wozniak/obj2.jpg", "/data/rooms/wozniak/obj3.jpg", "/data/rooms/wozniak/obj4.jpg",
                 "/data/rooms/wozniak/obj5.jpg", "/data/rooms/wozniak/obj6.jpg", "/data/rooms/wozniak/obj7.jpg" ];

// Objects description
const descriptions  = [
    "Apple Computer Inc. Micro-ordinateur Apple II\n" +
    "Ensemble - 1979",
    "Apple Computer Inc. Color High resolution RGB monitor\n" +
    "Ecran - 1980",
    "Apple Computer Inc. Micro-ordinateur Apple IIe\n" +
    "Ensemble - 1983",
    "Apple Computer Inc. Micro-ordinateur Apple IIc\n" +
    "Ensemble - 1984",
    "Apple Computer Inc. IIc\n" +
    "Ecran - 1984",
    "Apple Computer Inc. IIc\n" +
    "Lecteur disquettes - 1984",
    "Apple Computer Inc. : Installation de votre Apple IIc - 1975-2000"
]

// Objects to expose
const objects = []
for (let i=0; i<images.length; i++){
    objects[i] = [images[i], descriptions[i]];
}

// Creation of a room
let room = MUSEUM.createRoom( n, objects, protagonist, MUSEUM.Simple, 1, 1);
scene.add(room);

let transitionRoom = MUSEUM.createTransitionRoom(Simple.getWidth(n), Simple.getHeight(n)/2, 0, 0, 1, 0);
transitionRoom.position.add(new THREE.Vector3(0,Simple.getHeight(n)*3/4, 0));
scene.add(transitionRoom);

let transitionRoom2 = MUSEUM.createTransitionRoom(Simple.getWidth(n), Simple.getHeight(n)/2, 0, 0, 0, 1);
transitionRoom2.position.add(new THREE.Vector3(0,-Simple.getHeight(n)*3/4, 0));
scene.add(transitionRoom2);

// Collisions
worldOctree.fromGraphNode(scene);

animate();

if (!debug) toggleModal();