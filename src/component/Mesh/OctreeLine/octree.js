import vec3 from 'gl-matrix'

export default function OctreeNode(center, halfWidth, depth, object) {

  this.center = center;
  this.halfWidth = halfWidth;
  this.object = object;
  this.bounds = [];
  this.parent = null;
  this.children = [];
  this.lines = [];

  this.createBounds = function() {
    this.bounds[0] = [this.center[0] - this.halfWidth];
    this.bounds[1] = [this.center[0] + this.halfWidth];
    this.bounds[2] = [this.center[1] - this.halfWidth];
    this.bounds[3] = [this.center[1] + this.halfWidth];
    this.bounds[4] = [this.center[2] - this.halfWidth];
    this.bounds[5] = [this.center[2] + this.halfWidth];
  }

  this.createLines = function() {
    const offset = [];
    for(let i = 0; i < 8; i++) {      
      const center = [];
      offset[0] = (i & 1) ? 1 : -1;
      offset[1] = (i & 2) ? 1 : -1;
      offset[2] = (i & 4) ? 1 : -1;
      center[0] = this.center[0] + offset[0] * this.halfWidth;
      center[1] = this.center[1] + offset[1] * this.halfWidth;
      center[2] = this.center[2] + offset[2] * this.halfWidth;

      this.lines.push(center[0]);
      this.lines.push(center[1]);
      this.lines.push(center[2]);

      const center1 = [];
      offset[0] = (i & 2) ? 1 : -1;
      offset[1] = (i & 1) ? -1 : 1;
      offset[2] = (i & 4) ? 1 : -1;
      center1[0] = this.center[0] + offset[0] * this.halfWidth;
      center1[1] = this.center[1] + offset[1] * this.halfWidth;
      center1[2] = this.center[2] + offset[2] * this.halfWidth;
      this.lines.push(center1[0]);
      this.lines.push(center1[1]);
      this.lines.push(center1[2]);
    }

    for(let i = 0; i < 8; i++) {      
      const center = [];
      offset[0] = (i & 1) ? 1 : -1;
      offset[1] = (i & 2) ? 1 : -1;
      offset[2] = 1;
      center[0] = this.center[0] + offset[0] * this.halfWidth;
      center[1] = this.center[1] + offset[1] * this.halfWidth;
      center[2] = this.center[2] + offset[2] * this.halfWidth;

      this.lines.push(center[0]);
      this.lines.push(center[1]);
      this.lines.push(center[2]);

      const center1 = [];
      offset[0] = (i & 1) ? 1 : -1;
      offset[1] = (i & 2) ? 1 : -1;
      offset[2] = -1;
      center1[0] = this.center[0] + offset[0] * this.halfWidth;
      center1[1] = this.center[1] + offset[1] * this.halfWidth;
      center1[2] = this.center[2] + offset[2] * this.halfWidth;
      this.lines.push(center1[0]);
      this.lines.push(center1[1]);
      this.lines.push(center1[2]);
    }
  }

  this.isInside = function() {
    for(let i = 0; i < this.object.length; i += 3) {
      if((this.bounds[0] <= this.object[i] && this.bounds[1] >= this.object[i])
      && (this.bounds[2] <= this.object[i + 1] && this.bounds[3] >= this.object[i + 1])
      && (this.bounds[4] <= this.object[i + 2] && this.bounds[5] >= this.object[i + 2])) {
        return true;
      }
    }

    return false;
  }

  this.addChildNode = function(child) {
    this.children.push(child)
  }

  this.getChildNode = function(index) {
    if(index >= this.children.length) {
      return null;
    }
    return this.children[index];
  }

  this.createOctree = function() {

    if(depth < 0) {
      return;
    }
    const halfWidth = this.halfWidth / 2;
    const offset = [];
    for(let i = 0; i < 8; i++) {      
      const center = [];
      offset[0] = (i & 1) ? 1 : -1;
      offset[1] = (i & 2) ? 1 : -1;
      offset[2] = (i & 4) ? 1 : -1;
      center[0] = this.center[0] + offset[0] * halfWidth;
      center[1] = this.center[1] + offset[1] * halfWidth;
      center[2] = this.center[2] + offset[2] * halfWidth;

      const octree = new OctreeNode(center, halfWidth, depth - 1, this.object);
      octree.build();
      this.addChildNode(octree);
    }
  }

  this.setParent = function(parent) {
    this.parent = parent;
  }

  this.addObject = function(object) {
    this.objects.push(object);
  }  

  this.getLines = function(lines) {
    for(let i = 0; i < this.lines.length; i++) {
      lines.push(this.lines[i]);
    }

    if(this.children.length === 0) {
      return;
    }

    for(let i = 0; i < this.children.length; i++) {
      this.children[i].getLines(lines);
    }
  }

  this.build = function() {
    this.createBounds();
    this.createLines();
    if(this.isInside()) {  
      this.createOctree(); 
    }
  }
}
