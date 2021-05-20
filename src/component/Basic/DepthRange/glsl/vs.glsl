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
  vec3 vertexDC = vertexPC.xyz / vertexPC.w;
  gl_Position = vertexPC;
  outDepth = (vertexDC.z + 1.0) / 2.0;
  outVertexPosition = vertexDC;
  mat4 normalMat = transpose(inverse(uWCVC));
  outVertexNormal = vec4(normalMat * vec4(attrVertexNormal, 0.0)).xyz;
}