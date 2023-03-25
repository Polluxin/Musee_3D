/**********************************************************************************
 *
    Library of functions used to create museum rooms and arrange objects in them.
 *
 **********************************************************************************/

import * as THREE from 'three';


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
    spaceW : 3,                                     // Distance between the 2 lines of presenters
    spaceSidesH : 2,                                // Distance between a wall and a presenter in height space
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
            this.presentersPositions.push(new THREE.Vector3(-this.spaceW,pos,0.5));
            pos += this.spaceH;
            i += 1;
        }
        pos = deb;
        while (i < n){
            this.presentersPositions.push(new THREE.Vector3(this.spaceW,pos,0.5));
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
    room.add(buildPresenters(nb_objects, images, configuration));

    return room;
}

/**********************************************************************************
    Private functions & objects
 **********************************************************************************/

const loader = new THREE.TextureLoader();
// Wall information
const cap = 5
const wtexture = loader.load("/data/textures/granite.jpg")
const wallMaterial = new THREE.MeshPhongMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
wallMaterial.map = wtexture;

const rtexture = loader.load("/data/textures/marble.jpg")
const roofMaterial = new THREE.MeshPhongMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
roofMaterial.map = rtexture;

// Presenters information
const ptexture = loader.load ('/data/textures/wood.jpg');
const presenterMaterial = new THREE.MeshPhongMaterial({ color: 0xE75900 } );
presenterMaterial.map = ptexture;

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
    walls.add(new THREE.Mesh( roof, roofMaterial ));

    const top = new THREE.PlaneGeometry(w, h);
    const mesh = new THREE.Mesh( top, wallMaterial );
    mesh.position.set(0,0,cap);
    walls.add(mesh);

    const right = new THREE.PlaneGeometry(cap, h);
    const mesh2 = new THREE.Mesh(right, wallMaterial);
    mesh2.position.set(w / 2, 0, cap / 2);
    mesh2.rotation.y = Math.PI / -2;
    walls.add(mesh2);


    const mesh3 = mesh2.clone();
    mesh3.rotation.y = Math.PI / 2; // To avoid non collision
    mesh3.position.set(-w/2,0,cap/2);
    walls.add(mesh3);

    const deep = new THREE.PlaneGeometry(w, cap);
    const mesh4 = new THREE.Mesh( deep, wallMaterial );
    mesh4.position.set(0,h/2,cap/2);
    mesh4.rotation.x = Math.PI / 2;
    if (door == 0) walls.add(mesh4);

    const mesh5 = mesh4.clone();
    mesh5.rotation.x = Math.PI / -2; // To avoid non collision
    mesh5.position.set(0,-h/2,cap/2);
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
function buildPresenters(n, images, configuration){
    const presenters = new THREE.Group();
    configuration.computePresentersPosition(n);
    for (let i = 0; i < n; i++) {
        let geometry = new THREE.BoxGeometry(1, 1, 1);
        let mesh = new THREE.Mesh(geometry, presenterMaterial);
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

    i.position.set(presenter.position.x, presenter.position.y, presenter.position.z+ measure.z/2 + h/2);
    i.rotateX(Math.PI/2);
    i.rotateY(Math.PI/2);
    return i;
}
