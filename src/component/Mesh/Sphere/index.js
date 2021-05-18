import React, { useEffect } from 'react';
import { createShader, createRenderShaderProgram } from '../../../webgl/shader/Shader';
import vertexShaderSource from './glsl/vs.glsl';
import fragmentShaderSource from './glsl/fs.glsl';
import { vec3, vec4, mat4 } from 'gl-matrix';
import Sphere from '../../../common/geometry/sphere';
import Camera from '../../../common/camera';
import PointLight from '../../../common/light/PointLight';
import Material from '../../../common/Material';

const PRIMITIVE_TYPE = {
  line: 0,
  triangle: 1,
};

const OBJECT = {
  light: 0,
  sphere: 1,
  other: 2,
};

const shapeCountX = 10;
const shapeCountY = 10;
const interval = 400;

const pointLight = new PointLight();
pointLight.setPosition([0, 0, 1000]);
pointLight.setColor([1, 1, 1]);
const shapes = [];
const materials = [];
const MCWC = [];
for (let i = 0; i < shapeCountX; i++) {
  for (let j = 0; j < shapeCountY; j++) {
    const sphere = new Sphere();
    sphere.setPosition([i * interval, j * interval, 0]);
    sphere.setRadius(200);
    shapes.push(sphere);
    materials.push(new Material());
    MCWC.push(mat4.create());
  }
}
shapes[OBJECT.light].setPosition(pointLight.getPosition());
shapes[OBJECT.light].setRadius(50);
materials[OBJECT.light].setColor(pointLight.getColor());
materials[OBJECT.light].setAmbient(pointLight.getColor());
materials[OBJECT.light].setDiffuse(pointLight.getColor());
materials[OBJECT.light].setSpecular(pointLight.getColor());
const camera = new Camera();

let animationRequest;

const vbo_vertexPosition = [];
const vbo_indexBuffer = [];
const vbo_lineIndexBuffer = [];

let renderShaderProgram;

let uMCWC;
let uWCPC;
let uWCVC;
let uVCPC;

let uColor;
let uAmbient;
let uDiffuse;
let uSpecular;

let uLightColor;
let uLightPosition;

let uCamPosition;

let attrVertexPosition;
let attrVertexNormal;

