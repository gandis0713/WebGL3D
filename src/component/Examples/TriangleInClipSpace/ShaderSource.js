export const vertexShaderSource = `#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexColor;

uniform vec3 uScreenResolution;

out vec4 vColor; 

void main() {

  vec3 zeroToOne = aVertexPosition / uScreenResolution;

  gl_Position = vec4(zeroToOne * vec3(1, 1, 0), 1.0);
  vColor = vec4(aVertexColor, 1.0);
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