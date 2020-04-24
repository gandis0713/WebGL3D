#version 300 es

in vec3 vs_VertexPosition;

uniform mat4 u_MCPC;

// out vec4 vColor; 
out vec2 fs_textCoord;

void main() {

  vec4 vertexDC = u_MCPC * vec4(vs_VertexPosition, 1.0);
  gl_Position = vertexDC;
  
  fs_textCoord = vec2((vertexDC.x + 1.0) / 2.0, 1.0 - (vertexDC.y + 1.0) / 2.0);
}