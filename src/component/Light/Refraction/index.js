import React, { useEffect } from 'react';
import { createShader, createRenderShaderProgram } from '../../../webgl/shader/Shader';
import vertexShaderSource from './glsl/vs.glsl';
import fragmentShaderSource from './glsl/fs.glsl';
import vertexBackgroundShaderSource from './glsl/background_vs.glsl';
import fragmentBackgroundShaderSource from './glsl/background_fs.glsl';
import { vec3, mat4 } from 'gl-matrix';
import Sphere from '../../../common/geometry/sphere';
import { backgroundVertex, skyBoxVertex } from './resource';
import Camera from '../../../common/camera';
import PointLight from '../../../common/light/PointLight';
import Material from '../../../common/Material';

const OBJECT = {
  light: 0,
  sphere: 1,
  background: 2,
};

const getCubeGLTarget = (gl) => {
  return [
    gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
  ];
};

const skyboxType = 2;
const cubeImages = [
  `assets/images/skybox${skyboxType}/right.jpg`,
  `assets/images/skybox${skyboxType}/left.jpg`,
  `assets/images/skybox${skyboxType}/top.jpg`,
  `assets/images/skybox${skyboxType}/bottom.jpg`,
  `assets/images/skybox${skyboxType}/front.jpg`,
  `assets/images/skybox${skyboxType}/back.jpg`,
];

const pointLight = new PointLight();
pointLight.setPosition([1000, 700, 0]);
pointLight.setColor([1, 1, 0]);
const shapes = [new Sphere(), new Sphere()];
shapes[OBJECT.light].setPosition(pointLight.getPosition());
shapes[OBJECT.light].setRadius(20);
shapes[OBJECT.sphere].setSectorCount(50);
shapes[OBJECT.sphere].setStackCount(50);
shapes[OBJECT.sphere].setRadius(1000);
const materials = [new Material(), new Material()];
materials[OBJECT.light].setColor(pointLight.getColor());
materials[OBJECT.light].setAmbient(pointLight.getColor());
materials[OBJECT.light].setDiffuse(pointLight.getColor());
materials[OBJECT.light].setSpecular(pointLight.getColor());
materials[OBJECT.sphere].setColor([1, 1, 0]);
materials[OBJECT.sphere].setSpecular([1, 1, 0]);
const camera = new Camera();

const MCWC = [mat4.create(), mat4.create()];
mat4.rotateY(MCWC[1], MCWC[1], Math.PI / 2);

let animationRequest;

const vbo_vertexPosition = [];
const vbo_indexBuffer = [];
const vbo_lineIndexBuffer = [];

const vbo_skyBoxVertexBuffer = [];
const vbo_skyBoxTextureBuffer = [];
const vbo_backgroundVertexBuffer = [];

const renderShaderProgram = [];

const uMCWC = [];
const uWCPC = [];
const uWCVC = [];
const uVCWC = [];
const uVCPC = [];
const uPCWC = [];

const uColor = [];
const uAmbient = [];
const uDiffuse = [];
const uSpecular = [];

const uLightColor = [];
const uLightPosition = [];

const uCamPosition = [];
const uTexture = [];

const attrVertexPosition = [];
const attrVertexNormal = [];

