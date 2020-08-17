#version 300 es

precision mediump float;

in vec3 fs_vertexVC;

out vec4 outColor;

uniform highp sampler3D u_volume;
uniform highp sampler2D u_color;
uniform highp sampler2D u_jitter;
uniform vec3 u_Dim;
uniform vec3 u_Extent;
uniform vec3 u_BoundsMin;
uniform vec3 u_BoundsMax;
uniform vec3 u_Spacing;
uniform float u_width;
uniform float u_height;
uniform float u_depth;
uniform highp vec2 u_boxX;
uniform highp vec2 u_boxY;
uniform highp vec2 u_boxZ;
uniform float u_isoMinValue;
uniform float u_isoMaxValue;

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
uniform vec3 u_origin;
uniform vec3 u_Center;

uniform highp mat4 u_MCVC;
uniform highp mat4 u_VCMC;
uniform highp mat4 u_PCVC;

uniform int u_mode;

vec4 getTextureValue(vec3 coord)
{
  return texture(u_volume, coord);
}

vec4 getIsoSurface(vec3 coord)
{
  vec4 color = texture(u_volume, coord);
  if(color.r >= u_isoMinValue && color.r <= u_isoMaxValue)
  {
    return vec4(color);
  }

  return vec4(-1, -1, -1, -1);
}

