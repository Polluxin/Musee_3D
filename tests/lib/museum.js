/**********************************************************************************
 *
    Library of functions used to create museum rooms and arrange objects in them.
 *
 **********************************************************************************/

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


/**********************************************************************************
     Public functions
 **********************************************************************************/


// Wall informations
const cap = 5
const wallMaterial = new THREE.MeshPhongMaterial( {color: 0xffff00, side: THREE.DoubleSide} );

// Room configurations available
const configs = [ "Simple" ]

let Simple = {
    getHeight : function(n) {
        return (n + 4)
    },
    getWidth : function(n) {
        return 9
    }
}

// Function that add a new room with objects in the scene (at 0,0,0)
// Following the given configuration
function createRoom(scene, nb_object, objects_image, configuration){

}

/**********************************************************************************
    Private functions
 **********************************************************************************/

// Return an empty room that can be filled with n presenters
function buildWallsSimple(n){
    let w = Simple.getWidth(n);
    let h = Simple.getHeight(n);
    const room = new THREE.Group();


    const roof = new THREE.PlaneGeometry(w, h);
    room.add(new THREE.Mesh( roof, wallMaterial ));

    const top = new THREE.PlaneGeometry(w, h);
    const mesh = new THREE.Mesh( top, wallMaterial );
    mesh.position.set(0,0,cap);
    room.add(mesh);

    const right = new THREE.PlaneGeometry(cap, h);
    const mesh2 = new THREE.Mesh( right, wallMaterial );
    mesh2.position.set(w/2,0,cap/2);
    mesh2.rotation.y = Math.PI / 2;
    room.add(mesh2);

    const mesh3 = mesh2.clone();
    mesh3.position.set(-w/2,0,cap/2);
    room.add(mesh3);

    const deep = new THREE.PlaneGeometry(w, cap);
    const mesh4 = new THREE.Mesh( deep, wallMaterial );
    mesh4.position.set(0,h/2,cap/2);
    mesh4.rotation.x = Math.PI / 2;
    room.add(mesh4);

    const mesh5 = mesh4.clone();
    mesh4.position.set(0,-h/2,cap/2);
    room.add(mesh5);

    return room;
}

function main(){

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

    const room = buildWallsSimple(20);
    scene.add( room );

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
    console.log("Test of museum.js lib");

}

main();

