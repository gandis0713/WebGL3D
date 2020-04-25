#version 300 es

precision mediump float;

in vec2 fs_textCoord;

out vec4 outColor;

void main() {
  outColor = vec4(fs_textCoord.x, 0, 0, 1);
}