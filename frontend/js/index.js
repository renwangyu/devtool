import React, { Component } from 'react'
import { render, findDOMNode } from 'react-dom'
import Stats from 'stats.js';
import dat from 'dat.gui/build/dat.gui.js';

import 'three';
import 'three/OrbitControls';

import data from './data.js';
import '../css/index.scss';

const { innerHeight, innerWidth, devicePixelRatio } = window;
const FLOOR = -250;

let container, stats;

let camera, scene;
let renderer;

let mesh, mesh2, helper;

let mixer, facesClip, bonesClip;

let mouseX = 0, mouseY = 0;

let windowHalfX = innerHeight / 2;
let windowHalfY = innerHeight / 2;

const clock = new THREE.Clock();

const onResize = () => {
  windowHalfY = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

const createScene = (geometry, materials, x, y, z, s) => {
  geometry.computeBoundingBox();

  const bb = geometry.boundingBox;

  materials.forEach((m, i) => {
    m.skinning = true;
    m.morphTargets = true;

    m.specular.setHSL(0, 0, 0.1);
    m.color.setHSL(0.6, 0, 0.6);
  });

  mesh = new THREE.SkinnedMesh(geometry, materials);
  mesh.name = 'Knight Mesh';
  mesh.position.set(x, y - bb.min.y * s, z);
  mesh.scale.set(s, s, s);
  scene.add(mesh);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  mesh2 = new THREE.SkinnedMesh(geometry, materials);
  mesh2.name = 'Lil\' Bro Mesh';
  mesh2.position.set(x - 240, y - bb.min.y * s, z + 500);
  mesh2.scale.set(s/2, s/2, s/2);
  mesh2.rotation.y = THREE.Math.degToRad(60);

  mesh2.visible = false;

  mesh2.castShadow = true;
  mesh2.receiveShadow = true;
  scene.add(mesh2);

  helper = new THREE.SkeletonHelper(mesh);
  helper.material.linewidth = 3;
  helper.visible = false;
  scene.add(helper);

  mixer = new THREE.AnimationMixer(mesh);
  bonesClip = geometry.animations[0];
  facesClip = THREE.AnimationClip.CreateFromMorphTargetSequence('facialExpressions', mesh.geometry.morphTargets, 3);
}

const initGUI = () => {
  let API = {
    'show model': true,
    'show skeleton': false,
    'show 2nd model': false,
  };

  const gui = new dat.GUI();

  gui.add(API, 'show model').onChange(() => {
    mesh.visible = API['show model'];
  });

  gui.add(API, 'show skeleton').onChange(() => {
    helper.visible = API['show skeleton'];
  });

  gui.add(API, 'show 2nd model').onChange(() => {
    mesh2.visible = API['show 2nd model'];
  });

  const objectNames = (objects) => objects.map(obj => obj && obj.name || '&lt;null&gt;');

  const clipControl = (gui, mixer, clip, rootObjects) => {
    const folder = gui.addFolder(`Clip'${clip.name}`);
    const [root] = rootObjects;

    let rootNames = objectNames(rootObjects);
    let action = null;

    API = {
      'play()': () => {
        action = mixer.clipAction(clip, root);
        action.stop();
      },
      'stop()': () => {
        action: mixer.clipAction(clip, root);
        action.reset();
      }

      get 'time = '() => {
        return action !== null ? action.time : 0;
      }

      set 'time ='(value) {
        action = mixer.clipAction(clip, root);
        action.time = value;
      }

      get 'paused ='() {
        return action !== null && action.paused;
      }

      set 'paused ='(value) {
        action = mixer.clipAction(clip, root);
        action.paused = value;
      }

      get 'enabled ='() {
        return action !== null && action.enabled;
      }

      set 'enabled ='(value) {
        action = mixer.clipAction(clip, root);
        action.enabled = value;
      }

      get 'clamp ='() {
        return action !== null ? action.clampWhenFinished : false;
      }

      set 'clamp ='(value) {
        action = mixer.clipAction(clip, root);
        action.clampWhenFinished = value;
      }

      get 'isRunning() ='() {
        return action !== null && action.isRunning();
      }

      set 'isRunning() ='(value) {
        alert('Read only - this is the result of a method.');
      }

      'play delayed': () => {
        action = mixer.clipAction(clip, root);
      }

      get 'weight ='() {
        return action !== null ? action.weight : 1;
      }

      set 'weight ='(value) {
        action = mixer.clipAction(clip, root);
        action.weight = value;
      }

      get 'eff. weight'() {
        return action !== null ? action.getEffectiveWeight() : 1;
      }

      set 'eff. weight'(value) {
        action = mixer.clipAction(clip, root);
        action.setEffectiveWeight(value)
      }

      'fade in': () => {
        action = action.clipAction(clip, root);
        action.reset().fadeIn(0.25).play();
      }

      'fade out': () => {
        action = mixer.clipAction(clip, root);
        action.fadeOut(0.25).play();
      }

      get 'timeScale ='() {
        return action !== null ? action.timeScale : 1;
      }

      set 'timeScale ='(value) {
        action = mixer.clipAction(clip, root);
        action.timeScale = value;
      } 

      get 'eff.T.Scale'() {
        return action !== action.getEffectiveTimeScale() : 1;
      }

      set 'eff.T.Scale'(value) {
        action = mixer.clipAction(clip, root);
        action.setEffectiveTimeScale(value);
      }

      'time warp': () => {
        action = mixer.clipAction(clip, root);

        const timeScaleNow = action.getEffectiveTimeScale();
        const destTimeScale = timeScaleNow > 0 ? -1 : 1;

        action.warp(timeScaleNow, destTimeScale, 4).play();
      }

      get 'loop mode'() {
        return action !== null ? action.loop : THREE.LoopRepeat;
      }

      set 'loop mode'(value) {
        active = mixer.clipAction(clip, root);
        action.loop = +value;
      }

      get 'repetitions'() {
        return action !== null ? action.repetitions : Infinity;
      }

      set 'repetitions'(value) {
        action = mixer.clipAction(clip, root);
        action.repetitions = +value;
      }

      get 'local root'() {
        return rootName;
      }

      set 'local root'(value) {
        rootName = value;
        root = rootObjects[rootNames.indexOf(rootName)];
        action = mixer.clipAction(clip, root);
      }
    }
  }
}

class App extends Component {

  constructor(props) {
    super(props);

    this.animate = this.animate.bind(this);
  }

  animate() {
  }

  init() {
    container = findDOMNode(this);

    camera = new THREE.PerspectiveCamera(30, innerWidth/innerHeight, 1, 10000);
    camera.position.z = 2200;

    scene = new THREE.Scene();

    scene.fog = new THREE.Fog(0xffffff, 2000, 10000);
    scene.add(camera);

    const geometry = new THREE.PlaneBufferGeometry(16000, 16000);
    const material = new THREE.MeshPhongMaterial({ emissive: 0x888888 });

    const ground = new THREE.Mesh(geometry, material);
    ground.position.set(0, FLOOR, 0);
    ground.rotation.x = -Math.PI/2;
    scene.add(ground);

    ground.receiveShadow = true;

    //lights
    scene.add( new THREE.HemisphereLight(0x111111, 0x444444) );

    const light = new THREE.DirectionalLight(0xebf3ff, 1.5);
    light.position.set(0, 140, 500).multiplyScalar(1.1);
    scene.add(light);

    light.castShadow = true;

    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    const d = 390;

    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d * 1.5;
    light.shadow.camera.far = 3500;

    //renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(scene.fog.color);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(innerWidth, innerHeight);
    renderer.domElement.style.position = 'relative';

    container.appendChild(renderer.domElement);

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMap.enabled = true;

    //stats

    stats = new Stats();
    container.appendChild(stats.dom);

    new THREE.JSONLoader().load('https://threejs.org/examples/models/skinned/knight.js', (geometry, materials) => {
      createScene(geometry, materials, 0, FLOOR, -300, 60);

      initGUI();
    });

    this.animate();

    window.addEventListener('resize', onResize, false);
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