bool getCollisionPosition(vec3 planePos, vec3 planeNor, out vec3 pos)
{
  vec3 startZ = (u_PCVC * vec4(0, 0, u_boxZ[1], 1)).xyz;
  vec3 endZ = (u_PCVC * vec4(0, 0, u_boxZ[0], 1)).xyz;
  vec3 near = fs_vertexVC + startZ;
  vec3 far = fs_vertexVC + endZ;

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
  vec3 coliPosTemp[6];
  bool isColi = false;
  int count = 0;
  vec3 coliPos[2];

  vec3 plane0Center = u_Center + u_planeNormal0 * u_planeDist0;
  isColi = getCollisionPosition(plane0Center, u_planeNormal0, coliPosTemp[count]);
  if(isColi == true)
  {
    vec3 indexPos = vec3(dot(coliPosTemp[count], u_planeNormal1),
                       dot(coliPosTemp[count], u_planeNormal3),
                       dot(coliPosTemp[count], u_planeNormal5));
    indexPos -= u_origin;
    if(indexPos.y >= u_BoundsMin[1] && indexPos.z >= u_BoundsMin[2] && 
    indexPos.y <= u_BoundsMax[1] && indexPos.z <= u_BoundsMax[2] )
    {
      coliPos[count] = indexPos;
      count++;
    }
  }

  vec3 plane1Center = u_Center + u_planeNormal1 * u_planeDist1;
  isColi = getCollisionPosition(plane1Center, u_planeNormal1, coliPosTemp[count]);
  if(isColi == true)
  {
    vec3 indexPos = vec3(dot(coliPosTemp[count], u_planeNormal1),
                       dot(coliPosTemp[count], u_planeNormal3),
                       dot(coliPosTemp[count], u_planeNormal5));
    indexPos -= u_origin;
    if(indexPos.y >= u_BoundsMin[1] && indexPos.z >= u_BoundsMin[2] && 
    indexPos.y <= u_BoundsMax[1] && indexPos.z <= u_BoundsMax[2] )
    {
      coliPos[count] = indexPos;
      count++;
    }
  }
  
  vec3 plane2Center = u_Center + u_planeNormal2 * u_planeDist2;
  isColi = getCollisionPosition(plane2Center, u_planeNormal2, coliPosTemp[count]);
  if(isColi == true)
  {
    vec3 indexPos = vec3(dot(coliPosTemp[count], u_planeNormal1),
                       dot(coliPosTemp[count], u_planeNormal3),
                       dot(coliPosTemp[count], u_planeNormal5));
    indexPos -= u_origin;
    if(indexPos.x >= u_BoundsMin[0] && indexPos.z >= u_BoundsMin[2] && 
    indexPos.x <= u_BoundsMax[0] && indexPos.z <= u_BoundsMax[2] )
    {
      coliPos[count] = indexPos;
      count++;
    }
  }

  vec3 plane3Center = u_Center + u_planeNormal3 * u_planeDist3;
  isColi = getCollisionPosition(plane3Center, u_planeNormal3, coliPosTemp[count]);
  if(isColi == true)
  {
    vec3 indexPos = vec3(dot(coliPosTemp[count], u_planeNormal1),
                       dot(coliPosTemp[count], u_planeNormal3),
                       dot(coliPosTemp[count], u_planeNormal5));
    indexPos -= u_origin;
    if(indexPos.x >= u_BoundsMin[0] && indexPos.z >= u_BoundsMin[2] && 
    indexPos.x <= u_BoundsMax[0] && indexPos.z <= u_BoundsMax[2] )
    {
      coliPos[count] = indexPos;
      count++;
    }
  }

  vec3 plane4Center = u_Center + u_planeNormal4 * u_planeDist4;
  isColi = getCollisionPosition(plane4Center, u_planeNormal4, coliPosTemp[count]);
  if(isColi == true)
  {
    vec3 indexPos = vec3(dot(coliPosTemp[count], u_planeNormal1),
                       dot(coliPosTemp[count], u_planeNormal3),
                       dot(coliPosTemp[count], u_planeNormal5));
    indexPos -= u_origin;
    if(indexPos.x >= u_BoundsMin[0] && indexPos.y >= u_BoundsMin[1] && 
    indexPos.x <= u_BoundsMax[0] && indexPos.y <= u_BoundsMax[1] )
    {
      coliPos[count] = indexPos;
      count++;
    }
  }

  vec3 plane5Center = u_Center + u_planeNormal5 * u_planeDist5;
  isColi = getCollisionPosition(plane5Center, u_planeNormal5, coliPosTemp[count]);
  if(isColi == true)
  {
    vec3 indexPos = vec3(dot(coliPosTemp[count], u_planeNormal1),
                       dot(coliPosTemp[count], u_planeNormal3),
                       dot(coliPosTemp[count], u_planeNormal5));
    indexPos -= u_origin;
    if(indexPos.x >= u_BoundsMin[0] && indexPos.y >= u_BoundsMin[1] && 
    indexPos.x <= u_BoundsMax[0] && indexPos.y <= u_BoundsMax[1] )
    {
      coliPos[count] = indexPos;
      count++;
    }
  }

  if(count == 2)
  {
    if(coliPosTemp[0].z > coliPosTemp[1].z)
    {
      StartPos = coliPos[0];
      EndPos = coliPos[1];
    }
    else
    {
      StartPos = coliPos[1];
      EndPos = coliPos[0];
    }
    return true;
  }
  else if(count == 1 || count == 3)
  {
    vec3 startZ = (u_PCVC * vec4(0, 0, u_boxZ[1], 1)).xyz;
    vec3 endZ = (u_PCVC * vec4(0, 0, u_boxZ[0], 1)).xyz;
    StartPos = fs_vertexVC + startZ;  
    StartPos -= u_origin;
    StartPos = vec3(dot(u_planeNormal1, StartPos),
                    dot(u_planeNormal3, StartPos),
                    dot(u_planeNormal5, StartPos));

    EndPos = fs_vertexVC + endZ;  
    EndPos -= u_origin;
    EndPos = vec3(dot(u_planeNormal1, EndPos),
                  dot(u_planeNormal3, EndPos),
                  dot(u_planeNormal5, EndPos));
    return true;
  }

  return false;

}

