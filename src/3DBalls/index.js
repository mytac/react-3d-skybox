import React, { PureComponent } from 'react';
import * as THREE from './jsm/build/three.module.js';
import { OrbitControls } from './jsm/OrbitControls';
import styles from './style.less'

import { EffectComposer } from './jsm/EffectComposer.js';
import { RenderPass } from './jsm/RenderPass.js';
import { ShaderPass } from './jsm/ShaderPass.js';
import { UnrealBloomPass } from './jsm/UnrealBloomPass.js';
import Geometry from './geometry'
import Material from './material'
// import Stats from './common/threejslibs/stats.min.js';
const materials = {};
const meshInfoMap = { // key:球形id，value对应的公司信息

}
let picsIndex = 0;
const params = {
  exposure: 1,
  bloomStrength: 5,
  bloomThreshold: 0,
  bloomRadius: 0,
  scene: 'Scene with Glow',
};

const darkMaterial = new THREE.MeshBasicMaterial({
  color: 'black',
});

const ENTIRE_SCENE = 0;
const BLOOM_SCENE = 1;


export default class ThreeBall extends PureComponent {
  constructor(props) {
    super(props)
    this.hasRender = false

    this.scene = null
    this.bloomLayer = null
    this.controls = null
    this.renderer = null
    this.mouse = new THREE.Vector2()
    this.camera = null
    this.renderScene = null
    this.bloomComposer = null
    this.finalComposer = null
    this.myRef = null
    this.raycaster = null

    this.state = {
      showCanvas: false,
      currentUUID: null,
      showBloack: true
    }
  }

  componentDidMount() {
    this.init()
  }

  /*   componentWillReceiveProps(nextProps) {
      const { showCanvas } = this.state
      if (companyList && companyList.length && !this.hasRender) {
  
        this.init()
        this.hasRender = true
        if (!showCanvas) {
          setTimeout(() => {
            this.setState({
              showCanvas: true
            })
          }, 1500)
        }
      }
    } */


  /* shouldComponentUpdate(){

  } */

  init = () => {
    // 如果是手机端直接返回
    // 判断是否有gpu
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('experimental-webgl');
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const openGlEngine = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    if (!openGlEngine) return; // 没有渲染引擎的直接返回
    if (window.performance.memory) {
      // 如果内存不足512m，直接返回
      const { jsHeapSizeLimit, usedJSHeapSize } = window.performance.memory
      if (jsHeapSizeLimit - usedJSHeapSize < 512000000) {
        return;
      }
    }

    this.gpuScript()
    this.initScene()
  }

  // 开启gpu加速
  gpuScript = () => {
    const scriptEl1 = document.createElement('script')
    const scriptEl2 = document.createElement('script')
    scriptEl1.type = 'x-shader/x-fragment'
    scriptEl2.type = 'x-shader/x-vertex'
    scriptEl1.id = 'fragmentshader'
    scriptEl2.id = 'vertexshader'
    const code1 = `uniform sampler2D baseTexture;
    uniform sampler2D bloomTexture;

    varying vec2 vUv;

    vec4 getTexture( sampler2D texelToLinearTexture ) {

      return mapTexelToLinear( texture2D( texelToLinearTexture , vUv ) );

    }

    void main() {

      gl_FragColor = ( getTexture( baseTexture ) + vec4( 1.0 ) * getTexture( bloomTexture ) );

    }`
    const code2 = `varying vec2 vUv;

    void main() {

      vUv = uv;

      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }`

    try {
      scriptEl2.appendChild(document.createTextNode(code2))
      scriptEl1.appendChild(document.createTextNode(code1))
    } catch (err) {
      scriptEl2.text(code1);
      scriptEl1.text(code1);
    }
    console.log('scriptEl1', scriptEl1)
    window.document.body.appendChild(scriptEl2)
    window.document.body.appendChild(scriptEl1)
  }

  initScene = () => {
    this.scene = new THREE.Scene()
    this.bloomLayer = new THREE.Layers();
    this.bloomLayer.set(BLOOM_SCENE);
    this.raycaster = new THREE.Raycaster();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight * 0.667);
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.myRef.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();

