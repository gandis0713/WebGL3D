

import Splines, {splineType} from "./model/spline/splines.js"
import NaturalCubicSpline2D from "./model/spline/kochanek_bartels.js"
import KochanekSpline2D from "./model/spline/natural_cubic.js"
import CardinalSpline2D from "./model/spline/cardinal.js"
import SplineScreen from "./view/screen/spline_screen.js"
import SplinePanel from "./view/panel/spline_panel.js"
import SplineController from "./controller/spline_controller.js"

export default function App(body) {

  this.body = body;
  var app = {
    spline: {
      input: {    
        data: [[100, 200, 200, 100], [100, 100, 200, 200]]     
      },
      output: {
      },
      spec: {
        close: false,
        resolution: 32,
        intervals: [0, 0.25, 0.5, 0.75, 1],
      
        tension: [0, 0, 0, 0],
        bias: [0, 0, 0, 0],
        continuity: [0, 0, 0, 0]
      },
      state: {
        selectedPointIndex: -1,
        selectedLineIndex: -1
      },
      visual: {
        pointSize: 7,
        pointStroke: 2
      },
      type: {
        show: [true, true, true],
        color: [['#0000ff', '#0055ff', '#0099ff'], ['#ff0000', '#ff5500', '#ff9900'], ['#00ff00', '#ffff00', '#ffff55']],
        name: ['Natural', 'Kochanek', 'Cardinal']
      }
    }
  }

  this.start = function() {
    
    const splineController = new SplineController(app.spline);
    
    // create model
    const splines = new Splines(app.spline);
    splines.create(splineType.natural, new NaturalCubicSpline2D());
    splines.create(splineType.kochanek, new KochanekSpline2D());
    splines.create(splineType.cardinal, new CardinalSpline2D());
    
    splineController.setSplines(splines);

    // create view
    const splineScreen = new SplineScreen(this.body);
    splineController.setScreen(splineScreen);

    const splinePanel = new SplinePanel(this.body);
    splineController.setPanel(splinePanel);

    // draw spline
    splineController.drawSpline();
    
  }

}