#version 300 es

in vec3 vs_VertexPosition;
in vec3 vs_Normal;

uniform mat4 u_MCPC;

out vec3 fs_Normal;

void main()
{
  gl_Position = u_MCPC * vec4(vs_VertexPosition, 1.0);
  fs_Normal = vs_Normal;
}