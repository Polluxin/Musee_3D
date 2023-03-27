/**********************************************************************************
 *
    Library of functions used to create museum rooms and arrange objects in them.
 *
 **********************************************************************************/

import * as THREE from 'three';
import { Vector3 } from 'three';


/**********************************************************************************
     Public functions & configurations
 **********************************************************************************/

// Room configurations
/* Configuration Simple :
    The room is a simple rectangle where presenters are disposed on two
    parallels lines :
               ^ +---------+
               | |         |
               | |  o   o  |
      height   | |         |    o -> a presenter
               | |  o   o  |
               | |         |
               ^ +---------+
                 <---------<
                    width
 */
export let Simple = {
    spaceH : 2,                                     // Distance between 2 presenters in height space
    spaceW : 9,                                     // Distance between the 2 lines of presenters
    spaceSidesH : 5,                                // Distance between a wall and a presenter in height space
    spaceSidesW  : 2,                                // Distance between a wall and a presenter in width space
    getHeight : function(n) {
        return ((n/2 - 1)*this.spaceH + 2 * this.spaceSidesH);
    },
    getWidth : function(n) {
        return this.spaceW + 2 + this.spaceSidesW*2; // spaceW + width of 2 presenters + 2*spaceSides
    },
    // Tab of presenters positions
    presentersPositions : [],
    computePresentersPosition : function(n) {
        let deb = -Math.ceil(n/2)+1;
        let pos = deb;
        let i = 0;
        while (i < n/2){
            this.presentersPositions.push(new THREE.Vector3(-this.spaceW/2,pos,0.5));
            pos += this.spaceH;
            i += 1;
        }
        pos = deb;
        while (i < n){
            this.presentersPositions.push(new THREE.Vector3(this.spaceW/2,pos,0.5));
            pos += this.spaceH;
            i += 1;
        }
    }
}

/* createRoom :
    Create a room with nb_objects disposed on presenters with images on them following the given
    configuration. The room is a group of geometry objects.
        Input  : - nb_objects the number of objets to include
                 - images a tab of objects to place on presenters
                 - configuration the shape of the room

        Output : - the group containing all elements in the room
*/
export function createRoom(nb_objects, images, configuration){
    const room = new THREE.Group();

    // Build walls and roof
    room.add(buildWallsSimple(nb_objects, 0));
    // Build presenters and dispose them
    let presenters = buildPresenters(nb_objects, images, configuration);
    room.add( presenters );

    return room;
}

/**********************************************************************************
    Private functions & objects
 **********************************************************************************/

const loader = new THREE.TextureLoader();

const cap = 10

// Walls
const wallMaterial = loadTexture("walls");

// Roof
const roofMaterial = loadTexture("roof");

// Function to load textures
function loadTexture(type){

    const bc = loader.load("/data/textures/"+type+"/basecolor.jpg");
    bc.wrapS = THREE.RepeatWrapping;
    bc.wrapT = THREE.RepeatWrapping;
    const n = loader.load("/data/textures/"+type+"/normal.jpg");
    const h = loader.load("/data/textures/"+type+"/height.png");
    const r = loader.load("/data/textures/"+type+"/roughness.jpg");
    const ao = loader.load("/data/textures/"+type+"/ao.jpg");
    return new THREE.MeshStandardMaterial(
        {
            color: 0xffffff,
            side: THREE.DoubleSide,
            map: bc,
            normalMap: n,
            displacementMap: h,
            displacementScale: 0,
            roughnessMap: r,
            roughness: 0.5,
            aoMap: ao
        }
    );
}

// Presenters information
const ptexture = loader.load ('/data/textures/wood.jpg');
const presenterMaterial = new THREE.MeshStandardMaterial();
presenterMaterial.map = ptexture;


