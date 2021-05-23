precision mediump float;

uniform float u_fNear;
uniform float u_fFar;

uniform mat4 u_mPCVC;
uniform mat4 u_mVCWC;

uniform vec4 u_vViewport;

float getMod(float a, float b) {
  return a - (b * floor(a/b));
}

void main() {
  // depth in depth range.
  float depth16 = floor(gl_FragCoord.z * 65535.0 + 0.1);
  float depthR = floor(depth16 / 256.0) / 255.0;
  float depthG = mod(depth16, 256.0) / 255.0;
  gl_FragColor = vec4(depthR, depthG, 0.0, 1.0); // 16 bit range

  // gl_FragColor = vec4(gl_FragCoord.z, 0.0, 0.0, 1.0); // 8 bit range

  // if(mod(65535.0, 256.0) > 254.0) {
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // 16 bit range
  // }
  // else {
  // gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0); // 16 bit range
  // }

}