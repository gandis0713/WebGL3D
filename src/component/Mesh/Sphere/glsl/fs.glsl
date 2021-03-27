#version 300 es

precision mediump float;

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

void main() {
  // caculate ambient color
  vec3 ambientColor = uLightColor * uAmbient;

  // caculate diffuse color
  vec3 normalizedVertexNormal = normalize(outVertexNormal);
  vec3 normalizedLightDir = normalize(outVertexPosition - uLightPosition);

  float diffuse = max(dot(-normalizedLightDir, normalizedVertexNormal), 0.0);
  vec3 diffuseColor = uLightColor * diffuse;

  // caculate specular color
  vec3 viewDir = normalize(outVertexPosition - uCamPosition);
  vec3 reflectDir = reflect(normalizedLightDir, normalizedVertexNormal);
  float specular = pow(max(dot(-viewDir, reflectDir), 0.0), 32.0);
  vec3 specularColor = uLightColor * specular;

  // caculate total color
  vec3 color = (ambientColor + diffuseColor + specularColor) * uColor;
  outColor = vec4(color, 1);
}