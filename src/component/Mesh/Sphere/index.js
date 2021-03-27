import React, { useEffect } from 'react';
import { createShader, createRenderShaderProgram } from '../../../webgl/shader/Shader';
import vertexShaderSource from './glsl/vs.glsl';
import fragmentShaderSource from './glsl/fs.glsl';
import { vec3, mat4 } from 'gl-matrix';
import Sphere from '../../../common/geometry/sphere';
import Camera from '../../../common/camera';
import PointLight from '../../../common/light/PointLight';

const sphere = new Sphere();
const camera = new Camera();
const pointLight = new PointLight();
const lightSphere = new Sphere();
lightSphere.setPosition([1000, 0, 0]);
lightSphere.setRadius(20);

const POLYGON_INDEX = {
  sphere: 0,
  light: 1,
};

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
const VCMC = mat4.create();

const MCVC = mat4.create();
const MCPC = mat4.create();

let animationRequest;

function SphereComponent() {
  console.log('create SphereComponent');

  let isDragging = false;
  let gl;
  let glCanvas;

  const vbo_vertexPosition = [];
  const vbo_indexBuffer = [];
  const vbo_lineIndexBuffer = [];

  let renderShaderProgram;

  let uMCPC;
  let uVCPC;
  let attrVertexPosition;
  let attrVertexNormal;

  let prePosition = [0, 0];

  let width = 0;
  let height = 0;
  let halfWidth = 0;
  let halfHeight = 0;

  const createShaderProgram = (index) => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    renderShaderProgram = createRenderShaderProgram(gl, vertexShader, fragmentShader);

    uMCPC = gl.getUniformLocation(renderShaderProgram, 'uMCPC');
    uVCPC = gl.getUniformLocation(renderShaderProgram, 'uVCPC');
    attrVertexPosition = gl.getAttribLocation(renderShaderProgram, 'attrVertexPosition');
    attrVertexNormal = gl.getAttribLocation(renderShaderProgram, 'attrVertexNormal');
  };

  const createBuffer = () => {
    vbo_vertexPosition.push(gl.createBuffer());
    vbo_indexBuffer.push(gl.createBuffer());
    vbo_lineIndexBuffer.push(gl.createBuffer());
  };

  const bindBufferData = (data, index) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_vertexPosition[index]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.getData()), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_indexBuffer[index]);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(data.getTriangleIndices()),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_lineIndexBuffer[index]);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.getLineIndices()), gl.STATIC_DRAW);

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

    camera.setLootAt(camEye, camTar, camUp);
    camera.setFrustum(-halfWidth, halfWidth, -halfHeight, halfHeight, -1000, 1000);

    gl.viewport(0, 0, width, height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // create shader
    createShaderProgram();

    createBuffer();
    createBuffer();

    bindBufferData(sphere, 0);
    bindBufferData(lightSphere, 1);

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

    draw(sphere, 0);
    draw(lightSphere, 1);

    animationRequest = requestAnimationFrame(render);
  };

  const draw = (data, index) => {
    gl.useProgram(renderShaderProgram);
    const { wcpc, vcpc } = camera.getState();
    gl.uniformMatrix4fv(uMCPC, false, wcpc);
    gl.uniformMatrix4fv(uVCPC, false, vcpc);

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_vertexPosition[index]);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_indexBuffer[index]);
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_lineIndexBuffer[index]);
    gl.enableVertexAttribArray(attrVertexPosition);
    gl.enableVertexAttribArray(attrVertexNormal);
    gl.vertexAttribPointer(attrVertexPosition, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(attrVertexNormal, 3, gl.FLOAT, false, 24, 12);

    gl.drawElements(gl.TRIANGLES, data.getTriangleIndices().length, gl.UNSIGNED_SHORT, 0);
    // gl.drawElements(gl.LINES, data.getLineIndices().length, gl.UNSIGNED_SHORT, 0);

    gl.disableVertexAttribArray(attrVertexPosition);
    gl.disableVertexAttribArray(attrVertexNormal);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  };

  const mouseMoveEvent = (event) => {
    if (isDragging === true) {
      const diffX = event.offsetX - halfWidth - prePosition[0];
      const diffY = halfHeight - event.offsetY - prePosition[1];

      camera.orbit(diffX, diffY, width, height);
      const { wcvc, vcpc } = camera.getState();

      mat4.multiply(MCVC, wcvc, MCWC);
      mat4.invert(VCMC, MCVC);
      mat4.multiply(MCPC, vcpc, MCVC);

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
