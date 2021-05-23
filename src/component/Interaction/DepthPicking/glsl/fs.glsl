precision highp float;

uniform float u_fNear;
uniform float u_fFar;

uniform mat4 u_mPCVC;
uniform mat4 u_mVCWC;

uniform vec4 u_vViewport;
varying float v_fDepth;
varying vec4 v_vPosition;

vec3 PackDepth24( in float depth )
{
    float depthVal = depth * (256.0*256.0*256.0 - 1.0) / (256.0*256.0*256.0);
    vec4 encode = fract( depthVal * vec4(1.0, 256.0, 256.0*256.0, 256.0*256.0*256.0) );
    return encode.xyz - encode.yzw / 256.0 + 1.0/512.0;
}

float UnpackDepth24( in vec3 pack )
{
  float depth = dot( pack, 1.0 / vec3(1.0, 256.0, 256.0*256.0) );
  return depth * (256.0*256.0*256.0) / (256.0*256.0*256.0 - 1.0);
}

vec4 PackDepth32( in float depth )
{
    depth *= (256.0*256.0*256.0 - 1.0) / (256.0*256.0*256.0);
    vec4 encode = fract( depth * vec4(1.0, 256.0, 256.0*256.0, 256.0*256.0*256.0) );
    return vec4( encode.xyz - encode.yzw / 256.0, encode.w ) + 1.0/512.0;
}

float UnpackDepth32( in vec4 pack )
{
    float depth = dot( pack, 1.0 / vec4(1.0, 256.0, 256.0*256.0, 256.0*256.0*256.0) );
    return depth * (256.0*256.0*256.0) / (256.0*256.0*256.0 - 1.0);
}

float getMod(float a, float b) {
  return a - (b * floor(a/b));
}

void main() {
  // depth in depth range.
  float depth = (v_vPosition.z + 1.0) / 2.0;
  // float depth16 = floor(depth * 65535.0 + 0.1);
  // float depth16 = floor(gl_FragCoord.z * 65535.0 + 0.1);
  // float depthR = floor(depth16 / 256.0) / 255.0;
  // float depthG = mod(depth16, 256.0) / 255.0;
  // gl_FragColor = vec4(depthR, depthG, 0.0, 1.0); // 16 bit range

  gl_FragColor = PackDepth32(depth);

}