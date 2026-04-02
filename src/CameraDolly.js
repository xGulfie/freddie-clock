import tooloud from 'tooloud';
import * as THREE from 'three';
const {Perlin} = tooloud


function genPos(t,outVec){
    let timeScale=0.1;
    let sc=1;
    let aspect = window.innerHeight / window.innerWidth;
    if (aspect > 1){
        sc = sc /aspect;
    }
    outVec.set(
        sc*Perlin.noise(timeScale*t,0,0),
        sc*Perlin.noise(0,timeScale*t,0),
        0
    );
}
function genRot(t,outEuler){
    let timeScale=0.1;
    let sc=0.1;
    let aspect = window.innerHeight / window.innerWidth;
    if (aspect > 1){
        sc = sc /aspect;
    }
    outEuler.set(
        sc*Perlin.noise(timeScale*t,0,0),
        sc*Perlin.noise(0,timeScale*t,0),
        sc*Perlin.noise(0,0,timeScale*t)
    )
}
class CameraDolly extends THREE.Object3D{
    _euler;
    constructor(){
        super();
        this._euler=new THREE.Euler();
    }
    update(dt,t){
        // this.position.set(0,0,0)
        genPos(t,this.position);
        genRot(t,this._euler)
        this.setRotationFromEuler(this._euler)
    }

}

export{CameraDolly}