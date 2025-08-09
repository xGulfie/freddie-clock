import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as bubbles from './bubbles.js'
import {Freddie} from './Freddie.js'

window.THREE = THREE

// scene / camera / renderer
const fogColor = new THREE.Color('#54a3ff').getHex()
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
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
const allowedTweak = Math.PI/6
controls.maxAzimuthAngle = allowedTweak;
controls.minAzimuthAngle = -allowedTweak;
controls.maxPolarAngle = Math.PI/2 + allowedTweak;
controls.minPolarAngle = Math.PI/2 - allowedTweak;
controls.enablePan=false;

// text plane
const canv = document.createElement('canvas')
canv.width=1024
canv.height=512
updateCanvas()
const textPlane = new THREE.PlaneGeometry(13,6.5)
const timeTexture = new THREE.CanvasTexture(canv)
const textMaterial = new THREE.MeshBasicMaterial({map: timeTexture, transparent:true, alphaTest:0.5, fog:false})
const timeMesh = new THREE.Mesh(textPlane, textMaterial)
scene.add(timeMesh)

// bg plane
// const bgGeometry = new THREE.PlaneGeometry(10000,10000);
// const bg = new THREE.Mesh(bgGeometry, new THREE.MeshBasicMaterial({color:0xddffff}));
// bg.position.set(0,0,-100)
// scene.add(bg);

scene.add(bubbles.createBubbles())

camera.position.z = 5;
const clock = new THREE.Clock()

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

var lastMinutes=-1
function updateCanvas(){
    const d = new Date()
    const minutes = d.getMinutes()
    if (minutes == lastMinutes){
        return;// don't need to re-render canvas
    }
    lastMinutes=minutes;
    const ctx = canv.getContext('2d')
    ctx.clearRect(0,0,canv.width,canv.height)
    ctx.font = "bold "+(canv.width*0.3)+"px sans-serif";
    ctx.textBaseline = "middle";  
    ctx.textAlign="center"
    ctx.fillStyle='yellow'
    const hoursFormatted = ('0'+(d.getHours() % 12 || 12).toString()).slice(-2)
    const minutesFormatted = ('0'+minutes.toString()).slice(-2)
    ctx.fillText(hoursFormatted+':'+minutesFormatted,canv.width*0.5,canv.height*0.5)
}
setInterval(updateCanvas,1000)

window.addEventListener('resize',function(){    
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
})
renderer.setAnimationLoop( animate );