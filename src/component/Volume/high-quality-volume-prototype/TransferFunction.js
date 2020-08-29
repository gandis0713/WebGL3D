import {KochanekSpline3D, KochanekSpline1D} from './Kochanek'
import {LinearLine3D, LinearLine1D} from './linearLine'



function TransferFunction() {
  this.colorFunction = null;
  this.opacityFunction = null;

  // original
  // const colorData = [
  //   [0.0, 1.0],
  //   [0.0, 1.0],
  //   [0.0, 1.0]
  // ]
  // const colorUnit = [-1140, 7000];

  // const opacityData = [1.0, 1.0];
  // const opacityUnit = [-1140, 7000];

  // teeth
  // const colorData = [
  //   [0.0, 0.0, 0.522, 0.859, 1.0, 1.0, 1.0],
  //   [0.0, 0.0, 0.078, 0.667, 1.0, 1.0, 1.0],
  //   [0.0, 0.0,  0.09, 0.294, 1.0, 1.0, 1.0]
  // ]
  // const colorUnit = [-1140, -1000, 320, 1760, 2800, 3000, 7000];

  // const opacityData = [0.0, 0.0, 0.0, 0.4274, 0.42391, 0.42391, 0.42391];
  // const opacityUnit = [-1140, 400, 560, 1731, 3000, 5000, 7000];

  // bone
  const colorData = [
    [0.0, 0.0, 0.627, 0.992, 1.0, 1.0, 1.0],
    [0.0, 0.0, 0.102, 0.886, 1.0, 1.0, 1.0],
    [0.0, 0.0, 0.086, 0.576, 1.0, 1.0, 1.0]
  ]
  const colorUnit = [-1140, -1000, 788, 1090, 1247, 3000, 7000];
  
  const opacityData = [0.0, 0.0, 0.0, 0.71304, 1.0, 1.0, 1.0];
  const opacityUnit = [-1140, 400, 752, 1151, 3000, 5000, 7000];

  this.create = function() {
    const colorSpec = {};
    colorSpec.resolution = colorUnit[colorUnit.length - 1] - colorUnit[0];
    colorSpec.intervals = [];
    colorSpec.intervals [0] = 0;
    for(let i = 0; i < colorUnit.length - 1; i++) {
      const value = colorSpec.intervals[i] + ((colorUnit[i + 1] - colorUnit[i]) / colorSpec.resolution);
      colorSpec.intervals.push(value);
    }

    const opacitySpec = {};
    opacitySpec.resolution = opacityUnit[opacityUnit.length - 1] - opacityUnit[0];
    opacitySpec.intervals = [];
    opacitySpec.intervals [0] = 0;
    for(let i = 0; i < opacityUnit.length - 1; i++) {
      const value = opacitySpec.intervals[i] + ((opacityUnit[i + 1] - opacityUnit[i]) / opacitySpec.resolution);
      opacitySpec.intervals.push(value);
    }

    this.colorFunction = new LinearLine3D(colorData, colorSpec);
    // this.colorFunction = new KochanekSpline3D(colorData, colorSpec);
    this.colorFunction.create();

    this.opacityFunction = new LinearLine1D(opacityData, opacitySpec);
    // this.opacityFunction = new KochanekSpline1D(opacityData, opacitySpec);
    this.opacityFunction.create();
  }

  this.getColorValue = function() {
    return this.colorFunction.getOutput();
  }

  this.getOpacityValue = function() {
    return this.opacityFunction.getOutput();
  }
}

export default TransferFunction;