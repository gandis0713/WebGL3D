#version 300 es

precision mediump float;

in vec2 fs_TextCoord;

out vec4 outColor;

uniform sampler2D u_texture;

void main() {
  outColor = texture(u_texture, fs_TextCoord);
}