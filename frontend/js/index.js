import React, { Component } from 'react'
import { render, findDOMNode } from 'react-dom'
import Stats from 'stats.js';
import dat from 'dat.gui/build/dat.gui.js';

import 'three';
import 'three/OrbitControls';
import 'three/CinematicCamera';
import 'three/BokehShader2'

import data from './data.js';
import '../css/index.scss';

document.documentElement.style.fontSize = Math.min(640, Math.max(document.documentElement.clientWidth, 320)) / 320 * 14 + 'px'

let container;
let { innerWidth, innerHeight } = window;
const { devicePixelRatio } = window;

const near = 1e-6;
const far = 1e27;
const mouse = [0.5, 0.5];
const minzoomspeed = 0.015;
const objs = {};

let screenSplit = 0.25;
let screenRight = 0;
let zoompos = -100;

let zoomspeed = minzoomspeed;

let border, stats;
var labelData = [
  { size: .01, scale: 0.0001, label: "microscopic (1µm)" },
  { size: .01, scale: 0.1, label: "minuscule (1mm)" },
  { size: .01, scale: 1.0, label: "tiny (1cm)" },
  { size: 1, scale: 1.0, label: "child-sized (1m)" },
  { size: 10, scale: 1.0, label: "tree-sized (10m)" },
  { size: 100, scale: 1.0, label: "building-sized (100m)" },
  { size: 1000, scale: 1.0, label: "medium (1km)" },
  { size: 10000, scale: 1.0, label: "city-sized (10km)" },
  { size: 3400000, scale: 1.0, label: "moon-sized (3,400 Km)" },
  { size: 12000000, scale: 1.0, label: "planet-sized (12,000 km)" },
  { size: 1400000000, scale: 1.0, label: "sun-sized (1,400,000 km)" },
  { size: 7.47e12, scale: 1.0, label: "solar system-sized (50Au)" },
  { size: 9.4605284e15, scale: 1.0, label: "gargantuan (1 light year)" },
  { size: 3.08567758e16, scale: 1.0, label: "ludicrous (1 parsec)" },
  { size: 1e19, scale: 1.0, label: "mind boggling (1000 light years)" },
  { size: 1.135e21, scale: 1.0, label: "galaxy-sized (120,000 light years)" },
  { size: 9.46e23, scale: 1.0, label: "... (100,000,000 light years)" },
];

const initView = (scene, name, logDepthBuf) => {
  const frameContainer = document.getElementById(`container_${name}`);
  const camera = new THREE.PerspectiveCamera(50, screenSplit * innerWidth / innerHeight, near, far);

  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: logDepthBuf });

  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(innerWidth/2, innerHeight);
  renderer.domElement.style.position = "relative";
  renderer.domElement.id = `renderer_${name}`;
  frameContainer.appendChild(renderer.domElement);

  return {
    container: frameContainer,
    renderer,
    scene,
    camera,
  };
};

const initScene = (font) => {
  const scene = new THREE.Scene();

  scene.add(new THREE.AmbientLight(0x222222));

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(100, 100, 100);
  scene.add(light);

  const materialArgs = {
    color: 0xffffff,
    specular: 0x050505,
    shininess: 50,
    shading: THREE.SmoothShading,
    emissive: 0x000000,
  };

  const meshes = [];
  const geometry = new THREE.SphereBufferGeometry(0.5, 24, 12);

  labelData.forEach((item, i) => {
    const { scale = 1, label, size } = item;
    const labelGeo = new THREE.TextBufferGeometry(label, {
      font,
      size,
      height: size / 2,
    });

    labelGeo.computeBoundingSphere();

    labelGeo.translate(-labelGeo.boundingSphere.radius, 0, 0);
    materialArgs.color = new THREE.Color().setHSL(Math.random(), 0.5, 0.5);

    const material = new THREE.MeshPhongMaterial(materialArgs);
    const group = new THREE.Group();
    group.position.z = -size * scale;
    scene.add(group);

    const textMesh = new THREE.Mesh(labelGeo, material);
    textMesh.scale.set(scale, scale, scale);
    textMesh.position.z = -size * scale;
    textMesh.position.y = size / 4 * scale;
    group.add(textMesh);

    const dotMesh = new THREE.Mesh(geometry, material);
    dotMesh.position.y = -size / 4 * scale;
    dotMesh.scale.multiplyScalar(size * scale);
    group.add(dotMesh);
  });

  return scene;
}

