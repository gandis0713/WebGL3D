#version 300 es

precision mediump float;

in vec2 fs_textCoord;

out vec4 outColor;

uniform sampler2D u_texture;
uniform vec2 u_mousePosition;
uniform vec2 u_mousePositionTC;
uniform mat3 u_EdgeMat3;
uniform highp mat4 u_MCPC;


void main() {

  float width = 5.0;
  // sobel ref : https://www.sciencedirect.com/topics/engineering/sobel-operator
  float xDet[9] = float[9](-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -1.0, 0.0, 1.0);
  float yDet[9] = float[9](-1.0, -2.0, -1.0, 0.0, 0.0, 0.0, 1.0, 2.0, 1.0);
  if(u_mousePosition.x - width > gl_FragCoord.x) // draw image with edge effect.
  {
    outColor = vec4(0, 0, 0, 1);
    for(int i = -2; i <= 0; i++)
    {
      for(int j = 1; j <= 3; j++) // due to shift +Y axis litle bit. need to be check.
      {
        float x = (gl_FragCoord.x + float(i)) / 2.0;
        float y = 1.0 - (gl_FragCoord.y + float(j)) / 2.0;
        vec4 coord = u_MCPC * vec4(x, y, 0, 1);
        outColor.rgb += texture(u_texture, coord.xy).rrr * yDet[(i + 2) * 3 + (j - 1)];
        outColor.rgb += texture(u_texture, coord.xy).rrr * xDet[(i + 2) * 3 + (j - 1)];
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