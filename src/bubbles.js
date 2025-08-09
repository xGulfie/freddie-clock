import * as THREE from 'three';
const bubble_count=100
const emitterPos = new THREE.Vector3(0,-25,-10);
const bubbleSpeed = 10
const bubbleMaxY = 50;
const bubbleSpreadX = 50;
const bubbleSpreadZ = 50;
const rotationCount = 8;
var rotatedMaterials=[];

var bubbleEmitter= new THREE.Object3D();
bubbleEmitter.position.copy(emitterPos);

function mix(a,b,r){
    return a + (b-a)*r
}

function createBubbles(){
    const map = new THREE.TextureLoader().load(
        new URL(
        'textures/bubble.png',
        import.meta.url
        )
    );
    const material = new THREE.SpriteMaterial( { map: map, color: 0xffffff, fog:true } );
    
    for (var i = 0 ; i < rotationCount; i++){
        var m = material.clone();
        m.rotation=Math.PI*2 * i/8
        m.spinSpeed=mix(-0.2,0.2,Math.random())
        rotatedMaterials.push(m)
    }
    function pickRandomMat(){
        return rotatedMaterials[Math.floor(Math.random() * 8)]
    }
    for (var i = 0; i < bubble_count; i++){
        const b = new THREE.Sprite(pickRandomMat());
        b.fatness = Math.pow(Math.random(),2)*0.9+0.1;
        const sc = mix(0.2,2,b.fatness)
        b.scale.set(sc,sc,sc)
        b.rotateY(Math.PI * 2 * Math.random())
        b.position.set(Math.random()*bubbleSpreadX - bubbleSpreadX/2,Math.random()*bubbleMaxY,Math.random()*bubbleSpreadZ - bubbleSpreadZ/2)
        bubbleEmitter.add(b);
    }
    return bubbleEmitter;
}

function updateBubbles(dt){
    bubbleEmitter.children.forEach(b=>{
        let spd = Math.pow(mix(1,0.5,b.fatness),3)*2
        b.position.y+=dt*bubbleSpeed * spd;
        if (b.position.y > bubbleMaxY){
            // respawn at a diffrent x,z
            b.position.set(Math.random()*bubbleSpreadX - bubbleSpreadX/2,b.position.y-bubbleMaxY,Math.random()*bubbleSpreadZ - bubbleSpreadZ/2)
        }
    });
    rotatedMaterials.forEach(mat=>{
        mat.rotation += mat.spinSpeed*dt
    })
}

export {createBubbles, updateBubbles}