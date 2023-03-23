import * as MUSEUM from "../lib/museum.js";
import * as THREE from "three";
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const spotLight = new THREE.DirectionalLight(0xffffff, 0.5);
spotLight.position.set(4,10,5);
scene.add(spotLight);

const sunLight = new THREE.AmbientLight(0xffffff, 0.5);
sunLight.position.set(10,10,10);
scene.add(sunLight);

const n = 4;

const images = [ "/data/139.jpg", "/data/979.jpg", "/data/1034.jpg", "/data/2245.jpg" ];

scene.add(MUSEUM.createRoom( n, images, MUSEUM.Simple));

const axesHelper = new THREE.AxesHelper( 30 );
scene.add( axesHelper );

camera.position.z = 25;
const controls = new OrbitControls( camera, renderer.domElement );

function animate() {
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
}

animate();