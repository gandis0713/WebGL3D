import React, { useEffect, useState } from 'react';
import { createShader, createShaderProgram } from '../../../webgl/shader/Shader'
import vertexShaderSource from './glsl/vs.glsl'
import fragmentShaderSource from './glsl/fs.glsl'
import {vertices, textCoord} from './resource'
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

function FrameBufferRendering() {

  console.log("create TextureRendering");

  let isDragging = false;
  let gl;
  let glCanvas;

  let vbo_vertexPosition;
  let vbo_textCoord;
  let vbo_texture;
  let vbo_textureTarget;
  let vbo_frame;

  let vao;

  let shaderProgram;

  let u_MCPCmatrix;
  let vs_vertexPosition;
  let vs_textCoord;
  let u_texture;

  let prePosition = [0, 0];
  
  let width = 0;
  let height = 0;
  let halfWidth = 0;
  let halfHeight = 0;

  let image;
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

    shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader);

    u_MCPCmatrix = gl.getUniformLocation(shaderProgram, 'u_MCPCmatrix');
    vs_vertexPosition = gl.getAttribLocation(shaderProgram, 'vs_VertexPosition');
    vs_textCoord = gl.getAttribLocation(shaderProgram, 'vs_TextCoord');
    u_texture = gl.getUniformLocation(shaderProgram, "u_texture");

    // initialize buffer

    vbo_vertexPosition = gl.createBuffer();
    vbo_textCoord = gl.createBuffer();
    vbo_texture = gl.createTexture();
    vbo_textureTarget = gl.createTexture();
    vbo_frame = gl.createFramebuffer();

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

    gl.enableVertexAttribArray(vs_textCoord);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_textCoord);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textCoord), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      vs_textCoord,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );    

    gl.bindTexture(gl.TEXTURE_2D, vbo_textureTarget);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.width, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      
    gl.bindFramebuffer(gl.FRAMEBUFFER, vbo_frame);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, vbo_textureTarget, 0);

    
    image = new Image();
    image.src = "assets/sky.png";
    image.addEventListener('load', function() {
      gl.bindTexture(gl.TEXTURE_2D, vbo_texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
      
      drawScene();
    });
  }
  
  const drawScene = function() {
    if(!gl) {
      console.log(" glContext return ");
      return;
    }    

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.bindFramebuffer(gl.FRAMEBUFFER, vbo_frame);

    gl.bindTexture(gl.TEXTURE_2D, vbo_texture);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.width);

    // Clear the canvas AND the depth buffer.
    gl.clearColor(1, 0, 0, 1);   // clear to blue
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    gl.useProgram(shaderProgram);
    gl.bindVertexArray(vao);  

    gl.uniformMatrix4fv(u_MCPCmatrix, false, MCPC);
    gl.uniform1i(u_texture, 0);      

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // render the cube with the texture we just rendered to
    gl.bindTexture(gl.TEXTURE_2D, vbo_textureTarget);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas AND the depth buffer.
    gl.clearColor(0, 0, 0, 1);   // clear to white
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    
    gl.useProgram(shaderProgram);
    gl.bindVertexArray(vao);  

    gl.uniformMatrix4fv(u_MCPCmatrix, false, MCPC);
    gl.uniform1i(u_texture, 0);      

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

export default FrameBufferRendering;