function Refraction() {
  console.log('create Refraction');

  let isDragging = false;
  let gl;
  let glCanvas;

  let prePosition = [0, 0];

  let width = 0;
  let height = 0;
  let halfWidth = 0;
  let halfHeight = 0;

  const createShaderProgram = (index, vertexShaderSource, fragmentShaderSource) => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    renderShaderProgram[index] = createRenderShaderProgram(gl, vertexShader, fragmentShader);
  };

  const setUniformLocation = (index) => {
    uMCWC[index] = gl.getUniformLocation(renderShaderProgram[index], 'uMCWC');
    uWCPC[index] = gl.getUniformLocation(renderShaderProgram[index], 'uWCPC');
    uWCVC[index] = gl.getUniformLocation(renderShaderProgram[index], 'uWCVC');
    uVCWC[index] = gl.getUniformLocation(renderShaderProgram[index], 'uVCWC');
    uVCPC[index] = gl.getUniformLocation(renderShaderProgram[index], 'uVCPC');
    uPCWC[index] = gl.getUniformLocation(renderShaderProgram[index], 'uPCWC');
    uColor[index] = gl.getUniformLocation(renderShaderProgram[index], 'uColor');
    uAmbient[index] = gl.getUniformLocation(renderShaderProgram[index], 'uAmbient');
    uDiffuse[index] = gl.getUniformLocation(renderShaderProgram[index], 'uDiffuse');
    uSpecular[index] = gl.getUniformLocation(renderShaderProgram[index], 'uSpecular');
    uLightColor[index] = gl.getUniformLocation(renderShaderProgram[index], 'uLightColor');
    uLightPosition[index] = gl.getUniformLocation(renderShaderProgram[index], 'uLightPosition');
    uCamPosition[index] = gl.getUniformLocation(renderShaderProgram[index], 'uCamPosition');
    uTexture[index] = gl.getUniformLocation(renderShaderProgram[index], 'uTexture');

    attrVertexPosition[index] = gl.getAttribLocation(
      renderShaderProgram[index],
      'attrVertexPosition'
    );
    attrVertexNormal[index] = gl.getAttribLocation(renderShaderProgram[index], 'attrVertexNormal');
  };

  const createBuffer = (index) => {
    vbo_vertexPosition[index] = gl.createBuffer();
    vbo_indexBuffer[index] = gl.createBuffer();
    vbo_lineIndexBuffer[index] = gl.createBuffer();
  };

  const createSkyBoxBuffer = (index) => {
    vbo_skyBoxVertexBuffer[index] = gl.createBuffer();
    vbo_skyBoxTextureBuffer[index] = gl.createTexture();
  };

  const createBackgroundBuffer = (index) => {
    vbo_backgroundVertexBuffer[index] = gl.createBuffer();
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

  const bindSkyBoxBufferData = async (index) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_skyBoxVertexBuffer[index]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(skyBoxVertex), gl.STATIC_DRAW);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, vbo_skyBoxTextureBuffer[index]);
    const cubeGLTarget = getCubeGLTarget(gl);
    for (let i = 0; i < cubeImages.length; i++) {
      const imagePromise = new Promise((res) => {
        const img = new Image();
        img.src = cubeImages[i];
        img.addEventListener('load', function() {
          res(img);
        });
      });

      const image = await imagePromise;
      gl.texImage2D(
        cubeGLTarget[i],
        0,
        gl.RGB,
        image.width,
        image.height,
        0,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        image
      );
    }
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
  };

  const bindBackgrounBufferData = (index) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_backgroundVertexBuffer[index]);
    gl.bufferData(gl.ARRAY_BUFFER, backgroundVertex, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
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
    camera.setFrustum(-width * 2, width * 2, -height * 2, height * 2, -10000, 10000);

    gl.viewport(0, 0, width, height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // create shader
    createShaderProgram(OBJECT.light, vertexShaderSource, fragmentShaderSource);
    setUniformLocation(OBJECT.light);
    createBuffer(OBJECT.light);
    bindBufferData(shapes, OBJECT.light);

    createShaderProgram(OBJECT.sphere, vertexShaderSource, fragmentShaderSource);
    setUniformLocation(OBJECT.sphere);
    createBuffer(OBJECT.sphere);
    bindBufferData(shapes, OBJECT.sphere);

    createSkyBoxBuffer(0);
    bindSkyBoxBufferData(0);

    createShaderProgram(
      OBJECT.background,
      vertexBackgroundShaderSource,
      fragmentBackgroundShaderSource
    );
    setUniformLocation(OBJECT.background);
    createBackgroundBuffer(OBJECT.background);
    bindBackgrounBufferData(OBJECT.background);

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

    // draw(shapes, materials, OBJECT.light);
    draw(shapes, materials, OBJECT.sphere);
    drawBackground(OBJECT.background);

    animationRequest = requestAnimationFrame(render);
  };

  const draw = (datas, materials, index) => {
    gl.useProgram(renderShaderProgram[index]);
    const { wcpc, vcpc, wcvc, vcwc, pcwc } = camera.getState();
    gl.uniformMatrix4fv(uMCWC[index], false, MCWC[index]);
    gl.uniformMatrix4fv(uWCPC[index], false, wcpc);
    gl.uniformMatrix4fv(uWCVC[index], false, wcvc);
    gl.uniformMatrix4fv(uVCWC[index], false, vcwc);
    gl.uniformMatrix4fv(uVCPC[index], false, vcpc);
    gl.uniformMatrix4fv(uPCWC[index], false, pcwc);
    gl.uniform3fv(uColor[index], materials[index].getColor());
    gl.uniform3fv(uAmbient[index], materials[index].getAmbient());
    gl.uniform3fv(uDiffuse[index], materials[index].getDiffuse());
    gl.uniform3fv(uSpecular[index], materials[index].getSpecular());
    gl.uniform3fv(uLightColor[index], pointLight.getColor());
    gl.uniform3fv(uLightPosition[index], pointLight.getPosition());
    gl.uniform3fv(uCamPosition[index], camera.getPosition());

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_vertexPosition[index]);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_indexBuffer[index]);
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_lineIndexBuffer[index]);

    // gl.activeTexture(gl.TEXTURE0);
    // gl.bindTexture(gl.TEXTURE_CUBE_MAP, vbo_cubeTextureBuffer[0]);
    gl.uniform1i(uTexture[index], 0);
    gl.enableVertexAttribArray(attrVertexPosition[index]);
    gl.enableVertexAttribArray(attrVertexNormal[index]);
    gl.vertexAttribPointer(attrVertexPosition[index], 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(attrVertexNormal[index], 3, gl.FLOAT, false, 24, 12);

    gl.drawElements(gl.TRIANGLES, datas[index].getTriangleIndices().length, gl.UNSIGNED_SHORT, 0);
    // gl.drawElements(gl.LINES, datas[index].getLineIndices().length, gl.UNSIGNED_SHORT, 0);

    gl.disableVertexAttribArray(attrVertexPosition[index]);
    gl.disableVertexAttribArray(attrVertexNormal[index]);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  };

  const drawBackground = (index) => {
    gl.depthFunc(gl.LEQUAL);
    gl.useProgram(renderShaderProgram[index]);
    const { vcwc } = camera.getState();
    const vcwcWidhOutPosition = mat4.clone(vcwc);
    vcwcWidhOutPosition[12] = 0;
    vcwcWidhOutPosition[13] = 0;
    vcwcWidhOutPosition[14] = 0;
    gl.uniformMatrix4fv(uVCWC[index], false, vcwcWidhOutPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_backgroundVertexBuffer[index]);
    gl.uniform1i(uTexture[index], 0);
    gl.enableVertexAttribArray(attrVertexPosition[index]);
    gl.vertexAttribPointer(attrVertexPosition[index], 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.disableVertexAttribArray(attrVertexPosition[index]);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.depthFunc(gl.LESS);
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

export default Refraction;
