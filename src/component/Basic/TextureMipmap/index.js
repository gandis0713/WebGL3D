import React, { useEffect, useState } from 'react';
import { createShader, createRenderShaderProgram } from '../../../webgl/shader/Shader';
import vertexShaderSource from './glsl/vs.glsl';
import fragmentShaderSource from './glsl/fs.glsl';
import { vec2, vec3, mat4 } from 'gl-matrix';

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
const MCVC = mat4.create();
const VCPC = mat4.create();
const MCPC = mat4.create();

let renderShaderProgram;
let textureBuffer;
let vertexBuffer;
let texCoordBuffer;

let u_MCPC;

function Magnifier() {
  console.log('create TriangleWithMatrix');

  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [gl, setGL] = useState(undefined);
  const [angle, setAngle] = useState(30);

  // prettier-ignore
  const [vertex, setVertex] = useState([
    -width,  height, -100,
    -width, -height, -100,
     width,  height, -5000,
    -width, -height, -100,
     width, -height, -5000,
     width,  height, -5000,
  ]);

  // prettier-ignore
  const [texCoord] = useState([
    0, 1,
    0, 0,
    1, 1,
    0, 0,
    1, 0,
    1, 1,
  ]);

  let glCanvas;

  const onMounted = function() {
    // initialize
    glCanvas = document.getElementById('_glcanvas');
    const newGL = glCanvas.getContext('webgl2');

    if (!newGL) {
      alert('Unable to initialize WebGL.');
      return;
    }

    setGL(newGL);
  };

  const changeAngle = (event) => {
    const newAngle = Number(event.target.value);

    mat4.perspective(VCPC, newAngle * (Math.PI / 180), 1, 0, 1000);
    mat4.multiply(MCPC, VCPC, MCVC);

    setAngle(newAngle);
  };

  useEffect(() => {
    if (!gl) {
      console.log(' gl return ');
      return;
    }

    // init camera
    mat4.lookAt(WCVC, camEye, camTar, camUp);
    mat4.multiply(MCVC, WCVC, MCWC);
    // mat4.ortho(VCPC, -width, width, -height, height, 1000, -1000);
    mat4.perspective(VCPC, angle * (Math.PI / 180), 1, 0, 1000);
    mat4.multiply(MCPC, VCPC, MCVC);

    gl.viewport(0, 0, width, height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // create shader
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    renderShaderProgram = createRenderShaderProgram(gl, vertexShader, fragmentShader);

    u_MCPC = gl.getUniformLocation(renderShaderProgram, 'u_MCPC');

    // initialize buffer
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex), gl.DYNAMIC_DRAW);

    texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoord), gl.DYNAMIC_DRAW);

    // create texture
    textureBuffer = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, textureBuffer);

    // const powTwoo = 9;
    // for (let i = 0; i <= powTwoo; i++) {
    //   const pow = Math.pow(2, powTwoo - i);
    //   const texture = new Uint8Array(pow * pow * 4);
    //   const g = parseInt(255 / (i / 4 + 1));
    //   const b = parseInt(255 / (i / 4 + 1));
    //   const r2 = parseInt(255 / (i / 4 + 1));
    //   const g2 = parseInt(255 / (i / 4 + 1));
    //   texture.fill(255, 0, texture.length / 4);
    //   texture.fill(255, (texture.length / 4) * 3, texture.length);
    //   for (let uv = texture.length / 4; uv < texture.length / 2; uv = uv + 4) {
    //     texture[uv] = 0;
    //     texture[uv + 1] = g;
    //     texture[uv + 2] = b;
    //     texture[uv + 3] = 255;
    //   }
    //   for (let uv = (texture.length / 4) * 3; uv < texture.length; uv = uv + 4) {
    //     texture[uv] = r2;
    //     texture[uv + 1] = g2;
    //     texture[uv + 2] = 0;
    //     texture[uv + 3] = 255;
    //   }
    //   gl.texImage2D(gl.TEXTURE_2D, i, gl.RGBA, pow, pow, 0, gl.RGBA, gl.UNSIGNED_BYTE, texture);
    // }
    // const mipLength = powTwoo;

    var c = document.getElementById('canvas');
    var ctx = c.getContext('2d');
    var mips = [
      { size: 1024, color: 'rgb(0,0,255)' },
      { size: 512, color: 'rgb(255,0,0)' },
      { size: 256, color: 'rgb(0,255,0)' },
      { size: 128, color: 'rgb(0,255,255)' },
      { size: 64, color: 'rgb(255,255,0)' },
      { size: 32, color: 'rgb(255,0,255)' },
      { size: 16, color: 'rgb(0,0,255)' },
      { size: 8, color: 'rgb(255,0,0)' },
      { size: 4, color: 'rgb(0,255,0)' },
      { size: 2, color: 'rgb(0,255,255)' },
      { size: 1, color: 'rgb(255,0,255)' },
    ];
    mips.forEach((s, level) => {
      var size = s.size;
      c.width = size;
      c.height = size;
      ctx.fillStyle = 'rgb(255,255,255)';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = s.color;
      ctx.fillRect(0, 0, size / 2, size / 2);
      ctx.fillRect(size / 2, size / 2, size / 2, size / 2);
      gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    });
    const mipLength = mips.length;

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    if (mipLength > 1) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      // gl.generateMipmap(gl.TEXTURE_2D);
    }

    gl.bindTexture(gl.TEXTURE_2D, null);

    drawScene();
  }, [gl]);

  const drawScene = function() {
    if (!gl) {
      console.log(' gl return ');
      return;
    }

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(renderShaderProgram);
    gl.uniformMatrix4fv(u_MCPC, false, MCPC);

    const vertexID = gl.getAttribLocation(renderShaderProgram, 'vs_VertexPosition');
    gl.enableVertexAttribArray(vertexID);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(vertexID, 3, gl.FLOAT, false, 0, 0);

    const texID = gl.getAttribLocation(renderShaderProgram, 'vs_TextureCoord');
    gl.enableVertexAttribArray(texID);
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(texID, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
    gl.uniform1i(gl.getUniformLocation(renderShaderProgram, 'u_texture'), 0);

    gl.drawArrays(gl.TRIANGLES, 0, vertex.length / 3);
  };

  useEffect(() => {
    drawScene();
  }, [angle]);

  useEffect(onMounted, []);
  return (
    <>
      <input
        id="slider"
        type="range"
        value={angle}
        min="1"
        max="179"
        step="1"
        onChange={changeAngle}
      />
      <canvas id="_glcanvas" width={width} height={height} />
      <canvas id="canvas" width={width} height={height} />
    </>
  );
}

export default Magnifier;
