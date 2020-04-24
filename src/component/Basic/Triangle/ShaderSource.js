export const vertexShaderSource = `
attribute vec3 vs_VertexPosition;
attribute vec3 aVertexColor;

varying lowp vec4 vColor; 

void main() {
  gl_Position = vec4(vs_VertexPosition, 1.0);
  vColor = vec4(aVertexColor, 1.0);
}
`;

export const fragmentShaderSource = `
varying lowp vec4 vColor;

void main() {
  gl_FragColor = vColor;
}
`;