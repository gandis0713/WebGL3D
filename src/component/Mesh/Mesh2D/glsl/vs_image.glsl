#version 300 es

in vec3 vs_VertexPosition;
in vec2 vs_textureCoords;

uniform mat4 u_MCPC;

out vec2 fs_textureCoords;

void main()
{
  gl_Position = vec4(vs_VertexPosition, 1.0);
  fs_textureCoords = vs_textureCoords;
}