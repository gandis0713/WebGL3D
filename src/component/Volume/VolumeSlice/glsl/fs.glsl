#version 300 es

precision mediump float;

in vec2 fs_textCoord;

out vec4 outColor;

uniform highp sampler3D u_texture;

void main() {
  vec4 color = texture(u_texture, vec3(fs_textCoord, 0.5));
  outColor = vec4(color.r, color.r, color.r, color.a);
}