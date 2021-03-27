import React, { useCallback, useEffect, useState } from 'react';
import { createShader, createRenderShaderProgram } from '../../../webgl/shader/Shader';
import vertexShaderSource from './glsl/vs.glsl';
import fragmentShaderSource from './glsl/fs.glsl';
import { vertex, F, normals } from './resource';
import { vec3, mat4 } from 'gl-matrix';
import { openSTLByUrl } from '../../../common/OpenSTLFile';

const vertices = [];
const indices = [];
const lineIndices = [];

const camEye = vec3.create();
camEye[0] = 0;
camEye[1] = 0;
camEye[2] = 1;
const camUp = vec3.create();
camUp[0] = 0;
camUp[1] = 1;
camUp[2] = 0;
const camTar = vec3.create();
camTar[0] = 0;
camTar[1] = 0;
camTar[2] = 0;
const MCWC = mat4.create();
const WCVC = mat4.create();
const VCPC = mat4.create();

const MCVC = mat4.create();
const MCPC = mat4.create();
let lines = [];

function Crown() {
  console.log('create Crown');

  let isDragging = false;
  let gl;
  let glCanvas;

  let vbo_vertexPosition;
  let vbo_vertexNormal;
  let vbo_indexBuffer;
  let vbo_lineIndexBuffer;
  let vbo_normals;
  let vbo_texture;
  let vbo_textureTarget;
  let vbo_frame;

  let vao;

  let renderShaderProgram;

  let u_MCPC;
  let u_VCPC;
  let attrVertexPosition;
  let attrVertexNormal;
  let u_texture;

  let prePosition = [0, 0];

  let width = 0;
  let height = 0;
  let halfWidth = 0;
  let halfHeight = 0;

  let image;

  const addPoint = function(v1, v2) {
    const forward = vec3.create();
    vec3.subtract(forward, camTar, camEye);
    vec3.normalize(forward, forward);

    const v2v1 = vec3.create();
    vec3.subtract(v2v1, v2, v1);
    // vec3.normalize(v2v1, v2v1);
    const child = vec3.dot(forward, v2v1);
    if (child === 0) {
      return false;
    }

    const v3v1 = vec3.create();
    vec3.subtract(v3v1, [0, 0, 0], v1);
    const parent = vec3.dot(forward, v3v1);
    const u = parent / child;
    if (u < 0 || u > 1) {
      return false;
    }
    const B = vec3.create();
    vec3.subtract(B, v2, v1);
    B[0] *= u;
    B[1] *= u;
    B[2] *= u;
    const A = v1;
    const point = vec3.create();
    vec3.add(point, A, B);
    lines.push(point[0]);
    lines.push(point[1]);
    lines.push(point[2]);

    return true;
  };

  const onMounted = function() {
    // initialize
    glCanvas = document.getElementById('_glcanvas');
    glCanvas.addEventListener('mousedown', mouseDownEvent, false);
    glCanvas.addEventListener('mousemove', mouseMoveEvent, false);
    glCanvas.addEventListener('mouseup', mouseUpEvent, false);
    gl = glCanvas.getContext('webgl2');

    if (!gl) {
      alert('Unable to initialize WebGL.');
      return;
    }

    width = gl.canvas.width;
    height = gl.canvas.height;
    halfWidth = width / 2;
    halfHeight = height / 2;

    mat4.identity(MCWC);
    mat4.scale(MCWC, MCWC, [20, 20, 20]);
    mat4.lookAt(WCVC, camEye, camTar, camUp);
    mat4.ortho(VCPC, -halfWidth, halfWidth, -halfHeight, halfHeight, -1000, 1000);
    mat4.multiply(MCVC, WCVC, MCWC);
    mat4.multiply(MCPC, VCPC, MCVC);

    gl.viewport(0, 0, width, height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // create shader
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    renderShaderProgram = createRenderShaderProgram(gl, vertexShader, fragmentShader);

    u_MCPC = gl.getUniformLocation(renderShaderProgram, 'u_MCPC');
    u_VCPC = gl.getUniformLocation(renderShaderProgram, 'u_VCPC');
    attrVertexPosition = gl.getAttribLocation(renderShaderProgram, 'attrVertexPosition');
    attrVertexNormal = gl.getAttribLocation(renderShaderProgram, 'attrVertexNormal');

    const sectorCount = 30;
    const stackCount = 30;
    const radius = 10;
    let x, y, z, xy; // vertex position
    let nx,
      ny,
      nz,
      lengthInv = 1.0 / radius; // vertex normal
    let s, t; // vertex texCoord
    let sectorStep = (2 * Math.PI) / sectorCount;
    let stackStep = Math.PI / stackCount;
    let sectorAngle, stackAngle;

    for (let i = 0; i <= stackCount; ++i) {
      stackAngle = Math.PI / 2 - i * stackStep; // starting from pi/2 to -pi/2
      xy = radius * Math.cos(stackAngle); // r * cos(u)
      z = radius * Math.sin(stackAngle); // r * sin(u)

      // add (sectorCount+1) vertices per stack
      // the first and last vertices have same position and normal, but different tex coords
      for (let j = 0; j <= sectorCount; ++j) {
        sectorAngle = j * sectorStep; // starting from 0 to 2pi

        // vertex position (x, y, z)
        x = xy * Math.cos(sectorAngle); // r * cos(u) * cos(v)
        y = xy * Math.sin(sectorAngle); // r * cos(u) * sin(v)
        vertices.push(x);
        vertices.push(y);
        vertices.push(z);

        // normalized vertex normal (nx, ny, nz)
        nx = x * lengthInv;
        ny = y * lengthInv;
        nz = z * lengthInv;

        normals.push(nx);
        normals.push(ny);
        normals.push(nz);
        vertices.push(nx);
        vertices.push(ny);
        vertices.push(nz);

        // // vertex tex coord (s, t) range between [0, 1]
        // s = j / sectorCount;
        // t = i / stackCount;
        // texCoords.push(s);
        // texCoords.push(t);
      }
    }

    let k1, k2;
    for (let i = 0; i < stackCount; ++i) {
      k1 = i * (sectorCount + 1); // beginning of current stack
      k2 = k1 + sectorCount + 1; // beginning of next stack

      for (let j = 0; j < sectorCount; ++j, ++k1, ++k2) {
        // 2 triangles per sector excluding first and last stacks
        // k1 => k2 => k1+1
        if (i != 0) {
          indices.push(k1);
          indices.push(k2);
          indices.push(k1 + 1);

          lineIndices.push(k1);
          lineIndices.push(k2);

          lineIndices.push(k2);
          lineIndices.push(k1 + 1);

          lineIndices.push(k1);
          lineIndices.push(k1 + 1);
        }

        // k1+1 => k2 => k2+1
        if (i != stackCount - 1) {
          indices.push(k1 + 1);
          indices.push(k2);
          indices.push(k2 + 1);

          lineIndices.push(k1 + 1);
          lineIndices.push(k2);

          lineIndices.push(k2);
          lineIndices.push(k2 + 1);

          lineIndices.push(k1 + 1);
          lineIndices.push(k2 + 1);
        }
      }
    }

    vbo_vertexPosition = gl.createBuffer();
    vbo_indexBuffer = gl.createBuffer();
    vbo_lineIndexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_vertexPosition);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_lineIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(lineIndices), gl.STATIC_DRAW);
    console.log('vertices : ', vertices);
    console.log('indices : ', indices);
    drawScene();
  };

  const drawScene = function() {
    if (!gl) {
      console.log(' glContext return ');
      return;
    }

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    // Clear the canvas AND the depth buffer.
    gl.clearColor(0, 0, 0, 1); // clear to blue
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(renderShaderProgram);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_indexBuffer);
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_lineIndexBuffer);
    gl.enableVertexAttribArray(attrVertexPosition);
    gl.vertexAttribPointer(attrVertexPosition, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(attrVertexNormal);
    gl.vertexAttribPointer(attrVertexNormal, 3, gl.FLOAT, false, 24, 12);
    // gl.bindVertexArray(vao);

    gl.uniformMatrix4fv(u_MCPC, false, MCPC);
    gl.uniformMatrix4fv(u_VCPC, false, VCPC);

    var offset = 0;
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, offset);
    // gl.drawElements(gl.LINES, lineIndices.length, gl.UNSIGNED_SHORT, offset);
  };

  const mouseMoveEvent = (event) => {
    if (isDragging === true) {
      const diffX = event.offsetX - halfWidth - prePosition[0];
      const diffY = halfHeight - event.offsetY - prePosition[1];

      const screenNormal = [0, 0, 1];
      const dir = [diffX, diffY, 0];
      const axis = vec3.create();
      vec3.cross(axis, dir, screenNormal);

      vec3.normalize(axis, axis);

      let dgreeX = vec3.dot(axis, [1, 0, 0]);
      let dgreeY = vec3.dot(axis, [0, 1, 0]);

      const degreeAmount = 2.5;
      dgreeX = (dgreeX * Math.PI) / 180.0;
      dgreeY = (dgreeY * Math.PI) / 180.0;
      dgreeX *= degreeAmount;
      dgreeY *= degreeAmount;

      const camTarToEye = vec3.create();
      vec3.subtract(camTarToEye, camEye, camTar);
      vec3.normalize(camTarToEye, camTarToEye);
      const camRight = vec3.create();
      vec3.cross(camRight, camUp, camTarToEye);
      vec3.normalize(camRight, camRight);

      const camPitch = mat4.create();
      mat4.fromRotation(camPitch, dgreeX, camRight);
      const camYaw = mat4.create();
      mat4.fromRotation(camYaw, dgreeY, camUp);

      vec3.transformMat4(camEye, camEye, camPitch);
      vec3.transformMat4(camEye, camEye, camYaw);

      vec3.subtract(camTarToEye, camEye, camTar);
      vec3.normalize(camTarToEye, camTarToEye);
      vec3.cross(camUp, camTarToEye, camRight);
      vec3.normalize(camUp, camUp);

      vec3.cross(camRight, camUp, camTarToEye);
      vec3.normalize(camRight, camRight);

      mat4.lookAt(WCVC, camEye, camTar, camUp);

      mat4.multiply(MCVC, WCVC, MCWC);
      mat4.multiply(MCPC, VCPC, MCVC);

      prePosition[0] = event.offsetX - halfWidth;
      prePosition[1] = halfHeight - event.offsetY;

      drawScene();
    }
  };

  const mouseDownEvent = (event) => {
    isDragging = true;

    prePosition[0] = event.offsetX - halfWidth;
    prePosition[1] = halfHeight - event.offsetY;

    drawScene();
  };

  const mouseUpEvent = (event) => {
    isDragging = false;
  };

  useEffect(onMounted, []);
  return (
    <>
      <canvas id="_glcanvas" width="640" height="480" />
    </>
  );
}

export default Crown;
