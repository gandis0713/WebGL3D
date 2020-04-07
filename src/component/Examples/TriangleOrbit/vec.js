export const vec3 = {
  normalize: function(x, y, z) {
    const normalizeFactor = 1.0 / Math.sqrt(x * x + y * y + z * z);

    x *= normalizeFactor;
    y *= normalizeFactor;
    z *= normalizeFactor;

    return [x, y, z];
  },

  cross: function(src, dst) {
    return [src[1] * dst[2] - src[2] * dst[1], 
            src[2] * dst[0] - src[0] * dst[2],
            src[0] * dst[1] - src[1] * dst[0]];
  },

  dot: function(src, dst) {
    return src[0] * dst[0] + src[1] * dst[1] + src[2] * dst[2];
  }
}

export const vec2 = {
  normalize: function(x, y) {
    const normalizeFactor = 1.0 / Math.sqrt(x * x + y * y);

    x *= normalizeFactor;
    y *= normalizeFactor;

    return [x, y];
  }
}