import vec3 from 'gl-matrix'

export default function OctreeNode(center, halfWidth, depth) {

  this.center = center;
  this.halfWidth = halfWidth;
  this.bounds = [];
  this.parent = null;
  this.children = [];
  this.objects = [];

  this.createBounds = function() {
    this.bounds[0] = [this.center[0] - this.haftWidth, this.center[1], this.center[2]];
    this.bounds[1] = [this.center[0] + this.haftWidth, this.center[1], this.center[2]];
    this.bounds[2] = [this.center[0], this.center[1] - this.haftWidth, this.center[2]];
    this.bounds[3] = [this.center[0], this.center[1] + this.haftWidth, this.center[2]];
    this.bounds[4] = [this.center[0], this.center[1], this.center[2] - this.haftWidth];
    this.bounds[5] = [this.center[0], this.center[1], this.center[2] + this.haftWidth];
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

      const octree = new OctreeNode(center, halfWidth, depth - 1);
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

  this.build = function() {
    this.createBounds();
    this.createOctree()
  }
}
