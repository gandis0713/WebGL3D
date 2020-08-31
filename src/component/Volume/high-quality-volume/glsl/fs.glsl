#version 300 es

precision mediump float;

in vec3 fs_vertexVC;

out vec4 outColor;

uniform highp sampler3D u_volume;
uniform highp sampler2D u_color;
uniform highp sampler2D u_jitter;
uniform vec3 u_Dim;
uniform vec3 u_viewDir;
uniform vec3 u_Extent;
uniform vec3 u_BoundsMin;
uniform vec3 u_BoundsMax;
uniform vec3 u_Spacing;
uniform float u_width;
uniform float u_height;
uniform float u_depth;
uniform highp vec2 u_boxVCX;
uniform highp vec2 u_boxVCY;
uniform highp vec2 u_boxVCZ;
uniform float u_isoMinValue;
uniform float u_isoMaxValue;

uniform vec3 u_planeNormalVC0;
uniform vec3 u_planeNormalVC1;
uniform vec3 u_planeNormalVC2;
uniform vec3 u_planeNormalVC3;
uniform vec3 u_planeNormalVC4;
uniform vec3 u_planeNormalVC5;
uniform float u_planeDist0;
uniform float u_planeDist1;
uniform float u_planeDist2;
uniform float u_planeDist3;
uniform float u_planeDist4;
uniform float u_planeDist5;
uniform vec3 u_originWC;
uniform vec3 u_centerWC;

uniform highp mat4 u_MCVC;
uniform highp mat4 u_VCMC;
uniform highp mat4 u_PCVC;

uniform int u_mode;

vec4 getScalarValue(vec3 coord)
{
  return texture(u_volume, coord);
}

vec4 getColorValue(vec2 coord)
{
  return texture(u_color, coord);
}

vec4 getJitterValue(vec2 coord)
{
  return texture(u_jitter, coord);
}

vec4 getIsoSurface(vec3 coord)
{
  vec4 scalar = getScalarValue(coord);
  if(scalar.r >= u_isoMinValue && scalar.r <= u_isoMaxValue)
  {
    return vec4(scalar);
  }

  return vec4(-1, -1, -1, -1);
}

bool getCollisionPosition(vec3 planePosVC, vec3 planeNor, out vec3 posVC)
{
  vec3 startVC = vec3(0, 0, u_boxVCZ[1]);
  vec3 endVC = vec3(0, 0, u_boxVCZ[0]);
  vec3 nearVC = fs_vertexVC + startVC;
  vec3 farVC = fs_vertexVC + endVC;

  float A = dot(planeNor, (planePosVC - nearVC));
  float B = dot(planeNor, (farVC - nearVC));

  if(B == 0.)
  {
    posVC = vec3(0, 0, 0);
    return false;
  }

  float u = A / B;
  if(u <= 1. && u >= 0.)
  {
    posVC = nearVC + u * (farVC - nearVC);
    return true;
  }
  else 
  {
    posVC = vec3(0, 0, 0);
    return false;
  }
}

