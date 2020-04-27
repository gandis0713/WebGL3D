#version 300 es

precision mediump float;

out vec4 outColor;
in vec3 fs_vertex;
in vec3 fs_normal;

void main() {
  // vec4 color = vec4(fs_vertex.x, 0, 0, 1);
  vec3 nNormal = normalize(fs_normal);
  // if(nNormal.x < 0.0)
  // {
  //   nNormal.x *= -1.0;
  // }

  //   if(nNormal.y < 0.0)
  // {
  //   nNormal.y *= -1.0;
  // }

  //   if(nNormal.z < 0.0)
  // {
  //   nNormal.z *= -1.0;
  // }
  // if(fs_vertex.x == 0. && fs_vertex.y == 0. && fs_vertex.z == 0.)
  // {
  //   outColor = vec4(1, 0, 0, 1);
  // }
  // else 
  // {
  //   outColor = vec4(1, 1, 0, 1);
  // }
  // outColor = vec4(nNormal.x, nNormal.y, nNormal.z, 1) * 1000.0;
  outColor = vec4(1, 0, 0, 1);
  // outColor = vec4(1, 0, 0, 1);
}