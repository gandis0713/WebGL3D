#version 300 es

precision mediump float;

in vec4 vColor;
in vec2 textCoord;

out vec4 outColor;

uniform sampler2D u_texture;

void main() {
  outColor = texture(u_texture, textCoord);
}