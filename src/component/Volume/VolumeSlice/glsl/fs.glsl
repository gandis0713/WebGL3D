#version 300 es

precision mediump float;

in vec2 fs_textCoord;

out vec4 outColor;

uniform highp sampler3D u_texture;
uniform vec3 u_Dim;
uniform vec3 u_Extent;
uniform vec3 u_Bounds;
uniform vec3 u_Spacing;
uniform float u_camThickness;
uniform float u_camNear;
uniform float u_camFar;
uniform float u_camTar;
uniform float u_width;
uniform float u_height;
uniform float u_depth;
uniform highp mat4 u_MCPC;

vec4 getTextureValue(vec3 coord)
{
  return texture(u_texture, coord);
}

void main() {
  float stepX = 1.0 / u_width;
  float stepY = 1.0 / u_height;
  float stepZ = 1.0 / u_depth;
  highp int countX = int(ceil(u_camThickness / u_Spacing[0]));
  highp int countY = int(ceil(u_camThickness / u_Spacing[1]));
  highp int countZ = int(ceil(u_camThickness / u_Spacing[2]));
  float coordX = u_camNear / u_width;
  float coordY = u_camNear / u_height;
  float coordZ = u_camNear / u_depth;
  vec4 sum = vec4(0.);
  // for(int i = 0; i < countZ; i++)
  // {
  //   vec4 color = getTextureValue(vec3(fs_textCoord.x, fs_textCoord.y, coordZ + float(i) * stepZ));
  //   sum += vec4(color.r, color.r, color.r, 0.0);
  // }
  // for(int i = 0; i < countX; i++)
  // {
  //   vec4 color = getTextureValue(vec3(coordX + float(i) * stepX, fs_textCoord.x, fs_textCoord.y));
  //   sum += vec4(color.r, color.r, color.r, 0.0);
  // }
  for(int i = 0; i < countY; i++)
  {
    vec4 color = getTextureValue(vec3(fs_textCoord.x, coordY + float(i) * stepY, fs_textCoord.y));
    sum += vec4(color.r, color.r, color.r, 0.0);
  }
  sum /= float(countZ);
  outColor = vec4(sum.rgb, 1.0);
}
