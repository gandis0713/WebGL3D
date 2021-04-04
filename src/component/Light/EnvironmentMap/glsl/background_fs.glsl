#version 300 es

precision mediump float;

out vec4 outColor;
in vec4 outVertexPosition;

uniform samplerCube uTexture;

void main() {
  outColor = texture(uTexture, normalize(outVertexPosition.xyz / outVertexPosition.w));
}