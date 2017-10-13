import React, { Component } from 'react'
import { render } from 'react-dom'
import 'three';

import '../css/index.scss';

import ed from '../img/ed.jpg';
import test from '../img/test.png';

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

const getIndex = (curr, add, max) => {
  const maxReal = max - 1;
  const res = curr + add;

  if (res <= maxReal) {
    return res;
  }

  return maxReal - (res - maxReal);
};

const createDonut = (row, col, r, w) => {
  const position = [];
  const normal = [];
  const color = [];
  const index = [];

  const line = r + w / 2;
  const twoPi = Math.PI * 2;

  for(let v = 0; v <= row; v += 1) {
    const baseIndex = v * (col + 1);
    const radio = v / row;
    const angleV = twoPi * radio;
    const colorH = `hsl(${radio * 360}, 100%, 50%)`;
    const sinV = Math.sin(angleV);
    const cosV = Math.cos(angleV);

    const colorCurr = new THREE.Color(colorH);


    // const x = line * Math.cos(angleV);
    // const y = line * Math.sin(angleV);
    // const z = 0;

    // position.push(x, y, z);
    // color.push(colorCurr.r * 255, colorCurr.g * 255, colorCurr.b * 255, 1);

    // index.push(v, getIndex(v, 1, row), getIndex(v, 2, row));

    for(let a = 0; a <= col; a += 1) {
      const currIndex = baseIndex + a;
      const angleA = twoPi * a / col;
      const sinA = Math.sin(angleA);
      const cosA = Math.cos(angleA);
      const sA = w * sinA;
      const cA = w * cosA;

      const lineA = line - cA;

      // const x = line * Math.cos(angleV);
      // const y = line * Math.sin(angleV);

      const x = lineA * cosV;
      const y = lineA * sinV;
      const z = sA;

      const normalX = -cosA * cosV;
      const normalY = -cosA * sinV;
      const normalZ = sA;

      const normalVector3 = new THREE.Vector3(normalX, normalY, normalZ);

      normalVector3.normalize();

      position.push(x, y, z);
      normal.push(normalVector3.x, normalVector3.y, normalVector3.z);
      color.push(colorCurr.r, colorCurr.g, colorCurr.b, 1);
      // color.push(colorCurr.r * 255, colorCurr.g * 255, colorCurr.b * 255, 1);

      if (v === row || a === col) {
        continue;
      }

      index.push(currIndex, currIndex + col + 1, currIndex + 1);
      index.push(currIndex + col + 1, currIndex + col + 2, currIndex + 1);
    }
  }

  return {
    position,
    normal,
    color,
    index,
  };
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

const cIBO = (gl, data = []) => {
  const ibo = gl.createBuffer();

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return ibo;
};

const cTexture = (gl, url = '', cb) => {
  if (!url || !gl) {
    return null;
  }

  const img = new Image();
  img.crossOrigin = '';
  img.src = url;

  img.onload = () => {
    const tex = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

    cb && cb(tex);
  }
};

const setAttr = (gl, vbo, location, stride) => {
  const { length = 0 } = vbo;

  for(let v = 0; v < length; v += 1) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo[v]);
    gl.enableVertexAttribArray(location[v]);
    gl.vertexAttribPointer(location[v], stride[v], gl.FLOAT, false, 0, 0);
  }
};

let count = 0;

// const animation = (gl, mMatrix, tmpMatrix, mvpMatrix, uniLocation, index, lightPosition, ambientColor, eyeDirection) => {
//   gl.clearColor(0.0, 0.0, 0.0, 1.0);
//   gl.clearDepth(1.0);
//   gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);

//   count += 0.005;

//   const invMatrix = new THREE.Matrix4();
//   const rad = (count % 360) * Math.PI;
//   const x = Math.cos(rad);
//   const y = Math.sin(rad);

//   mMatrix.makeRotationAxis(new THREE.Vector3(0, 1, 1).normalize(), rad);
//   mMatrix.setPosition(new THREE.Vector3(0, 0, -8));
//   mvpMatrix.multiplyMatrices(tmpMatrix, mMatrix);
//   invMatrix.getInverse(mvpMatrix)

//   gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix.elements);
//   gl.uniformMatrix4fv(uniLocation[1], false, invMatrix.elements);
//   gl.uniform3fv(uniLocation[2], lightPosition);
//   gl.uniform4fv(uniLocation[3], ambientColor);
//   gl.uniform3fv(uniLocation[4], eyeDirection);
//   gl.uniformMatrix4fv(uniLocation[5], false, mMatrix.elements);

//   gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

//   // gl.enable(gl.CULL_FACE)

