import * as THREE from './jsm/build/three.module.js';
import { Maths } from './utils'

const transDeg = deg => (deg / 360) * 2 * Math.PI;

const Geometry = {
  cube: () => new THREE.BoxGeometry(100, 100, 100),
  sphere: (num = 60, scale = false) => {
    const geometry = new THREE.SphereGeometry(num, 40, 40);
    if (!scale) return geometry;
    const s = Math.random().toFixed(2);
    // geometry.scale(s, s, s);
    return geometry;
  },
  innerCube2: (img, r, p, angle = 60) => {
    const width = Maths.sin(angle) * r * 1.5;
    const height = Maths.cos(angle) * r * 1.5;
    const depth = 0.1;
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);

    /* geometry.clearGroups();
            geometry.addGroup(0, Infinity, 0);
            geometry.addGroup(0, Infinity, 1); */

    const [x, y, z] = p;
    const texture = new THREE.TextureLoader().load(img);
    const material1 = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      color: '#fff'
    });
    const material0 = new THREE.MeshBasicMaterial({
      color: 'orange',
      transparent: true,
    });
    const materials = [material0, material1];
    const mesh = new THREE.Mesh(geometry, material1); // 网格模型对象Mesh
    mesh.position.set(x, y, z);
    return mesh;
  },
  innerCube: (img, r, p, angle = 15) => {
    const width = 10;
    const height = 10;
    const depth = 0.1;
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);

    const [x, y, z] = p;

    const texture = new THREE.TextureLoader().load(img);
    const material1 = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });
    const material0 = new THREE.MeshPhysicalMaterial({
      emissive: '#fff',
      emissiveMap: texture,
      transparent: true,
      // side: THREE.DoubleSide,
    });
    const materials = [material0, material1];
    const mesh = new THREE.Mesh(geometry, material0); // 网格模型对象Mesh
    mesh.position.set(x * r, y * r, z * r);
    const rotateAngle = Math.PI / 2 - transDeg(angle);
    // console.log(angle, rotateAngle);

    mesh.rotateY(rotateAngle);
    // mesh.rotation.y -= Math.PI / 4;

    const myEdgeMesh = Geometry.egdes(mesh);
    myEdgeMesh.position.set(x * r, y * r, z * r);
    myEdgeMesh.rotateY(rotateAngle);

    const group = new THREE.Group();
    group.add(mesh);
    group.add(myEdgeMesh);

    return group;
  },
  egdes: mesh => {
    const geometry = new THREE.EdgesGeometry(mesh.geometry);

    const material = new THREE.LineBasicMaterial({
      ambient: 0xffffff,
      color: 0xffffff,
    });

    const wireframe = new THREE.LineSegments(geometry, material);
    return wireframe;
  },

  line: (a = [0, 0, 0], b = [50, 50, 50]) => {
    const line = new THREE.BufferGeometry();
    const vertices = new Float32Array([...a, ...b]);
    const attribue = new THREE.BufferAttribute(vertices, 3);
    line.attributes.position = attribue;
    return line;
  },
  square: () => {
    const geometry = new THREE.Geometry(); // 声明一个几何体对象Geometry

    const p1 = new THREE.Vector3(0, 0, 0); // 顶点1坐标
    const p2 = new THREE.Vector3(0, 100, 0); // 顶点2坐标
    const p3 = new THREE.Vector3(100, 0, 0); // 顶点3坐标
    const p4 = new THREE.Vector3(100, 100, 0); // 顶点4坐标
    // 顶点坐标添加到geometry对象
    geometry.vertices.push(p1, p2, p3, p4);

    // Face3构造函数创建一个三角面
    const face1 = new THREE.Vector3(0, 1, 2);
    // 三角面每个顶点的法向量
    const n1 = new THREE.Vector3(0, 0, -1); // 三角面Face1顶点1的法向量
    const n2 = new THREE.Vector3(0, 0, -1); // 三角面2Face2顶点2的法向量
    const n3 = new THREE.Vector3(0, 0, -1); // 三角面3Face3顶点3的法向量
    const n4 = new THREE.Vector3(0, 0, -1); // 三角面3Face3顶点3的法向量
    // 设置三角面Face3三个顶点的法向量
    face1.vertexNormals.push(n1, n2, n3, n4);
    // 三角面face1、face2添加到几何体中
    geometry.faces.push(face1);

    return geometry;
  },
  vector1: () => {
    const geometry = new THREE.Geometry();
    const p1 = new THREE.Vector3(50, 0, 0); // 顶点1坐标
    const p2 = new THREE.Vector3(0, 70, 0); // 顶点2坐标
    const p3 = new THREE.Vector3(80, 70, 0); // 顶点3坐标
    geometry.vertices.push(p1, p2, p3);
    const color1 = new THREE.Color(0x00ff00); // 顶点1颜色——绿色
    const color2 = new THREE.Color(0xff0000); // 顶点2颜色——红色
    const color3 = new THREE.Color(0x0000ff); // 顶点3颜色——蓝色
    // 顶点颜色数据添加到geometry对象
    geometry.colors.push(color1, color2, color3);
    return geometry;
  },
};

export default Geometry
