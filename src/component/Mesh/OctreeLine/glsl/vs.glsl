#version 300 es

in vec3 vs_VertexPosition;

uniform mat4 u_MCPC;

void main()
{
  gl_Position = u_MCPC * vec4(vs_VertexPosition, 1.0);
}