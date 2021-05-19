import React, { useEffect } from 'react';
import { createShader, createRenderShaderProgram } from '../../../webgl/shader/Shader';
import vertexShaderSource from './glsl/vs.glsl';
import fragmentShaderSource from './glsl/fs.glsl';
import { vec3, vec4, mat4 } from 'gl-matrix';
import Sphere from '../../../common/geometry/sphere';
import Camera from '../../../common/camera';
import PointLight from '../../../common/light/PointLight';
import Material from '../../../common/Material';
import { square } from './resource';

const OBJECT = {
  light: 0,
  sphere: 1,
};

const pointLight = new PointLight();
pointLight.setPosition([1000, 0, 0]);
pointLight.setColor([1, 1, 1]);
const shapes = [new Sphere(), new Sphere()];
shapes[OBJECT.light].setPosition(pointLight.getPosition());
shapes[OBJECT.light].setRadius(20);
shapes[OBJECT.sphere].setSectorCount(50);
shapes[OBJECT.sphere].setStackCount(50);
const materials = [new Material(), new Material()];
materials[OBJECT.light].setColor(pointLight.getColor());
materials[OBJECT.light].setAmbient(pointLight.getColor());
materials[OBJECT.light].setDiffuse(pointLight.getColor());
materials[OBJECT.light].setSpecular(pointLight.getColor());
materials[OBJECT.sphere].setColor([0.8, 0.2, 0]);
materials[OBJECT.sphere].setSpecular([1, 1, 1]);
const camera = new Camera();

const MCWC = [mat4.create(), mat4.create()];
mat4.rotateY(MCWC[1], MCWC[1], Math.PI / 2);

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

