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

    // viewport[0] = width / 2;
    // viewport[1] = height / 2;
    // viewport[2] = width / 2;
    // viewport[3] = height / 2;
    viewport[0] = 0;
    viewport[1] = 0;
    viewport[2] = width;
    viewport[3] = height;
    viewport[4] = -1000;
    viewport[5] = 1000;

    // camera.setLootAt(camEye, camTar, camUp);
    camera.setFrustum(-width, width, -height, height, -1000, 1000);

    gl.viewport(viewport[0], viewport[1], viewport[2], viewport[3]);
    gl.depthRange(viewport[4], viewport[5]);
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

    gl.enable(gl.CULL_FACE);
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

  const mouseDownEvent = (event) => {
    console.log('event : ', event);
    const { target } = event;
    console.log('event.offsetX : ', event.offsetX);
    console.log('event.offsetY : ', event.offsetY);
    console.log('camera : ', camera);
    console.log('target.width : ', target.width);
    console.log('target.height : ', target.height);

    const windowPosition = [event.offsetX, event.offsetY];
    const screenPosition = [windowPosition[0], target.height - windowPosition[1]];

    const normalizedScreenPosition = [
      screenPosition[0] / target.width,
      screenPosition[1] / target.height,
    ];

    const normalizedViewportScale = [viewport[2] / target.width, viewport[3] / target.height];
    const normalizedViewportOrigin = [viewport[0] / target.width, viewport[1] / target.height];
    const normalizedViewport = [
      normalizedViewportOrigin[0],
      normalizedViewportOrigin[0] + normalizedViewportScale[0],
      normalizedViewportOrigin[1],
      normalizedViewportOrigin[1] + normalizedViewportScale[1],
    ];
    const normalizedViewportPosition = [
      (normalizedScreenPosition[0] - normalizedViewportOrigin[0]) / normalizedViewportScale[0],
      (normalizedScreenPosition[1] - normalizedViewportOrigin[1]) / normalizedViewportScale[1],
    ];
    const NDCPosition = [
      normalizedViewportPosition[0] * 2.0 - 1.0,
      normalizedViewportPosition[1] * 2.0 - 1.0,
      0.5 * 2.0 - 1.0, // The z-axis is assumed to be 'near' position of the camera.
    ];

    const { wcvc, vcwc, vcpc, pcvc, wcpc } = camera.getState();

    const viewPosition = vec3.create();
    vec3.transformMat4(viewPosition, NDCPosition, pcvc);
    const worldPosition = vec3.create();
    vec3.transformMat4(worldPosition, viewPosition, vcwc);

    console.log('windowPosition : ', windowPosition);
    console.log('screenPosition : ', screenPosition);
    console.log('normalizedScreenPosition : ', normalizedScreenPosition);
    console.log('normalizedViewportScale : ', normalizedViewportScale);
    console.log('normalizedViewportOrigin : ', normalizedViewportOrigin);
    console.log('normalizedViewport : ', normalizedViewport);
    console.log('normalizedViewportPosition : ', normalizedViewportPosition);
    console.log('NDCPosition : ', NDCPosition);
    console.log('viewPosition : ', viewPosition);
    console.log('worldPosition : ', worldPosition);

    const re_viewPosition = vec3.create();
    vec3.transformMat4(re_viewPosition, worldPosition, wcvc);
    console.log('re_viewPosition : ', re_viewPosition);
    const re_NDCPosition = vec3.create();
    vec3.transformMat4(re_NDCPosition, re_viewPosition, vcpc);
    console.log('re_NDCPosition : ', re_NDCPosition);

    const pwcvc = mat4.create();
    mat4.lookAt(pwcvc, [0, 0, 0], [0, 0, -50], [0, 1, 0]);
    const pvcpc = mat4.create();
    const fovYDegree = 45;
    const fovY = (fovYDegree * Math.PI) / 180;
    const aspect = 640 / 480;
    const near = 50;
    const far = 100;
    mat4.perspective(pvcpc, fovY, aspect, near, far);
    const ppcvc = mat4.create();
    const pvcwc = mat4.create();
    mat4.invert(pvcwc, pwcvc);
    mat4.invert(ppcvc, pvcpc);
    mat4.transpose(ppcvc, ppcvc);

    const ovcpc = mat4.create();
    mat4.ortho(ovcpc, -halfWidth, halfWidth, -halfHeight, halfHeight, near, far);
    const opcvc = mat4.create();
    const ovcwc = mat4.create();
    mat4.invert(ovcwc, pwcvc);
    mat4.invert(opcvc, ovcpc);
    mat4.transpose(opcvc, opcvc);

    const tangent = Math.tan(fovY / 2);
    const pheight = near * tangent;
    const pwidth = pheight * aspect;

    // const valuew = -640 / 2;
    // const valueh = -480 / 2;
    const valuew = -100;
    const valueh = -100;
    const vec3z1 = vec3.clone([valuew, valueh, -0.5]);
    const vec3z10 = vec3.clone([valuew, valueh, -10]);
    const vec3z100 = vec3.clone([valuew, valueh, -50]);
    const vec3z1000 = vec3.clone([valuew, valueh, -100]);
    const vec4z1 = vec4.clone([valuew, valueh, -0.5, 1]);
    const vec4z10 = vec4.clone([valuew, valueh, -10, 1]);
    const vec4z100 = vec4.clone([valuew, valueh, -50, 1]);
    const vec4z1000 = vec4.clone([valuew, valueh, -100, 1]);
    console.log('vec3z1 o : ', vec3z1);
    console.log('vec3z10 o : ', vec3z10);
    console.log('vec3z100 o : ', vec3z100);
    console.log('vec3z1000 o : ', vec3z1000);
    console.log('vec4z1 o : ', vec4z1);
    console.log('vec4z10 o : ', vec4z10);
    console.log('vec4z100 o : ', vec4z100);
    console.log('vec4z1000 o : ', vec4z1000);

    vec3.transformMat4(vec3z1, vec3z1, pwcvc);
    vec3.transformMat4(vec3z10, vec3z10, pwcvc);
    vec3.transformMat4(vec3z100, vec3z100, pwcvc);
    vec3.transformMat4(vec3z1000, vec3z1000, pwcvc);
    vec4.transformMat4(vec4z1, vec4z1, pwcvc);
    vec4.transformMat4(vec4z10, vec4z10, pwcvc);
    vec4.transformMat4(vec4z100, vec4z100, pwcvc);
    vec4.transformMat4(vec4z1000, vec4z1000, pwcvc);

    console.log('vec3z1 e : ', vec3z1);
    console.log('vec3z10 e : ', vec3z10);
    console.log('vec3z100 e : ', vec3z100);
    console.log('vec3z1000 e : ', vec3z1000);
    console.log('vec4z1 e : ', vec4z1);
    console.log('vec4z10 e : ', vec4z10);
    console.log('vec4z100 e : ', vec4z100);
    console.log('vec4z1000 e : ', vec4z1000);

    const ovec3z1 = vec3.clone(vec3z1);
    const ovec3z10 = vec3.clone(vec3z10);
    const ovec3z100 = vec3.clone(vec3z100);
    const ovec3z1000 = vec3.clone(vec3z1000);
    const ovec4z1 = vec4.clone(vec4z1);
    const ovec4z10 = vec4.clone(vec4z10);
    const ovec4z100 = vec4.clone(vec4z100);
    const ovec4z1000 = vec4.clone(vec4z1000);

    const pvec3z1 = vec3.clone(vec3z1);
    const pvec3z10 = vec3.clone(vec3z10);
    const pvec3z100 = vec3.clone(vec3z100);
    const pvec3z1000 = vec3.clone(vec3z1000);
    const pvec4z1 = vec4.clone(vec4z1);
    const pvec4z10 = vec4.clone(vec4z10);
    const pvec4z100 = vec4.clone(vec4z100);
    const pvec4z1000 = vec4.clone(vec4z1000);

    vec3.transformMat4(ovec3z1, ovec3z1, ovcpc);
    vec3.transformMat4(ovec3z10, ovec3z10, ovcpc);
    vec3.transformMat4(ovec3z100, ovec3z100, ovcpc);
    vec3.transformMat4(ovec3z1000, ovec3z1000, ovcpc);
    vec4.transformMat4(ovec4z1, ovec4z1, ovcpc);
    vec4.transformMat4(ovec4z10, ovec4z10, ovcpc);
    vec4.transformMat4(ovec4z100, ovec4z100, ovcpc);
    vec4.transformMat4(ovec4z1000, ovec4z1000, ovcpc);

    vec3.transformMat4(pvec3z1, pvec3z1, pvcpc);
    vec3.transformMat4(pvec3z10, pvec3z10, pvcpc);
    vec3.transformMat4(pvec3z100, pvec3z100, pvcpc);
    vec3.transformMat4(pvec3z1000, pvec3z1000, pvcpc);
    vec4.transformMat4(pvec4z1, pvec4z1, pvcpc);
    vec4.transformMat4(pvec4z10, pvec4z10, pvcpc);
    vec4.transformMat4(pvec4z100, pvec4z100, pvcpc);
    vec4.transformMat4(pvec4z1000, pvec4z1000, pvcpc);

    console.log('ovec3z1 : ', ovec3z1);
    console.log('ovec3z10 : ', ovec3z10);
    console.log('ovec3z100 : ', ovec3z100);
    console.log('ovec3z1000 : ', ovec3z1000);
    console.log('ovec4z1 : ', ovec4z1);
    console.log('ovec4z10 : ', ovec4z10);
    console.log('ovec4z100 : ', ovec4z100);
    console.log('ovec4z1000 : ', ovec4z1000);

    console.log('pvec3z1 : ', pvec3z1);
    console.log('pvec3z10 : ', pvec3z10);
    console.log('pvec3z100 : ', pvec3z100);
    console.log('pvec3z1000 : ', pvec3z1000);
    console.log('pvec4z1 : ', pvec4z1);
    console.log('pvec4z10 : ', pvec4z10);
    console.log('pvec4z100 : ', pvec4z100);
    console.log('pvec4z1000 : ', pvec4z1000);

    console.log('pwidth : ', pwidth);
    console.log('pheight : ', pheight);

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
