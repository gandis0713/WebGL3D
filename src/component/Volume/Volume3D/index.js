import React, {useState, useEffect } from 'react'
import xmlVtiReader from '../../../common/DicomReader'
import { createShader, createShaderProgram } from '../../../webgl/shader/Shader'
import vertexShaderSource from './glsl/vs.glsl'
import fragmentShaderSource from './glsl/fs.glsl'
import {vec2, vec3, mat4} from 'gl-matrix'
import {vertices, textCoords} from './resource'


import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

const camEye = vec3.create();
camEye[0] = 0;
camEye[1] = 0;
camEye[2] = 0.0001;
const camUp = vec3.create();
camUp[0] = 0;
camUp[1] = 1;
camUp[2] = 0;
const camTar = vec3.create();
let camNear = 0.5;
let camFar = -0.5;

const MCWC = mat4.create();
const WCMC = mat4.create();
mat4.invert(WCMC, MCWC);

const WCVC = mat4.create();
const VCWC = mat4.create();
mat4.invert(VCWC, WCVC);

const VCPC = mat4.create();
const PCVC = mat4.create();
mat4.invert(PCVC, VCPC);

const MCVC = mat4.create();
const VCMC = mat4.create();
const MCPC = mat4.create();

let isDragging = false;
let prePosition = [0, 0];
let gl;

let width = 0;
let height = 0;
let halfWidth = 0;
let halfHeight = 0;

let shaderProgram;

let vbo_vertexBuffer;
// let vbo_textCoordBuffer;
let vbo_volumeBuffer;
let vao;
let u_MCPC;
let u_MCVC;
let u_VCMC;
let u_PCVC;
let u_Dim;
let u_Center;
let u_Extent;
let u_Bounds;
let u_Spacing;
let u_camTar;
let u_camNear;
let u_camFar;
let u_width;
let u_height;
let u_depth;
let u_boxX;
let u_boxY;
let u_boxZ;

let u_planeNormal0;
let u_planeNormal1;
let u_planeNormal2;
let u_planeNormal3;
let u_planeNormal4;
let u_planeNormal5;
let u_planeDist0;
let u_planeDist1;
let u_planeDist2;
let u_planeDist3;
let u_planeDist4;
let u_planeDist5;

let volume;

