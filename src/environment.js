import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
class Environment{

    texture;
    constructor(){                
        var path = new URL('textures/underwater-12k-unclipped-hdr_2K_3e7b4850-9304-4a08-8a17-f74a378f9a0f.exr',import.meta.url)
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