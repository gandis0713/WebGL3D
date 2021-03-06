import React, { useEffect, useState } from 'react';
import { createShader, createRenderShaderProgram } from '../../../webgl/shader/Shader'
import vertexShaderSource from './glsl/vs.glsl'
import fragmentShaderSource from './glsl/fs.glsl'
import {vec3, mat4} from 'gl-matrix'
import { openSTLByUrl } from "../../../common/OpenSTLFile"
import OctreeNode from './octree'

let vertices = [];
let lines = [];
const camEye = vec3.create();
camEye[0] = 0;
camEye[1] = 0;
camEye[2] = 1000;
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

function OctreeLine() {

  console.log("create OctreeLine");

  let isDragging = false;
  let gl;
  let glCanvas;

  let vbo_meshPosition;
  let vbo_linePosition;

  let vao_mesh;
  let vao_line;
  let renderShaderProgram;
  let lineShaderProgram;

  let u_MCPC;
  let u_color;
  let vs_vertexPosition;
  let u_LineMCPC;
  let u_Linecolor;
  let vs_LinePosition;

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
    mat4.scale(MCWC, MCWC, [10, 10, 10]);
    mat4.lookAt(WCVC, camEye, camTar, camUp);
    mat4.ortho(VCPC, -halfWidth, halfWidth, -halfHeight, halfHeight, 0, 2000);
    mat4.multiply(MCVC, WCVC, MCWC);
    mat4.multiply(MCPC, VCPC, MCVC);

    gl.viewport(0, 0, width, height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // create shader
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    renderShaderProgram = createRenderShaderProgram(gl, vertexShader, fragmentShader);
    u_MCPC = gl.getUniformLocation(renderShaderProgram, 'u_MCPC');
    u_color = gl.getUniformLocation(renderShaderProgram, 'u_color');
    vs_vertexPosition = gl.getAttribLocation(renderShaderProgram, 'vs_VertexPosition');
    
    const vertexShaderLine = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShaderLine = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    lineShaderProgram = createRenderShaderProgram(gl, vertexShaderLine, fragmentShaderLine);
    u_LineMCPC = gl.getUniformLocation(lineShaderProgram, 'u_MCPC');
    u_Linecolor = gl.getUniformLocation(lineShaderProgram, 'u_color');
    vs_LinePosition = gl.getAttribLocation(lineShaderProgram, 'vs_VertexPosition');

    // openSTLByUrl("assets/stl/Crown_23.stl")
    openSTLByUrl("assets/stl/dashboard.stl")
      .then((data) => {     
        
        data.getPoints().getData().forEach(data => {
          vertices.push(data);
        });
        const bounds = data.getBounds();

        // create VAO for mesh.
        vao_mesh = gl.createVertexArray();
        gl.bindVertexArray(vao_mesh);

        vbo_meshPosition = gl.createBuffer();
        gl.enableVertexAttribArray(vs_vertexPosition);
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo_meshPosition);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(
          vs_vertexPosition,
          3,
          gl.FLOAT,
          false,
          0,
          0
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, null); 

        gl.bindVertexArray(null);  

        // create VAO for line.
        
        const octree = new OctreeNode([0, 0, -2], 20, 4, vertices);
        octree.build();
        octree.getLines(lines);
        console.log(bounds);

        vao_line = gl.createVertexArray();
        gl.bindVertexArray(vao_line);

        vbo_linePosition = gl.createBuffer();
        gl.enableVertexAttribArray(vs_LinePosition);
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo_linePosition);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.STATIC_DRAW);
        gl.vertexAttribPointer(
          vs_LinePosition,
          3,
          gl.FLOAT,
          false,
          0,
          0
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, null); 

        gl.bindVertexArray(null); 

        drawScene();
        
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

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(renderShaderProgram); 
    gl.bindVertexArray(vao_mesh); 

    gl.uniformMatrix4fv(u_MCPC, false, MCPC);
    gl.uniform3fv(u_color,  [1, 0, 0]);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
    

    gl.useProgram(lineShaderProgram); 
    gl.bindVertexArray(vao_line); 

    gl.uniformMatrix4fv(u_LineMCPC, false, MCPC);
    gl.uniform3fv(u_Linecolor, [1, 1, 0]);
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
      <canvas id="_glcanvas" width="800" height="800"/>
    </>
  );
}

export default OctreeLine;