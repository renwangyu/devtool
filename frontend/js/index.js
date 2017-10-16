import React, { Component } from 'react'
import { render } from 'react-dom'

import { createDonut, cShader, cProgram, cVBO, cIBO, cTexture, setAttr } from './func';

import '../css/index.scss';

import ed from '../img/ed.jpg';
import bg from '../img/bg.png';
import word from '../img/word.png';

let count = 0;

function renderGl(gl, position = [], mMatrix, mvpMatrix, tmpMatrix, prgLocation, index, rad) {
  if (!gl || !position.length) {
    return null;
  }

  const [x = 0, y = 0, z = 0] = position;

  mMatrix.makeRotationAxis(new THREE.Vector3(0, 1, 0).normalize(), 0);
  mMatrix.setPosition(new THREE.Vector3(x, y, z));
  mvpMatrix.multiplyMatrices(tmpMatrix, mMatrix);

  gl.uniformMatrix4fv(prgLocation, false, mvpMatrix.elements);
  gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
}

const animation = (gl, mMatrix, tmpMatrix, mvpMatrix, uniLocation, index, list) => {
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);

  count += 0.01;

  const invMatrix = new THREE.Matrix4();
  const rad = (count % 360) * Math.PI;
  const x = Math.cos(rad);
  const y = Math.sin(rad);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, list[0]);
  gl.uniform1i(uniLocation[1], 0);

  // gl.activeTexture(gl.TEXTURE1);
  // gl.bindTexture(gl.TEXTURE_2D, list[1]);
  // gl.uniform1i(uniLocation[2], 1);
  
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  // renderGl(gl, [0, 0, 0], mMatrix, mvpMatrix, tmpMatrix, uniLocation[0], index, 0);

  mMatrix.makeRotationAxis(new THREE.Vector3(0, 0, 1).normalize(), 0);
  // mMatrix.scale(new THREE.Vector3(y, y, 1));
  // mMatrix.setPosition(new THREE.Vector3(0, x, 0));
  mvpMatrix.multiplyMatrices(tmpMatrix, mMatrix);

  gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix.elements);
  gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  // renderGl(gl, [-3.75, 3, 0], mMatrix, mvpMatrix, tmpMatrix, uniLocation[0], index, rad);

  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  // renderGl(gl, [-1.25, 3, 0], mMatrix, mvpMatrix, tmpMatrix, uniLocation[0], index, rad);

  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAP_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  // gl.texParameteri(gl.TEXTURE_2d, gl.TEXTURE_WRAP_T, gl.REPEAT);
  // renderGl(gl, [1.25, 3, 0], mMatrix, mvpMatrix, tmpMatrix, uniLocation[0], index, rad);

  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  // renderGl(gl, [3.75, 3, 0], mMatrix, mvpMatrix, tmpMatrix, uniLocation[0], index, rad);

  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAR);
  // renderGl(gl, [6.25, 3, 0], mMatrix, mvpMatrix, tmpMatrix, uniLocation[0], index, rad);

  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  // renderGl(gl, [-2.5, -3, 0], mMatrix, mvpMatrix, tmpMatrix, uniLocation[0], index, rad);
  
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
  // renderGl(gl, [0, -3, 0], mMatrix, mvpMatrix, tmpMatrix, uniLocation[0], index, rad);
  
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // renderGl(gl, [2.5, -7.28, 0], mMatrix, mvpMatrix, tmpMatrix, uniLocation[0], index, rad);

  gl.flush();

  window.requestAnimationFrame(
    () => animation(gl, mMatrix, tmpMatrix, mvpMatrix, uniLocation, index, list)
  );
};

class App extends Component {
  componentDidMount() {
    const cvs = document.getElementById('canvas');
    const gl = cvs.getContext('webgl');

    const VSHADER_SOURCE = `
      attribute vec3 position;
      attribute vec4 color;
      attribute vec2 textureCoord;

      uniform mat4 mvpMatrix;
      varying vec4 vColor;
      varying vec2 vTextureCoord;

      void main(void) {
        vColor = color;
        vTextureCoord = textureCoord;

        gl_Position = mvpMatrix * vec4(position, 1.0);
      }
    `;

    const FSHADER_SOURCE = `
      precision mediump float;

      uniform sampler2D texture0;
      uniform sampler2D texture1;

      varying vec4 vColor;
      varying vec2 vTextureCoord;

      void main(void) {
        vec4 smpColor0 = texture2D(texture0, vTextureCoord);
        mat4 smpColor1 = mat4(
          -1.0, -1.0, -1.0, -1.0,
          -1.0, -1.0, -1.0, -1.0,
          -1.0, -1.0, -1.0, -1.0,
          -1.0, -1.0, -1.0, 1.0
        );
        gl_FragColor = vColor * smpColor0
        ;
      }
    `;

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clearDepth(1.0);

    gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);

    const vShader = cShader(gl, VSHADER_SOURCE);
    const fShader = cShader(gl, FSHADER_SOURCE, gl.FRAGMENT_SHADER);
    const program = cProgram(gl, vShader, fShader);

    const aLocation = [];
    const aStride = [3, 4, 2];

    aLocation[0] = gl.getAttribLocation(program, 'position');
    aLocation[1] = gl.getAttribLocation(program, 'color');
    aLocation[2] = gl.getAttribLocation(program, 'textureCoord');

    const position = [
      -1.0, 1.0, 0.0,
      1.0, 1.0, 0.0,
      -1.0, -1.0, 0.0,
      1.0, -1.0, 0.0,
    ];

    const color = [
      1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0,
    ];

    const textureCoord = [
      0, 0,
      1, 0,
      0, 1,
      1, 1,
    ];

    const index = [
      0, 1, 2,
      3, 2, 1,
    ];

    const positionVBO = cVBO(gl, position);
    const colorVBO = cVBO(gl, color);
    const coordVBO = cVBO(gl, textureCoord);
    const VBOList = [positionVBO, colorVBO, coordVBO];

    setAttr(gl, VBOList, aLocation, aStride);

    const ibo = cIBO(gl, index);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

    const uniLocation = [];

    uniLocation.push(gl.getUniformLocation(program, 'mvpMatrix'))
    uniLocation.push(gl.getUniformLocation(program, 'texture0'))
    uniLocation.push(gl.getUniformLocation(program, 'texture1'))

    let mMatrix = new THREE.Matrix4();
    const vMatrix = new THREE.Matrix4();
    const pMatrix = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const tmpMatrix = new THREE.Matrix4();
    const mvpMatrix = new THREE.Matrix4();

    vMatrix.watchAt(
      new THREE.Vector3(0, 0, 10),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0),
    );
    tmpMatrix.multiplyMatrices(pMatrix.projectionMatrix, vMatrix);

    cTexture(gl, ed,
      list => animation(gl, mMatrix, tmpMatrix, mvpMatrix, uniLocation, index, list)
    );
  }

  render() {
    return (
      <canvas id="canvas" width="1600" height="1600" />
    )
  }
}

render(
  <App />,
  document.getElementById('app')
)
