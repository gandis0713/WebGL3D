import React, { useEffect } from 'react';
import { createShader, createRenderShaderProgram } from '../../../webgl/shader/Shader';
import vertexShaderSource from './glsl/vs.glsl';
import fragmentShaderSource from './glsl/fs.glsl';
import vertexShaderSourceFrame from './glsl/vs_frame.glsl';
import fragmentShaderSourceFrame from './glsl/fs_frame.glsl';
import { vec3, vec4, mat4 } from 'gl-matrix';
import Sphere from '../../../common/geometry/sphere';
import Camera from '../../../common/camera';
import PointLight from '../../../common/light/PointLight';
import Material from '../../../common/Material';
import { squreTextCoord, squreVertex } from './resource';

const VERTEX_OBJECT_LIST = {
  light: 0,
  sphere1: 1,
  sphere2: 2,
};

const pointLight = new PointLight();
pointLight.setPosition([1000, 0, 0]);
pointLight.setColor([1, 1, 1]);
const shapes = [new Sphere(), new Sphere(), new Sphere()];
shapes[VERTEX_OBJECT_LIST.light].setPosition(pointLight.getPosition());
shapes[VERTEX_OBJECT_LIST.light].setRadius(20);
shapes[VERTEX_OBJECT_LIST.sphere1].setSectorCount(50);
shapes[VERTEX_OBJECT_LIST.sphere1].setStackCount(50);
shapes[VERTEX_OBJECT_LIST.sphere2].setPosition([200, 200, 200]);
const materials = [new Material(), new Material(), new Material()];
materials[VERTEX_OBJECT_LIST.light].setColor(pointLight.getColor());
materials[VERTEX_OBJECT_LIST.light].setAmbient(pointLight.getColor());
materials[VERTEX_OBJECT_LIST.light].setDiffuse(pointLight.getColor());
materials[VERTEX_OBJECT_LIST.light].setSpecular(pointLight.getColor());
materials[VERTEX_OBJECT_LIST.sphere1].setColor([0.8, 0.2, 0]);
materials[VERTEX_OBJECT_LIST.sphere1].setSpecular([1, 1, 1]);
materials[VERTEX_OBJECT_LIST.sphere2].setColor([0.8, 0.2, 0]);
materials[VERTEX_OBJECT_LIST.sphere2].setSpecular([1, 1, 1]);
const camera = new Camera();

const MCWC = [mat4.create(), mat4.create(), mat4.create()];
mat4.rotateY(MCWC[1], MCWC[1], Math.PI / 2);

let animationRequest;

const vbo_objectPosition = [];
const vbo_objectIndex = [];
let fbo_color;
let tbo_framebuffer;
let vbo_drawingPosition;
let vbo_drawingTexCoord;

let renderShaderProgramObject = {};
let renderShaderProgramDrawing = {};

// let u_mWCPC;
// let u_mWCVC;
// let u_mVCPC;
// let u_mPCVC;
// let u_mVCWC;
// let u_fNear;
// let u_fFar;
// let u_vViewport;

// let a_vObjectPosition;
// let a_vObjectTexCoord;

