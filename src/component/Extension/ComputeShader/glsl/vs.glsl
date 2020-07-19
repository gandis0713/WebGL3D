#version 310 es

in vec3 vs_VertexPosition;

uniform mat4 u_MCPC;

void main() {

  vec4 vertexDC = u_MCPC * vec4(vs_VertexPosition, 1.0);
  gl_Position = vertexDC;
}