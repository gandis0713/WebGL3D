// #version 300 es

// precision mediump float;

// in vec3 vs_VertexPosition;
// in vec2 vs_TextureCoord;

// uniform sampler2D u_texture;
// uniform mat4 u_MCPC;

// // out vec4 vColor; 
// out vec2 fs_textCoord;

// void main() {

//   vec4 vertexDC = u_MCPC * vec4(vs_VertexPosition, 1.0);
//   gl_Position = vertexDC;
  
//   fs_textCoord = vs_TextureCoord;
//   vec4 outColor = texture2DLod(u_texture, fs_textCoord, 1.0);
// }

precision mediump float;

attribute vec3 vs_VertexPosition;
attribute vec2 vs_TextureCoord;

uniform sampler2D u_texture;
uniform mat4 u_MCPC;

// out vec4 vColor; 
varying vec2 fs_textCoord;

void main() {

  vec4 vertexDC = u_MCPC * vec4(vs_VertexPosition, 1.0);
  gl_Position = vertexDC;
  
  fs_textCoord = vs_TextureCoord;
}