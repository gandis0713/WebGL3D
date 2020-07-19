import React, { useEffect, useState } from 'react';
import { createShader, createRenderShaderProgram } from '../../../webgl/shader/Shader'
import vertexShaderSource from './glsl/vs.glsl'
import fragmentShaderSource from './glsl/fs.glsl'
import {vertex, F, normals} from './resource'
import {vec3, mat4} from 'gl-matrix'
import { openSTLByUrl } from "../../../common/OpenSTLFile"

const vertices = [];

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

function Mesh2DOutlineComputeShader() {

  console.log("create TextureRendering");

  let isDragging = false;
  let gl;
  let glCanvas;

  let vbo_vertexPosition;
  let vbo_normals;
  let vbo_texture;
  let vbo_textureTarget;
  let vbo_frame;

  let vao;

  let renderShaderProgram;

  let u_MCPC;
  let u_VCPC;
  let vs_vertexPosition;
  let vs_Normal;
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
    if(child === 0) {
      return false;
    }

    const v3v1 = vec3.create();
    vec3.subtract(v3v1, [0, 0, 0], v1);
    const parent = vec3.dot(forward, v3v1);
    const u = parent/ child;
    if(u < 0 || u > 1) {
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
  }

  const computeLine = function() {
    lines = [];
    for(let i = 0; i < vertices.length; i += 9) {
      let tri1 = [vertices[i], vertices[i+1], vertices[i+2]];
      let tri2 = [vertices[i+3], vertices[i+4], vertices[i+5]];
      let tri3 = [vertices[i+6], vertices[i+7], vertices[i+8]];

      addPoint(tri1, tri2);
      addPoint(tri2, tri3);
      addPoint(tri3, tri1);
    }
    // console.log("lines : ", lines);
  }
  const onMounted = function() {

    // initialize
    glCanvas = document.getElementById("_glcanvas");
    glCanvas.addEventListener("mousedown", mouseDownEvent , false);
    glCanvas.addEventListener("mousemove", mouseMoveEvent , false);
    glCanvas.addEventListener("mouseup", mouseUpEvent , false);
    gl = glCanvas.getContext("webgl2");

    if(!gl) {
      alert("Unable to initialize WebGL.");
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
    vs_vertexPosition = gl.getAttribLocation(renderShaderProgram, 'vs_VertexPosition');
    vs_Normal = gl.getAttribLocation(renderShaderProgram, 'vs_Normal');

    // initialize buffer

    const rotateMat = mat4.create();
    mat4.identity(rotateMat);
    mat4.rotateX(rotateMat, rotateMat, 89 * Math.PI / 180.0);
    let temp = [];
    openSTLByUrl("assets/stl/Implant01.stl")
    .then((data) => {      
      data.getPoints().getData().forEach(data => {
        temp.push(data);
      });

      openSTLByUrl("assets/stl/Crown_23.stl")
      .then((data) => {     
        
        data.getPoints().getData().forEach(data => {
          temp.push(data);
        })

        for(let i = 0; i < temp.length; i += 3) {
          const point = vec3.create();
          point[0] = temp[i];
          point[1] = temp[i + 1];
          point[2] = temp[i + 2];
          vec3.transformMat4(point, point, rotateMat);
          vertices.push(point[0]);
          vertices.push(point[1]);
          vertices.push(point[2]);
        }

        
        computeLine();
        vbo_vertexPosition = gl.createBuffer();
        drawScene();
        
      })
      .catch((error) => {
        console.log(error.message);
      });      
    })
    .catch((error) => {
      console.log(error.message);
    });
  }
  
  const drawScene = function() {
    if(!gl) {
      console.log(" glContext return ");
      return;
    }    

    // gl.enable(gl.CULL_FACE);
    // gl.enable(gl.DEPTH_TEST);
    // Clear the canvas AND the depth buffer.
    gl.clearColor(0, 0, 0, 1);   // clear to blue
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enableVertexAttribArray(vs_vertexPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_vertexPosition);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      vs_vertexPosition,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.useProgram(renderShaderProgram);
    // gl.bindVertexArray(vao);  

    gl.uniformMatrix4fv(u_MCPC, false, MCPC);
    gl.uniformMatrix4fv(u_VCPC, false, VCPC);

    gl.drawArrays(gl.LINES, 0, lines.length / 3);
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
      
      let dgreeX = vec3.dot(axis, [1, 0, 0]);
      let dgreeY = vec3.dot(axis, [0, 1, 0]);

      const degreeAmount = 2.5;
      dgreeX = dgreeX * Math.PI / 180.0;
      dgreeY = dgreeY * Math.PI / 180.0;
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

      computeLine();
      drawScene();
    }
  }

  const mouseDownEvent = (event) => {
    isDragging = true;

    prePosition[0] = event.offsetX - halfWidth;
    prePosition[1] = halfHeight - event.offsetY;
    
    drawScene();
  }

  const mouseUpEvent = (event) => {
    isDragging = false;
  }

  useEffect(onMounted, [])
  return (
    <>
      <canvas id="_glcanvas" width="640" height="480"/>
    </>
  );
}

export default Mesh2DOutlineComputeShader;