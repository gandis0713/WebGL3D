precision mediump float;

attribute vec3 a_vObjectPosition;
attribute vec2 a_vObjectTexCoord;

uniform mat4 u_mWCPC;

varying vec2 v_vTexCoord;

void main()
{
  vec4 vObjectPositionPC = vec4(a_vObjectPosition, 1.0);
  gl_Position = vObjectPositionPC;
  v_vTexCoord = a_vObjectTexCoord;
}