void applyLight(float value, vec3 StartPos, vec3 steps, out vec4 color)
{
    vec4 result;
    result.x = getTextureValue(StartPos + vec3(steps.x, 0.0, 0.0)).r - value;
    result.y = getTextureValue(StartPos + vec3(0.0, steps.y, 0.0)).r - value;
    result.z = getTextureValue(StartPos + vec3(0.0, 0.0, steps.z)).r - value;

    result.xyz /= 0.01;

    result.w = length(result.xyz);

    result.xyz =
      result.x * u_planeNormal1 +
      result.y * u_planeNormal3 +
      result.z * u_planeNormal5;

    if (result.w > 0.0)
    {
      result.xyz /= result.w;
    }

    float vDiffuse = 0.7;
    float vAmbient = 0.2;
    float vSpecular = 0.1;
    float vSpecularPower = 0.1;
    vec3 lightColor = vec3(1,1,1);
    vec3 lightDir = vec3(1, 0.5, 0.5);
    vec3 diffuse = vec3(0.0, 0.0, 0.0);
    vec3 specular = vec3(0.0, 0.0, 0.0);
    float df = abs(dot(result.rgb, -lightDir));
    diffuse += (df * lightColor);
    vec3 halfAngle = vec3(0,0, 0.5); // TODO calculate
    float sf = pow( abs(dot(halfAngle, result.rgb)), vSpecularPower);
    specular += (sf * lightColor);
    color.rgb = color.rgb*(diffuse*vDiffuse + vAmbient) + specular*vSpecular;
    
}

void main() {

  vec3 StartPos;
  vec3 EndPos;
  bool inVolume = getRayPosition(StartPos,  EndPos);
  if(inVolume == false)
  {
    // return;
    discard;
  }

  vec3 deltaM = EndPos - StartPos;
  EndPos = EndPos * vec3(1.0 / u_BoundsMax[0] - u_BoundsMin[0],
    1.0 / u_BoundsMax[1] - u_BoundsMin[1],
    1.0 / u_BoundsMax[2] - u_BoundsMin[2]);
  StartPos = StartPos * vec3(1.0 / u_BoundsMax[0] - u_BoundsMin[0],
    1.0 / u_BoundsMax[1] - u_BoundsMin[1],
    1.0 / u_BoundsMax[2] - u_BoundsMin[2]);
  vec3 deltaI = EndPos - StartPos;

  vec3 rayDir = EndPos - StartPos;
  float rayLength = length(deltaM / deltaI);
  float countf = rayLength;
  vec3 steps = rayDir / countf;
  highp int count = int(countf);
  vec4 sum = vec4(0.);

  // apply jittering.
  vec2 coordf = gl_FragCoord.xy / 32.0;
  vec2 coord = vec2(int(coordf.x), int(coordf.y));
  float jitter = texture(u_jitter, coordf - coord).r;
  StartPos += (steps * jitter);
  

  if(u_mode == 0) {
    // Average Intensity.

    for(int i = 0; i < count; i++)
    {
      float value = getTextureValue(StartPos).r;
      vec4 color = texture(u_color, vec2(value, 0.5));

      // applyLight(value, StartPos, steps, color);

      // color C = A Ci (1 - A) + C sum 
      sum += vec4(color.rgb*color.a, color.a)*(1.0 - sum.a);
      
      if(sum.a >= 1.0)
      {
        break;
      }
      StartPos += steps;
    }
  }
  else if(u_mode == 1) {
    // MAX Intensity.

    float maxValue = 0.0;
    for(int i = 0; i < count; i++)
    {
      float value = getTextureValue(StartPos).r;
      maxValue = max(maxValue, value);
      if(maxValue >= 1.0)
      {
        break;
      }
      StartPos += steps;
    }
    
    sum = vec4(maxValue, maxValue, maxValue, 1.0);
  }
  else if(u_mode == 2) {
    // Iso surface.

    for(int i = 0; i < count; i++)
    {
      vec4 color = getIsoSurface(StartPos);
      if(color.a > 0.0)
      {
        sum = vec4(color.r, color.r, color.r, color.r);
        applyLight(color.r, StartPos, steps, sum);
        break;
      }

      StartPos += steps;
    }
  }
  
  outColor = vec4(sum.rgb, 1.0);
}