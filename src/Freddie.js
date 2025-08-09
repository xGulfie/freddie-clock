import { WiggleBone } from "wiggle";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from 'three';

class Freddie{
    parentObj;
    object;
    wiggleBones=[];
    rootBone;
    constructor(scene){
        this.parentObj = new THREE.Object3D();
        scene.add(this.parentObj)
        new GLTFLoader().load(new URL('./dolphin.glb',import.meta.url).toString(), (gltf)=>{
            this.parentObj.add(gltf.scene)
            this.object=gltf.scene
            let mesh = gltf.scene.getObjectByName("Body")

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

            const skeletonHelper = new THREE.SkeletonHelper( mesh );
            skeletonHelper.material.linewidth = 2;
            scene.add( skeletonHelper );


        })
    }
    update(dt,t,scene,camera){
        // noop
        if (!this.rootBone){
            return;// not loaded yet
        }
        let aspect = camera.aspect;// use to see where the edge of the scene roughly is
        this.rootBone.position.x = Math.sin(t*2)*3*aspect;
        this.rootBone.position.y = -1.2+ Math.cos(t*2)*3;
        this.rootBone.rotateZ(dt)
        this.rootBone.rotateY(dt*1.1)
        this.rootBone.rotateX(dt*0.9)
        this.wiggleBones.forEach((wiggleBone) => {
            wiggleBone.update();
        });

    }
}
export {Freddie}