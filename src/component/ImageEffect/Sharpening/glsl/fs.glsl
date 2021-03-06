#version 300 es

precision mediump float;

in vec2 fs_textCoord;

out vec4 outColor;

uniform sampler2D u_texture;
uniform vec2 u_mousePosition;
uniform vec2 u_mousePositionTC;
uniform mat3 u_SharpenMat3;
uniform highp mat4 u_MCPC;


void main() {

  float width = 5.0;
  if(u_mousePosition.x - width > gl_FragCoord.x) // draw image with sharpen effect.
  {
    outColor = vec4(0, 0, 0, 0);
    for(int i = -1; i <= 1; i++)
    {
      for(int j = 1; j <= 3; j++) // due to shift +Y axis litle bit. need to be check.
      {
        float x = (gl_FragCoord.x + float(i)) / 2.0;
        float y = 1.0 - (gl_FragCoord.y + float(j)) / 2.0;
        vec4 coord = u_MCPC * vec4(x, y, 0, 1);
        outColor += texture(u_texture, coord.xy) * u_SharpenMat3[i + 1][j - 1];
      }
    }
  }
  else if(u_mousePosition.x + width >= gl_FragCoord.x && u_mousePosition.x - width <= gl_FragCoord.x) // draw vertical line.
  {
    vec4 color = texture(u_texture, fs_textCoord);
    outColor.r = clamp(color.r * 0.5, 0., 1.);
    outColor.g = clamp(color.g * 0.5, 0., 1.);
    outColor.b = clamp(color.b * 0.5, 0., 1.);
    outColor.a = clamp(color.a * 1.0, 0., 1.);
  }
  else
  {
    outColor = texture(u_texture, fs_textCoord); // draw original image.
  }
}