bool getRayPosition(out vec3 StartPosVC, out vec3 EndPosVC) 
{
  vec3 coliPosTempVC[6];
  bool isColi = false;
  int count = 0;
  vec3 coliPosVC[2];

  vec3 plane0CenterVC = u_centerWC + u_planeNormalVC0 * u_planeDist0;
  isColi = getCollisionPosition(plane0CenterVC, u_planeNormalVC0, coliPosTempVC[count]);
  if(isColi == true)
  {
    vec3 indexPos = vec3(dot(coliPosTempVC[count], u_planeNormalVC1),
                         dot(coliPosTempVC[count], u_planeNormalVC3),
                         dot(coliPosTempVC[count], u_planeNormalVC5));
    indexPos -= u_originWC;
    if(indexPos.y >= u_BoundsMin[1] && indexPos.z >= u_BoundsMin[2] && 
    indexPos.y <= u_BoundsMax[1] && indexPos.z <= u_BoundsMax[2] )
    {
      coliPosVC[count] = indexPos;
      count++;
    }
  }

  vec3 plane1CenterVC = u_centerWC + u_planeNormalVC1 * u_planeDist1;
  isColi = getCollisionPosition(plane1CenterVC, u_planeNormalVC1, coliPosTempVC[count]);
  if(isColi == true)
  {
    vec3 indexPos = vec3(dot(coliPosTempVC[count], u_planeNormalVC1),
                         dot(coliPosTempVC[count], u_planeNormalVC3),
                         dot(coliPosTempVC[count], u_planeNormalVC5));
    indexPos -= u_originWC;
    if(indexPos.y >= u_BoundsMin[1] && indexPos.z >= u_BoundsMin[2] && 
    indexPos.y <= u_BoundsMax[1] && indexPos.z <= u_BoundsMax[2] )
    {
      coliPosVC[count] = indexPos;
      count++;
    }
  }
  
  vec3 plane2CenterVC = u_centerWC + u_planeNormalVC2 * u_planeDist2;
  isColi = getCollisionPosition(plane2CenterVC, u_planeNormalVC2, coliPosTempVC[count]);
  if(isColi == true)
  {
    vec3 indexPos = vec3(dot(coliPosTempVC[count], u_planeNormalVC1),
                         dot(coliPosTempVC[count], u_planeNormalVC3),
                         dot(coliPosTempVC[count], u_planeNormalVC5));
    indexPos -= u_originWC;
    if(indexPos.x >= u_BoundsMin[0] && indexPos.z >= u_BoundsMin[2] && 
    indexPos.x <= u_BoundsMax[0] && indexPos.z <= u_BoundsMax[2] )
    {
      coliPosVC[count] = indexPos;
      count++;
    }
  }

  vec3 plane3CenterVC = u_centerWC + u_planeNormalVC3 * u_planeDist3;
  isColi = getCollisionPosition(plane3CenterVC, u_planeNormalVC3, coliPosTempVC[count]);
  if(isColi == true)
  {
    vec3 indexPos = vec3(dot(coliPosTempVC[count], u_planeNormalVC1),
                         dot(coliPosTempVC[count], u_planeNormalVC3),
                         dot(coliPosTempVC[count], u_planeNormalVC5));
    indexPos -= u_originWC;
    if(indexPos.x >= u_BoundsMin[0] && indexPos.z >= u_BoundsMin[2] && 
    indexPos.x <= u_BoundsMax[0] && indexPos.z <= u_BoundsMax[2] )
    {
      coliPosVC[count] = indexPos;
      count++;
    }
  }

  vec3 plane4CenterVC = u_centerWC + u_planeNormalVC4 * u_planeDist4;
  isColi = getCollisionPosition(plane4CenterVC, u_planeNormalVC4, coliPosTempVC[count]);
  if(isColi == true)
  {
    vec3 indexPos = vec3(dot(coliPosTempVC[count], u_planeNormalVC1),
                         dot(coliPosTempVC[count], u_planeNormalVC3),
                         dot(coliPosTempVC[count], u_planeNormalVC5));
    indexPos -= u_originWC;
    if(indexPos.x >= u_BoundsMin[0] && indexPos.y >= u_BoundsMin[1] && 
    indexPos.x <= u_BoundsMax[0] && indexPos.y <= u_BoundsMax[1] )
    {
      coliPosVC[count] = indexPos;
      count++;
    }
  }

  vec3 plane5CenterVC = u_centerWC + u_planeNormalVC5 * u_planeDist5;
  isColi = getCollisionPosition(plane5CenterVC, u_planeNormalVC5, coliPosTempVC[count]);
  if(isColi == true)
  {
    vec3 indexPos = vec3(dot(coliPosTempVC[count], u_planeNormalVC1),
                         dot(coliPosTempVC[count], u_planeNormalVC3),
                         dot(coliPosTempVC[count], u_planeNormalVC5));
    indexPos -= u_originWC;
    if(indexPos.x >= u_BoundsMin[0] && indexPos.y >= u_BoundsMin[1] && 
    indexPos.x <= u_BoundsMax[0] && indexPos.y <= u_BoundsMax[1] )
    {
      coliPosVC[count] = indexPos;
      count++;
    }
  }

  if(count == 2)
  {
    if(coliPosTempVC[0].z > coliPosTempVC[1].z)
    {
      StartPosVC = coliPosVC[0];
      EndPosVC = coliPosVC[1];
    }
    else
    {
      StartPosVC = coliPosVC[1];
      EndPosVC = coliPosVC[0];
    }
    return true;
  }
  else if(count == 1 || count == 3 )
  {
    vec3 startVC = vec3(0, 0, u_boxVCZ[1]);
    vec3 endVC = vec3(0, 0, u_boxVCZ[0]);
    StartPosVC = fs_vertexVC + startVC;  
    StartPosVC -= u_originWC;
    StartPosVC = vec3(dot(u_planeNormalVC1, StartPosVC),
                      dot(u_planeNormalVC3, StartPosVC),
                      dot(u_planeNormalVC5, StartPosVC));

    EndPosVC = fs_vertexVC + endVC;  
    EndPosVC -= u_originWC;
    EndPosVC = vec3(dot(u_planeNormalVC1, EndPosVC),
                    dot(u_planeNormalVC3, EndPosVC),
                    dot(u_planeNormalVC5, EndPosVC));
    return true;
  }

  return false;

}

