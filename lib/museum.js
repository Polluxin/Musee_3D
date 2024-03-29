/**********************************************************************************
 *
 *   Library of functions used to create museum rooms and arrange objects.
 *
 * Geoffrey DAVID M1 Informatique IM2AG - 2023
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
        this.paintingPosition = new Vector3(0,this.getHeight(n)/2,pH+1);
    }
}

/* createRoom :
    Create a room with nb_objects disposed on presenters with images on them following the given
    configuration. The room is a group of geometry objects.
        Input  : - nb_objects the number of objets to include
                 - objects a tab of images and names of objects to place on presenters
                 - protagonist the image of main character of the room
                 - configuration the shape of the room
                 - doorAtRight, doorAtLeft are booleans used to let doors on sides of room

        Output : - the group containing all elements in the room
*/
export function createRoom(nb_objects, objects, protagonist = null, configuration = Simple, doorAtLeft = 0, doorAtRight = 0){
    const room = new THREE.Group();
    room.name = "room";

    // Build walls and roof
    let walls = buildWallsSimple(nb_objects, protagonist, doorAtRight, doorAtLeft);
    room.add( walls );
    // Build presenters and dispose them
    let presenters = buildPresenters(nb_objects, objects, configuration);
    room.add( presenters );
    return room;
}

/* createTransitionRoom :
    Create a 3D-transition-room of dimensions wxh used to move between dedicated rooms.
    It uses function buildWalls to create walls.
            Input : - w the room width
                     - h the room height
                     - d the wall depth
                     - (optional) doorAtX is 1 if the wall X need a door
                     where X belongs to [Font, Back, Left, Right]
            Output : - the room 3D-model created
 */
