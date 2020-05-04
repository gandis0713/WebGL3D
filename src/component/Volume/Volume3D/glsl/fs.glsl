#version 300 es

precision mediump float;

in vec3 fs_vertexVC;

out vec4 outColor;

uniform highp sampler3D u_texture;
uniform vec3 u_Dim;
uniform vec3 u_Extent;
uniform vec3 u_Bounds;
uniform vec3 u_Spacing;
uniform float u_camNear;
uniform float u_camFar;
uniform float u_camTar;
uniform float u_width;
uniform float u_height;
uniform float u_depth;
uniform highp vec2 u_boxX;
uniform highp vec2 u_boxY;
uniform highp vec2 u_boxZ;

uniform vec3 u_planeNormal0;
uniform vec3 u_planeNormal1;
uniform vec3 u_planeNormal2;
uniform vec3 u_planeNormal3;
uniform vec3 u_planeNormal4;
uniform vec3 u_planeNormal5;
uniform float u_planeDist0;
uniform float u_planeDist1;
uniform float u_planeDist2;
uniform float u_planeDist3;
uniform float u_planeDist4;
uniform float u_planeDist5;
uniform vec3 u_Center;

uniform highp mat4 u_MCVC;
uniform highp mat4 u_VCMC;

vec4 getTextureValue(vec3 coord)
{
  return texture(u_texture, coord);
}

bool getCollisionPosition(vec3 planePos, vec3 planeNor, out vec3 pos)
{
  vec3 near = fs_vertexVC + vec3(0, 0, u_boxZ[1]);
  vec3 far = fs_vertexVC + vec3(0, 0, u_boxZ[0]);

  float A = dot(planeNor, (planePos - near));
  float B = dot(planeNor, (far - near));

  if(B == 0.)
  {
    pos = vec3(0, 0, 0);
    return false;
  }

  float u = A / B;
  if(u <= 1. && u >= 0.)
  {
    pos = near + u * (far - near);
    return true;
  }
  else 
  {
    pos = vec3(0, 0, 0);
    return false;
  }
}

bool getRayPosition(out vec3 StartPos, out vec3 EndPos) 
{
  vec3 coliPosTemp;
  bool isColi = false;
  int count = 0;
  vec3 coliPos[2];

  vec3 center = vec3(0, 0, 0);
  vec3 origin = vec3(0.5, 0.5, 0.5);

  vec3 plane0Center = center + u_planeNormal0 * 0.5;
  isColi = getCollisionPosition(plane0Center, u_planeNormal0, coliPosTemp);
  if(isColi == true)
  {
    coliPosTemp = vec3(dot(u_planeNormal1, coliPosTemp),
                       dot(u_planeNormal3, coliPosTemp),
                       dot(u_planeNormal5, coliPosTemp));
    coliPosTemp += origin;
    if(coliPosTemp.y >= 0. && coliPosTemp.z >= 0. && 
    coliPosTemp.y <= 1. && coliPosTemp.z <= 1. )
    {
      coliPos[count] = coliPosTemp;
      count++;
    }
  }

  vec3 plane1Center = center + u_planeNormal1 * 0.5;
  isColi = getCollisionPosition(plane1Center, u_planeNormal1, coliPosTemp);
  if(isColi == true)
  {
     coliPosTemp = vec3(dot(u_planeNormal1, coliPosTemp),
                       dot(u_planeNormal3, coliPosTemp),
                       dot(u_planeNormal5, coliPosTemp));
    coliPosTemp += origin;
    if(coliPosTemp.y >= 0. && coliPosTemp.z >= 0. && 
    coliPosTemp.y <= 1. && coliPosTemp.z <= 1. )
    {
      coliPos[count] = coliPosTemp;
      count++;
    }
  }
  
  vec3 plane2Center = center + u_planeNormal2 * 0.5;
  isColi = getCollisionPosition(plane2Center, u_planeNormal2, coliPosTemp);
  if(isColi == true)
  {
     coliPosTemp = vec3(dot(u_planeNormal1, coliPosTemp),
                       dot(u_planeNormal3, coliPosTemp),
                       dot(u_planeNormal5, coliPosTemp));
    coliPosTemp += origin;
    if(coliPosTemp.x >= 0. && coliPosTemp.z >= 0. && 
    coliPosTemp.x <= 1. && coliPosTemp.z <= 1. )
    {
      coliPos[count] = coliPosTemp;
      count++;
    }
  }

  vec3 plane3Center = center + u_planeNormal3 * 0.5;
  isColi = getCollisionPosition(plane3Center, u_planeNormal3, coliPosTemp);
  if(isColi == true)
  {
     coliPosTemp = vec3(dot(u_planeNormal1, coliPosTemp),
                       dot(u_planeNormal3, coliPosTemp),
                       dot(u_planeNormal5, coliPosTemp));
    coliPosTemp += origin;
    if(coliPosTemp.x >= 0. && coliPosTemp.z >= 0. && 
    coliPosTemp.x <= 1. && coliPosTemp.z <= 1. )
    {
      coliPos[count] = coliPosTemp;
      count++;
    }
  }

  vec3 plane4Center = center + u_planeNormal4 * 0.5;
  isColi = getCollisionPosition(plane4Center, u_planeNormal4, coliPosTemp);
  if(isColi == true)
  {
     coliPosTemp = vec3(dot(u_planeNormal1, coliPosTemp),
                       dot(u_planeNormal3, coliPosTemp),
                       dot(u_planeNormal5, coliPosTemp));
    coliPosTemp += origin;
    if(coliPosTemp.x >= 0. && coliPosTemp.y >= 0. && 
    coliPosTemp.x <= 1. && coliPosTemp.y <= 1. )
    {
      coliPos[count] = coliPosTemp;
      count++;
    }
  }

  vec3 plane5Center = center + u_planeNormal5 * 0.5;
  isColi = getCollisionPosition(plane5Center, u_planeNormal5, coliPosTemp);
  if(isColi == true)
  {
     coliPosTemp = vec3(dot(u_planeNormal1, coliPosTemp),
                       dot(u_planeNormal3, coliPosTemp),
                       dot(u_planeNormal5, coliPosTemp));
    coliPosTemp += origin;
    if(coliPosTemp.x >= 0. && coliPosTemp.y >= 0. && 
    coliPosTemp.x <= 1. && coliPosTemp.y <= 1. )
    {
      coliPos[count] = coliPosTemp;
      count++;
    }
  }

  if(count != 2)
  {
    return false;
  }
  
  StartPos = coliPos[0];
  EndPos = coliPos[1];
  return true;

}

void main() {

  vec3 StartPos;
  vec3 EndPos;
  bool inVolume = getRayPosition(StartPos,  EndPos);
  if(inVolume == false)
  {
    // outColor = vec4(1, 0, 0, 1);
    discard;
  }

  vec3 rayDir = EndPos - StartPos;
  float rayLength = length(rayDir);
  float countf = rayLength / 0.008;
  highp int count = int(countf);
  vec3 steps = rayDir / float(count);
  vec4 sum = vec4(0.);
  for(int i = 0; i < count; i++)
  {
    vec4 color = getTextureValue(StartPos);
    sum += vec4(color.r, color.r, color.r, 0.0);
    StartPos += steps;
  }
  sum /= float(count);
  outColor = vec4(sum.rgb, 1.0);
}