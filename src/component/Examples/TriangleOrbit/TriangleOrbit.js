import React, { useEffect, useState } from 'react';
import { createShader, createShaderProgram } from '../../../webgl/shader/Shader'
import { vertexShaderSource, fragmentShaderSource } from './ShaderSource'
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

import { vertices, colors } from './resources'
import {mat4} from './mat'
import {vec3} from './vec'

function TriangleOrbit() {

  console.log("create TriangleWithMatrix");

  let isDragging = false;
  let glContext;
  let glCanvas;

  let vertexBuffer;
  let colorBuffer;

  let shaderProgram;

  let translationMatrixUniformLocation;

  let prePosition = [0, 0];

  let mat = mat4.translation(0, 0, 0);
  
  const drawScene = function() {
    if(!glContext) {
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

    const colorID = glContext.getAttribLocation(shaderProgram, 'aVertexColor');
    glContext.bindBuffer(glContext.ARRAY_BUFFER, colorBuffer);
    glContext.vertexAttribPointer(
      colorID,
      3,
      glContext.UNSIGNED_BYTE,
      true,
      0,
      0
    )
    glContext.enableVertexAttribArray(colorID);

    const projection = mat4.orthographic(-glContext.canvas.width / 2, glContext.canvas.width / 2, -glContext.canvas.height / 2, glContext.canvas.height / 2, -1000, 1000);

    glContext.useProgram(shaderProgram);
    glContext.uniformMatrix4fv(translationMatrixUniformLocation, false, new Float32Array(mat4.multiply(projection, mat)));

    glContext.drawArrays(glContext.TRIANGLES, 0, vertices.length / 3);
  }

  const mouseMoveEvent = (event) => {
    if(isDragging === true) {
      
      const diffX = event.offsetX - prePosition[0];
      const diffY = event.offsetY - prePosition[1];

      const screenNormal = [0, 0, 1];
      const dir = [-diffX, -diffY, 0];
      let axis = vec3.cross(dir, screenNormal);

      axis = vec3.normalize(axis[0], axis[1], axis[2]);

      mat4.rotationA(0.02, axis[0], axis[1], axis[2], mat);

      prePosition[0] = event.offsetX;
      prePosition[1] = event.offsetY;
    }
    drawScene();
  }

  const mouseDownEvent = (event) => {
    isDragging = true;
    prePosition[0] = event.offsetX;
    prePosition[1] = event.offsetY;
  }

  const mouseUpEvent = (event) => {
    isDragging = false;
  }

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

    glContext.viewport(0, 0, glContext.canvas.width, glContext.canvas.height)
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

    // draw scene


    // initialize buffer
    vertexBuffer = glContext.createBuffer();
    glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);

    glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(vertices), glContext.STATIC_DRAW);

    colorBuffer = glContext.createBuffer();
    glContext.bindBuffer(glContext.ARRAY_BUFFER, colorBuffer);

    glContext.bufferData(glContext.ARRAY_BUFFER, new Uint8Array(colors), glContext.STATIC_DRAW);


    drawScene();
  }

  useEffect(onMounted, [])
  return (
    <>
      <canvas id="_glcanvas" width="640" height="480"/>
    </>
  );
}

export default TriangleOrbit;