//   // mMatrix = new THREE.Matrix4();
//   // mMatrix.makeTranslation(1.0, -1.0, 0.0);
//   // mMatrix.makeRotationAxis(new THREE.Vector3(0, 1, 0), rad);
//   // mvpMatrix.multiplyMatrices(tmpMatrix, mMatrix);

//   // gl.uniformMatrix4fv(uniLocation, false, mvpMatrix.elements);
//   // gl.drawArrays(gl.TRIANGLES, 0, 3);

//   // const s = y + 1.0;

//   // mMatrix = new THREE.Matrix4();
//   // mMatrix.makeTranslation(-1.0, -1.0, 0.0);
//   // mMatrix.scale(new THREE.Vector3(s, s, 0.0));
//   // mvpMatrix.multiplyMatrices(tmpMatrix, mMatrix);

//   // gl.uniformMatrix4fv(uniLocation, false, mvpMatrix.elements);
//   // gl.drawArrays(gl.TRIANGLES, 0, 3);

//   // gl.flush();

//   window.requestAnimationFrame(
//     () => animation(gl, mMatrix, tmpMatrix, mvpMatrix, uniLocation, index, lightPosition, ambientColor, eyeDirection)
//   );
// };

const animation = (gl, mMatrix, tmpMatrix, mvpMatrix, uniLocation, index, texture) => {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);

  count += 0.005;

  const invMatrix = new THREE.Matrix4();
  const rad = (count % 360) * Math.PI;
  const x = Math.cos(rad);
  const y = Math.sin(rad);


  mMatrix.makeRotationAxis(new THREE.Vector3(0, 1, 1).normalize(), rad);
  mMatrix.setPosition(new THREE.Vector3(0, 0, 0));
  mvpMatrix.multiplyMatrices(tmpMatrix, mMatrix);
  invMatrix.getInverse(mvpMatrix)

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(uniLocation[1], 0);
  gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix.elements);

  gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

  window.requestAnimationFrame(
    () => animation(gl, mMatrix, tmpMatrix, mvpMatrix, uniLocation, index, texture)
  );
};