function Volume3D() {
  console.log("Volume3D."); 
  
  const onMounted = function() {
    console.log("on Mounted.");

    if(gl) {
      console.log("View was already initialized.");
      return;
    }

    initView();
  }
  
  const mouseMoveEvent = (event) => {
    if(isDragging === true) {
      
      const diffX = event.offsetX - halfWidth - prePosition[0];
      const diffY = halfHeight - event.offsetY - prePosition[1];

      const screenNormal = [0, 0, 1];
      const dir = [diffX, diffY, 0];
      const axis = vec3.create();
      vec3.cross(axis, dir, screenNormal);

      vec3.normalize(axis, axis);

      // const r = diffX < 0 ? 1 : -1;
      // const r = diffY < 0 ? 1 : -1;

      // axis[0] = r;
      // axis[1] = 0;
      // axis[2] = 0;
      
      let dgreeX = vec3.dot(axis, [1, 0, 0]);
      let dgreeY = vec3.dot(axis, [0, 1, 0]);

      dgreeX = dgreeX * 3.141592 / 180.0;
      dgreeY = dgreeY * 3.141592 / 180.0;

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
      mat4.ortho(VCPC, -halfWidth, halfWidth, -halfHeight, halfHeight, -1000, 1000);

      mat4.multiply(MCVC, WCVC, MCWC);
      mat4.invert(VCMC, MCVC);
      mat4.multiply(MCPC, VCPC, MCVC);

      prePosition[0] = event.offsetX - halfWidth;
      prePosition[1] = halfHeight - event.offsetY;

      setCurrentValues();
      
      render();
    }
  }

  const setCurrentValues = function() {
    const pos = vec3.create();
    volume.current.box = [1000, -1000, 1000, -1000, 1000, -1000];
    const bounds = [0, 1, 0, 1, 0, 1];
    for(let i = 0; i < 8; i++) {
      vec3.set(
        pos,
        bounds[i % 2],
        bounds[2 + (Math.floor(i / 2) % 2)],
        bounds[4 + Math.floor(i / 4)]
        );
      vec3.transformMat4(pos, pos, MCVC);
    
      for(let j = 0; j < 3; j++) {
        volume.current.box[j * 2] = Math.min(pos[j], volume.current.box[j * 2]); 
        volume.current.box[j * 2 + 1] = Math.max(pos[j], volume.current.box[j * 2 + 1]); 
      }
    }
    // volume.current.box[4] += 1000; 
    // volume.current.box[5] += 1000; 

    volume.current.planeNormal0 = [-1, 0, 0];
    volume.current.planeNormal1 = [ 1, 0, 0];
    volume.current.planeNormal2 = [ 0,-1, 0];
    volume.current.planeNormal3 = [ 0, 1, 0];
    volume.current.planeNormal4 = [ 0, 0,-1];
    volume.current.planeNormal5 = [ 0, 0, 1];

    vec3.transformMat4(volume.current.planeNormal0, volume.current.planeNormal0, MCVC);
    vec3.transformMat4(volume.current.planeNormal1, volume.current.planeNormal1, MCVC);
    vec3.transformMat4(volume.current.planeNormal2, volume.current.planeNormal2, MCVC);
    vec3.transformMat4(volume.current.planeNormal3, volume.current.planeNormal3, MCVC);
    vec3.transformMat4(volume.current.planeNormal4, volume.current.planeNormal4, MCVC);
    vec3.transformMat4(volume.current.planeNormal5, volume.current.planeNormal5, MCVC);
    
    vec3.normalize(volume.current.planeNormal0, volume.current.planeNormal0);
    vec3.normalize(volume.current.planeNormal1, volume.current.planeNormal1);
    vec3.normalize(volume.current.planeNormal2, volume.current.planeNormal2);
    vec3.normalize(volume.current.planeNormal3, volume.current.planeNormal3);
    vec3.normalize(volume.current.planeNormal4, volume.current.planeNormal4);
    vec3.normalize(volume.current.planeNormal5, volume.current.planeNormal5);
    
    console.log("volume : ", volume);
  }

  const mouseDownEvent = (event) => {
    isDragging = true;

    prePosition[0] = event.offsetX - halfWidth;
    prePosition[1] = halfHeight - event.offsetY;
    
    render();
  }

  const mouseUpEvent = (event) => {
    isDragging = false;
  }

  const initView = function() {
    
    const glCanvas = document.getElementById("glcanvas");
    glCanvas.addEventListener("mousedown", mouseDownEvent , false);
    glCanvas.addEventListener("mousemove", mouseMoveEvent , false);
    glCanvas.addEventListener("mouseup", mouseUpEvent , false);
    gl = glCanvas.getContext("webgl2");
    if(!gl) {
      console.log("Failed to get gl context for webgl2.");
      return;
    }
    
    width = gl.canvas.width;
    height = gl.canvas.height;
    halfWidth = width / 2;
    halfHeight = height / 2;
    
    // init camera
    mat4.lookAt(WCVC, camEye, camTar, camUp);
    mat4.invert(VCWC, WCVC);
    mat4.multiply(MCVC, WCVC, MCWC);
    mat4.invert(VCMC, MCVC);
    mat4.ortho(VCPC, -halfWidth, halfWidth, -halfHeight, halfHeight, -1000, 1000);
    mat4.invert(PCVC, VCPC);
    mat4.multiply(MCPC, VCPC, MCVC);
    
    // create shader
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader);
    u_MCPC = gl.getUniformLocation(shaderProgram, 'u_MCPC');
    u_MCVC = gl.getUniformLocation(shaderProgram, 'u_MCVC');
    u_VCMC = gl.getUniformLocation(shaderProgram, 'u_VCMC');    
    u_PCVC = gl.getUniformLocation(shaderProgram, 'u_PCVC');
    u_Dim = gl.getUniformLocation(shaderProgram, 'u_Dim');
    u_Extent = gl.getUniformLocation(shaderProgram, 'u_Extent');
    u_Center = gl.getUniformLocation(shaderProgram, 'u_Center');
    u_Bounds = gl.getUniformLocation(shaderProgram, 'u_Bounds');
    u_Spacing = gl.getUniformLocation(shaderProgram, 'u_Spacing');
    u_camNear = gl.getUniformLocation(shaderProgram, 'u_camNear');
    u_camFar = gl.getUniformLocation(shaderProgram, 'u_camFar');
    u_camTar = gl.getUniformLocation(shaderProgram, 'u_camTar');
    u_width = gl.getUniformLocation(shaderProgram, 'u_width');
    u_height = gl.getUniformLocation(shaderProgram, 'u_height');
    u_depth = gl.getUniformLocation(shaderProgram, 'u_depth');
    u_boxX = gl.getUniformLocation(shaderProgram, 'u_boxX');
    u_boxY = gl.getUniformLocation(shaderProgram, 'u_boxY');
    u_boxZ = gl.getUniformLocation(shaderProgram, 'u_boxZ');
    u_planeNormal0 = gl.getUniformLocation(shaderProgram, 'u_planeNormal0');
    u_planeNormal1 = gl.getUniformLocation(shaderProgram, 'u_planeNormal1');
    u_planeNormal2 = gl.getUniformLocation(shaderProgram, 'u_planeNormal2');
    u_planeNormal3 = gl.getUniformLocation(shaderProgram, 'u_planeNormal3');
    u_planeNormal4 = gl.getUniformLocation(shaderProgram, 'u_planeNormal4');
    u_planeNormal5 = gl.getUniformLocation(shaderProgram, 'u_planeNormal5');
    u_planeDist0 = gl.getUniformLocation(shaderProgram, 'u_planeDist0');
    u_planeDist1 = gl.getUniformLocation(shaderProgram, 'u_planeDist1');
    u_planeDist2 = gl.getUniformLocation(shaderProgram, 'u_planeDist2');
    u_planeDist3 = gl.getUniformLocation(shaderProgram, 'u_planeDist3');
    u_planeDist4 = gl.getUniformLocation(shaderProgram, 'u_planeDist4');
    u_planeDist5 = gl.getUniformLocation(shaderProgram, 'u_planeDist5');
    
    setBuffer();
  }

  const setBuffer = function() {
    xmlVtiReader(`/assets/volumes/dicom.vti`).then((imageData) => {

      volume = imageData;
      
      volume.floatArray = new Float32Array(imageData.data.length);
      const range = volume.max - volume.min;
      for(let i = 0; i < volume.data.length; i++) {
        volume.floatArray[i] = (volume.data[i] - volume.min) / range;
      }
      volume.current = {};
      volume.current.planeNormal0 = [ 1, 0, 0];
      volume.current.planeNormal1 = [-1, 0, 0];
      volume.current.planeNormal2 = [ 0, 1, 0];
      volume.current.planeNormal3 = [ 0,-1, 0];
      volume.current.planeNormal4 = [ 0, 0, 1];
      volume.current.planeNormal5 = [ 0, 0,-1];
      volume.current.box = [1, -1, 1, -1, 1, -1];
      volume.current.planeDist0 = volume.bounds[1] - volume.center[0];
      volume.current.planeDist1 = volume.center[0] - volume.bounds[0];
      volume.current.planeDist2 = volume.bounds[3] - volume.center[1];
      volume.current.planeDist3 = volume.center[1] - volume.bounds[2];
      volume.current.planeDist4 = volume.bounds[5] - volume.center[2];
      volume.current.planeDist5 = volume.center[2] - volume.bounds[4];
      
      vao = gl.createVertexArray();

      vbo_volumeBuffer = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_3D, vbo_volumeBuffer);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage3D(gl.TEXTURE_3D,
        0,
        gl.R16F,
        imageData.dimension[0],
        imageData.dimension[1],
        imageData.dimension[2],
        0,
        gl.RED,
        gl.FLOAT,
        imageData.floatArray);

      vbo_vertexBuffer = gl.createBuffer();  
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo_vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      
      const vertexID = gl.getAttribLocation(shaderProgram, 'vs_VertexPosition');
      gl.enableVertexAttribArray(vertexID);
      gl.vertexAttribPointer(vertexID,
        2,
        gl.FLOAT,
        false,
        0,
        0);
      
      setCurrentValues();

      render();
    });
  }

  const render = function() {
    gl.clearColor(0, 0, 0, 1);
    // gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.useProgram(shaderProgram);
    gl.uniformMatrix4fv(u_MCPC, false, MCPC);
    gl.uniformMatrix4fv(u_MCVC, false, MCVC);
    gl.uniformMatrix4fv(u_VCMC, false, VCMC);
    gl.uniformMatrix4fv(u_PCVC, false, PCVC);
    gl.uniform3fv(u_Dim, volume.dimension);
    gl.uniform3fv(u_Extent, volume.extent);
    gl.uniform3fv(u_Center, volume.center);
    gl.uniform3fv(u_Bounds, volume.bounds);
    gl.uniform3fv(u_Spacing, volume.spacing);
    gl.uniform1f(u_camNear, camNear);
    gl.uniform1f(u_camFar, camFar);
    gl.uniform1f(u_camTar, camTar);
    gl.uniform1f(u_width, volume.bounds[1] - volume.bounds[0]);
    gl.uniform1f(u_height, volume.bounds[3] - volume.bounds[2]);
    gl.uniform1f(u_depth, volume.bounds[5] - volume.bounds[4]);
    gl.uniform2fv(u_boxX, [volume.current.box[0], volume.current.box[1]]);
    gl.uniform2fv(u_boxY, [volume.current.box[2], volume.current.box[3]]);
    gl.uniform2fv(u_boxZ, [volume.current.box[4], volume.current.box[5]]);
    gl.uniform3fv(u_planeNormal0, volume.current.planeNormal0);
    gl.uniform3fv(u_planeNormal1, volume.current.planeNormal1);
    gl.uniform3fv(u_planeNormal2, volume.current.planeNormal2);
    gl.uniform3fv(u_planeNormal3, volume.current.planeNormal3);
    gl.uniform3fv(u_planeNormal4, volume.current.planeNormal4);
    gl.uniform3fv(u_planeNormal5, volume.current.planeNormal5);
    gl.uniform1f(u_planeDist0, volume.current.planeDist0);
    gl.uniform1f(u_planeDist1, volume.current.planeDist1);
    gl.uniform1f(u_planeDist2, volume.current.planeDist2);
    gl.uniform1f(u_planeDist3, volume.current.planeDist3);
    gl.uniform1f(u_planeDist4, volume.current.planeDist4);
    gl.uniform1f(u_planeDist5, volume.current.planeDist5);
    gl.bindVertexArray(vao);

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
  }

  useEffect(onMounted, []);

  return(
    <div>
      <Grid container spacing={3}>
        <Grid item xs>
          <Typography gutterBottom>3D Volume Rendering</Typography>
        </Grid>
      </Grid>
      <canvas id="glcanvas" width="500" height ="500"/>
    </div>
  );
}

export default Volume3D;