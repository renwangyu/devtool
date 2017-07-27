import React, { Component } from 'react'
import { render, findDOMNode } from 'react-dom'
import Stats from 'stats.js';
import dat from 'dat.gui/build/dat.gui.js';

import 'three';
import 'three/OrbitControls';

import data from './data.js';
import '../css/index.scss';

let container;
let { innerWidth, innerHeight } = window;
const { devicePixelRatio } = window;

let camera, scene, renderer, raycaster, intersected;
const mouse = new THREE.Vector2();
const radius = 100;
const theta = 0;

class App extends Component {

  constructor(props) {
    super(props);

    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseMove(e) {
    e.preventDefault();

    const { clientX, clientY } = e;

    mouse.x = clientX * 2 / window.innerWidth - 1;
    mouse.y = clientY * 2 / window.innerHeight - 1;
  }

  animate() {
    requestAnimationFrame(this.animate, renderer);

    theta += 0.1;

    camera.position.x = radius * Math.sin( THREE.Math.degToRad(theta) );
    camera.position.y = radius * Math.sin( THREE.Math.degToRad(theta) );
    camera.position.z = radius * Math.cos( THREE.Math.degToRad(theta) );
    camera.lookAt(scene.position);

    camera.updateMatirxWorld();

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
      const targetDistance = intersects[0].distance;
    }

    stats.update();
  }

  init() {
    container = findDOMNode(this);

    camera = new THREE.CinematicCamera(60, innerWidth/innerHeight, 1, 100);
    camera.setLens(5);
    camera.position.set(2, 1, 500);

    scene = new THREE.Scene();
    scene.add( new THREE.AmbinetLight(0xffffff, 0.3) );

    const light = new THREE.DirectionalLight(0xffffff, 0.35);
    light.position.set(1,1,1).normalize();
    scene.add(light);

    const geometry = new THREE.BoxGeometry(20, 20, 20);

    for (let v = 0; v < 1500; v += 1) {
      const obj = new THREE.Mesh(geometry, new THREE.MeshLamberMaterial({ color: Math.random() * 0xffffff }));

      obj.position.x = Math.random() * 800 - 400;
      obj.position.y = Math.random() * 800 - 400;
      obj.position.z = Math.random() * 800 - 400;

      scene.add(obj);
    }

    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xf0f0f0);
    renderer.setPixelRatio(devicePixelRatio);
    renderer.setSize(innerWidth, innerHeight);
    renderer.sortObjects = false;
    conatiner.appendChild(renderer.domElement);

    stas = new Stats();

    container.appendChild(stas.dom);

    const effectController = {
      focalLength: 15,
      fstop: 2.8,
      showFocus: false,
      focalDepth: 3,
    };

    const matChanger = () => {
      for (let attr in effectController) {
        attr in camera.postprocessing.bokeh_uniforms && camera.postprocessing.bokeh_uniforms[attr].value = effectController[attr];
      }

      camera.postprocessing.bokeh_uniforms.znear.value = camera.near;
      camera.postprocessing.bokeh_uniforms.zfar.value = camera.far;
      camera.setLens( effectController.focalLength, camera.frameHeight, effectController.fstop, camera.coc );
      effectController['focalDepth'] = camera.postprocessing.bokeh_uniforms['focalDepth'].value;
    }

    const gui = new dat.GUI();

    gui.add(effectController, 'focalLength', 1, 135, 0.01).onChange(matChanger);
    gui.add(effectController, 'fstop', 1.8, 22, 0.01).onChange(matChanger);
    gui.add(effectController, 'focalDepth', 0.1, 100, 0.001).onChange(matChanger);
    gui.add(effectController, 'showFocus', true).onChange(matChanger);

    matChanger();

    this.animate();

    window.addEventListener('resize', this.onWindowResize, false);
  }

  componentDidMount() {
    this.init();
  }

  render() {
    return (
      <div tabIndex="1" onMouseMove={this.onMouseMove}/>
    )
  }
}

render(
  <App />,
  document.getElementById('app')
)
