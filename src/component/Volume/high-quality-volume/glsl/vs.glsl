#version 300 es

in vec2 vs_VertexPosition;

out vec3 fs_vertexVC;
uniform vec2 u_boxVCX;
uniform vec2 u_boxVCY;
uniform highp mat4 u_VCPC;
uniform highp mat4 u_PCVC;

void main() {

  vec4 boxMinPC = u_VCPC * vec4(u_boxVCX[0], u_boxVCY[0], 0, 1);
  vec4 boxMaxPC = u_VCPC * vec4(u_boxVCX[1], u_boxVCY[1], 0, 1);
  gl_Position = vec4(
    boxMinPC[0] + (vs_VertexPosition.x + 1.0) * 0.5 * (boxMaxPC[0] - boxMinPC[0]),
    boxMinPC[1] + (vs_VertexPosition.y + 1.0) * 0.5 * (boxMaxPC[1] - boxMinPC[1]),
    0.0,
    1.0);

  fs_vertexVC = (u_PCVC * gl_Position).xyz;

}