/* createWall :
    Create an ExtrudeGeometry used to build walls.
        Input  : - width the width of desired wall
                 - height the height of desired wall
                 - depth the depth of desired wall

        Output : - the geometry of desired wall
*/
function createWall(width, height, depth){
    const wall = new THREE.Shape();
    wall.moveTo(0, 0);
    wall.lineTo(width, 0);
    wall.lineTo(width, height);
    wall.lineTo(0, height);
    wall.lineTo(0, 0);


    const extrudeSettings = {
        steps: 2,
        depth: depth,
        bevelEnabled: false
    };

    return new THREE.ExtrudeGeometry( wall, extrudeSettings );
}

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
    let d = 0.2;
    const walls = new THREE.Group();


    const roof = createWall(w, h, d);
    const mroof = new THREE.Mesh( roof, roofMaterial );
    mroof.receiveShadow = true ;
    walls.add(mroof);

    const top = createWall(w, h, d);
    let white = new THREE.MeshStandardMaterial( { color : 0x949494 });
    const mtop = new THREE.Mesh( top, white);
    mtop.position.add(new Vector3(0, 0, cap));
    walls.add(mtop);

    const right = createWall(cap, h, d);
    const mright = new THREE.Mesh( right, wallMaterial );
    mright.rotation.y = Math.PI / -2;
    walls.add(mright);

    const left = createWall(cap, h, d);
    const mleft = new THREE.Mesh( left, wallMaterial );
    mleft.rotation.y = Math.PI / -2;
    mleft.position.add(new Vector3(w,0,0));
    walls.add(mleft);

    const deep = createWall(w, cap, d);
    const mdeep = new THREE.Mesh( deep, wallMaterial );
    mdeep.rotation.x = Math.PI / 2;
    mdeep.position.add(new Vector3(0,h,0));
    walls.add(mdeep);


    const front = createWall(w, cap, d);
    const mfront = new THREE.Mesh( front, wallMaterial );
    mfront.rotation.x = Math.PI / 2;
    if (door == 0) walls.add(mfront);

    walls.position.add(new Vector3(-w/2, -h/2, 0));

    return walls;
}

/* buildPresenters :
    Create n presenters following the given configuration in the space. The position
    of each presenter is in Simple attributs and need to be calculated.
        Input  : - n the number of presenters to include
                 - configuration the shape of the room

        Output : - the group containing all presenters
*/
function buildPresenters(n, images, configuration){
    const presenters = new THREE.Group();
    configuration.computePresentersPosition(n);
    for (let i = 0; i < n; i++) {
        let geometry = new THREE.BoxGeometry(1, 1, 1);
        let mesh = new THREE.Mesh(geometry, presenterMaterial);
        mesh.receiveShadow = true ;
        mesh.castShadow = true ;
        mesh.position.set(Simple.presentersPositions[i].x, Simple.presentersPositions[i].y, Simple.presentersPositions[i].z);
        presenters.add(getAnObjectOnTop(mesh, images[i], 0.75, 0.75));
        presenters.add(mesh);
    }
    return presenters;
}

/* getSize :
    Give the dimensions of the object given using BoundingBox.
        Input  : - obj the object to measure

        Output : - the measure by a Vector3
 */
function getSize(obj) {
    let measure = new THREE.Vector3();
    obj.geometry.computeBoundingBox();
    obj.geometry.boundingBox.getSize(measure);
    return measure;
}

/* getAnObjectOnTop :
    Give an object of texture image, sized w and h, placed on top of
    given presenter. The object is a simple plane.
        Input  : - presenter the presenter
                 - image the image of object to add
                 - w the width of object
                 - h the height of object
        Output : - the object in 2 dimensions placed on top of presenter
 */
function getAnObjectOnTop(presenter, image, w, h){
    let measure = new THREE.Vector3();
    let plane = new THREE.PlaneGeometry(w, h);
    presenter.geometry.computeBoundingBox();
    presenter.geometry.boundingBox.getSize(measure);

    const im = new THREE.MeshLambertMaterial({
        map: loader.load(image),
        side: THREE.DoubleSide
    });

    let i = new THREE.Mesh(plane, im);
    i.castShadow = true;
    i.position.set(presenter.position.x, presenter.position.y, presenter.position.z+ measure.z/2 + h/2);
    i.rotateX(Math.PI/2);
    i.rotateY(Math.PI/2);
    return i;
}
