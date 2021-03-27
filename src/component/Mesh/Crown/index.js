import React, { useEffect } from 'react';
import { createShader, createRenderShaderProgram } from '../../../webgl/shader/Shader';
import vertexShaderSource from './glsl/vs.glsl';
import fragmentShaderSource from './glsl/fs.glsl';
import { vec3, mat4 } from 'gl-matrix';
import Sphere from '../../../common/geomatry/sphere';
import Camera from '../../../common/camera';

const sphere = new Sphere();
const camera = new Camera();

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

function Crown() {
  console.log('create Crown');

  let isDragging = false;
  let gl;
  let glCanvas;

  let vbo_vertexPosition;
  let vbo_indexBuffer;
  let vbo_lineIndexBuffer;

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
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    renderShaderProgram = createRenderShaderProgram(gl, vertexShader, fragmentShader);

    uMCPC = gl.getUniformLocation(renderShaderProgram, 'uMCPC');
    uVCPC = gl.getUniformLocation(renderShaderProgram, 'uVCPC');
    attrVertexPosition = gl.getAttribLocation(renderShaderProgram, 'attrVertexPosition');
    attrVertexNormal = gl.getAttribLocation(renderShaderProgram, 'attrVertexNormal');

    vbo_vertexPosition = gl.createBuffer();
    vbo_indexBuffer = gl.createBuffer();
    vbo_lineIndexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_vertexPosition);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphere.getData()), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(sphere.getTriangleIndices()),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_lineIndexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(sphere.getLineIndices()),
      gl.STATIC_DRAW
    );
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

    gl.useProgram(renderShaderProgram);

    // draw triangle
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_indexBuffer);
    gl.enableVertexAttribArray(attrVertexPosition);
    gl.vertexAttribPointer(attrVertexPosition, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(attrVertexNormal);
    gl.vertexAttribPointer(attrVertexNormal, 3, gl.FLOAT, false, 24, 12);

    const { wcpc, vcpc } = camera.getState();
    gl.uniformMatrix4fv(uMCPC, false, wcpc);
    gl.uniformMatrix4fv(uVCPC, false, vcpc);

    gl.drawElements(gl.TRIANGLES, sphere.getTriangleIndices().length, gl.UNSIGNED_SHORT, 0);

    // // draw line
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_lineIndexBuffer);
    // gl.enableVertexAttribArray(attrVertexPosition);
    // gl.vertexAttribPointer(attrVertexPosition, 3, gl.FLOAT, false, 24, 0);
    // gl.enableVertexAttribArray(attrVertexNormal);
    // gl.vertexAttribPointer(attrVertexNormal, 3, gl.FLOAT, false, 24, 12);

    // const { wcpc, vcpc } = camera.getState();
    // gl.uniformMatrix4fv(uMCPC, false, wcpc);
    // gl.uniformMatrix4fv(uVCPC, false, vcpc);

    // gl.drawElements(gl.LINES, sphere.getLineIndices().length, gl.UNSIGNED_SHORT, 0);

    animationRequest = requestAnimationFrame(render);
  };

  const mouseMoveEvent = (event) => {
    if (isDragging === true) {
      const diffX = event.offsetX - halfWidth - prePosition[0];
      const diffY = halfHeight - event.offsetY - prePosition[1];

      camera.orbit(diffX, diffY);
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
    camera.zoom(event.deltaY / 25);

    const { wcvc, vcpc } = camera.getState();

    mat4.multiply(MCVC, wcvc, MCWC);
    mat4.invert(VCMC, MCVC);
    mat4.multiply(MCPC, vcpc, MCVC);

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

export default Crown;
