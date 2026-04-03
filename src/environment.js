import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
class Environment{

    texture;
    constructor(){
        // underwater-12k-unclipped-hdr_0_5K_1992a829-4966-4c25-8a8d-1bcb47d85061
        // underwater-12k-unclipped-hdr_2K_3e7b4850-9304-4a08-8a17-f74a378f9a0f
        // underwater-12k-unclipped-hdr_1K_84473f3c-f60c-4d69-b99d-e75380ea9dfe
        var path = new URL('textures/underwater-12k-unclipped-hdr_0_5K_1992a829-4966-4c25-8a8d-1bcb47d85061.exr',import.meta.url)
        this.texture = new EXRLoader().load( path, ()=>{
            this.texture.mapping = THREE.EquirectangularReflectionMapping;
        } );
        this.texture.format = THREE.RGBAFormat;
        this.texture.type = THREE.UnsignedByteType;
    };

    getTexture(){
        return this.texture;
    }
}

window.environment = window.environment || new Environment().texture;
let environment=window.environment;

export {environment}