precision mediump float;

uniform float u_fNear;
uniform float u_fFar;

uniform mat4 u_mPCVC;
uniform mat4 u_mVCWC;

uniform vec4 u_vViewport;

void main() {

  float ndcZ = gl_FragCoord.z * 2.0 - 1.0;
  float ndcX = (gl_FragCoord.x - u_vViewport[0] - u_vViewport[2] / 2.0) * 2.0 / u_vViewport[2];
  float ndcY = (gl_FragCoord.y - u_vViewport[1] - u_vViewport[3] / 2.0) * 2.0 / u_vViewport[3];

  vec3 ndc = vec3(ndcX, ndcY, ndcZ);
  vec4 clip = u_mPCVC * vec4(ndc, 1.0);
  vec4 eye = clip.xyzw / clip.w;
  vec4 world = u_mVCWC * eye;
  float linearDepth = (2.0 * u_fNear * u_fFar) / (u_fFar + u_fNear - ndcZ * (u_fFar - u_fNear));
  gl_FragColor = vec4((-eye.z - u_fNear)/ (u_fFar - u_fNear), 0.0, 0.0,  1.0);  // using matrix
  // gl_FragColor = vec4((linearDepth - u_fNear)/ (u_fFar - u_fNear), 0, 0,  1); // using near, far.
  // gl_FragColor = vec4(gl_FragCoord.z, 0.0, 0.0, 1.0); // using depth range

}