#version 300 es

in vec3 attrVertexPosition;
in vec3 attrVertexNormal;

uniform mat4 uMCWC;
uniform mat4 uWCPC;
uniform mat4 uVCPC;

out vec3 outVertexPosition;
out vec3 outVertexNormal;

void main()
{
  gl_Position = uWCPC * uMCWC * vec4(attrVertexPosition, 1.0);
  outVertexPosition = gl_Position.xyz;
  outVertexNormal = vec4(uMCWC * vec4(attrVertexNormal, 0.0)).xyz;
}