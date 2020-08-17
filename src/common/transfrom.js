export default function Transfrom() {
  this._state = {

  }

  this.getState = () => {
    return { ...this._state };
  }
}