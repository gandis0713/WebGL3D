#version 310 es
layout (local_size_x = 8, local_size_y = 1, local_size_z = 1) in;
layout (std430, binding = 0) buffer SSBO1 {
  vec2 pos[];
} ssbo1;

uniform float time;

void main() {
  uint threadIndex = gl_GlobalInvocationID.x;
  int index = int(threadIndex);

  if(index == 0) {
   ssbo1.pos[threadIndex] = vec2(-0.5, 0.5);
  }
  else if(index == 1) {
   ssbo1.pos[threadIndex] = vec2( 0.5, 0.5);
  }
  else if(index == 2) {
   ssbo1.pos[threadIndex] = vec2( 0.5, 0.5);
  }
  else if(index == 3) {
   ssbo1.pos[threadIndex] = vec2( 0.5,-0.5);
  }
  else if(index == 4) {
   ssbo1.pos[threadIndex] = vec2( 0.5,-0.5);
  }
  else if(index == 5) {
   ssbo1.pos[threadIndex] = vec2(-0.5,-0.5);
  }
  else if(index == 6) {
   ssbo1.pos[threadIndex] = vec2(-0.5,-0.5);
  }
  else if(index == 7) {
   ssbo1.pos[threadIndex] = vec2(-0.5, 0.5);
  }
}