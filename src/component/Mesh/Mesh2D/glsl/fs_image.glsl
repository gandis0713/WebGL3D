#version 300 es

precision mediump float;

out vec4 outColor;
in vec2 fs_textureCoords;

uniform highp mat4 u_MCPC;

uniform sampler2D u_texture;
uniform float u_width;
uniform float u_height;

void main() {

  bool isEdge = false;

  vec4 color = texture(u_texture, fs_textureCoords);
  if(color.x != 0. || color.y != 0. || color.z != 0.) {
    for(int i = -1; i <= 1; i++)
    {
      for(int j = -1; j <= 1; j++)
      {
        if(i == 0 && j == 0){
          continue;
        }

        float x = (gl_FragCoord.x + float(i)) / u_width;
        float y = 1.0 - (gl_FragCoord.y + float(j)) / u_height;
        vec4 coord = vec4(x, y, 0, 1);
        color = texture(u_texture, coord.xy);
        if(color.x == 0. && color.y == 0. && color.z == 0.) {
          isEdge = true;
          break;
        }
      }
    }

    if(isEdge == false) {
      discard;
    }
  }
  
  outColor = texture(u_texture, fs_textureCoords);
}