import React, { useEffect, useState } from 'react';
import { createShader, createRenderShaderProgram } from '../../../webgl/shader/Shader'
import vertexShaderSource from './glsl/vs.glsl'
import fragmentShaderSource from './glsl/fs.glsl'
import {vec2, vec3, mat4} from 'gl-matrix'

const camEye = vec3.create();
camEye[0] = 0;
camEye[1] = 0;
camEye[2] = 1000;
const camUp = vec3.create();
camUp[0] = 0;
camUp[1] = 1;
camUp[2] = 0;
const camTar = vec3.create();
const MCVC = mat4.create();
const VCPC = mat4.create();
const MCPC = mat4.create();

let vertices = [];

function Magnifier() {

  console.log("create TriangleWithMatrix");

  let isDragging = false;
  let glContext;
  let glCanvas;

  let vertexBuffer;
  let textureBuffer;

  let renderShaderProgram;

  let u_MCPC;
  let u_mousePosition;
  let u_mousePositionTC;

  let mousePosition = [-1000, -1000];
  let mousePositionTC = [-1, -1];
  
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
    glContext = glCanvas.getContext("webgl2");

    if(!glContext) {
      alert("Unable to initialize WebGL.");
      return;
    }
    
    width = glContext.canvas.width;
    height = glContext.canvas.height;
    halfWidth = width / 2;
    halfHeight = height / 2;

    vertices = [
    -halfWidth,   halfHeight,  5,
    halfWidth, halfHeight,  5,
    -halfWidth, -halfHeight,  5,    
    -halfWidth, -halfHeight,  5,
    halfWidth, halfHeight,  5,
    halfWidth, -halfHeight,  5
  ];

    // init camera
    mat4.lookAt(MCVC, camEye, camTar, camUp);
    mat4.ortho(VCPC, -halfWidth, halfWidth, -halfHeight, halfHeight, 1000, -1000);
    mat4.multiply(MCPC, VCPC, MCVC);

    glContext.viewport(0, 0, width, height);
    glContext.clearColor(0.0, 0.0, 0.0, 1.0);
    glContext.clearDepth(1.0);
    glContext.enable(glContext.DEPTH_TEST);
    glContext.depthFunc(glContext.LEQUAL);
    
    glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);

    // create shader
    const vertexShader = createShader(glContext, glContext.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(glContext, glContext.FRAGMENT_SHADER, fragmentShaderSource);

    renderShaderProgram = createRenderShaderProgram(glContext, vertexShader, fragmentShader);
    
    u_MCPC = glContext.getUniformLocation(renderShaderProgram, 'u_MCPC');
    u_mousePosition = glContext.getUniformLocation(renderShaderProgram, 'u_mousePosition');
    u_mousePositionTC = glContext.getUniformLocation(renderShaderProgram, 'u_mousePositionTC');

    // initialize buffer
    vertexBuffer = glContext.createBuffer();
    glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);

    glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(vertices), glContext.STATIC_DRAW);

    // create texture
    textureBuffer = glContext.createTexture();
    
    image = new Image();
    image.src = "assets/images/image1.jpg";
    image.addEventListener('load', function() {
      glContext.bindTexture(glContext.TEXTURE_2D, textureBuffer);
      glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGBA, glContext.RGBA,glContext.UNSIGNED_BYTE, image);
      glContext.generateMipmap(glContext.TEXTURE_2D);
      
      drawScene();
    });


    
    drawScene();
  }

  

  const mouseMoveEvent = (event) => {
    if(isDragging === true) {

      mousePosition[0] = event.offsetX;
      mousePosition[1] = height - event.offsetY; // invert to rasterization in webgl Y axis.
      
      mousePositionTC[0] = event.offsetX / 2;
      mousePositionTC[1] = event.offsetY / 2;
      vec2.transformMat4(mousePositionTC, mousePositionTC, MCPC);
      
      drawScene();
    }
  }

  const mouseDownEvent = (event) => {
    isDragging = true;

    mousePosition[0] = event.offsetX;
    mousePosition[1] = height - event.offsetY;
    
    mousePositionTC[0] = event.offsetX / 2;
    mousePositionTC[1] = event.offsetY / 2;
    vec2.transformMat4(mousePositionTC, mousePositionTC, MCPC);
    
    drawScene();
  }

  const mouseUpEvent = (event) => {
    isDragging = false;
    
    mousePosition[0] = -1000;
    mousePosition[1] = -1000;
    
    mousePositionTC[0] = -1;
    mousePositionTC[1] = -1;
    
    drawScene();
  }
  
  const drawScene = function() {
    if(!glContext) {
      console.log(" glContext return ");
      return;
    }    

    // glContext.enable(glContext.CULL_FACE);
    glContext.enable(glContext.DEPTH_TEST);
    glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);
    
    const vertexID = glContext.getAttribLocation(renderShaderProgram, 'vs_VertexPosition');
    glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);
    glContext.vertexAttribPointer(
      vertexID,
      3,
      glContext.FLOAT,
      false,
      0,
      0
    )
    glContext.enableVertexAttribArray(vertexID);

    glContext.useProgram(renderShaderProgram);
    glContext.uniformMatrix4fv(u_MCPC, false, MCPC);
    glContext.uniform2fv(u_mousePosition, mousePosition);
    glContext.uniform2fv(u_mousePositionTC, mousePositionTC);

    glContext.drawArrays(glContext.TRIANGLES, 0, vertices.length / 3);
  }

  useEffect(onMounted, [])
  return (
    <>
      <canvas id="_glcanvas" width="960" height="540"/>
    </>
  );
}

export default Magnifier;