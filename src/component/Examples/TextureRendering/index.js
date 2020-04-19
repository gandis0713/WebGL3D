import React, { useEffect, useState } from 'react';
import { createShader, createShaderProgram } from '../../../webgl/shader/Shader'
import vertexShaderSource from './glsl/vs.glsl'
import fragmentShaderSource from './glsl/fs.glsl'
import {vec3, mat4} from 'gl-matrix'

const camEye = vec3.create();
camEye[0] = 0;
camEye[1] = 0;
camEye[2] = 100;
const camUp = vec3.create();
camUp[0] = 0;
camUp[1] = 1;
camUp[2] = 0;
const camTar = vec3.create();
const MCWC = mat4.create();
const WCVC = mat4.create();
const VCPC = mat4.create();

const MCPC = mat4.create();

let vertices = [];

function Texture() {

  console.log("create TriangleWithMatrix");

  let isDragging = false;
  let glContext;
  let glCanvas;

  let vertexBuffer;
  let textureBuffer;

  let shaderProgram;

  let translationMatrixUniformLocation;

  let prePosition = [0, 0];
  
  let width = 0;
  let height = 0;
  let halfWidth = 0;
  let halfHeight = 0;

  let image;
  const onMounted = function() {

    // initialize
    glCanvas = document.getElementById("_glcanvas");
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
    -halfWidth,   halfHeight,  0,
    halfWidth, halfHeight,  0,
    -halfWidth, -halfHeight,  0,    
    -halfWidth, -halfHeight,  0,
    halfWidth, halfHeight,  0,
    halfWidth, -halfHeight,  0
  ];

    glContext.viewport(0, 0, width, height);
    glContext.clearColor(0.0, 0.0, 0.0, 1.0);
    glContext.clearDepth(1.0);
    glContext.enable(glContext.DEPTH_TEST);
    glContext.depthFunc(glContext.LEQUAL);
    
    glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);

    // create shader
    const vertexShader = createShader(glContext, glContext.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(glContext, glContext.FRAGMENT_SHADER, fragmentShaderSource);

    shaderProgram = createShaderProgram(glContext, vertexShader, fragmentShader);

    translationMatrixUniformLocation = glContext.getUniformLocation(shaderProgram, 'uTransformMatrix');

    // initialize buffer
    vertexBuffer = glContext.createBuffer();
    glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);

    glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(vertices), glContext.STATIC_DRAW);

    // create texture
    textureBuffer = glContext.createTexture();
    // glContext.activeTexture(glContext.TEXTURE0 + 0);
    glContext.bindTexture(glContext.TEXTURE_2D, textureBuffer);
    glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGBA, 1, 1, 0, glContext.RGBA, glContext.UNSIGNED_BYTE,
              new Uint8Array([0, 0, 255, 255]));
    
    image = new Image();
    image.src = "assets/sky.png";
    image.addEventListener('load', function() {
      glContext.bindTexture(glContext.TEXTURE_2D, textureBuffer);
      glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGBA, glContext.RGBA,glContext.UNSIGNED_BYTE, image);
      glContext.generateMipmap(glContext.TEXTURE_2D);
      
      drawScene();
    });

    // init camera
    mat4.identity(MCWC);
    mat4.lookAt(WCVC, camEye, camTar, camUp);
    mat4.ortho(VCPC, -halfWidth, halfWidth, -halfHeight, halfHeight, 1000, -1000);
    const MCVC = mat4.create();
    mat4.multiply(MCVC, WCVC, MCWC);
    mat4.multiply(MCPC, VCPC, MCVC);

    
    drawScene();
  }
  
  const drawScene = function() {
    if(!glContext) {
      console.log(" glContext return ");
      return;
    }    

    glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);
    
    const vertexID = glContext.getAttribLocation(shaderProgram, 'aVertexPosition');
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

    glContext.useProgram(shaderProgram);
    glContext.uniformMatrix4fv(translationMatrixUniformLocation, false, MCPC);

    glContext.drawArrays(glContext.TRIANGLES, 0, vertices.length / 3);
  }

  useEffect(onMounted, [])
  return (
    <>
      <canvas id="_glcanvas" width="640" height="480"/>
    </>
  );
}

export default Texture;