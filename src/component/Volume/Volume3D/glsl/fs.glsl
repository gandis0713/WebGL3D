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

  vec3 center = (u_MCVC * vec4(0.5, 0.5, 0.5, 1.0)).xyz;
  vec3 plane0Center = center + u_planeNormal0 * 0.5;
  isColi = getCollisionPosition(plane0Center, u_planeNormal0, coliPosTemp);
  if(isColi == true)
  {
    // coliPosTemp = (u_VCMC * vec4(coliPosTemp, 1.0)).xyz;
    coliPosTemp = vec3(dot(u_planeNormal1, coliPosTemp),
                       dot(u_planeNormal3, coliPosTemp),
                       dot(u_planeNormal5, coliPosTemp));
    // coliPosTemp = vec3(dot(u_planeNormal0, coliPosTemp),
    //                    dot(u_planeNormal2, coliPosTemp),
    //                    dot(u_planeNormal4, coliPosTemp));
    if(coliPosTemp.y >= 0. && coliPosTemp.z >= 0. && 
    coliPosTemp.y <= 1. && coliPosTemp.z <= 1.)
    {
      coliPos[count] = coliPosTemp;
      // outColor = vec4(coliPosTemp.y, 0, 0, 1.0);
      count++;
    }
    // if(coliPosTemp.x >= 0. && coliPosTemp.y >= 0. && coliPosTemp.z >= 0. && 
    //    coliPosTemp.x <= 1. && coliPosTemp.y <= 1. && coliPosTemp.z <= 1.)
    // {
    //   coliPos[count] = coliPosTemp;
    //   // outColor = vec4(coliPosTemp.y, 0, 0, 1.0);
    //   count++;
    // }
  }

  vec3 plane1Center = center + u_planeNormal1 * 0.5;
  isColi = getCollisionPosition(plane1Center, u_planeNormal1, coliPosTemp);
  if(isColi == true)
  {
    // coliPosTemp = (u_VCMC * vec4(coliPosTemp, 1.0)).xyz;
     coliPosTemp = vec3(dot(u_planeNormal1, coliPosTemp),
                       dot(u_planeNormal3, coliPosTemp),
                       dot(u_planeNormal5, coliPosTemp));
    // coliPosTemp = vec3(dot(u_planeNormal0, coliPosTemp),
    //                    dot(u_planeNormal2, coliPosTemp),
    //                    dot(u_planeNormal4, coliPosTemp));
    if(coliPosTemp.y >= 0. && coliPosTemp.z >= 0. && 
    coliPosTemp.y <= 1. && coliPosTemp.z <= 1.)
    {
      coliPos[count] = coliPosTemp;
      // outColor = vec4(coliPosTemp.y, 0, 0, 1.0);
      count++;
    }
    // if(coliPosTemp.x >= 0. && coliPosTemp.y >= 0. && coliPosTemp.z >= 0. && 
    //    coliPosTemp.x <= 1. && coliPosTemp.y <= 1. && coliPosTemp.z <= 1.)
    // {
    //   coliPos[count] = coliPosTemp;
    //   // outColor = vec4(coliPosTemp.y, 0, 0, 1.0);
    //   count++;
    // }
  }
  
  vec3 plane2Center = center + u_planeNormal2 * 0.5;
  isColi = getCollisionPosition(plane2Center, u_planeNormal2, coliPosTemp);
  if(isColi == true)
  {
    // coliPosTemp = (u_VCMC * vec4(coliPosTemp, 1.0)).xyz;
     coliPosTemp = vec3(dot(u_planeNormal1, coliPosTemp),
                       dot(u_planeNormal3, coliPosTemp),
                       dot(u_planeNormal5, coliPosTemp));
    // coliPosTemp = vec3(dot(u_planeNormal0, coliPosTemp),
    //                    dot(u_planeNormal2, coliPosTemp),
    //                    dot(u_planeNormal4, coliPosTemp));
    if(coliPosTemp.x >= 0. && coliPosTemp.z >= 0. && 
    coliPosTemp.x <= 1. && coliPosTemp.z <= 1.)
    {
      coliPos[count] = coliPosTemp;
      // outColor = vec4(coliPosTemp.y, 0, 0, 1.0);
      count++;
    }
    // if(coliPosTemp.x >= 0. && coliPosTemp.y >= 0. && coliPosTemp.z >= 0. && 
    //    coliPosTemp.x <= 1. && coliPosTemp.y <= 1. && coliPosTemp.z <= 1.)
    // {
    //   coliPos[count] = coliPosTemp;
    //   // outColor = vec4(coliPosTemp.y, 0, 0, 1.0);
    //   count++;
    // }
  }

  vec3 plane3Center = center + u_planeNormal3 * 0.5;
  isColi = getCollisionPosition(plane3Center, u_planeNormal3, coliPosTemp);
  if(isColi == true)
  {
    // coliPosTemp = (u_VCMC * vec4(coliPosTemp, 1.0)).xyz;
     coliPosTemp = vec3(dot(u_planeNormal1, coliPosTemp),
                       dot(u_planeNormal3, coliPosTemp),
                       dot(u_planeNormal5, coliPosTemp));
    // coliPosTemp = vec3(dot(u_planeNormal0, coliPosTemp),
    //                    dot(u_planeNormal2, coliPosTemp),
    //                    dot(u_planeNormal4, coliPosTemp));

    if(coliPosTemp.x >= 0. && coliPosTemp.z >= 0. && 
    coliPosTemp.x <= 1. && coliPosTemp.z <= 1.)
    {
      coliPos[count] = coliPosTemp;
      // outColor = vec4(coliPosTemp.y, 0, 0, 1.0);
      count++;
    }
    // if(coliPosTemp.x >= 0. && coliPosTemp.y >= 0. && coliPosTemp.z >= 0. && 
    //    coliPosTemp.x <= 1. && coliPosTemp.y <= 1. && coliPosTemp.z <= 1.)
    // {
    //   coliPos[count] = coliPosTemp;
    //   // outColor = vec4(coliPosTemp.y, 0, 0, 1.0);
    //   count++;
    // }
  }

  vec3 plane4Center = center + u_planeNormal4 * 0.5;
  isColi = getCollisionPosition(plane4Center, u_planeNormal4, coliPosTemp);
  if(isColi == true)
  {
    // coliPosTemp = (u_VCMC * vec4(coliPosTemp, 1.0)).xyz;
     coliPosTemp = vec3(dot(u_planeNormal1, coliPosTemp),
                       dot(u_planeNormal3, coliPosTemp),
                       dot(u_planeNormal5, coliPosTemp));
    // coliPosTemp = vec3(dot(u_planeNormal0, coliPosTemp),
    //                    dot(u_planeNormal2, coliPosTemp),
    //                    dot(u_planeNormal4, coliPosTemp));
    if(coliPosTemp.x >= 0. && coliPosTemp.y >= 0. && 
    coliPosTemp.x <= 1. && coliPosTemp.y <= 1.)
    {
      coliPos[count] = coliPosTemp;
      // outColor = vec4(1, 0, 0, 1.0);
      count++;
    }
    else
    {      
      // outColor = vec4(0, 1, 0, 1.0);
    }
    // if(coliPosTemp.x >= 0. && coliPosTemp.y >= 0. && coliPosTemp.z >= 0. && 
    //    coliPosTemp.x <= 1. && coliPosTemp.y <= 1. && coliPosTemp.z <= 1.)
    // {
    //   coliPos[count] = coliPosTemp;
    //   outColor = vec4(coliPosTemp.y, 0, 0, 1.0);
    //   count++;
    // }
    // else
    // {      
    //   outColor = vec4(0, 1, 0, 1.0);
    // }
  }

  vec3 plane5Center = center + u_planeNormal5 * 0.5;
  isColi = getCollisionPosition(plane5Center, u_planeNormal5, coliPosTemp);
  if(isColi == true)
  {
      // outColor = vec4(coliPosTemp.y, 0, 0, 1.0);
    // coliPosTemp = (u_VCMC * vec4(coliPosTemp, 1.0)).xyz;
     coliPosTemp = vec3(dot(u_planeNormal1, coliPosTemp),
                       dot(u_planeNormal3, coliPosTemp),
                       dot(u_planeNormal5, coliPosTemp));
    // coliPosTemp = vec3(dot(u_planeNormal0, coliPosTemp),
    //                    dot(u_planeNormal2, coliPosTemp),
    //                    dot(u_planeNormal4, coliPosTemp));
    if(coliPosTemp.x >= 0. && coliPosTemp.y >= 0. && 
    coliPosTemp.x <= 1. && coliPosTemp.y <= 1.)
    {
      coliPos[count] = coliPosTemp;
      // outColor = vec4(1, 0, 0, 1.0);
      count++;
    }
    else
    {      
      // outColor = vec4(0, 1, 0, 1.0);
    }
    // if(coliPosTemp.x >= 0. && coliPosTemp.y >= 0. && coliPosTemp.z >= 0. && 
    //    coliPosTemp.x <= 1. && coliPosTemp.y <= 1. && coliPosTemp.z <= 1.)
    // {
    //   coliPos[count] = coliPosTemp;
    //   // outColor = vec4(coliPosTemp.y, 0, 0, 1.0);
    //   count++;
    // }
    // else
    // {      
    //   // outColor = vec4(0, coliPosTemp.y, 0, 1.0);
    // }
  }

  if(count == 2)
  {
    StartPos = coliPos[0];
    EndPos = coliPos[1];
  }  

  // if(count == 0)
  // {
  //   outColor = vec4(0, 1, 0, 1);
  // }
  // if(count == 1)
  // {
  //   outColor = vec4(1, 1, 0, 1);
  // }
  // if(count == 2)
  // {
  //   outColor = vec4(1, 0, 0, 1);
  // }
  // if(count == 3)
  // {
  //   outColor = vec4(0, 0, 1, 1);
  // }
  // if(count == 4)
  // {
  //   outColor = vec4(1, 0, 1, 1);
  // }

  return true;
}

void main() {

  vec3 StartPos;
  vec3 EndPos;
  getRayPosition(StartPos,  EndPos);
  vec3 delta = EndPos - StartPos;
  // float resolutionf = length(delta) * 1000.0;
  float resolutionf = 100.0;
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
  }
  sum /= float(count);
  outColor = vec4(sum.rgb, 1.0);
}