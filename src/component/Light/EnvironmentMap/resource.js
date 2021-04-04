const skyBoxSize = 1.0;

// prettier-ignore
export const skyBoxVertex = [
  -skyBoxSize,  skyBoxSize, -skyBoxSize,
  -skyBoxSize, -skyBoxSize, -skyBoxSize,
   skyBoxSize, -skyBoxSize, -skyBoxSize,
   skyBoxSize, -skyBoxSize, -skyBoxSize,
   skyBoxSize,  skyBoxSize, -skyBoxSize,
  -skyBoxSize,  skyBoxSize, -skyBoxSize,

  -skyBoxSize, -skyBoxSize,  skyBoxSize,
  -skyBoxSize, -skyBoxSize, -skyBoxSize,
  -skyBoxSize,  skyBoxSize, -skyBoxSize,
  -skyBoxSize,  skyBoxSize, -skyBoxSize,
  -skyBoxSize,  skyBoxSize,  skyBoxSize,
  -skyBoxSize, -skyBoxSize,  skyBoxSize,

   skyBoxSize, -skyBoxSize, -skyBoxSize,
   skyBoxSize, -skyBoxSize,  skyBoxSize,
   skyBoxSize,  skyBoxSize,  skyBoxSize,
   skyBoxSize,  skyBoxSize,  skyBoxSize,
   skyBoxSize,  skyBoxSize, -skyBoxSize,
   skyBoxSize, -skyBoxSize, -skyBoxSize,

  -skyBoxSize, -skyBoxSize,  skyBoxSize,
  -skyBoxSize,  skyBoxSize,  skyBoxSize,
   skyBoxSize,  skyBoxSize,  skyBoxSize,
   skyBoxSize,  skyBoxSize,  skyBoxSize,
   skyBoxSize, -skyBoxSize,  skyBoxSize,
  -skyBoxSize, -skyBoxSize,  skyBoxSize,

  -skyBoxSize,  skyBoxSize, -skyBoxSize,
   skyBoxSize,  skyBoxSize, -skyBoxSize,
   skyBoxSize,  skyBoxSize,  skyBoxSize,
   skyBoxSize,  skyBoxSize,  skyBoxSize,
  -skyBoxSize,  skyBoxSize,  skyBoxSize,
  -skyBoxSize,  skyBoxSize, -skyBoxSize,

  -skyBoxSize, -skyBoxSize, -skyBoxSize,
  -skyBoxSize, -skyBoxSize,  skyBoxSize,
   skyBoxSize, -skyBoxSize, -skyBoxSize,
   skyBoxSize, -skyBoxSize, -skyBoxSize,
  -skyBoxSize, -skyBoxSize,  skyBoxSize,
   skyBoxSize, -skyBoxSize,  skyBoxSize

  ];

const z = 0.99;
// prettier-ignore
export const backgroundVertex = new Float32Array(
  [
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1,
  ]);

// prettier-ignore
export const normals = [
  0, 0, -1,
  0, 0, -1,
  0, 0, -1,
  0, 0, -1,
  0, 0, -1,
  0, 0, -1,
  
  0, 0, 1,
  0, 0, 1,
  0, 0, 1,
  0, 0, 1,
  0, 0, 1,
  0, 0, 1,

  0, 1, 0,
  0, 1, 0,
  0, 1, 0,
  0, 1, 0,
  0, 1, 0,
  0, 1, 0,

  0, -1, 0,
  0, -1, 0,
  0, -1, 0,
  0, -1, 0,
  0, -1, 0,
  0, -1, 0,

  -1, 0, 0,
  -1, 0, 0,
  -1, 0, 0,
  -1, 0, 0,
  -1, 0, 0,
  -1, 0, 0,
  
  1, 0, 0,
  1, 0, 0,
  1, 0, 0,
  1, 0, 0,
  1, 0, 0,
  1, 0, 0,
];
