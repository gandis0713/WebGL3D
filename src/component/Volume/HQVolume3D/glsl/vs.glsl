#version 300 es

in vec2 vs_VertexPosition;

out vec3 fs_vertexVC;
uniform vec2 u_boxX;
uniform vec2 u_boxY;
uniform highp sampler2D u_color;

void main() {
  gl_Position = vec4(
    u_boxX[0] + (vs_VertexPosition.x + 1.0) * 0.5 * (u_boxX[1] - u_boxX[0]),
    u_boxY[0] + (vs_VertexPosition.y + 1.0) * 0.5 * (u_boxY[1] - u_boxY[0]),
    0.0,
    1.0);
  fs_vertexVC = vec3(
  u_boxX[0] + (vs_VertexPosition.x + 1.0) * 0.5 * (u_boxX[1] - u_boxX[0]),
  u_boxY[0] + (vs_VertexPosition.y + 1.0) * 0.5 * (u_boxY[1] - u_boxY[0]),
  0.0);

}