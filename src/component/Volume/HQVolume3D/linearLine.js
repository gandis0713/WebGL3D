export function LinearLine3D(input, spec) {

  this.spline = [];
  this.input = input;
  this.spec = spec;

  this.create = function() {
    this.spline[0] = new LinearLine1D(this.input[0], this.spec);
    this.spline[1] = new LinearLine1D(this.input[1], this.spec);
    this.spline[2] = new LinearLine1D(this.input[2], this.spec);

    this.build();
  }

  this.build = function() {
    this.spline[0].build();
    this.spline[1].build();
    this.spline[2].build();
  }

  this.getOutput = function() {
    return [
      this.spline[0].getOutput(),
      this.spline[1].getOutput(),
      this.spline[2].getOutput()
    ];
  }
}

export function LinearLine2D(input, spec) {

  this.spline = [];
  this.input = input;
  this.spec = spec;

  this.create = function() {
    this.spline[0] = new LinearLine1D(this.input[0], this.spec);
    this.spline[1] = new LinearLine1D(this.input[1], this.spec);

    this.build();
  }

  this.build = function() {
    this.spline[0].build();
    this.spline[1].build();
  }
  
  this.getOutput = function() {
    return [
      this.spline[0].getOutput(),
      this.spline[1].getOutput()
    ];
  }
}

export function LinearLine1D(input, spec) {

  this.output = [];
  this.input = input;
  this.spec = spec;

  this.create = function() {
    this.build();
  }

  this.getOutput = function() {
    return this.output;
  }

  this.build = function() {

    if(this.input.length < 2) {
      console.log("data is not enough in Linear Line.");
      return;
    } 
    
    this.output = [];

    const N = this.input.length - 1;
    // create spline.
    for(let i = 0; i < this.spec.resolution; i++) {

      const unit = i / this.spec.resolution;
      let index = 0;
      if(unit === 0) {          
        this.output.push(this.input[0]);
        continue;
      }

      for(let j = 0; j < this.spec.intervals.length - 1; j++) {
        const curJ = this.spec.intervals[j];
        const nextJ = this.spec.intervals[j+1];

        if(unit <= nextJ && unit > curJ) {
          index = j;

          const cur = this.input[index];
          const next = this.input[index+1];
          const y = next - cur;
          const x = (nextJ - curJ) * this.spec.resolution;
          const a = y / x;
          const b = this.input[index] - this.spec.intervals[index] * this.spec.resolution * a;
          
          const t = ((unit - curJ) / (nextJ - curJ));
          const value = a * unit * this.spec.resolution + b;
          this.output.push(value);
          break;
        }
      }
    }
  }
}