const updateRendererSizes = () => {
  innerHeight = window.innerHeight;
  innerWidth = window.innerWidth;

  screenRight = 1 - screenSplit;

  const { normal = {}, logzbuf = {} } = objs;

  normal.renderer.setSize(screenSplit * innerWidth, innerHeight);
  normal.camera.aspect = screenSplit * innerWidth / innerHeight;
  normal.camera.updateProjectionMatrix();
  normal.camera.setViewOffset(innerWidth, innerHeight, 0, 0, innerWidth * screenSplit, innerHeight);
  normal.container.style.width = `${screenSplit * 100}%`;

  logzbuf.renderer.setSize(screenRight * innerWidth, innerHeight);
  logzbuf.camera.aspect = screenRight * innerWidth / innerHeight;
  logzbuf.camera.updateProjectionMatrix();
  logzbuf.camera.setViewOffset(innerWidth, innerHeight, screenSplit * innerWidth, 0, innerWidth * screenRight, innerHeight);

  logzbuf.container.style.width = `${screenRight * 100}%`;
  border.style.left = `${screenSplit * 100}%`;
}

class App extends Component {
  // constructor(props) {
  //   super(props);

  //   this.animate = this.animate.bind(this);
  //   this.onWindowResize = this.onWindowResize.bind(this);
  //   this.onMouseMove = this.onMouseMove.bind(this);
  //   this.onMouseDown = this.onMouseDown.bind(this);
  //   this.onMouseUp = this.onMouseUp.bind(this);
  //   this.onWheel = this.onWheel.bind(this);
  // }

  // onWindowResize() {
  //   updateRendererSizes();
  // }

  // onMouseMove(e) {
  //   e.stopPropagation();

  //   screenSplit = Math.max(0, Math.min(1, e.clientX / innerWidth));
  // }

  // onMouseDown(e) {
  //   e.stopPropagation();
  //   e.preventDefault();
  // }
  // onMouseUp(e) {

  // }
  // onWheel(e) {

  // }

  // animate() {
  //   requestAnimationFrame(this.animate);

  //   const [ data = {} ] = labelData;
  //   const { length = 0 } = labelData;
  //   const { size, scale } = data;

  //   const minzoom = size * scale;
  //   const maxzoom = labelData[length - 1].size * labelData[length - 1].scale * 100;

  //   let damping = Math.abs(zoomspeed) > minzoomspeed ? 0.95 : 1;

  //   const zoom = THREE.Math.clamp(Math.pow(Math.E, zoompos), minzoom, maxzoom);
  //   zoompos = Math.log(zoom);

  //   if ((zoom == minzoom && zoomspeed < 0) || ( zoom === maxzoom && zoomspeed > 0 )) {
  //     damping = 0.85;
  //   }

  //   zoompos += zoomspeed;
  //   zoomspeed *= damping;

  //   const { normal = {}, logzbuf = {} } = objs;

  //   normal.camera.position.x = Math.sin(0.5 * Math.PI * (mouse[0] - 0.5)) * zoom;
  //   normal.camera.position.y = Math.sin(0.25 * Math.PI * (mouse[1] - 0.5)) * zoom;
  //   normal.camera.position.z = Math.cos(0.5 * Math.PI * (mouse[0] - 0.5)) * zoom;

  //   logzbuf.camera.position.copy(normal.camera.position);
  //   logzbuf.camera.quaternion.copy(normal.camera.quaternion);

  //   if (screenRight != 1 - screenSplit) {
  //     updateRendererSizes();
  //   }

  //   normal.renderer.render(normal.scene, normal.camera);
  //   logzbuf.renderer.render(logzbuf.scene, logzbuf.camera);

  //   stats.update();
  // }

  // init() {
  //   container = findDOMNode(this);

  //   const loader = new THREE.FontLoader();
  //   const font = loader.parse(data);
  //   const scene = initScene(font);

  //   objs.normal = initView(scene, 'normal', false);
  //   objs.logzbuf = initView(scene, 'logzbuf', true);

  //   stats = new Stats();
  //   container.appendChild(stats.dom);

  //   border = document.getElementById('renderer_border');

  //   this.animate();
  // }

  // componentDidMount() {
  //   this.init();
  // }

  render() {
    return (
      <div className="test">
        <div className="item" />
      </div>
    )
  }
}

render(
  <App />,
  document.getElementById('app')
)
