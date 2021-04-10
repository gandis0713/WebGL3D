import React, { useState, useEffect } from 'react';
import xmlVtiReader from '../../../common/DicomReader';
import { createShader, createRenderShaderProgram } from '../../../webgl/shader/Shader';
import vertexShaderSource from './glsl/vs.glsl';
import fragmentShaderSource from './glsl/fs.glsl';
import { vec3, mat4 } from 'gl-matrix';
import { vertices } from './resource';

import { makeStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TransferFunction from './TransferFunction';

const useStyles = makeStyles({
  root: {
    width: 300,
  },
});

const camEye = vec3.create();
camEye[0] = 0;
camEye[1] = 0;
camEye[2] = 0.0001;
const camUp = vec3.create();
camUp[0] = 0;
camUp[1] = 1;
camUp[2] = 0;
const camTar = vec3.create();
let camNear = 0.5;
let camFar = -0.5;

const MCWC = mat4.create();
const WCMC = mat4.create();
mat4.invert(WCMC, MCWC);

const WCVC = mat4.create();
const VCWC = mat4.create();
mat4.invert(VCWC, WCVC);

const VCPC = mat4.create();
const PCVC = mat4.create();
mat4.invert(PCVC, VCPC);

const MCVC = mat4.create();
const VCMC = mat4.create();
const MCPC = mat4.create();

let isDragging = false;
let prePosition = [0, 0];
let gl;

let width = 0;
let height = 0;
let viewWidth = 0;
let viewHeight = 0;
let isosurfaceMin = 0.3;
let isosurfaceMax = 0.7;
let mode = 0;
let box = [];

let renderShaderProgram;

let vbo_vertexBuffer;
let vbo_volumeBuffer;
let vbo_colorBuffer;
let vbo_jitterTexture;
let vao;
let u_MCPC;
let u_MCVC;
let u_VCMC;
let u_PCVC;
let u_Dim;
let u_Center;
let u_Extent;
let u_BoundsMin;
let u_BoundsMax;
let u_Spacing;
let u_camTar;
let u_camNear;
let u_camFar;
let u_width;
let u_height;
let u_depth;
let u_boxX;
let u_boxY;
let u_boxZ;
let u_volume;
let u_color;
let u_jitter;
let u_isoMinValue;
let u_isoMaxValue;
let u_mode;

let u_planeNormal0;
let u_planeNormal1;
let u_planeNormal2;
let u_planeNormal3;
let u_planeNormal4;
let u_planeNormal5;
let u_planeDist0;
let u_planeDist1;
let u_planeDist2;
let u_planeDist3;
let u_planeDist4;
let u_planeDist5;
let u_origin;

let volume;

let colorData;

function HighQualityVolumePrototype() {
  console.log('HighQualityVolumePrototype.');

  const [value, setValue] = useState([0.3, 0.7]);
  const classes = useStyles();

  const onMounted = function() {
    console.log('on Mounted.');

    const transfer = new TransferFunction();
    transfer.create();

    let colorValue = transfer.getColorValue();
    let opacityValue = transfer.getOpacityValue();

    const dataSize = opacityValue.length;
    colorData = new Float32Array(dataSize * 4);
    for (let i = 0; i < dataSize; i++) {
      colorData[i * 4 + 0] = colorValue[0][i] < 0 ? 0 : colorValue[0][i];
      colorData[i * 4 + 1] = colorValue[1][i] < 0 ? 0 : colorValue[1][i];
      colorData[i * 4 + 2] = colorValue[2][i] < 0 ? 0 : colorValue[2][i];
      colorData[i * 4 + 3] = opacityValue[i] < 0 ? 0 : opacityValue[i];

      colorData[i * 4 + 0] = colorValue[0][i] > 1 ? 1 : colorData[i * 4 + 0];
      colorData[i * 4 + 1] = colorValue[1][i] > 1 ? 1 : colorData[i * 4 + 1];
      colorData[i * 4 + 2] = colorValue[2][i] > 1 ? 1 : colorData[i * 4 + 2];
      colorData[i * 4 + 3] = opacityValue[i] > 1 ? 1 : colorData[i * 4 + 3];
    }

    if (gl) {
      console.log('View was already initialized.');
      initView();
      return;
    }

    initView();
  };

  const mouseMoveEvent = (event) => {
    if (isDragging === true) {
      const diffX = event.offsetX - viewWidth - prePosition[0];
      const diffY = viewHeight - event.offsetY - prePosition[1];

      const screenNormal = [0, 0, 1];
      const dir = [diffX, diffY, 0];
      const axis = vec3.create();
      vec3.cross(axis, dir, screenNormal);

      vec3.normalize(axis, axis);

      let dgreeX = vec3.dot(axis, [1, 0, 0]);
      let dgreeY = vec3.dot(axis, [0, 1, 0]);

      const degreeAmount = 10;
      dgreeX = (dgreeX * Math.PI) / 180.0;
      dgreeY = (dgreeY * Math.PI) / 180.0;
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

      vec3.cross(camRight, camUp, camTarToEye);
      vec3.normalize(camRight, camRight);

      mat4.lookAt(WCVC, camEye, camTar, camUp);
      mat4.invert(VCWC, WCVC);
      mat4.multiply(MCVC, WCVC, MCWC);
      mat4.invert(VCMC, MCVC);
      mat4.invert(PCVC, VCPC);
      mat4.multiply(MCPC, VCPC, MCVC);

      prePosition[0] = event.offsetX - viewWidth;
      prePosition[1] = viewHeight - event.offsetY;

      setCurrentValues();

      render();
    }
  };

  const setCurrentValues = function() {
    const pos = vec3.create();
    volume.current.box = [
      volume.bounds[1],
      volume.bounds[0],
      volume.bounds[3],
      volume.bounds[2],
      volume.bounds[5],
      volume.bounds[4],
    ];
    const bounds = volume.bounds;
    box = [
      volume.bounds[1],
      volume.bounds[0],
      volume.bounds[3],
      volume.bounds[2],
      volume.bounds[5],
      volume.bounds[4],
    ];
    for (let i = 0; i < 8; i++) {
      vec3.set(
        pos,
        bounds[i % 2],
        bounds[2 + (Math.floor(i / 2) % 2)],
        bounds[4 + Math.floor(i / 4)]
      );

      vec3.transformMat4(pos, pos, MCVC);

      for (let j = 0; j < 3; j++) {
        volume.current.box[j * 2] = Math.min(pos[j], volume.current.box[j * 2]);
        volume.current.box[j * 2 + 1] = Math.max(pos[j], volume.current.box[j * 2 + 1]);
      }

      vec3.transformMat4(pos, pos, VCPC);
      for (let j = 0; j < 3; j++) {
        box[j * 2] = Math.min(pos[j], box[j * 2]);
        box[j * 2 + 1] = Math.max(pos[j], box[j * 2 + 1]);
      }
    }

    volume.current.planeNormal0 = [-1, 0, 0];
    volume.current.planeNormal1 = [1, 0, 0];
    volume.current.planeNormal2 = [0, -1, 0];
    volume.current.planeNormal3 = [0, 1, 0];
    volume.current.planeNormal4 = [0, 0, -1];
    volume.current.planeNormal5 = [0, 0, 1];

    vec3.transformMat4(volume.current.planeNormal0, volume.current.planeNormal0, WCVC);
    vec3.transformMat4(volume.current.planeNormal1, volume.current.planeNormal1, WCVC);
    vec3.transformMat4(volume.current.planeNormal2, volume.current.planeNormal2, WCVC);
    vec3.transformMat4(volume.current.planeNormal3, volume.current.planeNormal3, WCVC);
    vec3.transformMat4(volume.current.planeNormal4, volume.current.planeNormal4, WCVC);
    vec3.transformMat4(volume.current.planeNormal5, volume.current.planeNormal5, WCVC);

    vec3.normalize(volume.current.planeNormal0, volume.current.planeNormal0);
    vec3.normalize(volume.current.planeNormal1, volume.current.planeNormal1);
    vec3.normalize(volume.current.planeNormal2, volume.current.planeNormal2);
    vec3.normalize(volume.current.planeNormal3, volume.current.planeNormal3);
    vec3.normalize(volume.current.planeNormal4, volume.current.planeNormal4);
    vec3.normalize(volume.current.planeNormal5, volume.current.planeNormal5);

    volume.current.center = [];
    vec3.transformMat4(volume.current.center, volume.center, MCVC);
  };

  const mouseDownEvent = (event) => {
    isDragging = true;

    prePosition[0] = event.offsetX - viewWidth;
    prePosition[1] = viewHeight - event.offsetY;

    render();
  };

  const mouseUpEvent = (event) => {
    isDragging = false;
  };

  const initView = function() {
    const glCanvas = document.getElementById('glcanvas');
    glCanvas.addEventListener('mousedown', mouseDownEvent, false);
    glCanvas.addEventListener('mousemove', mouseMoveEvent, false);
    glCanvas.addEventListener('mouseup', mouseUpEvent, false);
    gl = glCanvas.getContext('webgl2');
    if (!gl) {
      console.log('Failed to get gl context for webgl2.');
      return;
    }

    width = gl.canvas.width;
    height = gl.canvas.height;
    viewWidth = width / 4;
    viewHeight = height / 4;

    // create shader
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    renderShaderProgram = createRenderShaderProgram(gl, vertexShader, fragmentShader);
    u_volume = gl.getUniformLocation(renderShaderProgram, 'u_volume');
    u_color = gl.getUniformLocation(renderShaderProgram, 'u_color');
    u_jitter = gl.getUniformLocation(renderShaderProgram, 'u_jitter');
    u_MCPC = gl.getUniformLocation(renderShaderProgram, 'u_MCPC');
    u_MCVC = gl.getUniformLocation(renderShaderProgram, 'u_MCVC');
    u_VCMC = gl.getUniformLocation(renderShaderProgram, 'u_VCMC');
    u_PCVC = gl.getUniformLocation(renderShaderProgram, 'u_PCVC');
    u_Dim = gl.getUniformLocation(renderShaderProgram, 'u_Dim');
    u_Extent = gl.getUniformLocation(renderShaderProgram, 'u_Extent');
    u_Center = gl.getUniformLocation(renderShaderProgram, 'u_Center');
    u_BoundsMin = gl.getUniformLocation(renderShaderProgram, 'u_BoundsMin');
    u_BoundsMax = gl.getUniformLocation(renderShaderProgram, 'u_BoundsMax');
    u_Spacing = gl.getUniformLocation(renderShaderProgram, 'u_Spacing');
    u_camNear = gl.getUniformLocation(renderShaderProgram, 'u_camNear');
    u_camFar = gl.getUniformLocation(renderShaderProgram, 'u_camFar');
    u_camTar = gl.getUniformLocation(renderShaderProgram, 'u_camTar');
    u_width = gl.getUniformLocation(renderShaderProgram, 'u_width');
    u_height = gl.getUniformLocation(renderShaderProgram, 'u_height');
    u_depth = gl.getUniformLocation(renderShaderProgram, 'u_depth');
    u_boxX = gl.getUniformLocation(renderShaderProgram, 'u_boxX');
    u_boxY = gl.getUniformLocation(renderShaderProgram, 'u_boxY');
    u_boxZ = gl.getUniformLocation(renderShaderProgram, 'u_boxZ');
    u_isoMinValue = gl.getUniformLocation(renderShaderProgram, 'u_isoMinValue');
    u_isoMaxValue = gl.getUniformLocation(renderShaderProgram, 'u_isoMaxValue');
    u_mode = gl.getUniformLocation(renderShaderProgram, 'u_mode');
    u_planeNormal0 = gl.getUniformLocation(renderShaderProgram, 'u_planeNormal0');
    u_planeNormal1 = gl.getUniformLocation(renderShaderProgram, 'u_planeNormal1');
    u_planeNormal2 = gl.getUniformLocation(renderShaderProgram, 'u_planeNormal2');
    u_planeNormal3 = gl.getUniformLocation(renderShaderProgram, 'u_planeNormal3');
    u_planeNormal4 = gl.getUniformLocation(renderShaderProgram, 'u_planeNormal4');
    u_planeNormal5 = gl.getUniformLocation(renderShaderProgram, 'u_planeNormal5');
    u_planeDist0 = gl.getUniformLocation(renderShaderProgram, 'u_planeDist0');
    u_planeDist1 = gl.getUniformLocation(renderShaderProgram, 'u_planeDist1');
    u_planeDist2 = gl.getUniformLocation(renderShaderProgram, 'u_planeDist2');
    u_planeDist3 = gl.getUniformLocation(renderShaderProgram, 'u_planeDist3');
    u_planeDist4 = gl.getUniformLocation(renderShaderProgram, 'u_planeDist4');
    u_planeDist5 = gl.getUniformLocation(renderShaderProgram, 'u_planeDist5');
    u_origin = gl.getUniformLocation(renderShaderProgram, 'u_origin');

    setBuffer();
  };

  const setBuffer = function() {
    xmlVtiReader('/assets/volumes/dicom2.vti').then((imageData) => {
      volume = imageData;

      volume.floatArray = new Float32Array(imageData.data.length);
      const range = volume.max - volume.min;
      for (let i = 0; i < volume.data.length; i++) {
        volume.floatArray[i] = (volume.data[i] - volume.min) / range;
      }
      volume.current = {};
      volume.current.planeDist0 = volume.bounds[1] - volume.center[0];
      volume.current.planeDist1 = volume.center[0] - volume.bounds[0];
      volume.current.planeDist2 = volume.bounds[3] - volume.center[1];
      volume.current.planeDist3 = volume.center[1] - volume.bounds[2];
      volume.current.planeDist4 = volume.bounds[5] - volume.center[2];
      volume.current.planeDist5 = volume.center[2] - volume.bounds[4];

      // init camera
      volume.current.origin = [-volume.center[0], -volume.center[1], -volume.center[2]];
      mat4.fromTranslation(MCWC, volume.current.origin);

      mat4.lookAt(WCVC, camEye, camTar, camUp);
      mat4.invert(VCWC, WCVC);
      mat4.multiply(MCVC, WCVC, MCWC);
      mat4.invert(VCMC, MCVC);
      mat4.ortho(VCPC, -viewWidth, viewWidth, -viewHeight, viewHeight, -1000, 1000);
      mat4.invert(PCVC, VCPC);
      mat4.multiply(MCPC, VCPC, MCVC);

      vbo_colorBuffer = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, vbo_colorBuffer);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA16F,
        colorData.length / 4,
        1,
        0,
        gl.RGBA,
        gl.FLOAT,
        colorData
      );
      gl.bindTexture(gl.TEXTURE_2D, null);

      vbo_volumeBuffer = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_3D, vbo_volumeBuffer);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage3D(
        gl.TEXTURE_3D,
        0,
        gl.R16F,
        imageData.dimension[0],
        imageData.dimension[1],
        imageData.dimension[2],
        0,
        gl.RED,
        gl.FLOAT,
        imageData.floatArray
      );
      gl.bindTexture(gl.TEXTURE_3D, null);

      const jitter = new Float32Array(32 * 32);
      for (let i = 0; i < 32 * 32; ++i) {
        jitter[i] = Math.random();
      }

      vbo_jitterTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, vbo_jitterTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, 32, 32, 0, gl.RED, gl.FLOAT, jitter);

      vao = gl.createVertexArray();
      gl.bindVertexArray(vao);

      vbo_vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo_vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

      const vertexID = gl.getAttribLocation(renderShaderProgram, 'vs_VertexPosition');
      gl.enableVertexAttribArray(vertexID);
      gl.vertexAttribPointer(vertexID, 2, gl.FLOAT, false, 0, 0);

      gl.bindVertexArray(null);

      setCurrentValues();

      render();
    });
  };

  const render = function() {
    gl.clearColor(0, 0, 0, 1);
    // gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(renderShaderProgram);
    gl.uniformMatrix4fv(u_MCPC, false, MCPC);
    gl.uniformMatrix4fv(u_MCVC, false, MCVC);
    gl.uniformMatrix4fv(u_VCMC, false, VCMC);
    gl.uniformMatrix4fv(u_PCVC, false, PCVC);
    gl.uniform3fv(u_Dim, volume.dimension);
    gl.uniform3fv(u_Extent, volume.extent);
    gl.uniform3fv(u_Center, volume.current.center);
    gl.uniform3fv(u_BoundsMin, [volume.bounds[0], volume.bounds[2], volume.bounds[4]]);
    gl.uniform3fv(u_BoundsMax, [volume.bounds[1], volume.bounds[3], volume.bounds[5]]);
    gl.uniform3fv(u_Spacing, volume.spacing);
    gl.uniform1f(u_camNear, camNear);
    gl.uniform1f(u_camFar, camFar);
    gl.uniform1f(u_camTar, camTar);
    gl.uniform1f(u_width, volume.bounds[1] - volume.bounds[0]);
    gl.uniform1f(u_height, volume.bounds[3] - volume.bounds[2]);
    gl.uniform1f(u_depth, volume.bounds[5] - volume.bounds[4]);
    gl.uniform2fv(u_boxX, [box[0], box[1]]);
    gl.uniform2fv(u_boxY, [box[2], box[3]]);
    gl.uniform2fv(u_boxZ, [box[4], box[5]]);
    gl.uniform1f(u_isoMinValue, isosurfaceMin);
    gl.uniform1f(u_isoMaxValue, isosurfaceMax);
    gl.uniform1i(u_mode, mode);
    gl.uniform3fv(u_planeNormal0, volume.current.planeNormal0);
    gl.uniform3fv(u_planeNormal1, volume.current.planeNormal1);
    gl.uniform3fv(u_planeNormal2, volume.current.planeNormal2);
    gl.uniform3fv(u_planeNormal3, volume.current.planeNormal3);
    gl.uniform3fv(u_planeNormal4, volume.current.planeNormal4);
    gl.uniform3fv(u_planeNormal5, volume.current.planeNormal5);
    gl.uniform1f(u_planeDist0, volume.current.planeDist0);
    gl.uniform1f(u_planeDist1, volume.current.planeDist1);
    gl.uniform1f(u_planeDist2, volume.current.planeDist2);
    gl.uniform1f(u_planeDist3, volume.current.planeDist3);
    gl.uniform1f(u_planeDist4, volume.current.planeDist4);
    gl.uniform1f(u_planeDist5, volume.current.planeDist5);
    gl.uniform3fv(u_origin, volume.current.origin);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, vbo_colorBuffer);
    gl.uniform1i(u_color, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_3D, vbo_volumeBuffer);
    gl.uniform1i(u_volume, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, vbo_jitterTexture);
    gl.uniform1i(u_jitter, 2);

    gl.bindVertexArray(vao);

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
  };

  useEffect(onMounted, []);

  const onTeeth = function() {
    mode = 0;
    render();
  };

  const onMIP = function() {
    mode = 1;
    render();
  };

  const onISO = function() {
    mode = 2;
    render();
  };

  const onChangeIsosurface = function(event, newValue) {
    setValue(newValue);
    isosurfaceMin = newValue[0];
    isosurfaceMax = newValue[1];
    render();
  };

  const valueText = function(value) {
    return `${value}`;
  };

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs>
          <Typography gutterBottom>High Quality 3D Volume Rendering</Typography>
          <Button variant="contained" color="primary" onClick={onTeeth}>
            COLOR MODE
          </Button>
          <Button variant="contained" color="primary" onClick={onMIP}>
            MIP MODE
          </Button>

          <div className={classes.root}>
            <Grid container spacing={3}>
              <Grid item>
                <Button variant="contained" color="primary" onClick={onISO}>
                  ISO Surface
                </Button>
              </Grid>
              <Grid item xs>
                <Slider
                  value={value}
                  min={0}
                  step={0.01}
                  max={1}
                  onChange={onChangeIsosurface}
                  valueLabelDisplay="auto"
                  aria-labelledby="range-slider"
                  getAriaValueText={valueText}
                />
              </Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
      <canvas id="glcanvas" width="500" height="500" />
    </div>
  );
}

export default HighQualityVolumePrototype;