class App extends Component {
  componentDidMount() {
    const cvs = document.getElementById('canvas');
    const gl = cvs.getContext('webgl');

    // const VSHADER_SOURCE = `
    //   attribute vec3 position;
    //   attribute vec3 normal;
    //   attribute vec4 color;

    //   uniform mat4 mvpMatrix;
    //   uniform mat4 invMatrix;
    //   uniform vec3 lightDirection;
    //   uniform vec3 eyeDirection;
    //   uniform vec4 ambientColor;
    //   varying vec4 vColor;

    //   void main() {
    //     vec3 invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;
    //     vec3 invEye = normalize(invMatrix * vec4(eyeDirection, 0.0)).xyz;
    //     vec3 halfLE = normalize(invLight + invEye);

    //     float diffuse  = clamp(dot(normal, invLight), 0.0, 1.0);
    //     float specular = pow(clamp(dot(normal, halfLE), 0.0, 1.0), 1000.0);
    //     vec4  light    = color * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0);

    //     vColor = light + ambientColor;
    //     gl_Position = mvpMatrix * vec4(position, 1);
    //   }

    // `;

    // const FSHADER_SOURCE = `
    //   precision mediump float;
    //   varying vec4 vColor;

    //   void main() {
    //     gl_FragColor = vColor;
    //   }
    // `;

    // const VSHADER_SOURCE = `
    //   attribute vec3 position;
    //   attribute vec3 normal;
    //   attribute vec4 color;

    //   uniform mat4 mvpMatrix;
    //   uniform mat4 mMatrix;
      
    //   varying vec3 vPosition;
    //   varying vec3 vNormal;
    //   varying vec4 vColor;

    //   void main(void) {
    //     vPosition = (mMatrix * vec4(position, 1.0)).xyz;
    //     vNormal = normal;
    //     vColor = color;

    //     gl_Position = mvpMatrix * vec4(position, 1.0);
    //   }
    // `;

    // const FSHADER_SOURCE = `
    //   precision mediump float;

    //   uniform mat4 invMatrix;
    //   uniform vec3 lightPosition;
    //   uniform vec3 eyeDirection;
    //   uniform vec4 ambientColor;

    //   varying vec3 vPosition;
    //   varying vec3 vNormal;
    //   varying vec4 vColor;

    //   void main(void) {
    //     vec3 lightVec = lightPosition - vPosition;
    //     vec3 invLight = normalize(invMatrix * vec4(lightVec, 0.0)).xyz;
    //     vec3 invEye = normalize(invMatrix * vec4(eyeDirection, 0.0)).xyz;
    //     vec3 halfLE = normalize(invEye + invLight);

    //     float diffuse = clamp(dot(vNormal, invLight), 0.0, 1.0) + 0.2;
    //     float specular = pow(clamp(dot(vNormal, halfLE), 0.0, 1.0), 100.0);

    //     vec4 destColor = vColor * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0) + ambientColor;

    //     gl_FragColor = destColor;
    //   }
    // `;

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

      uniform sampler2D texture;

      varying vec4 vColor;
      varying vec2 vTextureCoord;

      void main(void) {
        vec4 smpColor = texture2D(texture, vTextureCoord);
        gl_FragColor = vColor * smpColor;
      }
    `;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);

    const vShader = cShader(gl, VSHADER_SOURCE);
    const fShader = cShader(gl, FSHADER_SOURCE, gl.FRAGMENT_SHADER);
    const program = cProgram(gl, vShader, fShader);

    const aLocation = [];
    const aStride = [3, 4, 2];

    aLocation[0] = gl.getAttribLocation(program, 'position');
    // aLocation[1] = gl.getAttribLocation(program, 'normal');
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
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      1.0, 1.0,
    ];

    const index = [
      0, 1, 2,
      3, 2, 1,
    ];

    // const data = createDonut(16, 16, 1, 1);
    // const { position = [], normal = [], color = [], index = [] } = data;

    const positionVBO = cVBO(gl, position);
    // const normalVBO = cVBO(gl, normal);
    const colorVBO = cVBO(gl, color);
    const coordVBO = cVBO(gl, textureCoord);
    const VBOList = [positionVBO, colorVBO, coordVBO];

    setAttr(gl, VBOList, aLocation, aStride);

    const ibo = cIBO(gl, index);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

    const uniLocation = [];
    const lightPosition = [50, -50, -7.5];
    const ambientColor = [0.1, 0.1, 0.1, 1.0];
    const eyeDirection = [0.0, 0.0, -10.0];
    // const lightDirection = [0, 1, 0];

    uniLocation.push(gl.getUniformLocation(program, 'mvpMatrix'))
    uniLocation.push(gl.getUniformLocation(program, 'texture'))
    // uniLocation.push(gl.getUniformLocation(program, 'invMatrix'))
    // uniLocation.push(gl.getUniformLocation(program, 'lightPosition'))
    // uniLocation.push(gl.getUniformLocation(program, 'ambientColor'))
    // uniLocation.push(gl.getUniformLocation(program, 'eyeDirection'))
    // uniLocation.push(gl.getUniformLocation(program, 'mMatrix'))

    let mMatrix = new THREE.Matrix4();
    const vMatrix = new THREE.Matrix4();
    const pMatrix = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const tmpMatrix = new THREE.Matrix4();
    const mvpMatrix = new THREE.Matrix4();

    // pMatrix.position.copy(new THREE.Vector3(0.0, 0.0, 3.0));
    // pMatrix.up.copy(new THREE.Vector3(0, 1, 0));

    // const res =  pMatrix.watchAt(new THREE.Vector3(0, 0, 0));

    vMatrix.watchAt(
      new THREE.Vector3(0, 0, 10),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0),
    );
    tmpMatrix.multiplyMatrices(pMatrix.projectionMatrix, vMatrix);

    // gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.LEQUAL);
    // gl.enable(gl.CULL_FACE);
    // gl.frontFace(gl.CW);

    cTexture(gl, ed,
      texture => animation(gl, mMatrix, tmpMatrix, mvpMatrix, uniLocation, index, texture)
    );

    
    // animation(gl, mMatrix, tmpMatrix, mvpMatrix, uniLocation, index, lightPosition, ambientColor, eyeDirection);

    // mvpMatrix.multiplyMatrices(tmpMatrix, mMatrix);

    // gl.uniformMatrix4fv(uniLocation, false, mvpMatrix.elements);
    // gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

    // mMatrix.makeTranslation(1.5, 0.0, 0.0);

    // mvpMatrix.multiplyMatrices(tmpMatrix, mMatrix);

    // gl.uniformMatrix4fv(uniLocation, false, mvpMatrix.elements);
    // gl.drawArrays(gl.TRIANGLES, 0, 3);

    // mMatrix = new THREE.Matrix4();
    // mMatrix.makeTranslation(-1.5, 0.0, 0.0);
    // mvpMatrix.multiplyMatrices(tmpMatrix, mMatrix);

    // gl.uniformMatrix4fv(uniLocation, false, mvpMatrix.elements);

    // gl.drawArrays(gl.TRIANGLES, 0, 3);

    // gl.flush();
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
