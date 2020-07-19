import React, { useEffect } from 'react';
import { createShader, createRenderShaderProgram } from '../../../webgl/shader/Shader'
import { vertexShaderSource, fragmentShaderSource } from './ShaderSource'
import glm from 'glm-js'

function TriangleInClipSpace() {

  console.log("create TriangleInClipSpace");

  const onMounted = function() {

    // initialize
    const glCanvas = document.getElementById("_glcanvas");
    const glContext = glCanvas.getContext("webgl2");

    if(!glContext) {
      alert("Unable to initialize WebGL.");
      return;
    }

    glContext.viewport(0, 0, glContext.canvas.width, glContext.canvas.height);
    glContext.clearColor(0.0, 0.0, 0.0, 1.0);
    glContext.clear(glContext.COLOR_BUFFER_BIT);

    // create shader

    const vertexShader = createShader(glContext, glContext.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(glContext, glContext.FRAGMENT_SHADER, fragmentShaderSource);

    const shaderProgram = createRenderShaderProgram(glContext, vertexShader, fragmentShader);

    const resolutionUniformLocation = glContext.getUniformLocation(shaderProgram, 'uScreenResolution');

    // draw scene

    glContext.clearColor(0.0, 0.0, 0.0, 1.0);
    glContext.clearDepth(1.0);
    glContext.enable(glContext.DEPTH_TEST);
    glContext.depthFunc(glContext.LEQUAL);

    glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);

    // initialize buffer
    const vertexBuffer = glContext.createBuffer();
    glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);

    const vertices = [
       0.0,  80.0, 0.0, 1.0,
      -80.0, -80.0, 0.0, 1.0,
       80.0, -80.0, 0.0, 1.0
    ]

    glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(vertices), glContext.STATIC_DRAW);

    const colorBuffer = glContext.createBuffer();
    glContext.bindBuffer(glContext.ARRAY_BUFFER, colorBuffer);

    const colors = [
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0
    ]   

    glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(colors), glContext.STATIC_DRAW);


    const vertexID = glContext.getAttribLocation(shaderProgram, 'vs_VertexPosition');
    glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);
    glContext.vertexAttribPointer(
      vertexID,
      4,
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
      4,
      glContext.FLOAT,
      false,
      0,
      0
    )
    glContext.enableVertexAttribArray(colorID);

    glContext.useProgram(shaderProgram);
    glContext.uniform2f(resolutionUniformLocation, glContext.canvas.width, glContext.canvas.height);

    glContext.drawArrays(glContext.TRIANGLES, 0, 3);
  }

  useEffect(onMounted, [])
  return (
    <>
      <canvas id="_glcanvas" width="640" height="480"/>
    </>
  );
}

export default TriangleInClipSpace;