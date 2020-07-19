import React, { useEffect, useState } from 'react';
import { createShader, createRenderShaderProgram } from '../../../webgl/shader/Shader'
import vertexShaderSource from './glsl/vs.glsl'
import fragmentShaderSource from './glsl/fs.glsl'
import imageFragmentShaderSource from './glsl/fs_image.glsl'
import imageVertexShaderSource from './glsl/vs_image.glsl'
import {textCoord, textPosition} from './resource'
import {vec3, mat4} from 'gl-matrix'
import { openSTLByUrl } from "../../../common/OpenSTLFile"

let vertices = [];
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

function Mesh2DOutline2() {

  console.log("create TextureRendering");

  let isDragging = false;
  let gl;
  let glCanvas;

  let vbo_meshPosition;
  let vbo_textPosition;
  let vbo_textCoords;
  let vbo_textureTarget;
  let vbo_frame;

  let vao_mesh;
  let vao_texture;

  let renderShaderProgram;
  let imageShaderProgram;

  let u_MCPC;
  let u_MCPC_image;
  let vs_vertexPosition;
  let vs_vertexPosition_image;
  let vs_textureCoords_image;  
  let u_width_image;
  let u_height_image;
  let u_texture;

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
    mat4.scale(MCWC, MCWC, [20, 20, 20]);
    mat4.rotateX(MCWC, MCWC, 90 * Math.PI / 180.0);
    mat4.lookAt(WCVC, camEye, camTar, camUp);
    mat4.ortho(VCPC, -halfWidth, halfWidth, -halfHeight, halfHeight, 990, 1010);
    mat4.multiply(MCVC, WCVC, MCWC);
    mat4.multiply(MCPC, VCPC, MCVC);

    gl.viewport(0, 0, width, height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // create shader
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const imageVertexShader = createShader(gl, gl.VERTEX_SHADER, imageVertexShaderSource);
    const imageFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, imageFragmentShaderSource);

    renderShaderProgram = createRenderShaderProgram(gl, vertexShader, fragmentShader);
    u_MCPC = gl.getUniformLocation(renderShaderProgram, 'u_MCPC');
    vs_vertexPosition = gl.getAttribLocation(renderShaderProgram, 'vs_VertexPosition');
    
    imageShaderProgram = createRenderShaderProgram(gl, imageVertexShader, imageFragmentShader);
    u_MCPC_image = gl.getUniformLocation(imageShaderProgram, 'u_MCPC');
    vs_vertexPosition_image = gl.getAttribLocation(imageShaderProgram, 'vs_VertexPosition');
    vs_textureCoords_image = gl.getAttribLocation(imageShaderProgram, 'vs_textureCoords');
    u_width_image = gl.getUniformLocation(imageShaderProgram, 'u_width');
    u_height_image = gl.getUniformLocation(imageShaderProgram, 'u_height');
    u_texture = gl.getUniformLocation(imageShaderProgram, 'u_texture');

    // initialize buffer
    openSTLByUrl("assets/stl/Implant01.stl")
    .then((data) => {      
      data.getPoints().getData().forEach(data => {
        vertices.push(data);
      });

      openSTLByUrl("assets/stl/Crown_23.stl")
      .then((data) => {     
        
        data.getPoints().getData().forEach(data => {
          vertices.push(data);
        })

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

        // create VAO for texture.
        gl.bindVertexArray(vao_texture);

        vbo_textPosition = gl.createBuffer();
        gl.enableVertexAttribArray(vs_vertexPosition_image);
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo_textPosition);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textPosition), gl.STATIC_DRAW);
        gl.vertexAttribPointer(
          vs_vertexPosition_image,
          3,
          gl.FLOAT,
          false,
          0,
          0
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        
        vbo_textCoords = gl.createBuffer();
        gl.enableVertexAttribArray(vs_textureCoords_image);
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo_textCoords);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textCoord), gl.STATIC_DRAW);
        gl.vertexAttribPointer(
          vs_textureCoords_image,
          2,
          gl.FLOAT,
          false,
          0,
          0
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        vbo_textureTarget = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, vbo_textureTarget);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE,
          null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.bindTexture(gl.TEXTURE_2D, null);        
          
        vbo_frame = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, vbo_frame);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, vbo_textureTarget, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.bindVertexArray(null);

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

    gl.bindFramebuffer(gl.FRAMEBUFFER, vbo_frame);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(renderShaderProgram); 
    gl.bindVertexArray(vao_mesh); 

    gl.uniformMatrix4fv(u_MCPC, false, MCPC);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3); 

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);


    gl.bindTexture(gl.TEXTURE_2D, vbo_textureTarget);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    

    gl.useProgram(imageShaderProgram);
    gl.bindVertexArray(vao_texture);
    
    gl.uniform1f(u_width_image, gl.canvas.width);
    gl.uniform1f(u_height_image, gl.canvas.height);
    gl.uniformMatrix4fv(u_MCPC_image, false, MCPC);
    gl.uniform1i(u_texture, 0);

    gl.drawArrays(gl.TRIANGLES, 0, textPosition.length / 3);  
    
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
      <canvas id="_glcanvas" width="640" height="480"/>
    </>
  );
}

export default Mesh2DOutline2;