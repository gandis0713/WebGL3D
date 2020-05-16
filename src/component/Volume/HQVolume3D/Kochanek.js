export function KochanekSpline3D(input, spec) {

  this.spline = [];
  this.input = input;
  this.spec = spec;

  this.create = function() {
    this.spline[0] = new KochanekSpline1D(this.input[0], this.spec);
    this.spline[1] = new KochanekSpline1D(this.input[1], this.spec);
    this.spline[2] = new KochanekSpline1D(this.input[2], this.spec);

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

export function KochanekSpline2D(input, spec) {

  this.spline = [];
  this.input = input;
  this.spec = spec;

  this.create = function() {
    this.spline[0] = new KochanekSpline1D(this.input[0], this.spec);
    this.spline[1] = new KochanekSpline1D(this.input[1], this.spec);

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

export function KochanekSpline1D(input, spec) {

  this.output = [];
  this.coeffiA = [];
  this.coeffiB = [];
  this.coeffiC = [];
  this.coeffiD = [];
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
      console.log("data is not enough in kochanek spline.");
      return;
    }
    
    this.coeffiA = [];
    this.coeffiB = [];
    this.coeffiC = [];
    this.coeffiD = [];   
    
    this.output = [];
    
    let pre;
    let cur;
    let next;

    let p0 = [];
    let p1 = [];
    let d0 = [];
    let d1 = [];

    let n0;
    let n1;

    const N = this.input.length - 1;

    // set hermite parameter.
    for(let i = 1; i < N; i++) {

      pre = this.input[i - 1];
      cur = this.input[i];
      next = this.input[i + 1];
      
      n0 = this.spec.intervals[i] - this.spec.intervals[i - 1];
      n1 = this.spec.intervals[i + 1] - this.spec.intervals[i];
      
      p0[i] = cur;
      p1[i] = next;
      d0[i] = (n1 / (n0 + n1)) * (( next - cur ) + ( cur - pre ) );
      d1[i] = (n0 / (n0 + n1)) * (( next - cur ) + ( cur - pre ) );
    }
            
    // set hermite parameter at start point.
    pre = this.input[0];
    cur = this.input[0];
    next = this.input[1];
      
    n0 = 0;
    n1 = this.spec.intervals[1] - this.spec.intervals[0];

    p0[0] = cur;
    p1[0] = next;
    d0[0] = (n1 / (n0 + n1)) * (( next - cur ) + ( cur - pre ) );
    d1[0] = (n0 / (n0 + n1)) * (( next - cur ) + ( cur - pre ) );
    // set hermite parameter at end point.
    pre = this.input[N - 1];
    cur = this.input[N];
    next = this.input[N];
      
    n0 = this.spec.intervals[N] - this.spec.intervals[N - 1];
    n1 = this.spec.intervals[N] - this.spec.intervals[N];

    p0[N] = cur;
    p1[N] = next;
    d0[N] = (n1 / (n0 + n1)) * (( next - cur ) + ( cur - pre ) );
    d1[N] = (n0 / (n0 + n1)) * (( next - cur ) + ( cur - pre ) );

    // set coefficiant  
    for(let i = 0; i < N; i++) {  
      cur = this.input[i];
      next = this.input[i + 1];

      this.coeffiA[i] = 2 * cur - 2 * next + d0[i] + d1[i+1];
      this.coeffiB[i] = -3 * cur + 3 * next - 2 * d0[i] - d1[i+1];
      this.coeffiC[i] = d0[i];
      this.coeffiD[i] = cur;
    }

    // create spline.
    for(let i = 0; i < this.spec.resolution; i++) {

      const unit = i / this.spec.resolution;
      let index = 0;
      let t1;
      let t2;
      let t3;
      for(let j = 0; j < this.spec.intervals.length - 1; j++) {
        const curJ = this.spec.intervals[j+1];
        const preJ = this.spec.intervals[j];
        if(unit === 0) {          
          index = 0;
          
          t1 = 0;
          t2 = t1 * t1;
          t3 = t1 * t2;
          break;
        }
        if(unit <= curJ && unit > preJ) {
          index = j;
          
          t1 = (unit - preJ) / (curJ - preJ);
          t2 = t1 * t1;
          t3 = t1 * t2;
          break;
        }
      }

      const value = this.coeffiA[index] * t3 + this.coeffiB[index] * t2 + this.coeffiC[index] * t1 + this.coeffiD[index];

      this.output.push(value);
    }
  }
}