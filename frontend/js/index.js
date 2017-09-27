import React, { Component } from 'react'
import { render } from 'react-dom'

import '../css/index.scss';

const cShader = (str, gl, type = gl.VERTEX_SHADER) => {
  if (!str || !gl) {
    return null;
  }

  const shader = gl.createShader(type);

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) && shader;
};

const cProgram = (...list) => {
  const program = gl.createProgram();

  const { length } = list;

  for (let v = 0; v < length; v += 1) {
    const shader = list[v];

    gl.attachShader(program, shader);
  }

  gl.linkProgram(program);

  return gl.getProgramParameter(program, gl.LINK_STATUS) && program;
};

const cVBO = (data = []) => {
  const vbo = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return vbo;
};

const setAttr = (vbo, from, to, gl) => {
  const { length = 0 } = vbo;

  for(let v = 0; v < length; v += 1) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo[v]);
    gl.enableVertexAttribArray(from[v]);
    gl.vertexAttribPointer(from[v], to[v], gl.FLOAT, false, 0, 0);
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

    const vShader = cShader(VSHADER_SOURCE, gl);
    const fShader = cShader(FSHADER_SOURCE, gl, gl.FRAGMENT_SHADER);
    const program = cProgram(vShader, fShader);

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

    const positionVBO = cVBO(position);
    const colorVBO = cVBO(color);


  }

  render() {
    return (
      <canvas id="canvas" />
    )
  }
}

render(
  <App />,
  document.getElementById('app')
)
