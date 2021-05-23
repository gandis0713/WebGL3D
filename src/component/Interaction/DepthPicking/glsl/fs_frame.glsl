precision mediump float;

uniform sampler2D u_Texture;

varying vec2 v_vTexCoord;

void main() {
  gl_FragColor = texture2D(u_Texture, v_vTexCoord);
  // gl_FragColor = vec4(v_vTexCoord.x, 0.0, 0.0, 1.0);
}