export function createTransitionRoom(w, h, doorAtFront = 0, doorAtBack = 0, doorAtLeft = 0, doorAtRight = 0) {
    const walls = buildWalls(w, h, 0.2, doorAtFront, doorAtBack, doorAtLeft, doorAtRight);
    walls.name = "transitionWalls";
    return walls;
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
const pH = 1.5;
const ptexture = loader.load ('/data/textures/presenters/wood.jpg');
const presenterMaterial = new THREE.MeshStandardMaterial({ color : 0x757575, roughness: 1, metalness: 0.1 });
presenterMaterial.map = ptexture;

// Drawing functions
/* createRectanglePath :
    Draw a 2D-rectangle of dimensions wxh with the initial point
    (x,y). It returns a path.
    It is used to make holes in shapes.
        Input  : - w the rectangle width
                 - h the rectangle height
                 - (optional) x the x-position of initial drawing
                 - (optional) y the y-position of initial drawing
        Output : - the path of 2D-rectangle
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

/* createRectangleShape :
    Draw a 2D-rectangle of dimensions wxh with the initial point
    (x,y). It returns a shape.
        Input  : - w the rectangle width
                 - h the rectangle height
                 - (optional) x the x-position of initial drawing
                 - (optional) y the y-position of initial drawing
        Output : - the shape of 2D-rectangle
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


/* createPresenter :
    Create a 3D-presenter of dimensions wxhxd used to hold objects in museum.
    The current model is a rectangle and on top there is a socle
    where the object is exposed.
    The material used is defined by presenterMaterial.
        Input  : - w the presenter width
                 - h the presenter height
                 - d the presenter depth
        Output : - the presenter 3D-model created (mesh)
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

/* createWall :
    Create a wall (3D-almost-rectangle) of the considered shape and depth.
    It returns an ExtrudeGeometry with fixed extrudeSettings.
        Input :  - shape the wall shape(must be a rectangle)
                 - depth the wall depth
        Output : - the wall mesh created
*/
function createWall(shape, depth){

    const extrudeSettings = {
        steps: 1,
        depth: depth,
        bevelEnabled: false
    };

    return new THREE.ExtrudeGeometry( shape, extrudeSettings );
}
/* buildWalls :
    Create a room of dimensions wxh where walls have depth d.
    The others arguments are used to let a space for a "door" (but
    it is more like an arch).
    It uses the functions createRectanglePath, createRectangleShape
    and createWall to build walls one by one and place them to
    appropriate location.
    The wall and roof material are defined by constant roofMaterial
    and wallMaterial.
        Input  : - w the room width
                 - h the room height
                 - d the wall depth
                 - (optional) doorAtX is 1 if the wall X need a door
                 where X belongs to [Font, Back, Left, Right]

        Output : - the group of walls
*/
function buildWalls(w, h, d, doorAtFront = 0, doorAtBack = 0, doorAtLeft = 0, doorAtRight = 0) {
    const walls = new THREE.Group();
    walls.name = "walls";

    const doorPathLR = createRectanglePath(w-2, cap-2, 2, 0);
    const doorPathFB = createRectanglePath(h-2, cap-2, 2, 0);

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

    const leftShape = createRectangleShape(w, cap);
    if (doorAtLeft) leftShape.holes.push(doorPathLR);
    const left = createWall(leftShape, d);
    const mleft = new THREE.Mesh( left, wallMaterial );
    mleft.rotation.x = Math.PI / 2;
    mleft.name = "left";
    walls.add(mleft);

    const rightShape = createRectangleShape(w, cap);
    if (doorAtRight) rightShape.holes.push(doorPathLR);
    const right = createWall(rightShape, d);
    const mright = new THREE.Mesh( right, wallMaterial );
    mright.rotation.x = Math.PI / 2;
    mright.position.add(new Vector3(0, h, 0));
    mright.name = "right";
    walls.add(mright);

    const frontShape = createRectangleShape(h, cap);
    if (doorAtFront) frontShape.holes.push(doorPathFB);
    const front = createWall(frontShape, d);
    const mfront = new THREE.Mesh( front, wallMaterial );
    mfront.rotation.x = Math.PI / 2;
    mfront.rotation.y = Math.PI / 2;
    mfront.name = "front";
    walls.add(mfront);

    const backShape = createRectangleShape(h, cap);
    if (doorAtBack) backShape.holes.push(doorPathFB);
    const back = createWall(backShape, d);
    const mback = new THREE.Mesh( back, wallMaterial );
    mback.rotation.x = Math.PI / 2;
    mback.rotation.y = Math.PI / 2;
    mback.position.add(new Vector3(w, 0, 0));
    mback.name = "back";
    walls.add(mback);

    walls.position.add(new Vector3(-w/2, -h/2, 0));

    return walls;
}

/* buildWallsSimple :
    Create 6 walls for the architecture of the room. Follows the Simple
    configuration. The dimensions depend on n, the number of presenters to
    be added then.
        Input  : - n the number of presenters to include
                 - image the image of protagonist
                 - (optional) doorAtX are booleans, if 1 then there doors
                 on sides of painting, where X belongs to [Left, Right]

        Output : - the group containing all walls
*/
function buildWallsSimple(n, image, doorAtLeft = 0, doorAtRight = 0){
    let w = Simple.getWidth(n);
    let h = Simple.getHeight(n);
    let d = 0.2;
    let paintw = 2;
    let painth = 2.5;
    const walls = buildWalls(w, h, d, 0, 0, doorAtLeft, doorAtRight);
    walls.name = "simpleWalls";

    Simple.computePaintingPosition(n);
    const painting = createPainting(image, paintw, painth);
    painting.position.set(Simple.paintingPosition.x,
        Simple.paintingPosition.y, Simple.paintingPosition.z);
    painting.position.add(new Vector3(d,-paintw/2, 0));
    walls.add(painting);

    return walls;
}

/* buildPresenters :
    Create n presenters following the given configuration in the space. The position
    of each presenter is in Simple attributs and need to be calculated.
        Input  : - n the number of presenters to include
                 - objs a tab of images and names of objects
                 - configuration the shape of the room

        Output : - the group containing all presenters
*/
function buildPresenters(n, objs, configuration){
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
        let obj = getAnObjectOnTop(mesh, objs[i][0], 0.75, 0.75);
        obj.name = objs[i][1];
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
