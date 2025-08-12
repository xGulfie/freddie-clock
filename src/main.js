import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as bubbles from './bubbles.js'
import {Freddie} from './Freddie.js'
import {Clock} from './Clock.js'
window.THREE = THREE

// scene / camera / renderer
const fogColor = new THREE.Color('#54a3ff'.slice(0,7)).getHex()
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
scene.fog = new THREE.FogExp2( fogColor, 0.05 );
scene.background=fogColor
renderer.setClearColor(fogColor)
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// controls/camera
const controls = new OrbitControls( camera, renderer.domElement );
controls.listenToKeyEvents( window ); // optional
controls.enableDamping = true; 

// constrain for prod
// const allowedTweak = Math.PI/6
// controls.maxAzimuthAngle = allowedTweak;
// controls.minAzimuthAngle = -allowedTweak;
// controls.maxPolarAngle = Math.PI/2 + allowedTweak;
// controls.minPolarAngle = Math.PI/2 - allowedTweak;
// controls.enablePan=false;


// skybox
const bgGeometry = new THREE.BoxGeometry(1000,1000,1000);
const bg = new THREE.Mesh(bgGeometry, new THREE.MeshBasicMaterial({color:fogColor, side:THREE.BackSide}))
scene.add(bg);

scene.add(bubbles.createBubbles())

camera.position.z = 8;
const clock = new THREE.Clock()
const clockMesh = new Clock().object;
scene.add(clockMesh)

const freddie = new Freddie(scene);
window.freddie = freddie;
let c = '#0b4562ff'
scene.add(new THREE.HemisphereLight(0xaaffff, 0x0b4562,15))

function animate() {
    const dt = clock.getDelta();
    const t = clock.getElapsedTime();
    bubbles.updateBubbles(dt)
    controls.update()
    freddie.update(dt,t,scene,camera)
    renderer.render( scene, camera );
}

window.addEventListener('resize',function(){    
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
})
renderer.setAnimationLoop( animate );