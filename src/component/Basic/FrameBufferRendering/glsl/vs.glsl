#version 300 es

in vec3 vs_VertexPosition;
in vec2 vs_TextCoord;

uniform mat4 u_MCPC;

out vec2 fs_TextCoord;

void main()
{
  gl_Position = u_MCPC * vec4(vs_VertexPosition, 1.0);  
  fs_TextCoord = vs_TextCoord;
}