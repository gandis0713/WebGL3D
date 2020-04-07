export const mat4 = {

  rotation: function(angle, x, y, z) {
    const c = cosf(angle * DEG2RAD);    // cosine
    const s = sinf(angle * DEG2RAD);    // sine
    const c1 = 1.0 - c;                // 1 - c
    const m0 = 1.0,  m4 = 0.0,  m8 = 0.0,  m12= 0.0,
           m1 = 0.0,  m5 = 1.0,  m9 = 0.0,  m13= 0.0,
           m2 = 0.0,  m6 = 0.0,  m10= 1.0, m14= 0.0;

    const r0 = x * x * c1 + c;
    const r1 = x * y * c1 + z * s;
    const r2 = x * z * c1 - y * s;
    const r4 = x * y * c1 - z * s;
    const r5 = y * y * c1 + c;
    const r6 = y * z * c1 + x * s;
    const r8 = x * z * c1 + y * s;
    const r9 = y * z * c1 - x * s;
    const r10= z * z * c1 + c;

    const mat = [];
    mat[0] = r0 * m0 + r4 * m1 + r8 * m2;
    mat[1] = r1 * m0 + r5 * m1 + r9 * m2;
    mat[2] = r2 * m0 + r6 * m1 + r10* m2;
    mat[3] = 0.0;
    mat[4] = r0 * m4 + r4 * m5 + r8 * m6;
    mat[5] = r1 * m4 + r5 * m5 + r9 * m6;
    mat[6] = r2 * m4 + r6 * m5 + r10* m6;
    mat[7] = 0.0;
    mat[8] = r0 * m8 + r4 * m9 + r8 * m10;
    mat[9] = r1 * m8 + r5 * m9 + r9 * m10;
    mat[10]= r2 * m8 + r6 * m9 + r10* m10;
    mat[11]= 0.0;
    mat[12]= r0 * m12+ r4 * m13+ r8 * m14;
    mat[13]= r1 * m12+ r5 * m13+ r9 * m14;
    mat[14]= r2 * m12+ r6 * m13+ r10* m14;
    mat[15]= 1.0;

    return mat;
  },
  rotation: function(rotX, rotY, rotZ) {
    const mat00 = Math.cos(rotZ) * Math.cos(rotY);
    const mat10 = Math.cos(rotZ) * Math.sin(rotY) * Math.sin(rotX) - Math.sin(rotZ) * Math.cos(rotX);
    const mat20 = Math.cos(rotZ) * Math.sin(rotY) * Math.cos(rotX) + Math.sin(rotZ) * Math.sin(rotX);
    const mat01 = Math.sin(rotZ) * Math.cos(rotY);
    const mat11 = Math.sin(rotZ) * Math.sin(rotY) * Math.sin(rotX) + Math.cos(rotZ) * Math.cos(rotX);
    const mat21 = Math.sin(rotZ) * Math.sin(rotY) * Math.cos(rotX) - Math.cos(rotZ) * Math.sin(rotX);
    const mat02 = -Math.sin(rotY);
    const mat12 = Math.cos(rotY) * Math.sin(rotX);
    const mat22 = Math.cos(rotY) * Math.cos(rotX);
  
    return [mat00, mat10, mat20, 0,
            mat01, mat11, mat21, 0,
            mat02, mat12, mat22, 0,
            0, 0, 0, 1];  
  },

  translation: function(tx, ty, tz) {
    return [
       1,  0,  0,  0,
       0,  1,  0,  0,
       0,  0,  1,  0,
       tx, ty, tz, 1,
    ];
  },

  orthographic: function(left, right, top, bottom, near, far) {
    return [
      2 / (right - left), 0, 0, 0,
      0, 2 / (top - bottom), 0, 0,
      0, 0, 2 / (near - far), 0,
 
      (left + right) / (left - right),
      (bottom + top) / (bottom - top),
      (near + far) / (near - far),
      1,
    ];
  },

  multiply: function(a, b) {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  },


}