void applyLight(float scalar, vec3 StartPosVC, vec3 steps, out vec4 color)
{
    vec4 result;
    result.x = getScalarValue(StartPosVC + vec3(steps.x, 0.0, 0.0)).r - scalar;
    result.y = getScalarValue(StartPosVC + vec3(0.0, steps.y, 0.0)).r - scalar;
    result.z = getScalarValue(StartPosVC + vec3(0.0, 0.0, steps.z)).r - scalar;

    result.xyz /= 0.01;

    result.w = length(result.xyz);

    result.xyz =
      result.x * u_planeNormalVC1 +
      result.y * u_planeNormalVC3 +
      result.z * u_planeNormalVC5;

    if (result.w > 0.0)
    {
      result.xyz /= result.w;
    }

    // old version

    // float vDiffuse = 0.7;
    // float vAmbient = 0.2;
    // float vSpecular = 0.1;
    // float vSpecularPower = 10000.1;
    // vec3 lightColor = vec3(1,1,1);
    // vec3 lightDir = vec3(1, 0.5, 0.5);
    // vec3 diffuse = vec3(0.0, 0.0, 0.0);
    // vec3 specular = vec3(0.0, 0.0, 0.0);
    // float df = abs(dot(result.rgb, -lightDir));
    // diffuse += (df * lightColor);
    // vec3 halfAngle = vec3(0,0, 0.5); // TODO calculate
    // float sf = pow( abs(dot(halfAngle, result.rgb)), vSpecularPower);
    // specular += (sf * lightColor);
    // color.rgb = color.rgb*(diffuse*vDiffuse + vAmbient) + specular*vSpecular;

    // new version

    // material properties
    vec3 Ka = vec3(0.3, 0.3, 0.3); // ambient
    vec3 Kd = vec3(0.6, 0.6, 0.6); // diffuse
    vec3 Ks = vec3(0.2, 0.2, 0.2); // specular
    float shininess = 100.0; // shininess
    float lightPower = 1.5;
    // light properties
    vec3 lightColor = vec3(1.0, 1.0, 1.0);
    float ambientLight = 1.0;
    // Calculate halfway vector

    // vec3 viewDir = u_viewDir;
    vec3 viewDir =vec3(0, 0, 1);
    vec3 lightDir = normalize(viewDir);
    vec3 halfwayDir = normalize(lightDir + viewDir);
    // Compute ambient term
    vec3 ambient = Ka * ambientLight * lightPower;
    // Compute the diffuse term
    float diffuseLight = abs(dot(lightDir, result.xyz));
    // float diffuseLight = 1.0;
    vec3 diffuse = Kd * lightColor * diffuseLight * lightPower;
    // Compute the specular term
    float specularLight = pow(abs(dot(halfwayDir, result.xyz)), shininess);
    vec3 specular = Ks * lightColor * specularLight * lightPower;
    // color.rgb = ambient + diffuse + specular;    
    color.rgb = color.rgb*(diffuse + ambient) + specular;
}

