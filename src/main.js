import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as bubbles from './bubbles.js'
import {Freddie} from './Freddie.js'
import {Clock} from './Clock.js'
import { CameraDolly } from './CameraDolly.js';
import { options } from './options.js';
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
document.getElementById('app').appendChild( renderer.domElement );

// controls/camera for dev
// const controls = new OrbitControls( camera, renderer.domElement );
// controls.listenToKeyEvents( window ); // optional
// controls.enableDamping = true; 

const SCENE_PARENT=new THREE.Object3D();
window.SCENE_PARENT=SCENE_PARENT
SCENE_PARENT.setRotationFromEuler(new THREE.Euler( -3.112452278105576,-0.23741367371073124, 1.8639032285037975));
scene.add(SCENE_PARENT);

// ok values:
// Object { isEuler: true, _x: -3.141592653589793, _y: -0.14159265358979328, _z: 1.858407346410207, _order: "XYZ", _onChangeCallback: onRotationChange() }
// better values:
// { Object { isEuler: true, _x: -3.112452278105576, _y: -0.23741367371073124, _z: 1.8639032285037975, _order: "XYZ", _onChangeCallback: onRotationChange() }
// also ran:
// Object { isEuler: true, _x: -3.1124522781055766, _y: -0.23741367371073213, _z: -3.136096771496204, _order: "XYZ", _onChangeCallback: onRotationChange() }
// constrain for prod
// const allowedTweak = Math.PI/6
// controls.maxAzimuthAngle = allowedTweak;
// controls.minAzimuthAngle = -allowedTweak;
// controls.maxPolarAngle = Math.PI/2 + allowedTweak;
// controls.minPolarAngle = Math.PI/2 - allowedTweak;
// controls.enablePan=false;

// GUI code::
{
    ///////////////////////////////////// loading:
    THREE.DefaultLoadingManager.onProgress=(url, progress)=>{
        document.getElementById("progress").value = progress/9
        document.getElementById('loadingtext').innerHTML = `Loaded ${progress} of 9 assets...`
    }
    THREE.DefaultLoadingManager.onError=(url)=>{
        document.getElementById("loadingtext").innerHTML="Whoops! could not load "+url
    }
    THREE.DefaultLoadingManager.onLoad=()=>{
        document.getElementById("loadingtext").style.display='none'
        document.getElementById("progress").style.display='none'
    }
    document.getElementById("loadingtext").innerHTML="Loading assets..."
        
    document.getElementById("fullscreen").addEventListener('click', (e)=>{
        e.preventDefault()
        if (document.fullscreenElement){
            document.exitFullscreen()
        } else {
            document.documentElement.requestFullscreen()
        }
    })

    /////////////////////////////////// set initial state of hour toggle and modify location hash:
    if (options.use24 ){
        document.getElementById("hourtoggle").innerHTML="12:"
    } else {
        document.getElementById("hourtoggle").innerHTML="24:"
    }
    
    //////////////////////// hour toggle
    document.getElementById("hourtoggle").addEventListener('click', (e)=>{
        e.preventDefault()
        options.setUse24(!options.use24);
        if (options.use24 ){
            document.getElementById("hourtoggle").innerHTML="12:"
        } else {
            document.getElementById("hourtoggle").innerHTML="24:"
        }
    });

    /////////////////////////// fade:
    var timeout;
    var buttons = document.getElementById('controlsrow')
    function hideButtons(){
        buttons.style.opacity=0;
    }
    function showButtons(){
        buttons.style.opacity=1;
        if (timeout){
            clearTimeout(timeout);
        }
        timeout = setTimeout(hideButtons,2500);
    }
    timeout = setTimeout(hideButtons, 2500);
    document.addEventListener('mousemove',showButtons);
}


// skybox
const bgGeometry = new THREE.BoxGeometry(100,100,100);
const bg = new THREE.Mesh(bgGeometry, new THREE.MeshBasicMaterial({color:new THREE.Color(0,0,0), side:THREE.BackSide}))
SCENE_PARENT.add(bg);

SCENE_PARENT.add(bubbles.createBubbles())

const dolly = new CameraDolly();
SCENE_PARENT.add(dolly)
dolly.add(camera);
camera.position.z = 8;
const timer = new THREE.Timer()
timer.connect(document)
const clockMesh = new Clock().object;
SCENE_PARENT.add(clockMesh)

const freddie = new Freddie(SCENE_PARENT);
window.freddie = freddie;
let c = '#073146ff'
SCENE_PARENT.add(new THREE.HemisphereLight(0xaaffff, 0x073146,1))

function animate() {
    timer.update()
    const dt = timer.getDelta();
    const t = timer.getElapsed();
    bubbles.updateBubbles(dt)
    // controls.update()
    freddie.update(dt,t,SCENE_PARENT,camera)
    renderer.render( scene, camera );
    dolly.update(dt,t);
}

window.addEventListener('resize',function(){    
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
})
renderer.setAnimationLoop( animate );
