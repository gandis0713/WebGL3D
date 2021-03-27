#version 300 es

in vec3 attrVertexPosition;
in vec3 attrVertexNormal;

uniform mat4 uMCPC;
uniform mat4 uVCPC;

out vec3 outVertexPosition;
out vec3 outVertexNormal;

void main()
{
  gl_Position = uMCPC * vec4(attrVertexPosition, 1.0);
  // gl_Position = uVCPC * vec4(attrVertexPosition, 1.0);
  outVertexPosition = gl_Position.xyz;
  // outVertexNormal = (uMCPC * vec4(attrVertexNormal, 1.0)).xyz;
  outVertexNormal = attrVertexNormal;
}