function ZBuffer() {
  console.log('create ZBuffer');

  let isDragging = false;
  let gl;
  let glCanvas;

  let prePosition = [0, 0];

  let width = 0;
  let height = 0;
  let halfWidth = 0;
  let halfHeight = 0;

  const viewport = [];
  const depthRange = [];

  const onMounted = function() {
    // initialize
    glCanvas = document.getElementById('_glcanvas');
    glCanvas.addEventListener('mousedown', mouseDownEvent, false);
    glCanvas.addEventListener('mousemove', mouseMoveEvent, false);
    glCanvas.addEventListener('mouseup', mouseUpEvent, false);
    glCanvas.addEventListener('mousewheel', mouseWheelEvent, false);
    gl = glCanvas.getContext('webgl');

    if (!gl) {
      alert('Unable to initialize WebGL.');
      return;
    }

    gl.getExtension('WEBGL_depth_texture');

    width = gl.canvas.width;
    height = gl.canvas.height;
    halfWidth = width / 2;
    halfHeight = height / 2;

    viewport[0] = width / 2;
    viewport[1] = height / 2;
    viewport[2] = width / 2;
    viewport[3] = height / 2;
    viewport[0] = 0;
    viewport[1] = 0;
    viewport[2] = width;
    viewport[3] = height;
    depthRange[0] = 400;
    depthRange[1] = 1000;

    const fovYDegree = 90;
    const fovY = (fovYDegree * Math.PI) / 180;
    const aspect = width / height;
    const near = depthRange[0];
    const far = depthRange[1];
    camera.setLootAt([0, 0, 1000], [0, 0, 0], [0, 1, 0]);
    camera.perspective(fovY, aspect, near, far);
    // camera.ortho(-width, width, -height, height, near, far);

    // create shader
    createShaderProgramObject();
    createShaderProgramDrawing();

    createVertexBufferObject(VERTEX_OBJECT_LIST.light);
    bindVertexBufferObject(shapes, VERTEX_OBJECT_LIST.light);

    createVertexBufferObject(VERTEX_OBJECT_LIST.sphere1);
    bindVertexBufferObject(shapes, VERTEX_OBJECT_LIST.sphere1);

    createVertexBufferObject(VERTEX_OBJECT_LIST.sphere2);
    bindVertexBufferObject(shapes, VERTEX_OBJECT_LIST.sphere2);

    createTextureFramebuffer();
    bindTextureFramebuffer();

    createFramebufferColor();
    bindFramebufferColor();

    createVertexBufferDrawing();
    bindVertexBufferDrawing();

    render();
  };

  const createShaderProgramObject = () => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    renderShaderProgramObject.instance = createRenderShaderProgram(
      gl,
      vertexShader,
      fragmentShader
    );

    renderShaderProgramObject.uniform = {};
    renderShaderProgramObject.uniform.u_mWCPC = gl.getUniformLocation(
      renderShaderProgramObject.instance,
      'u_mWCPC'
    );
    renderShaderProgramObject.uniform.u_mPCVC = gl.getUniformLocation(
      renderShaderProgramObject.instance,
      'u_mPCVC'
    );
    renderShaderProgramObject.uniform.u_mVCWC = gl.getUniformLocation(
      renderShaderProgramObject.instance,
      'u_mVCWC'
    );
    renderShaderProgramObject.uniform.u_fNear = gl.getUniformLocation(
      renderShaderProgramObject.instance,
      'u_fNear'
    );
    renderShaderProgramObject.uniform.u_fFar = gl.getUniformLocation(
      renderShaderProgramObject.instance,
      'u_fFar'
    );
    renderShaderProgramObject.uniform.u_vViewport = gl.getUniformLocation(
      renderShaderProgramObject.instance,
      'u_vViewport'
    );

    renderShaderProgramObject.attribute = {};
    renderShaderProgramObject.attribute.a_vObjectPosition = gl.getAttribLocation(
      renderShaderProgramObject.instance,
      'a_vObjectPosition'
    );
  };

  const createShaderProgramDrawing = () => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSourceFrame);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceFrame);

    renderShaderProgramDrawing.instance = createRenderShaderProgram(
      gl,
      vertexShader,
      fragmentShader
    );

    renderShaderProgramDrawing.uniform = {};
    renderShaderProgramDrawing.uniform.u_mWCPC = gl.getUniformLocation(
      renderShaderProgramDrawing.instance,
      'u_mWCPC'
    );
    renderShaderProgramDrawing.uniform.u_Texture = gl.getUniformLocation(
      renderShaderProgramDrawing.instance,
      'u_Texture'
    );

    renderShaderProgramDrawing.attribute = {};
    renderShaderProgramDrawing.attribute.a_vObjectPosition = gl.getAttribLocation(
      renderShaderProgramDrawing.instance,
      'a_vObjectPosition'
    );

    renderShaderProgramDrawing.attribute.a_vObjectTexCoord = gl.getAttribLocation(
      renderShaderProgramDrawing.instance,
      'a_vObjectTexCoord'
    );
  };

  const createVertexBufferObject = (index) => {
    vbo_objectPosition[index] = gl.createBuffer();
    vbo_objectIndex[index] = gl.createBuffer();
  };

  const createFramebufferColor = () => {
    fbo_color = gl.createFramebuffer();
  };

  const createTextureFramebuffer = () => {
    tbo_framebuffer = gl.createTexture();
  };

  const createVertexBufferDrawing = () => {
    vbo_drawingPosition = gl.createBuffer();
    vbo_drawingTexCoord = gl.createBuffer();
  };

  const bindTextureFramebuffer = () => {
    gl.bindTexture(gl.TEXTURE_2D, tbo_framebuffer);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
  };

  const bindFramebufferColor = () => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo_color);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      tbo_framebuffer,
      0
    );

    // create a depth texture
    const depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.DEPTH_COMPONENT,
      width,
      height,
      0,
      gl.DEPTH_COMPONENT,
      gl.UNSIGNED_SHORT,
      null
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

  const bindVertexBufferDrawing = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_drawingPosition);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squreVertex), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_drawingTexCoord);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squreTextCoord), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  };

  const bindVertexBufferObject = (datas, index) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_objectPosition[index]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(datas[index].getData()), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_objectIndex[index]);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(datas[index].getTriangleIndices()),
      gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  };

  const render = function() {
    if (!gl) {
      console.log(' glContext return ');
      return;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo_color);

    gl.viewport(viewport[0], viewport[1], viewport[2], viewport[3]);
    gl.depthRange(0, 1);

    // gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    // Clear the canvas AND the depth buffer.

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // set program

    const { wcpc, vcpc, wcvc, pcvc, vcwc } = camera.getState();
    const { near, far } = camera.getState().frustum;
    gl.useProgram(renderShaderProgramObject.instance);
    gl.uniformMatrix4fv(renderShaderProgramObject.uniform.u_mWCPC, false, wcpc);
    gl.uniformMatrix4fv(renderShaderProgramObject.uniform.u_mWCVC, false, wcvc);
    gl.uniformMatrix4fv(renderShaderProgramObject.uniform.u_mVCPC, false, vcpc);
    gl.uniformMatrix4fv(renderShaderProgramObject.uniform.u_mPCVC, false, pcvc);
    gl.uniformMatrix4fv(renderShaderProgramObject.uniform.u_mVCWC, false, vcwc);
    gl.uniform1f(renderShaderProgramObject.uniform.u_fNear, near);
    gl.uniform1f(renderShaderProgramObject.uniform.u_fFar, far);
    gl.uniform4fv(renderShaderProgramObject.uniform.u_vViewport, viewport);

    // draw triangle

    drawVertexObject(shapes, materials, VERTEX_OBJECT_LIST.light);
    drawVertexObject(shapes, materials, VERTEX_OBJECT_LIST.sphere1);
    drawVertexObject(shapes, materials, VERTEX_OBJECT_LIST.sphere2);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(renderShaderProgramDrawing.instance);
    gl.uniformMatrix4fv(renderShaderProgramDrawing.uniform.u_mWCPC, false, wcpc);
    gl.bindTexture(gl.TEXTURE_2D, tbo_framebuffer);
    gl.uniform1i(renderShaderProgramDrawing.uniform.u_Texture, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_drawingPosition);
    gl.enableVertexAttribArray(renderShaderProgramDrawing.attribute.a_vObjectPosition);
    gl.vertexAttribPointer(
      renderShaderProgramDrawing.attribute.a_vObjectPosition,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_drawingTexCoord);
    gl.enableVertexAttribArray(renderShaderProgramDrawing.attribute.a_vObjectTexCoord);
    gl.vertexAttribPointer(
      renderShaderProgramDrawing.attribute.a_vObjectTexCoord,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.drawArrays(gl.TRIANGLES, 0, squreVertex.length / 3);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.disableVertexAttribArray(renderShaderProgramDrawing.attribute.a_vObjectPosition);
    gl.disableVertexAttribArray(renderShaderProgramDrawing.attribute.a_vObjectTexCoord);

    animationRequest = requestAnimationFrame(render);
  };

  const drawVertexObject = (datas, materials, index) => {
    // enable vertex attribute
    gl.enableVertexAttribArray(renderShaderProgramObject.attribute.a_vObjectPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_objectPosition[index]);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_objectIndex[index]);
    gl.vertexAttribPointer(
      renderShaderProgramObject.attribute.a_vObjectPosition,
      3,
      gl.FLOAT,
      false,
      24,
      0
    );

    // draw
    gl.drawElements(gl.TRIANGLES, datas[index].getTriangleIndices().length, gl.UNSIGNED_SHORT, 0);

    // disable vertex attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.disableVertexAttribArray(renderShaderProgramObject.attribute.a_vObjectPosition);
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
      <canvas id="_glcanvas" width="512" height="512" />
    </>
  );
}

export default ZBuffer;
