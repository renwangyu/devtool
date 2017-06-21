import React, { Component } from 'react'
import { render, findDOMNode } from 'react-dom'
import * as THREE from 'three';

import '../css/index.scss';

const { innerHeight, innerWidth, devicePixelRatio } = window;

let renderer = null;
let scene = null;
let camera = null;

const max = 500;
let line = null;
let drawCount;

class App extends Component {

  constructor(props) {
    super(props);

    this.animate = this.animate.bind(this);
  }

  updatePositions() {
    const positions = line.geometry.attributes.position.array;
    let index = 0;
    let x = 0;
    let y = 0;
    let z = 0;

    for (let i = 0, l = max; i < l; i ++ ) {
      positions[ index ++ ] = x;
      positions[ index ++ ] = y;
      positions[ index ++ ] = z;

      x += ( Math.random() - 0.5 ) * 30;
      y += ( Math.random() - 0.5 ) * 30;
      z += ( Math.random() - 0.5 ) * 30;
    }
  }

  animate() {
    window.requestAnimationFrame(this.animate);
    drawCount = (drawCount + 1) % max;
    line.geometry.setDrawRange(0, drawCount);

    if (!drawCount) {
      this.updatePositions();
      line.geometry.attributes.position.needsUpdate = true;
      line.material.color.setHSL(Math.random(), 1, 0.5);
    }

    renderer.render( scene, camera );
  }

  init() {
    const ele = findDOMNode(this);
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ canvas: ele });
    renderer.setPixelRatio(devicePixelRatio);
    renderer.setSize(innerWidth, innerHeight);

    camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 1, 500);
    camera.position.set(0,0,100);
    camera.lookAt(new THREE.Vector3(0,0,0));

    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(max * 3);
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));

    drawCount = 2;
    geometry.setDrawRange(0, drawCount);

    const material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });

    line = new THREE.Line(geometry, material);
    scene.add(line);

    this.updatePositions();

  }

  componentDidMount() {
    this.init();
    this.animate();
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
