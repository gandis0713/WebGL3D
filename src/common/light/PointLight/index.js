export default function PointLight() {
  this._state = {
    position: [0, 0, 0],
    color: [1, 1, 1],
  };

  this.getState = () => {
    return this._state;
  };

  this.setColor = (color) => {
    this._state.color = color;
  };

  this.getColor = () => {
    return this._state.color;
  };

  this.setPosition = (position) => {
    this._state.position = position;
  };

  this.getPosition = () => {
    return this._state.position;
  };
}
