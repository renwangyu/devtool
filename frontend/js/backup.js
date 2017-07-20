import React, { Component } from 'react'
import { render, findDOMNode } from 'react-dom'
import * as THREE from 'three';
import Stats from 'stats.js';

import data from './data.js';
import '../css/index.scss';

const { innerHeight, innerWidth, devicePixelRatio } = window;
let scene, camera, pointLight;
let renderer, mixer, animationClip;

const clock = new THREE.Clock();
const stats = new Stats();

class App extends Component {

  constructor(props) {
    super(props);

    this.animate = this.animate.bind(this);
  }

  animate() {
    window.requestAnimationFrame(this.animate);
    mixer.update( clock.getDelta() );
    stats.update();

    renderer.render(scene, camera);
  }

  init() {
    const ele = findDOMNode(this);
    ele.appendChild(stats.dom);

    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: ele });
    renderer.setClearColor = (0x000000, 1);
    renderer.setPixelRatio(devicePixelRatio);
    renderer.setSize(innerWidth, innerHeight);

    scene = new THREE.Scene();

    const grid = new THREE.GridHelper(20, 20, 0x888888, 0x888888);
    grid.position.set(0, -1.1, 0);
    scene.add(grid);

    camera = new THREE.PerspectiveCamera(40, innerWidth/innerHeight, 1, 100);
    camera.position.set(-5, 3.43, 11.31);
    camera.lookAt(new THREE.Vector3(-1.22, 2.18, 4.58));

    scene.add(new THREE.AmbientLight(0x404040));

    pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.copy(camera.position);
    scene.add(pointLight);

    new THREE.ObjectLoader().parse(data, (model) => {
      scene.add(model);
      mixer = new THREE.AnimationMixer(model);
      mixer.clipAction(model.animations[0]).play();
      
      this.animate();
    })
  }

  componentDidMount() {
    this.init();
  }

  render() {
    return (
      <canvas>app</canvas>
    )
  }
}

render(
  <App />,
  document.getElementById('app')
)
