#version 300 es

in vec2 vs_VertexPosition;
in vec2 vs_TextCoords;

uniform mat4 u_MCPC;

out vec2 fs_textCoord;

void main() {

  vec4 vertexDC = u_MCPC * vec4(vs_VertexPosition, 5.0, 1.0);
  gl_Position = vertexDC;
  
  fs_textCoord = vs_TextCoords;
}