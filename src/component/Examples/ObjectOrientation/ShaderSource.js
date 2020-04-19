export const vertexShaderSource = `#version 300 es

in vec4 aVertexPosition;
in vec4 aVertexColor;

uniform vec2 uScreenResolution;
uniform mat4 uTranslationMatrix;

out vec4 vColor; 

void main() {

  vec4 zeroToOne = vec4(aVertexPosition.xy / uScreenResolution.xy, aVertexPosition.z, aVertexPosition.w);

  gl_Position = uTranslationMatrix * vec4(zeroToOne);
  
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