function CoordinateSystem() {
  console.log('create CoordinateSystem');

  let isDragging = false;
  let gl;
  let glCanvas;

  let prePosition = [0, 0];

  let width = 0;
  let height = 0;
  let halfWidth = 0;
  let halfHeight = 0;

  const viewport = [];

  const createShaderProgram = (index) => {
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

    viewport[0] = 0;
    viewport[1] = 0;
    viewport[2] = width / 2;
    viewport[3] = height / 2;
    // viewport[0] = 0;
    // viewport[1] = 0;
    // viewport[2] = width;
    // viewport[3] = height;
    viewport[4] = 1;
    viewport[5] = 1000;

    // const fovYDegree = 45;
    // const fovY = (fovYDegree * Math.PI) / 180;
    // const aspect = 640 / 480;
    // const near = 1;
    // const far = 1000;
    // camera.perspective(fovY, aspect, near, far);
    camera.ortho(-width, width, -height, height, -1000, 1000);

    gl.viewport(viewport[0], viewport[1], viewport[2], viewport[3]);
    // gl.depthRange(viewport[4], viewport[5]);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // create shader
    createShaderProgram();

    createBuffer(OBJECT.light);
    bindBufferData(shapes, OBJECT.light);

    createBuffer(OBJECT.sphere);
    bindBufferData(shapes, OBJECT.sphere);

    render();
  };

  const render = function() {
    if (!gl) {
      console.log(' glContext return ');
      return;
    }

    // gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    // Clear the canvas AND the depth buffer.
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // draw triangle

    draw(shapes, materials, OBJECT.light);
    draw(shapes, materials, OBJECT.sphere);

    animationRequest = requestAnimationFrame(render);
  };

  const draw = (datas, materials, index) => {
    gl.useProgram(renderShaderProgram);
    const { wcpc, vcpc, wcvc } = camera.getState();
    gl.uniformMatrix4fv(uMCWC, false, MCWC[index]);
    gl.uniformMatrix4fv(uWCPC, false, wcpc);
    gl.uniformMatrix4fv(uWCVC, false, wcvc);
    gl.uniformMatrix4fv(uVCPC, false, vcpc);
    gl.uniform3fv(uColor, materials[index].getColor());
    gl.uniform3fv(uAmbient, materials[index].getAmbient());
    gl.uniform3fv(uDiffuse, materials[index].getDiffuse());
    gl.uniform3fv(uSpecular, materials[index].getSpecular());
    gl.uniform3fv(uLightColor, pointLight.getColor());
    gl.uniform3fv(uLightPosition, pointLight.getPosition());
    gl.uniform3fv(uCamPosition, camera.getPosition());

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_vertexPosition[index]);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_indexBuffer[index]);
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_lineIndexBuffer[index]);
    gl.enableVertexAttribArray(attrVertexPosition);
    gl.enableVertexAttribArray(attrVertexNormal);
    gl.vertexAttribPointer(attrVertexPosition, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(attrVertexNormal, 3, gl.FLOAT, false, 24, 12);

    gl.drawElements(gl.TRIANGLES, datas[index].getTriangleIndices().length, gl.UNSIGNED_SHORT, 0);
    // gl.drawElements(gl.LINES, datas[index].getLineIndices().length, gl.UNSIGNED_SHORT, 0);

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

  const doCoordinate = (inputWindowPosition) => {
    let windowPosition = [inputWindowPosition[0], inputWindowPosition[1]];
    let screenPosition = [windowPosition[0], height - windowPosition[1]];

    let nearNDCPosition = [
      ((screenPosition[0] - viewport[2] / 2 - viewport[0]) * 2) / viewport[2],
      ((screenPosition[1] - viewport[3] / 2 - viewport[1]) * 2) / viewport[3],
      0.0 * 2.0 - 1.0,
      1.0,
    ];

    let farNDCPosition = [
      ((screenPosition[0] - viewport[2] / 2 - viewport[0]) * 2) / viewport[2],
      ((screenPosition[1] - viewport[3] / 2 - viewport[1]) * 2) / viewport[3],
      1.0 * 2.0 - 1.0,
      1.0,
    ];

    console.log('windowPosition : ', windowPosition);
    console.log('screenPosition : ', screenPosition);
    console.log('nearNDCPosition : ', nearNDCPosition);
    console.log('farNDCPosition : ', farNDCPosition);

    const nearProjectedPosition = vec4.create();
    vec4.transformMat4(nearProjectedPosition, nearNDCPosition, camera.getState().pcvc);
    const farProjectedPosition = vec4.create();
    vec4.transformMat4(farProjectedPosition, farNDCPosition, camera.getState().pcvc);
    console.log('nearProjectedPosition : ', nearProjectedPosition);
    console.log('farProjectedPosition : ', farProjectedPosition);

    const nearEyePosition = vec4.create();
    const farEyePosition = vec4.create();
    nearEyePosition[0] = nearProjectedPosition[0] / nearProjectedPosition[3];
    nearEyePosition[1] = nearProjectedPosition[1] / nearProjectedPosition[3];
    nearEyePosition[2] = nearProjectedPosition[2] / nearProjectedPosition[3];
    nearEyePosition[3] = nearProjectedPosition[3] / nearProjectedPosition[3];

    farEyePosition[0] = farProjectedPosition[0] / farProjectedPosition[3];
    farEyePosition[1] = farProjectedPosition[1] / farProjectedPosition[3];
    farEyePosition[2] = farProjectedPosition[2] / farProjectedPosition[3];
    farEyePosition[3] = farProjectedPosition[3] / farProjectedPosition[3];
    console.log('nearEyePosition : ', nearEyePosition);
    console.log('farEyePosition : ', farEyePosition);

    const nearWorldPosition = vec4.create();
    vec4.transformMat4(nearWorldPosition, nearProjectedPosition, camera.getState().vcwc);
    const farWorldPosition = vec4.create();
    vec4.transformMat4(farWorldPosition, farProjectedPosition, camera.getState().vcwc);
    console.log('nearWorldPosition : ', nearWorldPosition);
    console.log('farWorldPosition : ', farWorldPosition);

    // re coordinate
    vec4.transformMat4(nearEyePosition, nearWorldPosition, camera.getState().wcvc);
    vec4.transformMat4(farEyePosition, farWorldPosition, camera.getState().wcvc);
    console.log('re nearEyePosition : ', nearEyePosition);
    console.log('re farEyePosition : ', farEyePosition);

    vec4.transformMat4(nearProjectedPosition, nearEyePosition, camera.getState().vcpc);
    vec4.transformMat4(farProjectedPosition, farEyePosition, camera.getState().vcpc);
    console.log('re nearProjectedPosition : ', nearProjectedPosition);
    console.log('re farProjectedPosition : ', farProjectedPosition);

    nearNDCPosition[0] = nearProjectedPosition[0] / nearProjectedPosition[3];
    nearNDCPosition[1] = nearProjectedPosition[1] / nearProjectedPosition[3];
    nearNDCPosition[2] = nearProjectedPosition[2] / nearProjectedPosition[3];
    nearNDCPosition[3] = nearProjectedPosition[3] / nearProjectedPosition[3];

    farNDCPosition[0] = farProjectedPosition[0] / farProjectedPosition[3];
    farNDCPosition[1] = farProjectedPosition[1] / farProjectedPosition[3];
    farNDCPosition[2] = farProjectedPosition[2] / farProjectedPosition[3];
    farNDCPosition[3] = farProjectedPosition[3] / farProjectedPosition[3];

    console.log('re nearNDCPosition : ', nearNDCPosition);
    console.log('re farNDCPosition : ', farNDCPosition);

    screenPosition[0] = viewport[0] + viewport[2] / 2 + (viewport[2] / 2) * nearNDCPosition[0];
    screenPosition[1] = viewport[1] + viewport[3] / 2 + (viewport[3] / 2) * nearNDCPosition[1];
    windowPosition[0] = screenPosition[0];
    windowPosition[1] = height - screenPosition[1];
    console.log('re screenPosition : ', screenPosition);
    console.log('re windowPosition : ', windowPosition);
  };

  const mouseDownEvent = (event) => {
    const windowPosition = [event.offsetX, event.offsetY];
    console.log('ortho');
    camera.ortho(-width, width, -height, height, -1000, 1000);
    doCoordinate(windowPosition);

    console.log('perspective');
    const fovYDegree = 45;
    const fovY = (fovYDegree * Math.PI) / 180;
    const aspect = 640 / 480;
    const near = 1;
    const far = 1000;
    camera.perspective(fovY, aspect, near, far);
    doCoordinate(windowPosition);

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

export default CoordinateSystem;
