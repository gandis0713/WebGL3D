export const NORMAL_TYPE = {
  vertex: 0,
  face: 1,
};

export default function Sphere() {
  this._sectorCount = 50;
  this._stackCount = 50;
  this._radius = 200;
  this._normalType = NORMAL_TYPE.vertex;
  this._useTexCoords = false;

  this._position = [0, 0, 0];
  this._data = [];
  this._triangleIndices = [];
  this._lineIndices = [];

  this.getData = () => {
    return this._data;
  };

  this.getPosition = () => {
    return this._position;
  };

  this.setPosition = (position) => {
    this._position[0] = position[0];
    this._position[1] = position[1];
    this._position[2] = position[2];
    this._build();
  };

  this.getTriangleIndices = () => {
    return this._triangleIndices;
  };

  this.getLineIndices = () => {
    return this._lineIndices;
  };

  this.isUseTexCoords = () => {
    return this._useTexCoords;
  };

  this.setRadius = (radius) => {
    this._radius = radius;
    this._build();
  };

  this.setStackCount = (stackCount) => {
    this._stackCount = stackCount;
    this._build();
  };

  this.setSectorCount = (sectorCount) => {
    this._sectorCount = sectorCount;
    this._build();
  };

  this.setNormalType = (normalType) => {
    this._normalType = normalType;
    this._build();
  };

  this._build = () => {
    this._data = [];
    this._triangleIndices = [];
    this._lineIndices = [];
    let x, y, z, xy; // vertex position
    let nx,
      ny,
      nz,
      lengthInv = 1.0 / this._radius; // vertex normal
    let s, t; // vertex texCoord
    let sectorStep = (2 * Math.PI) / this._sectorCount;
    let stackStep = Math.PI / this._stackCount;
    let sectorAngle, stackAngle;

    for (let i = 0; i <= this._stackCount; ++i) {
      stackAngle = Math.PI / 2 - i * stackStep; // starting from pi/2 to -pi/2
      xy = this._radius * Math.cos(stackAngle); // r * cos(u)
      z = this._radius * Math.sin(stackAngle); // r * sin(u)

      for (let j = 0; j <= this._sectorCount; ++j) {
        sectorAngle = j * sectorStep; // starting from 0 to 2pi

        // vertex position (x, y, z)
        x = xy * Math.cos(sectorAngle); // r * cos(u) * cos(v)
        y = xy * Math.sin(sectorAngle); // r * cos(u) * sin(v)
        this._data.push(x + this._position[0]);
        this._data.push(y + this._position[1]);
        this._data.push(z + this._position[2]);

        // normalized vertex normal (nx, ny, nz)
        nx = x * lengthInv;
        ny = y * lengthInv;
        nz = z * lengthInv;

        this._data.push(nx);
        this._data.push(ny);
        this._data.push(nz);

        if (this._useTexCoords) {
          // vertex tex coord (s, t) range between [0, 1]
          s = j / this._sectorCount;
          t = i / this._stackCount;
          this._data.push(s);
          this._data.push(t);
        }
      }
    }

    let k1, k2;
    for (let i = 0; i < this._stackCount; ++i) {
      k1 = i * (this._sectorCount + 1); // beginning of current stack
      k2 = k1 + this._sectorCount + 1; // beginning of next stack

      for (let j = 0; j < this._sectorCount; ++j, ++k1, ++k2) {
        // 2 triangles per sector excluding first and last stacks
        // k1 => k2 => k1+1
        if (i != 0) {
          this._triangleIndices.push(k1);
          this._triangleIndices.push(k2);
          this._triangleIndices.push(k1 + 1);

          this._lineIndices.push(k1);
          this._lineIndices.push(k2);

          this._lineIndices.push(k2);
          this._lineIndices.push(k1 + 1);

          this._lineIndices.push(k1);
          this._lineIndices.push(k1 + 1);
        }

        // k1+1 => k2 => k2+1
        if (i != this._stackCount - 1) {
          this._triangleIndices.push(k1 + 1);
          this._triangleIndices.push(k2);
          this._triangleIndices.push(k2 + 1);

          this._lineIndices.push(k1 + 1);
          this._lineIndices.push(k2);

          this._lineIndices.push(k2);
          this._lineIndices.push(k2 + 1);

          this._lineIndices.push(k1 + 1);
          this._lineIndices.push(k2 + 1);
        }
      }
    }
  };

  this._build();
}