function SphereComponent() {
  console.log('create SphereComponent');

  let isDragging = false;
  let gl;
  let glCanvas;

  let prePosition = [0, 0];

  let width = 0;
  let height = 0;
  let halfWidth = 0;
  let halfHeight = 0;

  const createShaderProgram = () => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    renderShaderProgram = createRenderShaderProgram(gl, vertexShader, fragmentShader);

    uMCWC = gl.getUniformLocation(renderShaderProgram, 'uMCWC');
    uWCPC = gl.getUniformLocation(renderShaderProgram, 'uWCPC');
    uWCVC = gl.getUniformLocation(renderShaderProgram, 'uWCVC');
    uVCPC = gl.getUniformLocation(renderShaderProgram, 'uVCPC');
    uColor = gl.getUniformLocation(renderShaderProgram, 'uColor');
    uAmbient = gl.getUniformLocation(renderShaderProgram, 'uAmbient');
    uDiffuse = gl.getUniformLocation(renderShaderProgram, 'uDiffuse');
    uSpecular = gl.getUniformLocation(renderShaderProgram, 'uSpecular');
    uLightColor = gl.getUniformLocation(renderShaderProgram, 'uLightColor');
    uLightPosition = gl.getUniformLocation(renderShaderProgram, 'uLightPosition');
    uCamPosition = gl.getUniformLocation(renderShaderProgram, 'uCamPosition');

    attrVertexPosition = gl.getAttribLocation(renderShaderProgram, 'attrVertexPosition');
    attrVertexNormal = gl.getAttribLocation(renderShaderProgram, 'attrVertexNormal');
  };

  const createBuffer = (index) => {
    vbo_vertexPosition[index] = gl.createBuffer();
    vbo_indexBuffer[index] = gl.createBuffer();
    vbo_lineIndexBuffer[index] = gl.createBuffer();
  };

  const bindBufferData = (datas, index) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_vertexPosition[index]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(datas[index].getData()), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_indexBuffer[index]);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(datas[index].getTriangleIndices()),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_lineIndexBuffer[index]);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(datas[index].getLineIndices()),
      gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  };

  const onMounted = function() {
    // initialize
    glCanvas = document.getElementById('_glcanvas');
    glCanvas.addEventListener('mousedown', mouseDownEvent, false);
    glCanvas.addEventListener('mousemove', mouseMoveEvent, false);
    glCanvas.addEventListener('mouseup', mouseUpEvent, false);
    glCanvas.addEventListener('mousewheel', mouseWheelEvent, false);
    gl = glCanvas.getContext('webgl2');

    if (!gl) {
      alert('Unable to initialize WebGL.');
      return;
    }

    width = gl.canvas.width;
    height = gl.canvas.height;
    halfWidth = width / 2;
    halfHeight = height / 2;

    // camera.setLootAt(camEye, camTar, camUp);
    camera.ortho(-width * 2, width * 2, -height * 2, height * 2, -10000, 10000);

    gl.viewport(0, 0, width, height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // create shader
    createShaderProgram();

    for (let i = 0; i < shapeCountX * shapeCountY; i++) {
      createBuffer(i);
    }
    for (let i = 0; i < shapeCountX * shapeCountY; i++) {
      bindBufferData(shapes, i);
    }

    render();
  };

  const render = function() {
    if (!gl) {
      console.log(' glContext return ');
      return;
    }

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    // Clear the canvas AND the depth buffer.
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // draw triangle
    for (let i = 0; i < shapeCountX * shapeCountY; i++) {
      draw(shapes, materials, i, PRIMITIVE_TYPE.triangle);
    }

    animationRequest = requestAnimationFrame(render);
  };

  const draw = (datas, materials, index, type) => {
    gl.useProgram(renderShaderProgram);
    const { wcpc, vcpc, wcvc } = camera.getState();
    gl.uniformMatrix4fv(uMCWC, false, MCWC[index]);
    gl.uniformMatrix4fv(uWCPC, false, wcpc);
    gl.uniformMatrix4fv(uWCVC, false, wcvc);
    gl.uniformMatrix4fv(uVCPC, false, vcpc);

    if (type === PRIMITIVE_TYPE.triangle) gl.uniform3fv(uColor, materials[index].getColor());
    else if (type === PRIMITIVE_TYPE.line) gl.uniform3fv(uColor, [1, 0, 0]);
    gl.uniform3fv(uAmbient, materials[index].getAmbient());
    gl.uniform3fv(uDiffuse, materials[index].getDiffuse());
    gl.uniform3fv(uSpecular, materials[index].getSpecular());
    gl.uniform3fv(uLightColor, pointLight.getColor());
    gl.uniform3fv(uLightPosition, pointLight.getPosition());
    gl.uniform3fv(uCamPosition, camera.getPosition());

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_vertexPosition[index]);
    if (type === PRIMITIVE_TYPE.triangle)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_indexBuffer[index]);
    else if (type === PRIMITIVE_TYPE.line)
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo_lineIndexBuffer[index]);

    gl.enableVertexAttribArray(attrVertexPosition);
    gl.enableVertexAttribArray(attrVertexNormal);
    gl.vertexAttribPointer(attrVertexPosition, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(attrVertexNormal, 3, gl.FLOAT, false, 24, 12);

    if (type === PRIMITIVE_TYPE.triangle)
      gl.drawElements(gl.TRIANGLES, datas[index].getTriangleIndices().length, gl.UNSIGNED_SHORT, 0);
    else if (type === PRIMITIVE_TYPE.line)
      gl.drawElements(gl.LINES, datas[index].getLineIndices().length, gl.UNSIGNED_SHORT, 0);

    gl.disableVertexAttribArray(attrVertexPosition);
    gl.disableVertexAttribArray(attrVertexNormal);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  };

  const mouseMoveEvent = (event) => {
    if (isDragging === true) {
      const diffX = event.offsetX - halfWidth - prePosition[0];
      const diffY = halfHeight - event.offsetY - prePosition[1];

      camera.orbit(diffX, diffY, width, height);

      prePosition[0] = event.offsetX - halfWidth;
      prePosition[1] = halfHeight - event.offsetY;
    }
  };

  const mouseDownEvent = (event) => {
    isDragging = true;

    prePosition[0] = event.offsetX - halfWidth;
    prePosition[1] = halfHeight - event.offsetY;

    animationRequest = requestAnimationFrame(render);
  };

  const mouseUpEvent = (event) => {
    cancelAnimationFrame(animationRequest);
    animationRequest = null;
    isDragging = false;
  };

  const mouseWheelEvent = (event) => {
    animationRequest = requestAnimationFrame(render);
    camera.zoom(event.deltaY);

    cancelAnimationFrame(animationRequest);
    animationRequest = null;
  };

  useEffect(onMounted, []);
  return (
    <>
      <canvas id="_glcanvas" width="640" height="480" />
    </>
  );
}

export default SphereComponent;
