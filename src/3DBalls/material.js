import * as THREE from './jsm/build/three.module.js';

const Material = {
    // 材质对象Material
    default: () =>
        new THREE.MeshLambertMaterial({
            color: 'white',
        }),
    transparent: () =>
        new THREE.MeshBasicMaterial({
            color: 'white',
            opacity: 0.15,
            transparent: true,
            side: THREE.DoubleSide,
        }),
    highLight: () =>
        new THREE.MeshPhongMaterial({
            color: '#fff',
            specular: 0x4488ee,
            shininess: 20,
            transparent: true,
            opacity: 0.35,
        }),
    imgMaterial: IMG => {
        const texture = new THREE.TextureLoader().load(IMG);
        console.log('IMG', IMG);
        return new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide, // 两面可见
            transparent: true,
            // lights: true,
            map: texture,
            opacity: 0.05,
            color: '#fff',
        });
    },
    lineMaterial: new THREE.LineBasicMaterial({
        color: 'white', // 线条颜色
    }),

    test1(img, urls = []) { // 月球
        /* var reflectionCube = new THREE.CubeTextureLoader()
            .load(urls);
        reflectionCube.encoding = THREE.sRGBEncoding; */

        const imgTexture = new THREE.TextureLoader().load(img);
        /* imgTexture.wrapS = imgTexture.wrapT = THREE.RepeatWrapping;
        imgTexture.encoding = THREE.sRGBEncoding;
        imgTexture.anisotropy = 16;
        imgTexture = null; */
        const material = new THREE.MeshBasicMaterial({
            map: imgTexture,
            color: '#fff',
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide, // 两面可见
        });
        return material
    },
    test2() { // 灯泡
        const color = new THREE.Color();
        color.setHSL(Math.random(), 0.7, Math.random() * 0.2 + 0.05);
        const material = new THREE.MeshBasicMaterial({
            color: '#fff',
            // color: color,
            transparent: true,
            opacity: 0.3
        });
        return material
    },
    vertexColors: () =>
        new THREE.MeshBasicMaterial({
            // color: 0x0000ff,
            vertexColors: THREE.FaceColors,
            // wireframe:true,//线框模式渲染
        }),
};

export default Material
