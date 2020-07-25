import React, { useEffect, useState } from 'react';
import { createShader, createRenderShaderProgram, createComputeShaderProgram } from '../../../webgl/shader/Shader'
import vertexShaderSource from './glsl/vs.glsl'
import fragmentShaderSource from './glsl/fs.glsl'
import computeShaderSource from './glsl/cp.glsl'
import {vec2, vec3, mat4} from 'gl-matrix'

function ComputeShader() {

  console.log("create ComputeShader");

  let gl;
  let glCanvas;
  let ssbo;
  let color;
  let timeUniformLocation;
  let time;

  let renderShaderProgram;
  let computeShaderProgram;

  const onMounted = function() {

    // initialize
    glCanvas = document.getElementById("_glcanvas");
    gl = glCanvas.getContext("webgl2-compute");

    if(!gl) {
      alert("Unable to initialize WebGL with compute shader");
      return;
    }
    console.log('gl MAX_COMPUTE_WORK_GROUP_SIZE x', gl.getIndexedParameter(gl.MAX_COMPUTE_WORK_GROUP_SIZE, 0));
    console.log('gl MAX_COMPUTE_WORK_GROUP_SIZE y ', gl.getIndexedParameter(gl.MAX_COMPUTE_WORK_GROUP_SIZE, 1));
    console.log('gl MAX_COMPUTE_WORK_GROUP_SIZE z', gl.getIndexedParameter(gl.MAX_COMPUTE_WORK_GROUP_SIZE, 2)); 
    

    // create shader
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const computeShader = createShader(gl, gl.COMPUTE_SHADER, computeShaderSource);

    renderShaderProgram = createRenderShaderProgram(gl, vertexShader, fragmentShader);
    computeShaderProgram = createComputeShaderProgram(gl, computeShader);



    // get uniform location in ComputeShader
    timeUniformLocation = gl.getUniformLocation(computeShaderProgram, 'time');

    // create ShaderStorageBuffer
    ssbo = gl.createBuffer();
    gl.bindBuffer(gl.SHADER_STORAGE_BUFFER, ssbo);
    gl.bufferData(gl.SHADER_STORAGE_BUFFER, new Float32Array(8 * 2), gl.DYNAMIC_COPY);
    gl.bindBufferBase(gl.SHADER_STORAGE_BUFFER, 0, ssbo); 

    gl.bindBuffer(gl.ARRAY_BUFFER, ssbo);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // create texture
    time = 0.0;
    drawScene();
  }

  
  
  const drawScene = function() {
    if(!gl) {
      console.log(" gl return ");
      return;
    }    

    time += 1.0;
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.useProgram(computeShaderProgram);
    gl.uniform1f(timeUniformLocation, time);

    gl.dispatchCompute(1, 1, 1);
    gl.memoryBarrier(gl.VERTEX_ATTRIB_ARRAY_BARRIER_BIT);
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(renderShaderProgram);

    gl.drawArrays(gl.LINES, 0, 8);
  }

  useEffect(onMounted, [])
  return (
    <>
      <canvas id="_glcanvas" width="600" height="600"/>
    </>
  );
}

export default ComputeShader;