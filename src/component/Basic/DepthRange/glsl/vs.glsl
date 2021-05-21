#version 300 es

precision mediump float;

in vec3 attrVertexPosition;
in vec3 attrVertexNormal;

uniform mat4 uMCWC;
uniform mat4 uWCPC;
uniform mat4 uWCVC;
uniform mat4 uVCPC;

out vec3 outVertexPosition;
out vec3 outVertexNormal;
out float outDepth;

void main()
{
  vec4 vertexPC = uWCPC * vec4(attrVertexPosition, 1.0);
  gl_Position = vertexPC;
}