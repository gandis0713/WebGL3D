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

void main()
{
  gl_Position = uWCPC * vec4(attrVertexPosition, 1.0);
  outVertexPosition = vec4(uWCVC * vec4(attrVertexPosition, 1.0)).xyz;
  outVertexNormal = vec4(transpose(inverse(uWCVC)) * vec4(attrVertexNormal, 0.0)).xyz;
}