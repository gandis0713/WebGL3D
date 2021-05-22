#version 300 es

precision mediump float;

uniform mat4 uWCVC;

out vec4 outColor;

uniform float uNear;
uniform float uFar;

uniform mat4 uPCVC;
uniform mat4 uVCWC;

uniform vec4 uViewport;

void main() {

  float ndcZ = gl_FragCoord.z * 2.0 - 1.0;
  float ndcX = (gl_FragCoord.x - uViewport[0] - uViewport[2] / 2.0) * 2.0 / uViewport[2];
  float ndcY = (gl_FragCoord.y - uViewport[1] - uViewport[3] / 2.0) * 2.0 / uViewport[3];

  vec3 ndc = vec3(ndcX, ndcY, ndcZ);
  vec4 clip = uPCVC * vec4(ndc, 1.0);
  vec4 eye = clip.xyzw / clip.w;
  vec4 world = uVCWC * eye;
  float linearDepth = (2.0 * uNear * uFar) / (uFar + uNear - ndcZ * (uFar - uNear));
  outColor = vec4((-eye.z - uNear)/ (uFar - uNear), 0, 0,  1);  // using matrix
  // outColor = vec4((linearDepth - uNear)/ (uFar - uNear), 0, 0,  1); // using near, far.
  // outColor = vec4(gl_FragCoord.z, 0.0, 0.0, 1.0); // using depth range
}