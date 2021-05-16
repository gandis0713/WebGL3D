#version 300 es

precision mediump float;

in vec2 fs_textCoord;

out vec4 outColor;

uniform sampler2D u_texture;
uniform vec2 u_mousePosition;
uniform vec2 u_mousePositionTC;

void main() {

  outColor = texture(u_texture, fs_textCoord);
  // outColor = vec4(fs_textCoord.x, 0.0, 0.0, 1.0);
  // if(fs_textCoord.x < 0.0 || fs_textCoord.y < 0.0 || fs_textCoord.x > 1.0 || fs_textCoord.y > 1.0) {
  //   discard;
  // }
}