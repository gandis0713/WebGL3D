#version 310 es
layout (local_size_x = 8, local_size_y = 1, local_size_z = 1) in;
layout (std430, binding = 0) buffer SSBO {
  vec2 pos[];
} ssbo;

uniform float time;

void main() {
  uint threadIndex = gl_GlobalInvocationID.x;
  float floatIndex = float(threadIndex);
  ssbo.pos[threadIndex] = vec2(floatIndex * 0.25 - 0.875, 0.5 * sin(time * 0.02 + floatIndex * 0.5));
}