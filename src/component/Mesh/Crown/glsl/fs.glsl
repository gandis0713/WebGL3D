#version 300 es

precision mediump float;

out vec4 outColor;
in vec3 outVertexPosition;
in vec3 outVertexNormal;

void main() {
  outColor = vec4(outVertexNormal, 1);
}