    this.renderer.sortObjects = false;

    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / (window.innerHeight * 0.667),
      45,
      30000
    );
    this.camera.position.set(-900, -200, -900); // 设置相机位置
    this.camera.lookAt(this.scene.position); // 设置相机方向(指向的场景对象)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement); // 创建控件对象
    this.controls.autoRotate = true;

    this.renderer.domElement.addEventListener('mousedown', this.onDocumentMouseMove, false);
    // controls.addEventListener('change', render);
    this.scene.add(new THREE.AmbientLight(0x404040));
    /* this.init(); */
    this.initRenderScene();
    this.setupScene();
  }

  initRenderScene = () => {
    this.renderScene = new RenderPass(this.scene, this.camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight * 0.667),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;

    this.bloomComposer = new EffectComposer(this.renderer);
    this.bloomComposer.renderToScreen = false;
    this.bloomComposer.addPass(this.renderScene);
    this.bloomComposer.addPass(bloomPass);

    const finalPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: {
            value: null,
          },
          bloomTexture: {
            value: this.bloomComposer.renderTarget2.texture,
          },
        },
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent,
        defines: {},
      }),
      'baseTexture'
    );
    finalPass.needsSwap = true;

    this.finalComposer = new EffectComposer(this.renderer);
    this.finalComposer.addPass(this.renderScene);
    this.finalComposer.addPass(finalPass);
  }

  setupScene = () => {
    const { companyList } = this.props
    if (!companyList || !companyList.length) {
      setTimeout(() => {
        this.setupScene()
      }, 100)
      return;
    }
    this.scene.traverse(this.disposeMaterial);
    this.scene.children.length = 0;
    this.renderSkyBox()
    this.renderMyScene();
    this.add6Sphere();
    this.add6Sphere(
      mesh => {
        mesh.translateOnAxis(new THREE.Vector3(-1, 1, 1), 600);
        // mesh.scale.set(0.5, 0.5, 0.5);
      },
      15,
      25,
      false,
      false
    );

    this.add6Sphere(
      mesh => {
        mesh.translateOnAxis(new THREE.Vector3(1, -1, -1), 550);
        // mesh.scale.set(0.5, 0.5, 0.5);
      },
      30,
      25,
      false,
      false
    );

    this.add6Sphere(
      mesh => {
        mesh.translateOnAxis(new THREE.Vector3(1, 0, 0), 550);
        // mesh.scale.set(0.5, 0.5, 0.5);
      },
      30,
      25,
      false,
      false
    );

    this.add6Sphere(
      mesh => {
        mesh.translateOnAxis(new THREE.Vector3(-1, -0.2, 0), 800);
        // mesh.scale.set(0.5, 0.5, 0.5);
      },
      30,
      25,
      false,
      false
    );
  }


  add6Sphere = (transform = () => { }, LONG = 185, size = 100, check = true, renderBall = true) => {
    const { companyList } = this.props
    const ax1 = [ // 14
      [0, 0, 1],
      [0, 0, -1],
      [0, 1, 0],
      [0, -1, 0],
      [1, 0, 0],
      [-1, 0, 0],
      [0.712, 0.712, 0.712],
      [0.712, 0.712, -0.712],
      [0.712, -0.712, 0.712],
      [0.712, -0.712, -0.712],
      [-0.712, 0.712, -0.712],
      [-0.712, 0.712, 0.712],
      [-0.712, -0.712, 0.712],
      [-0.712, -0.712, -0.712],
    ];
    const k = 3;
    // const ax = ax1
    const ax = ax1.map(([x, y, z]) => [x * k, y * k, z * k]);
    // const ax = [...ax1, ...ax2, ...ax3]
    const start = [0, 0, 0];

    for (let i = 0; i < ax.length; i += 1) {
      //  const rm = Math.random() * LONG;
      const rm = 0.5 * LONG;
      const sphere = Geometry.sphere(rm, false);


      const [x, y, z] = ax[i];

      const linemesh = new THREE.Line(
        Geometry.line(
          start,
          ax[i].map(u => u * size)
        ),
        Material.lineMaterial
      );
      transform(linemesh);

      try {
        if (renderBall) {
          const mesh = new THREE.Mesh(
            sphere,
            Material.test2()
            // Material.transparent
          ); // 网格模型对象Mesh
          mesh.position.set(x * size, y * size, z * size);
          transform(mesh);
          if (check && mesh.uuid) {
            meshInfoMap[mesh.uuid] = companyList[picsIndex]

            const innerCube = Geometry.innerCube2(companyList[picsIndex].logo, rm, [
              x * size,
              y * size,
              z * size,
            ]);
            if (picsIndex < companyList.length) {
              picsIndex += 1
            }
            transform(innerCube);
            this.scene.add(innerCube);
          }


          this.scene.add(mesh);
        }


        this.scene.add(linemesh);
      } catch (err) {
        console.log(err)
      }


      // if (Math.random() < 0.25) mesh.layers.enable(BLOOM_SCENE);
    }
  }

  darkenNonBloomed = obj => {
    if (obj.isMesh && this.bloomLayer.test(obj.layers) === false) {
      materials[obj.uuid] = obj.material;
      obj.material = darkMaterial;
    }
  }

  restoreMaterial = obj => {
    if (materials[obj.uuid]) {
      obj.material = materials[obj.uuid];
      delete materials[obj.uuid];
    }
  }

  renderBloom = mask => {
    if (mask === true) {
      this.scene.traverse(this.darkenNonBloomed);
      this.bloomComposer.render();
      this.scene.traverse(this.restoreMaterial);
    } else {
      this.camera.layers.set(BLOOM_SCENE);
      this.bloomComposer.render();
      this.camera.layers.set(ENTIRE_SCENE);
    }
  }

  renderMyScene = () => {
    requestAnimationFrame(this.renderMyScene); // 请求再次执行渲染函数render
    this.renderer.render(this.scene, this.camera); // 执行渲染操作
    this.raycaster.setFromCamera(this.mouse, this.camera);


    this.controls.update();

    switch (params.scene) {
      case 'Scene only':
        this.renderer.render(this.scene, this.camera);
        break;
      case 'Glow only':
        this.renderBloom(false);
        break;
      case 'Scene with Glow':
      default:
        // render scene with bloom
        this.renderBloom(true);
        // render the entire scene, then render bloom scene on top
        this.finalComposer.render();
        break;
    }
  }

  disposeMaterial = obj => {
    if (obj.material) {
      obj.material.dispose();
    }
  }

  onDocumentMouseMove = event => {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / (window.innerHeight * 0.667)) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    /*   if (intersects.length > 0) {
            var obj = intersects[0].object;
            if (prevActive) {
                prevActive.material.color.set("#fff");
            }
            //   obj.material.color.set("#ff0000");
            //   prevActive = obj;
            obj.material.needsUpdate = true;
        } */
    if (intersects.length > 0) {
      const { object } = intersects[0];
      const hasLight = object.layers && object.layers.mask === 3
      this.renderCompanyInfo(hasLight, object.uuid)
      object.layers.toggle(BLOOM_SCENE);
      // render();
    }
  }

  renderCompanyInfo = (hasActive, id) => {
    if (meshInfoMap[id]) {
      this.setState({
        currentUUID: hasActive ? false : id
      })
    }
  }

  renderSkyBox = () => {

    const imageURLs = [
      require('./images/posx.jpg'),
      require('./images/negx.jpg'),
      require('./images/negy.jpg'),
      require('./images/posy.jpg'),
      require('./images/posz.jpg'),
      require('./images/negz.jpg'),
    ]

    const materialArray = []
    imageURLs.forEach(imgs => {
      const texture = new THREE.TextureLoader().load(imgs);
      materialArray.push(
        new THREE.MeshBasicMaterial({
          map: texture,
        })
      );
    });


    for (let i = 0; i < 6; i += 1) materialArray[i].side = THREE.BackSide;

    const skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
    const skybox = new THREE.Mesh(skyboxGeo, materialArray);
    this.scene.add(skybox);
  }

  render() {
    const { showCanvas, currentUUID, showBloack } = this.state
    const info = meshInfoMap[currentUUID] || false
    return (
      <div className={styles.my3DBalls}>
        <div className={'loadWrapper' + showCanvas ? ' hideWrapper' : ''}>
          Loading.....
        </div>
        <div id="WebGL-output" ref={ref => this.myRef = ref}></div>
      </div>
    )
  }
}
