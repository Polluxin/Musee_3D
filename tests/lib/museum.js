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

// Room configurations
/* Configuration Simple :
    The room is a simple rectangle where presenters are disposed on two
    parallels lines :
                +---------+
                |         |
                |  o   o  |
                |         |    o -> a presenter
                |  o   o  |
                |         |
                +---------+
 */
let Simple = {
    space : 2,
    getHeight : function(n) {
        return ((n/2 - 1)*this.space + 4)
    },
    getWidth : function(n) {
        return 9
    },
    // Tab of presenters positions
    presentersPositions : [],
    computePresentersPosition : function(n) {
        let deb = -Math.ceil(n/2)+1;
        let pos = deb;
        let i = 0;
        while (i < n/2){
            this.presentersPositions.push(new THREE.Vector3(-1.5,pos,0.5));
            pos += this.space;
            i += 1;
        }
        pos = deb;
        while (i < n){
            this.presentersPositions.push(new THREE.Vector3(1.5,pos,0.5));
            pos += this.space;
            i += 1;
        }
    }
}

/* createRoom :
    Create a room with nb_objects disposed on presenters following the given
    configuration. The room is a group of geometry objects.
        Input  : - nb_objects the number of objets to include
                 - configuration the shape of the room

        Output : - the group containing all elements in the room
*/
function createRoom(nb_objects, configuration){
    const room = new THREE.Group();

    room.add(buildWallsSimple(nb_objects, 1));
    room.add(buildPresenters(nb_objects, configuration));

    return room;
}

/**********************************************************************************
    Private functions
 **********************************************************************************/

/* buildWallsSimple :
    Create 6 walls for the architecture of the room. Follows the Simple
    configuration. The dimensions depends on n, the number of presenters to
    be added then.
        Input  : - n the number of presenters to include
                 - door a boolean, if 1 then the front wall is hidden to let space
                 for futur door

        Output : - the group containing all walls
*/
function buildWallsSimple(n, door){
    let w = Simple.getWidth(n);
    let h = Simple.getHeight(n);
    const walls = new THREE.Group();


    const roof = new THREE.PlaneGeometry(w, h);
    walls.add(new THREE.Mesh( roof, wallMaterial ));

    // const top = new THREE.PlaneGeometry(w, h);
    // const mesh = new THREE.Mesh( top, wallMaterial );
    // mesh.position.set(0,0,cap);
    // room.add(mesh);

    const right = new THREE.PlaneGeometry(cap, h);
    const mesh2 = new THREE.Mesh(right, wallMaterial);
    mesh2.position.set(w / 2, 0, cap / 2);
    mesh2.rotation.y = Math.PI / 2;
    walls.add(mesh2);


    const mesh3 = mesh2.clone();
    mesh3.position.set(-w/2,0,cap/2);
    walls.add(mesh3);

    const deep = new THREE.PlaneGeometry(w, cap);
    const mesh4 = new THREE.Mesh( deep, wallMaterial );
    mesh4.position.set(0,h/2,cap/2);
    mesh4.rotation.x = Math.PI / 2;
    if (door == 0) walls.add(mesh4);

    const mesh5 = mesh4.clone();
    mesh4.position.set(0,-h/2,cap/2);
    walls.add(mesh5);

    return walls;
}

/* buildPresenters :
    Create n presenters following the given configuration in the space. The position
    of each presenter is in Simple attributs and need to be calculated.
        Input  : - n the number of presenters to include
                 - configuration the shape of the room

        Output : - the group containing all presenters
*/
function buildPresenters(n, configuration){
    const presenters = new THREE.Group();
    configuration.computePresentersPosition(n);
    for (let i = 0; i < n; i++) {
        let geometry = new THREE.BoxGeometry(1, 1, 1);
        let material = new THREE.MeshPhongMaterial({color: 0xE75900});
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(Simple.presentersPositions[i].x, Simple.presentersPositions[i].y, Simple.presentersPositions[i].z);
        presenters.add(mesh);
    }
    return presenters;
}

/* main :
    Test function
 */
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

    const n = 12;

    scene.add(createRoom( n, Simple));

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

