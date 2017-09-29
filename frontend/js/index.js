import React, { Component } from 'react'
import { render } from 'react-dom'
import 'three';

import '../css/index.scss';

THREE.Matrix4.prototype.watchAt = function(eye, center, up) {
  this.lookAt(eye, center, up);

  const { elements = [] } = this;
  const { x = 0, y = 0, z = 0 } = eye;

  const x0 = elements[0];
  const x1 = elements[1];
  const x2 = elements[2];

  const y0 = elements[4];
  const y1 = elements[5];
  const y2 = elements[6];

  const z0 = elements[8];
  const z1 = elements[9];
  const z2 = elements[10];

  this.elements = [
    x0, y0, z0, 0,
    x1, y1, z1, 0,
    x2, y2, z2, 0,
    -(x0 * x + x1 * y + x2 * z), -(y0 * x + y1 * y + y2 * z), -(z0 * x + z1 * y + z2 * z), 1,
  ];

  return this;
};

const cShader = (gl, str, type = gl.VERTEX_SHADER) => {
  if (!str || !gl) {
    return null;
  }

  const shader = gl.createShader(type);

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) && shader;
};

const cProgram = (gl, ...list) => {
  const program = gl.createProgram();

  const { length } = list;

  for (let v = 0; v < length; v += 1) {
    const shader = list[v];

    gl.attachShader(program, shader);
  }

  gl.linkProgram(program);
  gl.useProgram(program);

  return program;

  // return gl.getProgramParameter(program, gl.LINK_STATUS) && program;
};

const cVBO = (gl, data = []) => {
  const vbo = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return vbo;
};

const setAttr = (gl, vbo, location, stride) => {
  const { length = 0 } = vbo;

  for(let v = 0; v < length; v += 1) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo[v]);
    gl.enableVertexAttribArray(location[v]);
    gl.vertexAttribPointer(location[v], stride[v], gl.FLOAT, false, 0, 0);
  }
}

class App extends Component {
  componentDidMount() {
    const cvs = document.getElementById('canvas');
    const gl = cvs.getContext('webgl');

    const VSHADER_SOURCE = `
      attribute vec3 position;
      attribute vec4 color;
      uniform mat4 mvpMatrix;
      varying vec4 vColor;

      void main() {
        vColor = color;
        gl_Position = mvpMatrix * vec4(position, 1.0);
      }
    `;

    const FSHADER_SOURCE = `
      precision mediump float;
      varying vec4 vColor;

      void main() {
        gl_FragColor = vColor;
      }
    `;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);

    const vShader = cShader(gl, VSHADER_SOURCE);
    const fShader = cShader(gl, FSHADER_SOURCE, gl.FRAGMENT_SHADER);
    const program = cProgram(gl, vShader, fShader);

    const aLocation = [];
    const aStride = [3, 4];

    aLocation[0] = gl.getAttribLocation(program, 'position');
    aLocation[1] = gl.getAttribLocation(program, 'color');

    const position = [
      0.0, 1.0, 0.0,
      1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0,
    ];

    const color = [
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0,
    ];

    const positionVBO = cVBO(gl, position);
    const colorVBO = cVBO(gl, color);

    setAttr(gl, [positionVBO, colorVBO], aLocation, aStride);

    const uniLocation = gl.getUniformLocation(program, 'mvpMatrix');

    let mMatrix = new THREE.Matrix4();
    const vMatrix = new THREE.Matrix4();
    const pMatrix = new THREE.PerspectiveCamera(90, 1, 0.1, 100);
    const tmpMatrix = new THREE.Matrix4();
    const mvpMatrix = new THREE.Matrix4();

    // pMatrix.position.copy(new THREE.Vector3(0.0, 0.0, 3.0));
    // pMatrix.up.copy(new THREE.Vector3(0, 1, 0));

    // const res =  pMatrix.watchAt(new THREE.Vector3(0, 0, 0));

    vMatrix.watchAt(
      new THREE.Vector3(0, 0, 100),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0),
    );
    tmpMatrix.multiplyMatrices(pMatrix.projectionMatrix, vMatrix);
    mMatrix.makeTranslation(1.5, 0.0, 0.0);

    mvpMatrix.multiplyMatrices(tmpMatrix, mMatrix);

    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    mMatrix = new THREE.Matrix4();
    mMatrix.makeTranslation(-1.5, 0.0, 0.0);
    mvpMatrix.multiplyMatrices(tmpMatrix, mMatrix);

    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix.elements);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.flush();
  }

  render() {
    return (
      <canvas id="canvas" width="500" height="500" />
    )
  }
}

render(
  <App />,
  document.getElementById('app')
)
