#version 300 es

precision mediump float;

out vec4 outColor;
in vec3 fs_vertex;
in vec3 fs_normal;

void main() {
  outColor = vec4(1, 0, 0, 1);
}