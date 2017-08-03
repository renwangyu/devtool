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

let container;
let { innerWidth, innerHeight } = window;
const { devicePixelRatio } = window;

let camera, scene, renderer;
let group, mode;
let stats;

let startTime, time;

class App extends Component {
  constructor(props) {
    super(props);

    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
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
  }
  onMouseUp(e) {

  }
  onWheel(e) {

  }

  animate() {
    requestAnimationFrame(this.animate);

    const { children = [] } = group;

    children.forEach((child) => {
      const { material } = child;

      material.clippingPlanes.forEach((plane, i) => {
        const { constant } = plane;
        const { clipPosition } = mode;

        plane.constant = (constant * 49 + clipPosition ) / 50;
      });
    });

    stats.begin();
    renderer.render(scene, camera);
    stats.end();
  }

  init() {
    container = findDOMNode(this);

    camera = new THREE.PerspectiveCamera(40, innerWidth/innerHeight, 1, 800);
    camera.position.set(-20, 10, 50);
    camera.lookAt(new THREE.Vector3(0,0,0));

    scene = new THREE.Scene();

    const light = new THREE.HemisphereLight(0x009999, 0xffff00, 1);
    scene.add(light);

    const clipPlanes = [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),
      new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
      new THREE.Plane(new THREE.Vector3(0, 0, -1), 0),
    ];

    scene.add(new THREE.AmbientLight(0x505050));
    group = new THREE.Object3D();

    for (let v = 1; v < 25; v++) {
      const gemotry = new THREE.SphereBufferGeometry(v/2, 48, 48);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(Math.sin(v * 0.5) * 0.5 + 0.5, Math.cos(v * 1.5) * 0.5 + 0.5, Math.sin(v * 4.5) * 0.5 + 0.5),
        roughness: 0.95,
        metalness: 0,
        side: THREE.DoubleSide,
        clippingPlanes: clipPlanes,
        clipIntersection: true,
      });

      group.add(new THREE.Mesh(gemotry, material));
    }

    scene.add(group);

    renderer = new THREE.WebGLRenderer();
    renderer.antialias = true;
    renderer.setPixelRatio(devicePixelRatio);
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(0x222222);
    renderer.localClippingEnabled = true;

    window.addEventListener('resize', this.onWindowResize, false);
    container.appendChild(renderer.domElement);

    stats = new Stats();
    container.appendChild(stats.dom);

    mode = {};
    mode.clipIntersection = true;
    mode.clipPosition = 0;

    const gui = new dat.GUI();
    gui.add(mode, 'clipIntersection').onChange(() => {
      const { children = [] } = group;

      children.forEach(child => {
        child.material.clipIntersection = !child.material.clipIntersection;
      });
    });

    gui.add(mode, 'clipPosition', -16, 16);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.update();

    startTime = Date.now();
    time = 0;

    this.animate();
  }

  componentDidMount() {
    this.init();
  }

  render() {
    return (
      <div />
    )
  }
}

render(
  <App />,
  document.getElementById('app')
)
