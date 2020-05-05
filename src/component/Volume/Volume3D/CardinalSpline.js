export function CardinalSpline4D() {

  this.spline = [];

  this.create = function(input) {
    this.spline[0] = new CardinalSpline1D(input[0]);
    this.spline[1] = new CardinalSpline1D(input[1]);
    this.spline[2] = new CardinalSpline1D(input[2]);
    this.spline[3] = new CardinalSpline1D(input[3]);

    this.build();
  }

  this.build = function() {
    this.spline[0].build();
    this.spline[1].build();
    this.spline[2].build();
    this.spline[3].build();
  }

  this.getOutput = function() {
    return [
      this.spline[0].getOutput(),
      this.spline[1].getOutput(),
      this.spline[2].getOutput(),
      this.spline[3].getOutput()
    ];
  }
}

export function CardinalSpline2D() {

  this.spline = [];

  this.create = function(input) {
    this.spline[0] = new CardinalSpline1D(input[0]);
    this.spline[1] = new CardinalSpline1D(input[1]);

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

export function CardinalSpline1D(input) {
  
  this.coeffiA = [];
  this.coeffiB = [];
  this.coeffiC = [];
  this.coeffiD = [];
  this.output = [];
  
  this.getOutput = function() {
    return this.output;
  }

  this.build = function() {
    
    this.coeffiA = [];
    this.coeffiB = [];
    this.coeffiC = [];
    this.coeffiD = [];
    
    const N = input.length - 1;
    this.output = [];

    let p1 = [];
    let p2 = [];
    let p3 = [];
    let p4 = [];

    for(let i = 0; i < N; i++) {
      p1[i] = (i === 0) ? input[0] : input[i - 1];
      p2[i] = input[i];
      p3[i] = input[i + 1];
      p4[i] = i >= (N - 1) ? input[i + 1] : input[i + 2];
    }

    for(let i = 0; i < N; i++) {
      this.coeffiA[i] = 0.5 * (-p1[i] + 3*p2[i] - 3*p3[i] + p4[i]);
      this.coeffiB[i] = 0.5 * (2*p1[i] - 5*p2[i] + 4*p3[i] - p4[i]);
      this.coeffiC[i] = 0.5 * (-p1[i] + p3[i]);
      this.coeffiD[i] = 0.5 * (2*p2[i]);
    }

    const resolution = 32;
    for(let i = 0; i < N; i++) {
      for(let j = 0; j < resolution; j++) {

        const t1 = j / ( resolution - 1 );
        const t2 = t1 * t1;
        const t3 = t1 * t2;

        const value = this.coeffiA[i] * t3 + this.coeffiB[i] * t2 + this.coeffiC[i] * t1 + this.coeffiD[i];
        this.output[i * resolution + j] = value;
      }
    }
  } 
}