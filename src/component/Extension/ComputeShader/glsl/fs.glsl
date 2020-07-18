#version 300 es

precision mediump float;

in vec2 fs_textCoord;

out vec4 outColor;

uniform sampler2D u_texture;
uniform vec2 u_mousePosition;
uniform vec2 u_mousePositionTC;

void main() {
  float dist = distance(u_mousePosition, gl_FragCoord.xy);
  if(dist < 150.0 && dist > 140.0) 
  {
    vec4 color = texture(u_texture, fs_textCoord);
    outColor.r = clamp(color.r * 0.5, 0., 1.);
    outColor.g = clamp(color.g * 0.5, 0., 1.);
    outColor.b = clamp(color.b * 0.5, 0., 1.);
    outColor.a = clamp(color.a * 1.0, 0., 1.);
  }
  else if(dist <= 140.0)
  {
    vec2 diffTC = (fs_textCoord - u_mousePositionTC) / 3.0;
    outColor = texture(u_texture, u_mousePositionTC + diffTC);
  }
  else
  {    
    outColor = texture(u_texture, fs_textCoord);
  }
}