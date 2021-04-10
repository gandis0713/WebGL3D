#version 300 es

precision mediump float;

uniform mat4 uWCVC;
uniform mat4 uVCWC;

out vec4 outColor;
in vec3 outVertexPosition;
in vec3 outVertexNormal;

uniform vec3 uColor;
uniform vec3 uAmbient;
uniform vec3 uDiffuse;
uniform vec3 uSpecular;

uniform vec3 uLightColor;
uniform vec3 uLightPosition;

uniform vec3 uCamPosition;

uniform samplerCube uTexture;

void main() {
  float ratio = 1.00 / 1.52;
  vec3 camPosition = vec4(uWCVC * vec4(uCamPosition, 1.0)).xyz;
   vec3 I = normalize(outVertexPosition - camPosition); 
  vec3 cubeNormal = vec4(uVCWC * vec4(outVertexNormal, 0.0)).xyz;
  vec3 R = refract(I, normalize(cubeNormal), ratio); 
  outColor = vec4(texture(uTexture, R).rgb, 1.0);


  // vec3 normalizedVertexNormal = normalize(outVertexNormal);

  // // caculate total color
  // vec3 cubeNormal = vec4(uVCWC * vec4(normalizedVertexNormal, 0.0)).xyz;
  // outColor = texture(uTexture, cubeNormal);
}