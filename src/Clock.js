import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { environment } from './environment';
import { BufferGeometryUtils } from 'three/examples/jsm/Addons.js';

class Clock{
    geometry;
    mesh;
    object;
    lastMinutes=-1;
    font;
    constructor(){
        this.object = new THREE.Object3D();
        const loader = new FontLoader();

        this.font = loader.parse(require('./fonts/droid_sans_mono_regular.typeface.json'))
        this.geometry = new TextGeometry( '', {
            font: this.font,
            size: 1,
            depth: 5,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.1,
            bevelOffset: 0,
            bevelSegments: 5
        } );
        this.mesh = new THREE.Mesh(
            this.geometry,new THREE.MeshPhysicalMaterial({
                color:0xffff00,
                metalness:0,
                roughness:0.5,
                envMap:environment,
                flatShading:false
            })
        )
        this.object.add(this.mesh);
        setInterval(this.updateMesh.bind(this),1000)
        setInterval(this.updateScale.bind(this),100);
    }
        
    updateMesh(){
        const d = new Date()
        const minutes = d.getMinutes()
        if (minutes == this.lastMinutes){
            return;// don't need to make new mesh
        }
        this.lastMinutes=minutes;
        const hoursFormatted = ('0'+(d.getHours() % 12 || 12).toString()).slice(-2)
        const minutesFormatted = ('0'+minutes.toString()).slice(-2)
        
        let g = new TextGeometry( hoursFormatted+":"+minutesFormatted, {
            font: this.font,
            size: 1,
            depth: 0.15,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness:.04,
            bevelSize: .04,
            bevelOffset: 0,
            bevelSegments: 3
        } );
        g.center();
        g.deleteAttribute("normal");
        g = BufferGeometryUtils.mergeVertices(g, 1e-8);
        g.computeVertexNormals();
        this.geometry.dispose();// probably good enough!

        this.geometry=g;

        this.mesh.geometry=this.geometry;
        this.mesh.position.set(0,0,4)
        // this.mesh.geometry = BufferGeometryUtils.mergeVertices(this.mesh.geometry, 0.1);
        this.mesh.geometry.computeVertexNormals(true)

        // TODO make a geometry atlas of 0-9 and : so I can just translate them instead

    }

    updateScale(){
        // resize numbers to fit when the aspect ratio is narrow:
        let aspect = window.innerWidth / window.innerHeight;
        if (aspect < 1){
            let sc = aspect*0.75;
            this.mesh.scale.set(sc,sc,sc)
        } else {
            this.mesh.scale.set(1,1,1)
        }
    }

}

export {Clock}