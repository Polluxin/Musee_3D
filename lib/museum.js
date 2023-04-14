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
            this.presentersPositions.push(new Vector3(-this.spaceW/2,pos,0));
            pos += this.spaceH;
            i += 1;
        }
        pos = deb;
        while (i < n){
            this.presentersPositions.push(new Vector3(this.spaceW/2,pos,0));
            pos += this.spaceH;
            i += 1;
        }
    },
    paintingPosition : new Vector3(0,0,0),
    computePaintingPosition : function(n) {
        this.paintingPosition = new Vector3(0,this.getHeight(n)/2,1/8 * this.getHeight(n));
    }
}

/* createRoom :
    Create a room with nb_objects disposed on presenters with images on them following the given
    configuration. The room is a group of geometry objects.
        Input  : - nb_objects the number of objets to include
                 - images a tab of objects to place on presenters
                 - protagonist the image of main character of the room
                 - configuration the shape of the room
                 - doorAtRight, doorAtLeft are booleans used to let doors on sides of room

        Output : - the group containing all elements in the room
*/
export function createRoom(nb_objects, images, protagonist = null, configuration = Simple, doorAtLeft = 0, doorAtRight = 0){
    const room = new THREE.Group();
    room.name = "room";

    // Build walls and roof
    let walls = buildWallsSimple(nb_objects, protagonist, doorAtRight, doorAtLeft);
    room.add(walls);
    // Build presenters and dispose them
    let presenters = buildPresenters(nb_objects, images, configuration);
    room.add( presenters );
    return room;
}

/* TODO createTransitionRoom :

 */
export function createTransitionRoom(){

}

/**********************************************************************************
    Private functions & objects
 **********************************************************************************/

const loader = new THREE.TextureLoader();

const cap = 8

// Walls
// const wallMaterial = loadTexture("walls");
const wallMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff
})
// Roof
const roofMaterial = loadTexture("roof");

// Function to load textures
function loadTexture(type){

    const bc = loader.load("/data/textures/"+type+"/basecolor.jpg");
    bc.wrapS = THREE.RepeatWrapping;
    bc.wrapT = THREE.RepeatWrapping;
    return new THREE.MeshPhongMaterial(
        {
            side: THREE.DoubleSide,
            map: bc,
        }
    );
}

// Presenters information
const pW = 1;
const pD = 2;
const pH = 1.75;
const ptexture = loader.load ('/data/textures/presenters/wood.jpg');
const presenterMaterial = new THREE.MeshStandardMaterial({ color : 0x757575, roughness: 1, metalness: 0.1 });
presenterMaterial.map = ptexture;

/* TODO createPresenter :

 */
function createPresenter(w, h, d){

    let presenter = new THREE.Group();
    let body = new THREE.BoxGeometry(w, d, h);
    const mbody = new THREE.Mesh( body, presenterMaterial );
    presenter.add(mbody);

    const socle = new THREE.CylinderGeometry( w/2, w/2, 0.05);
    const socleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const msocle = new THREE.Mesh( socle, socleMaterial );
    msocle.rotation.x = Math.PI / 2;
    msocle.rotation.y = Math.PI / 2;
    msocle.position.z = h/2;
    presenter.add(msocle);

    return presenter;
}


/* createPainting :
    Create mesh representing a painting with the image desired.
        Input  : - w the width of desired painting
                 - h the height of desired painting
                 - image the image of desired painting

        Output : - the mesh of the painting
*/
function createPainting(image, w, h){
    let painting = new THREE.Group();
    const im = new THREE.MeshLambertMaterial({
        map: loader.load(image),
        side: THREE.DoubleSide
    });

    let curve = 0.02;

    const shape = new THREE.Shape();
    shape.moveTo(curve, 0);
    shape.lineTo(w-curve, 0);
    shape.quadraticCurveTo(w, curve, w, curve);
    shape.lineTo(w, h-curve);
    shape.quadraticCurveTo(w-curve, h, w-curve, h);
    shape.lineTo(curve, h);
    shape.quadraticCurveTo(0, h-curve, 0, h-curve);
    shape.lineTo(0, curve);
    shape.quadraticCurveTo(curve, 0, curve, 0);

    const extrudeSettings = {
        steps: 2,
        depth: 0.01,
        bevelEnabled: false
    };

    let around = new THREE.Mesh( new THREE.ExtrudeGeometry( shape, extrudeSettings),
        new THREE.MeshStandardMaterial( { color : 0x381302, side: THREE.DoubleSide }));
    let i = new THREE.Mesh(new THREE.PlaneGeometry(w-curve*2,h-curve*2), im);
    i.position.add(new Vector3(w/2, h/2, 0.02));

    painting.add(around);
    painting.add(i);
    painting.rotation.x = Math.PI / 2;
    painting.rotation.y = Math.PI / 2;
    return painting;
}