void main() {

  vec3 StartPosVC;
  vec3 EndPosVC;
  bool inVolume = getRayPosition(StartPosVC,  EndPosVC);
  if(inVolume == false)
  {
    // return;
    discard;
  }

  vec3 EndPosIdx = EndPosVC * vec3(1.0 / u_BoundsMax[0] - u_BoundsMin[0],
    1.0 / u_BoundsMax[1] - u_BoundsMin[1],
    1.0 / u_BoundsMax[2] - u_BoundsMin[2]);
  vec3 StartPosIdx = StartPosVC * vec3(1.0 / u_BoundsMax[0] - u_BoundsMin[0],
    1.0 / u_BoundsMax[1] - u_BoundsMin[1],
    1.0 / u_BoundsMax[2] - u_BoundsMin[2]);

  vec3 rayDir = normalize(EndPosIdx - StartPosIdx);
  float spacing = u_Spacing[0];
  float lengthVC = length(EndPosVC - StartPosVC);
  float lengthIdx = length(EndPosIdx - StartPosIdx);
  float spacingIdx = spacing * lengthIdx / lengthVC;
  vec3 stepIdx = rayDir * spacingIdx;
  float stepIdxCount = lengthIdx / spacingIdx;
  vec4 sum = vec4(0.);

  // apply jittering.
  vec2 coordf = gl_FragCoord.xy / 32.0;
  vec2 coord = vec2(int(coordf.x), int(coordf.y));
  float jitter = 0.01 + 0.99*getJitterValue((coordf - coord)).r;  
  float stepsIdxTraveled = jitter;
  
// StartPosIdx += (stepIdx * jitter);
  int maxCount = 1000;
  if(u_mode == 0) {
    // Average Intensity.

      // StartPosIdx += (stepIdx * jitter);
    for(int i = 0; i < maxCount; i++)
    {        
      if(stepsIdxTraveled + 1.0 >= stepIdxCount)
      {
        break;
      }
      float scalar = getScalarValue(StartPosIdx).r;
      vec4 color = getColorValue(vec2(scalar, 0.5));

      applyLight(scalar, StartPosIdx, stepIdx, color);

      // color C = A Ci (1 - A) + C sum 
      sum += vec4(color.rgb*color.a, color.a)*(1.0 - sum.a);
      
      if(sum.a >= 1.0)
      {
        break;
      }
      stepsIdxTraveled++;
      // StartPosIdx += (stepIdx * jitter);
      StartPosIdx += (stepIdx);
    }
  }
  else if(u_mode == 1) {
    // MAX Intensity.

    float maxValue = 0.0;
    for(int i = 0; i < maxCount; i++)
    {
      if(stepsIdxTraveled + 1.0 >= stepIdxCount)
      {
        break;
      }
      float scalar = getScalarValue(StartPosIdx).r;
      maxValue = max(maxValue, scalar);
      if(maxValue >= 1.0)
      {
        break;
      }
      stepsIdxTraveled++;
      StartPosIdx += (stepIdx);
    }
    
    sum = vec4(maxValue, maxValue, maxValue, 1.0);
  }
  else if(u_mode == 2) {
    // Iso surface.

    for(int i = 0; i < maxCount; i++)
    {
      if(stepsIdxTraveled + 1.0 >= stepIdxCount)
      {
        break;
      }
      vec4 color = getIsoSurface(StartPosIdx);
      if(color.a > 0.0)
      {
        sum = vec4(color.r, color.r, color.r, color.r);
        applyLight(color.r, StartPosIdx, stepIdx, sum);
        break;
      }

      stepsIdxTraveled++;
      StartPosIdx += (stepIdx);
    }
  }
  
  outColor = vec4(sum.rgb, 1.0);
}