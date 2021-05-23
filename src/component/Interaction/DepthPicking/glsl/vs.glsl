// precision highp float;

attribute vec3 a_vObjectPosition;

uniform mat4 u_mWCPC;

varying float v_fDepth;
varying vec4 v_vPosition;

void main()
{
  v_vPosition = u_mWCPC * vec4(a_vObjectPosition, 1.0);
  gl_Position = v_vPosition;
  v_fDepth = v_vPosition.z / v_vPosition.w;
}