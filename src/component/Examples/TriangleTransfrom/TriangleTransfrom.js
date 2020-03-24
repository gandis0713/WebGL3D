import React, { useEffect, useState } from 'react';
import { createShader, createShaderProgram } from '../../../webgl/shader/Shader'
import { vertexShaderSource, fragmentShaderSource } from './ShaderSource'
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

function TriangleTransfrom() {

  console.log("create TriangleWithMatrix");

  let valuePositionX = 0;
  let valuePositionY = 0;
  let valuePositionZ = 0;
  let valueRotationX = 0;
  let valueRotationY = 0;
  let valueRotationZ = 0;

  function handleChangePositionX(event, newValue) {
    valuePositionX = newValue;
    drawScene();
  }

  function handleChangePositionY(event, newValue) {
    valuePositionY = newValue;
    drawScene();
  }

  function handleChangePositionZ(event, newValue) {
    valuePositionZ = newValue;
    drawScene();
  }

  function handleChangeRotationX(event, newValue) {
    valueRotationX = newValue * Math.PI / 180;
    drawScene();
  }

  function handleChangeRotationY(event, newValue) {
    valueRotationY = newValue * Math.PI / 180;
    drawScene();
  }

  function handleChangeRotationZ(event, newValue) {
    valueRotationZ = newValue * Math.PI / 180;
    drawScene();
  }

  let glContext;

  let vertexBuffer;
  let colorBuffer;

  let shaderProgram;

  let resolutionUniformLocation;
  let translationMatrixUniformLocation;

  const drawScene = function() {
    if(!glContext) {
      return;
    }    

    console.log("drawScene");

    glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);
    
    const vertexID = glContext.getAttribLocation(shaderProgram, 'aVertexPosition');
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

    console.log(valueRotationX);
    console.log(valueRotationY);
    console.log(valueRotationZ);

    const mat00 = Math.cos(valueRotationZ) * Math.cos(valueRotationY);
    const mat10 = Math.cos(valueRotationZ) * Math.sin(valueRotationY) * Math.sin(valueRotationX) - Math.sin(valueRotationZ) * Math.cos(valueRotationX);
    const mat20 = Math.cos(valueRotationZ) * Math.sin(valueRotationY) * Math.cos(valueRotationX) + Math.sin(valueRotationZ) * Math.sin(valueRotationX);
    const mat01 = Math.sin(valueRotationZ) * Math.cos(valueRotationY);
    const mat11 = Math.sin(valueRotationZ) * Math.sin(valueRotationY) * Math.sin(valueRotationX) + Math.cos(valueRotationZ) * Math.cos(valueRotationX);
    const mat21 = Math.sin(valueRotationZ) * Math.sin(valueRotationY) * Math.cos(valueRotationX) - Math.cos(valueRotationZ) * Math.sin(valueRotationX);
    const mat02 = -Math.sin(valueRotationY);
    const mat12 = Math.cos(valueRotationY) * Math.sin(valueRotationX);
    const mat22 = Math.cos(valueRotationY) * Math.cos(valueRotationX);

    const matrix = [mat00, mat10, mat20, 0,
                    mat01, mat11, mat21, 0,
                    mat02, mat12, mat22, 0,
                    valuePositionX, valuePositionY, valuePositionZ, 1];

    glContext.useProgram(shaderProgram);
    glContext.uniform2f(resolutionUniformLocation, glContext.canvas.width, glContext.canvas.height, 0);
    glContext.uniformMatrix4fv(translationMatrixUniformLocation, false, new Float32Array(matrix));

    glContext.drawArrays(glContext.TRIANGLES, 0, 3);
  }

  const onMounted = function() {

    // initialize
    const glCanvas = document.getElementById("_glcanvas");
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

    resolutionUniformLocation = glContext.getUniformLocation(shaderProgram, 'uScreenResolution');
    translationMatrixUniformLocation = glContext.getUniformLocation(shaderProgram, 'uTranslationMatrix');

    // draw scene

    // initialize buffer
    vertexBuffer = glContext.createBuffer();
    glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);

    const vertices = [
       0.0,  80.0, 0.0, 1.0,
      -80.0, -80.0, 0.0, 1.0,
       80.0, -80.0, 0.0, 1.0
    ]

    glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(vertices), glContext.STATIC_DRAW);

    colorBuffer = glContext.createBuffer();
    glContext.bindBuffer(glContext.ARRAY_BUFFER, colorBuffer);

    const colors = [
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0
    ]   

    glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(colors), glContext.STATIC_DRAW);


    drawScene();
  }

  useEffect(onMounted, [])
  return (
    <>
      <canvas id="_glcanvas" width="640" height="480"/>
      <Typography>Position X</Typography>
      <Slider
        defaultValue={0}
        onChange={handleChangePositionX}
        aria-labelledby="discrete-slider"
        valueLabelDisplay="auto"
        step={0.01}
        min={-1}
        max={1}
        />
      <Typography>Position Y</Typography>
      <Slider
        defaultValue={0}
        onChange={handleChangePositionY}
        aria-labelledby="discrete-slider"
        step={0.01}
        min={-1}
        max={1}
        />
      <Typography>Position Z</Typography>
      <Slider
        defaultValue={0}
        onChange={handleChangePositionZ}
        aria-labelledby="discrete-slider"
        step={0.01}
        min={-1}
        max={1}
        />
      <Typography>Rotation X</Typography>
      <Slider
        defaultValue={0}
        onChange={handleChangeRotationX}
        aria-labelledby="discrete-slider"
        step={1}
        min={-180}
        max={180}
        />
      <Typography>Rotation Y</Typography>
      <Slider
        defaultValue={0}
        onChange={handleChangeRotationY}
        aria-labelledby="discrete-slider"
        step={1}
        min={-180}
        max={180}
        />
      <Typography>Rotation Z</Typography>
      <Slider
        defaultValue={0}
        onChange={handleChangeRotationZ}
        aria-labelledby="discrete-slider"
        step={1}
        min={-180}
        max={180}
        />
    </>
  );
}

export default TriangleTransfrom;