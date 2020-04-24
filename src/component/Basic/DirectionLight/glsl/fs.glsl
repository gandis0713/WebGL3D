#version 300 es

precision mediump float;

uniform vec3 u_reverseLightDirection;
uniform vec4 u_lightColor;

in vec3 fs_Normal;

out vec4 outColor;

void main() {

  float colorRatio = dot(normalize(fs_Normal), u_reverseLightDirection);
  outColor = u_lightColor;
  outColor.rgb *= colorRatio;
}