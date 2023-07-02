import *  as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import stars from "./img/stars.jpg";

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xa8def0)

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.y = 10;

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(3.5,0,3.5);
// these two values basically smooth the movement animation
controls.dampingFactor = 0.05;
controls.enableDamping = true;
controls.zoomSpeed = 5;
controls.minDistance = 5;
controls.maxDistance = 15;
controls.maxPolarAngle = Math.PI / 2;

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    stars,
    stars,
    stars,
    stars,
    stars,
    stars
]);

/**
 * set the pieces
 */
var radius = 0.3;
var height = 1;
var piecesGame = {
    pawn: {
        quantity: 8,
        coord:{
            0xfdcc0d: [ [1,0],[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7] ],
            0x0a7e8c: [ [6,0],[6,1],[6,2],[6,3],[6,4],[6,5],[6,6],[6,7] ]
        },
        colors: [0xfdcc0d,0x0a7e8c],
        geometry: new THREE.ConeGeometry( radius, height, 32 ),
        movementSet:[
            {
                x: 1,
                z: 0
            },
        ],
    },
    rook: {
        quantity: 1,
        coord:{
            0xfdcc0d:[ [0,0],[0,7] ] ,
            0x0a7e8c:[ [7,0],[7,7] ]
        },
        colors: [0xfdcc0d,0x0a7e8c],
        geometry: new THREE.CylinderGeometry( radius, radius, height, 32 ),
        movementSet:[
            {
                x: 7,
                z: 0
            },
            {
                x: -7,
                z: 0
            },
            {
                x: 0,
                z: 7
            },
            {
                x: 0,
                z: -7
            }
        ]
    },
    knight: {
        quantity: 2,
        coord:{
            0xfdcc0d:[ [0,1],[0,6] ] ,
            0x0a7e8c:[ [7,1],[7,6] ]
        },
        colors: [0xfdcc0d,0x0a7e8c],
        geometry: new THREE.DodecahedronGeometry( radius )
    },
    bishop: {
        quantity: 2,
        coord:{
            0xfdcc0d:[ [0,2],[0,5] ] ,
            0x0a7e8c:[ [7,2],[7,5] ]
        },
        colors: [0xfdcc0d,0x0a7e8c],
        geometry: new THREE.OctahedronGeometry( radius)
    },
    queen: {
        quantity: 1,
        coord:{
            0xfdcc0d:[ [0,3] ] ,
            0x0a7e8c:[ [7,3] ]
        },
        colors: [0xfdcc0d,0x0a7e8c],
        geometry: new THREE.SphereGeometry( radius, 32 )
    },
    king: {
        quantity: 1,
        coord:{
            0xfdcc0d:[ [0,4] ] ,
            0x0a7e8c:[ [7,4] ]
        },
        colors: [0xfdcc0d,0x0a7e8c],
        geometry: new THREE.TetrahedronGeometry( radius )
    }
}
var arrayPieces = [
    'pawn', 
    'rook', 
    'knight', 
    'bishop', 
    'queen', 
    'king'
];

light();

/**
 * generate the board
 */
var board = generateBoard();
scene.add(board)

var whiteGroup
var blackGroup;
placePieces()

scene.add(whiteGroup).add(blackGroup)


function createMesh(color){
    return new THREE.MeshPhongMaterial({ color: color });
}

function generateBoard(){
    var board, cubeMat, cubeGeo, color; 
    board = new THREE.Group();
    board.name = 'board';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let mesh = []
            color = ((i + j) % 2 == 0) ? 0xc5c5c5 : 0x000000
            cubeMat = createMesh(color);
            cubeGeo = new THREE.BoxGeometry( 0.9, 0.2, 0.9 );
            const cube = new THREE.Mesh( cubeGeo, cubeMat);
            cube.castShadow = true;
            cube.name = color
            cube.position.set(i,0,j);
            board.add(cube);
        } 
    }
    // scene.add(board);
    return board
}

function placePieces() {
    whiteGroup = new THREE.Group();
    whiteGroup.name = 'white';
    blackGroup = new THREE.Group();
    blackGroup.name = 'black';
    for (let piece of arrayPieces) {
        let objectPiece =  piecesGame[piece]
        for (let c = 0; c < objectPiece.colors.length; c++) {
            let objectColors = objectPiece.colors[c];
            for (let z = 0; z < objectPiece.coord[objectColors].length; z++) {
                const coord = objectPiece.coord[objectColors][z]; 
                const geo = objectPiece.geometry;
                const mat = createMesh(objectColors); 
                const mesh = new THREE.Mesh( geo, mat );  
                mesh.name = piece + z //+ '-' + coord[0] +'-' + coord[1];
                mesh.position.set(coord[0], 0.6, coord[1])   
                // mesh.position.set(4, 0.6, 4)         
                objectColors == 0xfdcc0d ? whiteGroup.add(mesh) : blackGroup.add(mesh);
            }
        }    
    }
}

function light() {
    var light
    light = new THREE.AmbientLight(0xffffff, 10);
    scene.add(light);
    light = new THREE.DirectionalLight(0xffeba8, 15);
    light.castShadow = true;
    scene.add(light);
}

function animate() {
	requestAnimationFrame( animate );
    controls.update();
	renderer.render( scene, camera );
}  

function clearBoard(object){
    if(object.parent.name == 'board') {
        console.log(object.position); 
        return
    };
    let parent = object.parent.name == 'white' ? whiteGroup : blackGroup;
    let selectedObject = parent.children.find(m => m.name == object.name);  
    let array = whiteGroup.children.concat(blackGroup.children)
    array.forEach(element => {
        var cloned = createMesh(element.parent.name == 'white' ? 0xfdcc0d: 0x0a7e8c);
        element.material = cloned;
    });
    board.children.forEach(element => {
        var cloned = createMesh(element.name);
        element.material = cloned;
    });
    var cloned = createMesh(0xcc0000);
    selectedObject.material = cloned;
    setMovementOfPiece(selectedObject)
    
}

// listMovements = [7, -7, 1, -1];

function setMovementOfPiece(piece){
    // let typePiece = arrayPieces.find(p => piece.name.includes(p))
    // let position = piece.position;
    // let movementSet = piecesGame[typePiece].movementSet;
    // let boardForMovement = [];
    // let arrayMovement = [];
    // for(var key in movementSet){
    //     const movement = movementSet[key];
    //     let x;
    //     x = (position.x + movement.x) < 0 ? 0 : ((position.x + movement.x) > 7 ? 7 : (position.x + movement.x));
    //     let z;
    //     z = (position.z + movement.z) < 0 ? 0 : ((position.z + movement.z) > 7 ? 7 : (position.z + movement.z));
    //     console.log(x,z);
    //    let block = board.children.find(b => b.position.x == x && b.position.z == z);
    //     if(block){
    //         boardForMovement.push(block)
    //     }
    // }
    // console.log(boardForMovement);
    // boardForMovement.forEach(element => {
    //     var cloned = createMesh(0xeb34ae);
    //     element.material = cloned;
    // }); 
}

// function pawnMovement(){

// }

function setLinearMovement(){

}

function setNonLinearMovement(){

}

animate();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let intersects = [];
window.addEventListener("click", event => {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( pointer, camera );
    intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0){
        let i0 = intersects[0];
        // resetColorEveryPiece();
        clearBoard(i0.object)
    }
})

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)  
  })