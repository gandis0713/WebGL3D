export default function Material() {
  this._state = {
    color: [1, 1, 1],
    ambient: [0.1, 0.1, 0.1],
    diffuse: [0.2, 0.2, 0.2],
    specular: [0.5, 0.5, 0.5],
  };

  this.setColor = (color) => {
    this._state.color[0] = color[0];
    this._state.color[1] = color[1];
    this._state.color[2] = color[2];
  };

  this.getColor = () => {
    return this._state.color;
  };

  this.setAmbient = (ambient) => {
    this._state.ambient[0] = ambient[0];
    this._state.ambient[1] = ambient[1];
    this._state.ambient[2] = ambient[2];
  };

  this.getAmbient = () => {
    return this._state.ambient;
  };

  this.setDiffuse = (diffuse) => {
    this._state.diffuse[0] = diffuse[0];
    this._state.diffuse[1] = diffuse[1];
    this._state.diffuse[2] = diffuse[2];
  };

  this.getDiffuse = () => {
    return this._state.diffuse;
  };

  this.setSpecular = (specular) => {
    this._state.specular[0] = specular[0];
    this._state.specular[1] = specular[1];
    this._state.specular[2] = specular[2];
  };

  this.getSpecular = () => {
    return this._state.specular;
  };
}
