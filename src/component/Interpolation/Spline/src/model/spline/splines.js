

export const splineType = {
  natural: 0,
  kochanek: 1,
  cardinal: 2
}

export const splineNumber = 3;

export default function Splines(spline) {

  this.splines = [];
  spline.output.data = [];
  
  this.create = function(type, splineObject) {
    spline.output.data[type] = [];

    splineObject.create(spline.input, spline.spec, spline.output.data[type]);
    splineObject.build();

    this.splines[type] = splineObject;
  }

  this.build = function() {
    for(let i = 0; i < this.splines.length; i++) {
      this.splines[i].build();
    }
  }
}