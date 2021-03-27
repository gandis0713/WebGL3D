#version 300 es

in vec3 attrVertexPosition;
in vec3 attrVertexNormal;

uniform mat4 u_MCPC;
uniform mat4 u_VCPC;

out vec3 outVertexPosition;
out vec3 outVertexNormal;

void main()
{
  gl_Position = u_MCPC * vec4(attrVertexPosition, 1.0);
  // gl_Position = u_VCPC * vec4(attrVertexPosition, 1.0);
  outVertexPosition = gl_Position.xyz;
  // outVertexNormal = (u_MCPC * vec4(attrVertexNormal, 1.0)).xyz;
  outVertexNormal = attrVertexNormal;
}