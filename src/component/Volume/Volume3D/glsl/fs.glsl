#version 300 es

precision mediump float;

in vec2 fs_textCoord;
in vec3 fs_vertexVC;
in vec3 fs_VertexPosition;

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
uniform highp vec2 u_boxX;
uniform highp vec2 u_boxY;
uniform vec2 u_boxZ;

uniform vec3 u_normal0;
uniform vec3 u_normal1;
uniform vec3 u_normal2;
uniform vec3 u_normal3;
uniform vec3 u_normal4;
uniform vec3 u_normal5;

vec4 getTextureValue(vec3 coord)
{
  return texture(u_texture, coord);
}

void getRayPosition(out vec3 StartPos, out vec3 EndPos) 
{
  StartPos = fs_VertexPosition + vec3(0, 0, 1);
  StartPos = vec3(dot(StartPos, u_normal0), dot(StartPos, u_normal2), dot(StartPos, u_normal4));
  
  EndPos = fs_VertexPosition +vec3(0, 0, 0);
  EndPos = vec3(dot(EndPos, u_normal0), dot(EndPos, u_normal2), dot(EndPos, u_normal4));

}

void main() {

  vec3 StartPos;
  vec3 EndPos;
  getRayPosition(StartPos,  EndPos);
  vec3 delta = EndPos - StartPos;

  float resolutionf = 1000.0;
  vec3 steps = delta / resolutionf;
  highp int resolution = int(resolutionf);
  vec4 sum = vec4(0.);
  int count = 0;
  for(int i = 0; i < resolution; i++)
  {
    vec4 color = getTextureValue(StartPos);
    sum += vec4(color.r, color.r, color.r, 0.0);
    StartPos += steps;
    count++;
    // if(StartPos.x < 0. || StartPos.y < 0. || StartPos.z < 0.)
    // {
    //   continue;
    // }

    // if(StartPos.x > 1. || StartPos.y > 1. || StartPos.z > 1.)
    // {
    //   continue;
    // }
  }
  sum /= float(count);
  outColor = vec4(sum.rgb, 1.0);
}