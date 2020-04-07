export const vertexShaderSource = `#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexColor;

uniform vec2 uScreenResolution;
uniform mat4 uTransformMatrix;

out vec4 vColor; 

void main() {

  gl_Position = uTransformMatrix * vec4(aVertexPosition, 1.0);
  
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