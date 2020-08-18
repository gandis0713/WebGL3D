import { mat4 } from 'gl-matrix';

export default function Camera() {

  this._state = {
    lookAt: {
      eye: [0, 0, 0.0001],
      up: [0, 1, 0],
      target: [0, 0, 0]
    },
    frustum: {
      left: -50,
      right: 50,
      bottom: -50,
      top: 50,
      near: -1000,
      far: 1000
    },
    wcvc: mat4.create(),
    vcwc: mat4.create(),
    vcpc: mat4.create(),
    pcvc: mat4.create(),
    wcpc: mat4.create(),
    pcwc: mat4.create()
  }

  this._initialize = () => {
    mat4.lookAt(this._state.wcvc, this._state.lookAt.eye, this._state.lookAt.target, this._state.lookAt.up);
    mat4.invert(this._state.vcwc, this._state.wcvc);
    mat4.ortho(this._state.vcpc, this._state.frustum.left, this._state.frustum.right, this._state.frustum.bottom, this._state.frustum.top, this._state.frustum.near, this._state.frustum.far);
    mat4.invert(this._state.pcvc, this._state.vcpc);
    mat4.multiply(this._state.wcpc, this._state.vcpc, this._state.wcvc);
    mat4.invert(this._state.pcwc, this._state.wcpc);
  }

  this.setLootAt = (eye, target, up) => {
    this._state.lookAt.eye = eye;
    this._state.lookAt.target = target;
    this._state.lookAt.up = up;
    mat4.lookAt(this._state.wcvc, this._state.lookAt.eye, this._state.lookAt.target, this._state.lookAt.up);
    mat4.invert(this._state.vcwc, this._state.wcvc);
    mat4.multiply(this._state.wcpc, this._state.vcpc, this._state.wcvc);
    mat4.invert(this._state.pcwc, this._state.wcpc);
  }

  this.setFrustum = (left, right, bottom, top, near, far) => {
    this._state.frustum.left = left;
    this._state.frustum.right = right;
    this._state.frustum.bottom = bottom;
    this._state.frustum.top = top;
    this._state.frustum.near = near;
    this._state.frustum.far = far;

    mat4.ortho(this._state.vcpc, left, right, bottom, top, near, far);
    mat4.invert(this._state.pcvc, this._state.vcpc);
    mat4.multiply(this._state.wcpc, this._state.vcpc, this._state.wcvc);
    mat4.invert(this._state.pcwc, this._state.wcpc);
  }

  this.getState = () => {
    return { ...this._state };
  }

  this._initialize();  
}