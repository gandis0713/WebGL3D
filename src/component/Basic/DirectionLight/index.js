import React, { useEffect, useState } from 'react';
import { createShader, createRenderShaderProgram } from '../../../webgl/shader/Shader'
import vertexShaderSource from './glsl/vs.glsl'
import fragmentShaderSource from './glsl/fs.glsl'
import {vertices, normal} from './resource'
import {vec3, mat4} from 'gl-matrix'

const camEye = vec3.create();
camEye[0] = 0;
camEye[1] = 0;
camEye[2] = 500;
const camUp = vec3.create();
camUp[0] = 0;
camUp[1] = 1;
camUp[2] = 0;
const camTar = vec3.create();
const MCWC = mat4.create();
const WCVC = mat4.create();
const VCPC = mat4.create();

const MCVC = mat4.create();
const MCPC = mat4.create();

function DirectionLight() {

  console.log("create DirectionLight");

  let isDragging = false;
  let gl;
  let glCanvas;

  let vbo_vertexPosition;
  let vbo_normal;

  let vao;

  let shaderProgram;

  let u_MCPC;
  let vs_vertexPosition;
  let vs_Normal;
  let u_reverseLightDirection;
  let u_lightColor;

  let prePosition = [0, 0];
  
  let width = 0;
  let height = 0;
  let halfWidth = 0;
  let halfHeight = 0;

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
    mat4.lookAt(WCVC, camEye, camTar, camUp);
    mat4.ortho(VCPC, -halfWidth, halfWidth, -halfHeight, halfHeight, -1000, 1000);
    // mat4.perspective(VCPC, 60 * Math.PI / 180.0 , 1.2, 0, 1000);
    mat4.multiply(MCVC, WCVC, MCWC);
    mat4.multiply(MCPC, VCPC, MCVC);

    gl.viewport(0, 0, width, height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // create shader
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    shaderProgram = createRenderShaderProgram(gl, vertexShader, fragmentShader);

    u_MCPC = gl.getUniformLocation(shaderProgram, 'u_MCPC');
    vs_vertexPosition = gl.getAttribLocation(shaderProgram, 'vs_VertexPosition');
    vs_Normal = gl.getAttribLocation(shaderProgram, 'vs_Normal');
    u_reverseLightDirection = gl.getUniformLocation(shaderProgram, 'u_reverseLightDirection');
    u_lightColor = gl.getUniformLocation(shaderProgram, 'u_lightColor');

    // initialize buffer

    vbo_vertexPosition = gl.createBuffer();
    vbo_normal = gl.createBuffer();

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    gl.enableVertexAttribArray(vs_vertexPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_vertexPosition);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      vs_vertexPosition,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.enableVertexAttribArray(vs_Normal);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_normal);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      vs_Normal,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );   

    drawScene();
  }
  
  const drawScene = function() {
    if(!gl) {
      console.log(" glContext return ");
      return;
    }    

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    gl.clearColor(0, 0, 0, 1);   // clear to blue
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    gl.useProgram(shaderProgram);
    gl.bindVertexArray(vao);  

    gl.uniformMatrix4fv(u_MCPC, false, MCPC);
    gl.uniform4fv(u_lightColor, [1, 0.5, 0, 1]);
    const direction = vec3.clone([MCPC[8], MCPC[9], MCPC[10]]);
    vec3.normalize(direction, direction);  
    gl.uniform3fv(u_reverseLightDirection, direction);

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
    
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
      
      mat4.lookAt(WCVC, camEye, camTar, camUp);

      mat4.multiply(MCVC, WCVC, MCWC);
      mat4.multiply(MCPC, VCPC, MCVC);

      prePosition[0] = event.offsetX - halfWidth;
      prePosition[1] = halfHeight - event.offsetY;
      
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

export default DirectionLight;