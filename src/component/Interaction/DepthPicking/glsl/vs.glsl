precision mediump float;

attribute vec3 a_vObjectPosition;

uniform mat4 u_mWCPC;

void main()
{
  vec4 vObjectPositionPC = u_mWCPC * vec4(a_vObjectPosition, 1.0);
  gl_Position = vObjectPositionPC;
}