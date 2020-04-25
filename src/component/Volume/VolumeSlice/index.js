import React, {useState, useEffect } from 'react'
import xmlVtiReader from '../../../common/DicomReader'
import { createShader, createShaderProgram } from '../../../webgl/shader/Shader'
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

let gl;
let vertices = [];
let textCoords = [];

let width = 0;
let height = 0;
let halfWidth = 0;
let halfHeight = 0;

let shaderProgram;

let vbo_vertexBuffer;
let vbo_textCoordBuffer;
let vbo_volumeBuffer;
let vao;
let u_MCPC;

function VolumeSlice() {

  const [volume, setVolume] = useState();
  
  const onMounted = function() {
    console.log("on Mounted.");    



    initView();
  }

  const initView = function() {
    
    const glCanvas = document.getElementById("glcanvas");
    gl = glCanvas.getContext("webgl2");
    if(!gl) {
      console.log("Failed to get gl context for webgl2.");
      return;
    }
    
    width = gl.canvas.width;
    height = gl.canvas.height;
    halfWidth = width / 2;
    halfHeight = height / 2;

    textCoords = [
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1
    ];
    
    // init camera
    mat4.lookAt(MCVC, camEye, camTar, camUp);
    mat4.ortho(VCPC, -halfWidth, halfWidth, -halfHeight, halfHeight, 1000, -1000);
    mat4.multiply(MCPC, VCPC, MCVC);
    
    // create shader
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader);
    u_MCPC = gl.getUniformLocation(shaderProgram, 'u_MCPC');


    xmlVtiReader(`/assets/volumes/dicom.vti`).then((imageData) => {

      vao = gl.createVertexArray();
      
      imageData.floatArray = new Float32Array(imageData.data.length);
      const range = imageData.max - imageData.min;
      for(let i = 0; i < imageData.data.length; i++) {
        imageData.floatArray[i] = (imageData.data[i] - imageData.min) / range;
      }
      console.log("imageData : ", imageData);
      
      vbo_volumeBuffer = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_3D, vbo_volumeBuffer);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage3D(gl.TEXTURE_3D,
        0,
        gl.R16F,
        imageData.dimension[0],
        imageData.dimension[1],
        imageData.dimension[2],
        0,
        gl.RED,
        gl.FLOAT,
        imageData.floatArray);

      setVolume(imageData);
      
      const imageWidth = imageData.bounds[1] - imageData.bounds[0];
      const imageHeight = imageData.bounds[3] - imageData.bounds[2];

      vertices = [
        -imageWidth,  imageHeight,
        imageWidth,  imageHeight,
        -imageWidth, -imageHeight,    
        -imageWidth, -imageHeight,
        imageWidth,  imageHeight,
        imageWidth, -imageHeight
      ];

      vbo_vertexBuffer = gl.createBuffer();  
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo_vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      
      const vertexID = gl.getAttribLocation(shaderProgram, 'vs_VertexPosition');
      gl.enableVertexAttribArray(vertexID);
      gl.vertexAttribPointer(vertexID,
        2,
        gl.FLOAT,
        false,
        0,
        0);
  
      vbo_textCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo_textCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textCoords), gl.STATIC_DRAW);
      const textCoordsID = gl.getAttribLocation(shaderProgram, 'vs_TextCoords');
      gl.enableVertexAttribArray(textCoordsID);
      gl.vertexAttribPointer(textCoordsID,
        2,
        gl.FLOAT,
        false,
        0,
        0);

      render();
    });


  }

  const render = function() {
    gl.clearColor(0, 0, 0, 1);
    // gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.useProgram(shaderProgram);
    gl.uniformMatrix4fv(u_MCPC, false, MCPC);
    gl.bindVertexArray(vao);

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
  }

  useEffect(onMounted, []);

  return(
    <div>
      <canvas id="glcanvas" width="800" height ="600"/>
    </div>
  );
}

export default VolumeSlice;