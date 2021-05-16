#version 300 es


in vec3 vs_VertexPosition;

uniform mat4 u_MCPC;
uniform float u_texSize;

// out vec4 vColor; 
out vec2 fs_textCoord;

void main() {

  vec4 vertexDC = u_MCPC * vec4(vs_VertexPosition, 1.0);
  vec4 vertexDCTex = u_MCPC * vec4(vs_VertexPosition[0] * u_texSize, vs_VertexPosition[1] * u_texSize, vs_VertexPosition[2], 1.0);
  // vec4 vertexDCPos = u_MCPC * vec4(vs_VertexPosition[0] * 4.0, vs_VertexPosition[1] * 4.0, vs_VertexPosition[2], 1.0);
  gl_Position = vertexDC;
  
  fs_textCoord = vec2((vertexDC.x * u_texSize + 1.0) / 2.0, 1.0 - ((vertexDC.y * u_texSize + 1.0) / 2.0));
  // fs_textCoord = vec2(vs_VertexPosition[0] / 512.0, vs_VertexPosition[1] / 512.0);
}