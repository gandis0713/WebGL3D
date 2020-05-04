#version 300 es

in vec2 vs_VertexPosition;
in vec2 vs_TextCoords;

uniform mat4 u_MCPC;
uniform mat4 u_MCVC;
uniform mat4 u_PCVC;

out vec2 fs_textCoord;
out vec3 fs_vertexVC;
out vec3 fs_VertexPosition;
uniform vec2 u_boxX;
uniform vec2 u_boxY;



void main() {
  gl_Position = vec4(
    u_boxX[0] + (vs_VertexPosition.x + 1.0) * 0.5 * (u_boxX[1] - u_boxX[0]),
    u_boxY[0] + (vs_VertexPosition.y + 1.0) * 0.5 * (u_boxY[1] - u_boxY[0]),
    0.0,
    1.0);
  // gl_Position = vec4(vs_VertexPosition, 0.0, 1.0);
  fs_VertexPosition = gl_Position.xyz / gl_Position.w; 
  fs_vertexVC = vec3(
  u_boxX[0] + (vs_VertexPosition.x + 1.0) * 0.5 * (u_boxX[1] - u_boxX[0]),
  u_boxY[0] + (vs_VertexPosition.y + 1.0) * 0.5 * (u_boxY[1] - u_boxY[0]),
  0.0);
  fs_textCoord = vec2((vs_VertexPosition + 1.0) * 0.5);

}