// Drawing functions
/* TODO createRectanglePath :

 */
function createRectanglePath(w, h, x=0, y=0){
    const rectangle = new THREE.Path();
    rectangle.moveTo(x, y);
    rectangle.lineTo(w, y);
    rectangle.lineTo(w, h);
    rectangle.lineTo(x,h);
    rectangle.lineTo(x, y);
    return rectangle;
}

/* TODO createRectangleShape :

 */
function createRectangleShape(w, h, x=0, y=0){
    const rectangle = new THREE.Shape();
    rectangle.moveTo(x, y);
    rectangle.lineTo(w, y);
    rectangle.lineTo(w, h);
    rectangle.lineTo(x,h);
    rectangle.lineTo(x, y);
    return rectangle;
}

/* TODO createWall :

*/
function createWall(shape, depth){

    const extrudeSettings = {
        steps: 2,
        depth: depth,
        bevelEnabled: false
    };

    return new THREE.ExtrudeGeometry( shape, extrudeSettings );
}

/* buildWallsSimple :
    Create 6 walls for the architecture of the room. Follows the Simple
    configuration. The dimensions depends on n, the number of presenters to
    be added then.
        Input  : - n the number of presenters to include
                 - image the image of protagonist
                 - doorAtRight are booleans, if 1 then there doors on sides of painting

        Output : - the group containing all walls
*/
function buildWallsSimple(n, image, doorAtLeft = 0, doorAtRight = 0){
    let w = Simple.getWidth(n);
    let h = Simple.getHeight(n);
    let d = 0.2;
    let paintw = 2;
    let painth = 2.5;
    const walls = new THREE.Group();
    walls.name = "walls";

    const doorPath = createRectanglePath(w-2, cap-2, 2, 0);

    const roofShape = createRectangleShape(w, h);
    const roof = createWall(roofShape, d);
    const mroof = new THREE.Mesh( roof, roofMaterial );
    mroof.receiveShadow = true ;
    mroof.name = "roof";
    walls.add(mroof);

    const top = createWall(roofShape, d);
    let white = new THREE.MeshStandardMaterial( { color : 0x949494 });
    const mtop = new THREE.Mesh( top, white);
    mtop.position.add(new Vector3(0, 0, cap));
    mtop.name = "top";
    walls.add(mtop);

    const rightShape = createRectangleShape(cap, h);
    const right = createWall(rightShape, d);
    const mright = new THREE.Mesh( right, wallMaterial );
    mright.rotation.y = Math.PI / -2;
    mright.name = "right";
    walls.add(mright);

    Simple.computePaintingPosition(n);
    const painting = createPainting(image, paintw, painth);

    painting.position.set(Simple.paintingPosition.x,
        Simple.paintingPosition.y, Simple.paintingPosition.z);
    painting.position.add(new Vector3(0,-paintw/2, 0));
    walls.add(painting);

    const left = createWall(rightShape, d);
    const mleft = new THREE.Mesh( left, wallMaterial );
    mleft.rotation.y = Math.PI / -2;
    mleft.position.add(new Vector3(w,0,0));
    mleft.name = "left";
    walls.add(mleft);

    const deepShape = createRectangleShape(w, cap);
    if (doorAtLeft) deepShape.holes.push(doorPath);
    const deep = createWall(deepShape, d);
    const mdeep = new THREE.Mesh( deep, wallMaterial );
    mdeep.rotation.x = Math.PI / 2;
    mdeep.position.add(new Vector3(0,h,0));
    mdeep.name = "deep";
    walls.add(mdeep);


    const frontShape = createRectangleShape(w, cap);
    if (doorAtRight) frontShape.holes.push(doorPath);
    const front = createWall(frontShape, d);
    const mfront = new THREE.Mesh( front, wallMaterial );
    mfront.rotation.x = Math.PI / 2;
    mfront.name = "front";
    walls.add(mfront);

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
    presenters.name = "presenters";
    const objects = new THREE.Group();
    objects.name = "objects";
    configuration.computePresentersPosition(n);
    for (let i = 0; i < n; i++) {
        let mesh = createPresenter(pW, pH, pD);
        mesh.name = "presenter " + i;
        mesh.receiveShadow = true ;
        mesh.castShadow = true ;
        mesh.position.set(Simple.presentersPositions[i].x, Simple.presentersPositions[i].y, Simple.presentersPositions[i].z);
        // We correct z position since presenters have a dynamic z height
        mesh.position.z =  Simple.presentersPositions[i].z + pH/2;
        let obj = getAnObjectOnTop(mesh, images[i], 0.75, 0.75);
        obj.name = "Object " + i;
        objects.add(obj);
        presenters.add(mesh);
    }
    presenters.add(objects);
    return presenters;
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
    let o = new THREE.Box3().setFromObject(presenter);
    o.getSize(measure);

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
