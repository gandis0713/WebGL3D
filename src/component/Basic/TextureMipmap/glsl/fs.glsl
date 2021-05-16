// #version 300 es

// precision mediump float;

// in vec2 fs_textCoord;

// out vec4 outColor;

// uniform sampler2D u_texture;

// void main() {

//   outColor = texture(u_texture, fs_textCoord);
// }

#define SUB_TEXTURE_SIZE 512.0
#define SUB_TEXTURE_MIPCOUNT 10


#extension GL_EXT_shader_texture_lod : enable
#extension GL_OES_standard_derivatives : enable

precision mediump float;

varying vec2 fs_textCoord;

uniform sampler2D u_texture;

float MipLevel(vec2 uv)
{
    vec2 dx = dFdx( uv * SUB_TEXTURE_SIZE );
    vec2 dy = dFdy( uv * SUB_TEXTURE_SIZE );
    float d = max( dot( dx, dx ), dot( dy, dy ) );
 
    // Clamp the value to the max mip level counts
    const float rangeClamp = pow(2.0, float((SUB_TEXTURE_MIPCOUNT - 1) * 2));
    d = clamp(d, 1.0, rangeClamp);
 
    float mipLevel = 0.5 * log2(d);
    mipLevel = floor(mipLevel);
 
    return mipLevel;
}

void main() {
  gl_FragColor = texture2DLodEXT(u_texture, fs_textCoord, MipLevel(fs_textCoord));
  gl_FragColor = texture2D(u_texture, fs_textCoord);
}