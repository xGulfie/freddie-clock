import { WiggleBone } from "wiggle";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from 'three';
import { environment } from "./environment";
import { Tween } from 'three/examples/jsm/libs/tween.module.js';
import {animate} from 'animejs'
import tooloud from 'tooloud';
const {Perlin} = tooloud
import {options} from './options'

let sleep = (timeMs)=>{
    return new Promise((resolve,reject)=>{
        setTimeout(resolve,timeMs)
    });
}

class Freddie{
    parentObj;
    object;
    wiggleBones=[];
    rootBone;
    cameraAspect;
    bodyMesh=null;
    eyeAnimation={completed:true};
    blendShapes={blink:0}
    harnessMesh=null
    constructor(scene){
        this.parentObj = new THREE.Object3D();
        scene.add(this.parentObj)
        if (!options.dolphin){
            return;// don't load dolphin
        }
        new GLTFLoader().load(new URL('./dolphin_compressed.glb',import.meta.url).toString(), (gltf)=>{
            
            this.parentObj.add(gltf.scene)
            this.object=gltf.scene

            this.object.getObjectsByProperty('isSkinnedMesh',true).forEach(o=>{
                var mat = o.material;
                o.material.envMap = environment;
                o.material.envMapIntensity = 1;
                o.frustumCulled=false;
            })
            let mesh = gltf.scene.getObjectByName("Body")
            this.harnessMesh = gltf.scene.getObjectByName("Harness")
            this.bodyMesh=mesh;

            this.rootBone = gltf.scene.getObjectByName("dolphy_head")
            gltf.scene.getObjectByName("wandl").scale.set(0)
            gltf.scene.getObjectByName("wandr").scale.set(0)
            this.rootBone.scale.set(4,4,4)
            
            let wiggleBoneData={
                dolph_spine_2:{stiffness:700, damping:0.0001, mass:1000, velocity:0.2},
                dolph_spine_3:{stiffness:100, damping:0.0001, mass:1000, velocity:0.15},
                dolph_spine_4:{stiffness:100, damping:0.0001, mass:1000, velocity:0.1},
                dolph_spine_5:{stiffness:100, damping:0.0001, mass:1000, velocity:0.05},
                dolph_spine_6:{stiffness:100, damping:0.0001, mass:1000, velocity:0.05},
                dolph_spine_7:{stiffness:80, damping:0.0001, mass:1000, velocity:0.05},
                dolph_spine_8:{stiffness:60, damping:0.0001, mass:1000, velocity:0.05},
                dolph_spine_9:{stiffness:40, damping:0.0001, mass:1000, velocity:0.05},
                flipperl:{stiffness:900, damping:28, velocity:3},
                flipperr:{stiffness:900, damping:28, velocity:3}
            }

            Object.keys(wiggleBoneData).forEach(k=>{
                this.wiggleBones.push(new WiggleBone(
                    gltf.scene.getObjectByName(k),wiggleBoneData[k]
                ));
            })
           
            // mesh.skeleton.bones.forEach((bone) => {
            //     if (!bone.parent.isBone) {
            //         this.rootBone = bone;
            //     } else {
            //         const wiggleBone = new WiggleBone(bone, {
            //             velocity: 0.5,
            //         });
            //         this.wiggleBones.push(wiggleBone);
            //     }
            // });

            // const skeletonHelper = new THREE.SkeletonHelper( mesh );
            // skeletonHelper.material.linewidth = 2;
            // scene.add( skeletonHelper );

            Object.keys(this.bodyMesh.morphTargetDictionary).forEach(k=>{
                this.blendShapes[k]=0;
            })

            this.rootBone.position.set(0,0,-50)
            this.randomizeGear()
            this.doMotion()
        })
    }
    update(dt,t,scene,camera){
        // noop
        if (!this.rootBone){
            return;// not loaded yet
        }
        this.cameraAspect = camera.aspect;// use to see where the edge of the scene roughly is
        this.wiggleBones.forEach((wiggleBone) => {
            wiggleBone.update();
        });

        this.doIdle(dt,t); // facial animation etc
        this.applyBlendShapes();
    }
    
    getCorner(n){
        if (typeof n == 'undefined'){
            n = Math.floor(Math.random()*4)
        }
        let destY = (n % 2 === 0) ? 1.8 : -3.7;
        let destX = (n < 2) ? 3*this.cameraAspect : -3*this.cameraAspect;
        return {x: destX, y: destY}
    }

    doIdle(dt,t){
        // first: idle rotation
        let rz = Perlin.noise(t*0.1,0,0);
        this.rootBone.rotation.z=(rz)*2*Math.PI - 0;
        
        let rx = Perlin.noise(0,t*0.1,0);
        this.rootBone.rotation.x=(rx)*2*Math.PI*0.5 - 0;

        let ry = Perlin.noise(0,0,t*0.1);
        this.rootBone.rotation.z=(ry)*2*Math.PI*0.5 - 0;

        // second: eyes
        if (this.eyeAnimation.completed){
            let b = Perlin.noise(0,t,t*5);
            if (b > 0.45){
                // choose from blink or happy eyes
                if (Math.random() < 0.9){
                    this.eyeAnimation = animate(this.blendShapes,{
                        blink:[0,0,1,0,0],
                        duration:200,
                        delay:500
                    })
                } else {
                    this.eyeAnimation=animate(this.blendShapes,{
                        '笑い':[
                            {to:1,duration:1},
                            {to:1,duration:2998},
                            {to:0,duration:1}
                        ],
                        'vrc.v_aa':[
                            {to:1,duration:300, ease:'outBack'},
                            {to:1,duration:2699},
                            {to:0}
                        ],
                        duration:3000,
                        delay:500
                    })
                }
            }
        }
        
    }
    async doMotion(){
        // this just cycles enter/exit animations basically
        while(true){
            // enter animation
            // pick a corner position
            let dest = this.getCorner();
            await animate(this.rootBone.position,{
                x:dest.x,
                y: dest.y,
                z:0,
                duration:5000,
                ease: 'inOut(3)'
            })

            // pause and mug the camera
            await sleep(2000);

            // swim away
            let destAway = this.getCorner();            
            await animate(this.rootBone.position,{
                x: destAway.x*3,
                y: destAway.y*3,
                duration:5000,
                ease: 'inOut(3)'
            })
            this.randomizeGear();

            // pause
            await sleep(5000)
        }
        
    }

    randomizeGear(){
        if (options.gear){
            this.blendShapes.hat = Math.random() > 0.9 ? 1 : 0;
            this.harnessMesh.visible = Math.random() > 0.5;
        } else {
            this.blendShapes.hat = 1;
            this.harnessMesh.visible = false;
        }
    }
    applyBlendShapes(){
        if (!this.bodyMesh){
            return;
        }
        Object.keys(this.blendShapes).forEach(name=>{
            this.bodyMesh.morphTargetInfluences[this.bodyMesh.morphTargetDictionary[name]]=this.blendShapes[name]
        })
    }
}



export {Freddie}