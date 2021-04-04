#version 300 es

precision mediump float;

uniform mat4 uVCWC;

in vec4 attrVertexPosition;

out vec4 outVertexPosition;


void main()
{
  vec4 position = attrVertexPosition;
  position = attrVertexPosition;
  position.z = -1.0;

  outVertexPosition = uVCWC * position;
  
  gl_Position = attrVertexPosition;
  gl_Position.z = 1.0;
}