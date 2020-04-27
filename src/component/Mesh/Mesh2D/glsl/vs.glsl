#version 300 es

in vec3 vs_VertexPosition;
in vec3 vs_Normal;

uniform mat4 u_MCPC;

out vec3 fs_vertex;
out vec3 fs_normal;

void main()
{
  gl_Position = u_MCPC * vec4(vs_VertexPosition, 1.0);
  fs_vertex = gl_Position.xyz;
  // fs_normal = (u_MCPC * vec4(vs_Normal, 1.0)).xyz;
  fs_normal = vs_Normal;
}