import { WiggleBone } from "wiggle";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from 'three';
import { environment } from "./environment";
import { Tween } from 'three/examples/jsm/libs/tween.module.js';
import {animate} from 'animejs'
import tooloud from 'tooloud';
const {Perlin} = tooloud

const ANIMSTATE = {
    ENTERING: Symbol('entering'),
    PAUSED_AFTER_ENTER: Symbol('paused'),
    EXITING: Symbol('exiting'),
    PAUSED_AFTER_EXITING: Symbol('pausedafterexit')
}

class Freddie{
    parentObj;
    object;
    wiggleBones=[];
    rootBone;
    currentAnimation;
    cameraAspect;
    nextAnimState=ANIMSTATE.ENTERING;
    bodyMesh=null;
    eyeAnimation={completed:true};
    blendShapes={blink:0}
    harnessMesh=null
    constructor(scene){
        this.parentObj = new THREE.Object3D();
        scene.add(this.parentObj)
        new GLTFLoader().load(new URL('./dolphin.glb',import.meta.url).toString(), (gltf)=>{
            
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
            
            let wiggleBoneNames = [
                'dolph_spine_2',
                'dolph_spine_3',
                'dolph_spine_4',
                'dolph_spine_5',
                'dolph_spine_6',
                'dolph_spine_7',
                'dolph_spine_8',
                'dolph_spine_9',
                'flipperl',
                'flipperr'
            ];
            let wiggleBoneWeights = [
                0.15,
                0.1,
                0.05,
                0.05,
                0.05,
                0.05,
                0.05,
                0.05,
                0.2,0.2
            ]
            let i =0;
            wiggleBoneNames.forEach(s=>{
                this.wiggleBones.push(new WiggleBone(
                    gltf.scene.getObjectByName(s),{
                        velocity:wiggleBoneWeights[i]
                    }
                ))
                i++;
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
        })
    }
    update(dt,t,scene,camera){
        // noop
        if (!this.rootBone){
            return;// not loaded yet
        }
        this.cameraAspect = camera.aspect;// use to see where the edge of the scene roughly is
        const minutef = new Date().getTime() / (1000*60);// good enough for government work
        // this.rootBone.position.x = 1*3*this.cameraAspect;
        // this.rootBone.position.y = -1.2+ 1*3;

        // this.rootBone.rotateZ(dt)
        // this.rootBone.rotateY(dt*1.1)
        // this.rootBone.rotateX(dt*0.9)
        this.wiggleBones.forEach((wiggleBone) => {
            wiggleBone.update();
        });

        this.doIdle(dt,t); // facial animation etc
        this.doMotion();
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
        this.rootBone.rotation.x=(rx)*2*Math.PI*0.75 - 0;

        let ry = Perlin.noise(0,0,t*0.1);
        this.rootBone.rotation.z=(ry)*2*Math.PI*0.75 - 0;

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
    doMotion(){
        // set currentAnimation and start it
        if (this.currentAnimation && !this.currentAnimation.completed){
            return
        }

        if (this.nextAnimState == ANIMSTATE.ENTERING){
            // enter animation
            // pick a corner position
            let dest = this.getCorner();

            this.currentAnimation = animate(this.rootBone.position,{
                x:dest.x,
                y: dest.y,
                z:0,
                duration:5000,
                ease: 'inOut(3)'
            })
            this.nextAnimState=ANIMSTATE.PAUSED_AFTER_ENTER
        } else if (this.nextAnimState == ANIMSTATE.PAUSED_AFTER_ENTER){
            this.currentAnimation = animate(this.rootBone.position,{
                x: this.rootBone.position.x,
                duration:2000
            })
            this.nextAnimState=ANIMSTATE.EXITING
        }else if (this.nextAnimState == ANIMSTATE.EXITING){
            // exit animation
            let dest = this.getCorner();
            
            this.currentAnimation = animate(this.rootBone.position,{
                x: dest.x*3,
                y: dest.y*3,
                duration:5000,
                ease: 'inOut(3)'
            })
            this.currentAnimation.play()
            this.nextAnimState=ANIMSTATE.PAUSED_AFTER_EXITING
        } else if (this.nextAnimState == ANIMSTATE.PAUSED_AFTER_EXITING){
            // randomly set his gear
            this.randomizeGear();
            this.currentAnimation = animate(this.rootBone.position,{
                x: this.rootBone.position.x,
                duration: 5000
            })
            this.nextAnimState = ANIMSTATE.ENTERING
        }
    }

    randomizeGear(){
        this.blendShapes.hat = Math.random() > 0.9 ? 1 : 0;
        this.harnessMesh.visible = Math.random() > 0.5;
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