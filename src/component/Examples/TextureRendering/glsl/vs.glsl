#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexColor;

uniform mat4 uTransformMatrix;

out vec4 vColor; 
out vec2 textCoord;

void main() {

  vec4 vertexDC = uTransformMatrix * vec4(aVertexPosition, 1.0);
  gl_Position = vertexDC;
  
  textCoord = vec2((vertexDC.x + 1.0) / 2.0, 1.0 - (vertexDC.y + 1.0) / 2.0);
  vColor = vec4(aVertexColor, 1.0);
}