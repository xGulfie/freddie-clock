import * as THREE from 'three';

class Environment{

    texture;
    constructor(){                
        var path = "./textures/skybox/";
        var format = '.jpg';
        var urls = [
            new URL('textures/skybox/posx.jpg',import.meta.url),
            new URL('textures/skybox/negx.jpg',import.meta.url),
            new URL('textures/skybox/posy.jpg',import.meta.url),
            new URL('textures/skybox/negy.jpg',import.meta.url),
            new URL('textures/skybox/posz.jpg',import.meta.url),
            new URL('textures/skybox/negz.jpg',import.meta.url)
        ];
        urls = urls.map(u=>{
            return new URL(u,import.meta.url)
        })

        this.texture = new THREE.CubeTextureLoader().load( urls, ()=>{
            this.loaded = true;
        } );
        this.texture.format = THREE.RGBAFormat;
        this.texture.type = THREE.UnsignedByteType;
    };

    getTexture(){
        return this.texture;
    }
}

globalThis.environment = globalThis.environment || new Environment().texture;
environment=globalThis.environment;

export {environment}