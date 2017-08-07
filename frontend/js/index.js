import React, { Component } from 'react'
import { render, findDOMNode } from 'react-dom'
import Stats from 'stats.js';
import dat from 'dat.gui/build/dat.gui.js';

import 'three';
import 'three/OrbitControls';
import 'three/CinematicCamera';
import 'three/BokehShader2'
import 'three/DecalGeometry'

import data from './data.js';
import '../css/index.scss';

import decalDiffuseImg from 'img/canvas/decal-diffuse.png';
import decalNormalImg from 'img/canvas/decal-normal.jpg';
import mapColImg from 'img/canvas/Map-COL.jpg';
import mapSpecImg from 'img/canvas/Map-SPEC.jpg';
import levelImg from 'img/canvas/Infinite-Level_02_Tangent_SmoothUV.jpg';

let container;
let { innerWidth, innerHeight } = window;
const { devicePixelRatio } = window;

let camera, scene, renderer, stats;

let mesh, decal;
let raycaster;
let line;

let intersection = {
  intersects: false,
  point: new THREE.Vector3(),
  normal: new THREE.Vector3(),
};

let controls;
let mouse = new THREE.Vector2();

const textureLoader = new THREE.TextureLoader();
const decalDiffuse = textureLoader.load(decalDiffuseImg);
const decalNormal = textureLoader.load(decalNormalImg);

const decalMaterial = new THREE.MeshPhongMaterial({
  specular: 0x444444,
  map: decalDiffuse,
  normalMap: decalNormal,
  normalScale: new THREE.Vector2(1, 1),
  shininess: 30,
  transparent: true,
  depthTest: true,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -4,
  wireframe: false,
});

let decals = [];
let mouseHelper;
let moved = false;
let position = new THREE.Vector3();
let orientation = new THREE.Euler();
let size = new THREE.Vector3(10, 10, 10);
let up = new THREE.Vector3(0, 1, 0);

const params = {
  minScale: 10,
  maxScale: 20,
  rotate: true,
  clear: () => {
    removeDecals();
  },
};

const removeDecals = () => {
  decals.forEach(item => {
    scene.remove(item);
  });

  decals = [];
};

const loadLeePerrySmith = () => {
  const loader = new THREE.JSONLoader();
  const { geometry } = loader.parse(data);

  const material = new THREE.MeshPhongMaterial({
    specular: 0x111111,
    map: textureLoader.load(mapColImg),
    specularMap: textureLoader.load(mapSpecImg),
    normalMap: textureLoader.load(levelImg),
    shininess: 25,
  });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  mesh.scale.set(10, 10, 10);
};

const checkIntersection = () => {
  if (!mesh) {
    return null;
  }

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([mesh]);

  if (intersects.length > 0) {
    const p = intersects[0].point;
    mouseHelper.position.copy(p);
    intersection.point.copy(p);

    const n = intersects[0].face.normal.clone();
    n.multiplyScalar(10);
    n.add(intersects[0].point);

    intersection.normal.copy(intersects[0].face.normal);
    mouseHelper.lookAt(n);

    line.geometry.vertices[0].copy(intersection.point);
    line.geometry.vertices[1].copy(n);
    line.geometry.verticesNeedUpdate = true;

    intersection.intersects = true;
  } else {
    intersection.intersects = false;
  }
};

const shoot = () => {
  position.copy(intersection.point);
  orientation.copy(mouseHelper.rotation);

  if (params.rotate) {
    orientation.z = Math.random() * 2 * Math.PI;
  }

  const scale = params.minScale + Math.random() * ( params.maxScale - params.minScale );
  size.set(scale, scale, scale);

  const material = decalMaterial.clone();
  material.color.setHex(Math.random() * 0xffffff);

  const m = new THREE.Mesh(new THREE.DecalGeometry(mesh, position, orientation, size), material);

  decals.push(m);
  scene.add(m);
};

class App extends Component {
  constructor(props) {
    super(props);

    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onWheel = this.onWheel.bind(this);
  }

  onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseMove(e) {
  }

  onMouseDown(e) {
    moved = false;
  }
  onTouchMove(e) {
    let x, y;

    if (e.changedTouches) {
      x = e.changedTouches[0].pageX;
      y = e.changedTouches[0].pageY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }

    mouse.x = (x/ window.innerWidth) * 2 -1;
    mouse.y = - (y/ window.innerHeight) * 2 + 1;

    checkIntersection();
  }
  onMouseUp(e) {
    checkIntersection();

    !moved && intersection.intersects && shoot();
  }
  onWheel(e) {

  }

  animate() {
    requestAnimationFrame(this.animate);

    renderer.render(scene, camera);
    stats.update();
  }

  init() {
    container = findDOMNode(this);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(devicePixelRatio);
    renderer.setSize(innerWidth, innerHeight);
    container.appendChild(renderer.domElement);

    stats = new Stats();
    container.appendChild(stats.dom);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 1, 1000);
    camera.position.z = 120;
    camera.target = new THREE.Vector3();

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 50;
    controls.maxDistance = 200;

    scene.add(new THREE.AmbientLight(0x443333));

    let light = new THREE.DirectionalLight(0xffddcc, 1);
    light.position.set(1, 0.75, 0.5);
    scene.add(light);

    light = new THREE.DirectionalLight(0xffddcc, 1);
    light.position.set(-1, 0.75, -0.5);
    scene.add(light);

    const geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(), new THREE.Vector3());

    line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ linewidth: 4 }));
    scene.add(line);

    loadLeePerrySmith();

    raycaster = new THREE.Raycaster();

    mouseHelper = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 10 ), new THREE.MeshNormalMaterial() );
    mouseHelper.visible = false;
    scene.add( mouseHelper );

    window.addEventListener('resize', this.onWindowResize, false);

    controls.addEventListener('change', () => {
      moved = true;
    });

    const gui = new dat.GUI();

    gui.add(params, 'minScale', 1, 30);
    gui.add(params, 'maxScale', 1, 30);
    gui.add(params, 'rotate');
    gui.add(params, 'clear');
    gui.open();

    this.onWindowResize();
    this.animate();
  }

  componentDidMount() {
    this.init();
  }

  render() {
    return (
      <div
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseMove={this.onTouchMove}
        onTouchMove={this.onTouchMove} />
    )
  }
}

render(
  <App />,
  document.getElementById('app')
)
