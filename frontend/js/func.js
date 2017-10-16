import 'three';

import { loadAll } from './common';

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

export function createDonut(row, col, r, w) {
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

export function cShader(gl, str, type = gl.VERTEX_SHADER) {
  if (!str || !gl) {
    return null;
  }

  const shader = gl.createShader(type);

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) && shader;
};

export function cProgram(gl, ...list) {
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

export function cVBO(gl, data = []) {
  const vbo = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return vbo;
};

export function cIBO(gl, data = []) {
  const ibo = gl.createBuffer();

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return ibo;
};

export function cTexture(gl, url = [], cb) {
  if (!url || !gl) {
    return null;
  }

  loadAll(url, (imgs) => {
    const res = imgs.map((img) => {

      const tex = gl.createTexture();

      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.bindTexture(gl.TEXTURE_2D, null);

      return tex;
    });

    cb && cb(res);
  });
};

export function setAttr(gl, vbo, location, stride) {
  const { length = 0 } = vbo;

  for(let v = 0; v < length; v += 1) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo[v]);
    gl.enableVertexAttribArray(location[v]);
    gl.vertexAttribPointer(location[v], stride[v], gl.FLOAT, false, 0, 0);
  }
};