import React, {useState, useEffect } from 'react'
import xmlVtiReader from '../../../common/DicomReader'
import { createShader, createRenderShaderProgram } from '../../../webgl/shader/Shader'
import vertexShaderSource from './glsl/vs.glsl'
import fragmentShaderSource from './glsl/fs.glsl'
import {vec2, vec3, mat4} from 'gl-matrix'


import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

const camEye = vec3.create();
camEye[0] = 0;
camEye[1] = 0;
camEye[2] = 0;
const camUp = vec3.create();
camUp[0] = 0;
camUp[1] = 1;
camUp[2] = 0;
const camTar = vec3.create();
let camNear = 0.5;
let camFar = -0.5;
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
let u_Dim;
let u_Extent;
let u_Bounds;
let u_Spacing;
let u_camThickness;
let u_camTar;
let u_camNear;
let u_camFar;
let u_width;
let u_height;
let u_depth;

let volume;

const AxisType = {
  axial: 0,
  saggital: 1,
  coronal: 2
}

function VolumeSlice() {
  console.log("VolumeSlice."); 

  const [axisType, setAxisType] = useState(AxisType.axial);
  const [thickness, setThickness] = useState(1);
  
  const onMounted = function(props) {
    console.log("props : ", props);
    console.log("on Mounted.");
    console.log("thickness : ", thickness);

    if(gl) {
      console.log("View was already initialized.");
      return;
    }

    initView();
  }

  const onAxisChanged = function(event) {
    console.log("axis : ", event.target.value);
    setAxisType(event.target.value);
  }

  const onMouseWheel = function(event) {
    console.log("thickness : ", thickness);
    const delta = event.deltaY > 0 ? 1 : -1;
    if(axisType === AxisType.axial) {
      camTar[0] = 0;
      camTar[1] = 0;
      camTar[2] += delta;

      const halfThickness = thickness / 2;
      camNear = camTar[2] + halfThickness;
      camFar = camTar[2] - halfThickness;
    }
    render();
  }

  const onThicknessChanged = function(event, value) {
    console.log("thickness : ", value);
    setThickness(value);

    if(axisType === AxisType.axial) {
      const halfThickness = value / 2;
      camNear = camTar[2] + halfThickness;
      camFar = camTar[2] - halfThickness;
    }
    render();
  }

  const initView = function() {
    
    const glCanvas = document.getElementById("glcanvas");
    glCanvas.addEventListener('wheel', onMouseWheel, false); 
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
    mat4.ortho(VCPC, -halfWidth, halfWidth, -halfHeight, halfHeight, 100, -100);
    mat4.multiply(MCPC, VCPC, MCVC);
    
    // create shader
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    shaderProgram = createRenderShaderProgram(gl, vertexShader, fragmentShader);
    u_MCPC = gl.getUniformLocation(shaderProgram, 'u_MCPC');
    u_Dim = gl.getUniformLocation(shaderProgram, 'u_Dim');
    u_Extent = gl.getUniformLocation(shaderProgram, 'u_Extent');
    u_Bounds = gl.getUniformLocation(shaderProgram, 'u_Bounds');
    u_Spacing = gl.getUniformLocation(shaderProgram, 'u_Spacing');
    u_camThickness = gl.getUniformLocation(shaderProgram, 'u_camThickness');
    u_camNear = gl.getUniformLocation(shaderProgram, 'u_camNear');
    u_camFar = gl.getUniformLocation(shaderProgram, 'u_camFar');
    u_camTar = gl.getUniformLocation(shaderProgram, 'u_camTar');
    u_width = gl.getUniformLocation(shaderProgram, 'u_width');
    u_height = gl.getUniformLocation(shaderProgram, 'u_height');
    u_depth = gl.getUniformLocation(shaderProgram, 'u_depth');
    
    setBuffer();
  }

  const setBuffer = function() {
    xmlVtiReader(`/assets/volumes/dicom1.vti`).then((imageData) => {

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

      volume = imageData;
      
      const imageWidth = (imageData.bounds[1] - imageData.bounds[0]) * 2;
      const imageHeight = (imageData.bounds[3] - imageData.bounds[2]) * 2;

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
    mat4.lookAt(MCVC, camEye, camTar, camUp);
    mat4.multiply(MCPC, VCPC, MCVC);
    gl.uniformMatrix4fv(u_MCPC, false, MCPC);
    gl.uniform3fv(u_Dim, volume.dimension);
    gl.uniform3fv(u_Extent, volume.extent);
    gl.uniform3fv(u_Bounds, volume.bounds);
    gl.uniform3fv(u_Spacing, volume.spacing);
    gl.uniform1f(u_camThickness, thickness);
    gl.uniform1f(u_camNear, camNear);
    gl.uniform1f(u_camFar, camFar);
    gl.uniform1f(u_camTar, camTar);
    gl.uniform1f(u_width, volume.bounds[1] - volume.bounds[0]);
    gl.uniform1f(u_height, volume.bounds[3] - volume.bounds[2]);
    gl.uniform1f(u_depth, volume.bounds[5] - volume.bounds[4]);
    console.log("camNear : ", camNear);
    console.log("camFar : ", camFar);
    console.log("camTar : ", camTar);
    gl.bindVertexArray(vao);

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
  }

  useEffect(onMounted, [thickness]);

  return(
    <div>
      <Divider />
      <Grid container spacing={2}>
        <Grid item>
          <Typography variant="h6">Axis</Typography>
        </Grid>
        <Grid item>
          <Select native value={axisType} onChange={onAxisChanged}>
            <option value={AxisType.axial}>Axial</option>
            <option value={AxisType.saggital}>Sagittal</option>
            <option value={AxisType.coronal}>Coronal</option>
          </Select>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs>
          <Typography gutterBottom>Thickness</Typography>
        </Grid>
        <Grid item xs>
          <Slider value={thickness} min={0} max={100} step={1} onChange={onThicknessChanged} />
        </Grid>
        <Grid item xs>
          <Typography gutterBottom>{thickness}</Typography>
        </Grid>
      </Grid>
      <Divider />
      <canvas id="glcanvas" width="600" height ="500"/>
    </div>
  );
}

export default VolumeSlice;