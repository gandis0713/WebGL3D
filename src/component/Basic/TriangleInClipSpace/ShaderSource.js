export const vertexShaderSource = `#version 300 es

in vec4 vs_VertexPosition;
in vec4 aVertexColor;

uniform vec2 uScreenResolution;

out vec4 vColor; 

void main() {

  vec4 zeroToOne = vec4(vs_VertexPosition.xy / uScreenResolution.xy, vs_VertexPosition.z, vs_VertexPosition.w);

  gl_Position = vec4(zeroToOne);
  vColor = vec4(aVertexColor);
}
`;

export const fragmentShaderSource = `#version 300 es

precision mediump float;

in vec4 vColor;
out vec4 outColor;

void main() {
  outColor = vColor;
}
`;