/// <reference path="../../node_modules/babylonjs/babylon.d.ts" />

const {
  ArcRotateCamera,
  BoundingInfo,
  Buffer,
  Color3,
  ComputeShader,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  ShaderLanguage,
  ShaderMaterial,
  ShaderStore,
  StandardMaterial,
  StorageBuffer,
  UniformBuffer,
  Vector3,
  VertexBuffer,
  VertexData,
  WebGPUEngine,
} = BABYLON;

const PI = Math.PI;

const EDGE_CASES = new Uint32Array([
  0x000, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c, 0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
  0x190, 0x099, 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c, 0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
  0x230, 0x339, 0x033, 0x13a, 0x636, 0x73f, 0x435, 0x53c, 0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
  0x3a0, 0x2a9, 0x1a3, 0x0aa, 0x7a6, 0x6af, 0x5a5, 0x4ac, 0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
  0x460, 0x569, 0x663, 0x76a, 0x066, 0x16f, 0x265, 0x36c, 0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
  0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0x0ff, 0x3f5, 0x2fc, 0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
  0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x055, 0x15c, 0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
  0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0x0cc, 0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
  0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc, 0x0cc, 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
  0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c, 0x15c, 0x055, 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
  0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc, 0x2fc, 0x3f5, 0x0ff, 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
  0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c, 0x36c, 0x265, 0x16f, 0x066, 0x76a, 0x663, 0x569, 0x460,
  0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac, 0x4ac, 0x5a5, 0x6af, 0x7a6, 0x0aa, 0x1a3, 0x2a9, 0x3a0,
  0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c, 0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x033, 0x339, 0x230,
  0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c, 0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x099, 0x190,
  0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c, 0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x000,
]);

const TRIANGLE_CASES = new Int32Array([
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1,
  3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1,
  3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1,
  3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1,
  9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1,
  1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1,
  9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
  2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1,
  8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1,
  9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
  4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1,
  3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1,
  1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1,
  4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1,
  4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1,
  9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1,
  1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
  5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1,
  2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1,
  9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
  0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
  2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1,
  10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1,
  4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1,
  5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1,
  5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1,
  9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1,
  0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1,
  1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1,
  10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1,
  8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1,
  2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1,
  7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1,
  9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1,
  2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1,
  11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1,
  9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1,
  5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1,
  11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1,
  11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
  1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1,
  9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1,
  5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1,
  2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
  0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
  5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1,
  6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1,
  0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1,
  3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1,
  6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1,
  5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1,
  1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
  10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1,
  6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1,
  1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1,
  8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1,
  7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1,
  3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
  5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1,
  0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1,
  9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1,
  8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1,
  5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1,
  0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1,
  6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1,
  10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1,
  10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1,
  8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1,
  1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1,
  3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1,
  0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1,
  10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1,
  0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1,
  3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1,
  6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1,
  9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1,
  8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1,
  3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1,
  6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1,
  0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1,
  10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1,
  10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1,
  1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1,
  2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1,
  7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1,
  7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1,
  2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1,
  1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1,
  11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1,
  8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1,
  0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1,
  7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
  10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
  2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
  6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1,
  7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1,
  2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1,
  1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1,
  10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1,
  10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1,
  0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1,
  7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1,
  6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1,
  8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1,
  9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1,
  6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1,
  1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1,
  4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1,
  10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1,
  8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1,
  0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1,
  1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1,
  8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1,
  10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1,
  4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1,
  10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
  5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
  11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1,
  9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
  6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1,
  7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1,
  3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1,
  7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1,
  9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1,
  3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1,
  6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1,
  9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1,
  1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1,
  4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1,
  7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1,
  6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1,
  3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1,
  0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1,
  6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1,
  1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1,
  0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1,
  11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1,
  6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1,
  5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1,
  9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1,
  1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1,
  1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1,
  10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1,
  0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1,
  5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1,
  10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1,
  11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1,
  0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1,
  9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1,
  7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1,
  2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1,
  8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1,
  9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1,
  9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1,
  1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1,
  9, 0, 3, 9, 3, 5, 5, 3, 7, -1, -1, -1, -1, -1, -1, -1,
  9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1,
  5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1,
  0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1,
  10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1,
  2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1,
  0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, -1,
  0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1,
  9, 4, 5, 2, 11, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1,
  5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1,
  3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1,
  5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1,
  8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1,
  0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1,
  9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, -1, -1, -1, -1, -1,
  0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1,
  1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1,
  3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1,
  4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1,
  9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1,
  11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1,
  11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1,
  2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1,
  9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, -1,
  3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1,
  1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1,
  4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1,
  4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1,
  0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1,
  3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1,
  3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1,
  0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1,
  9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1,
  1, 10, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
]);

const Utils = {
  Buffer: {
    Strides: {
      INT32: 4,
      UINT32: 4,
      VERTEX: 32,
      VEC3_F32: 16,
    },
  },
  Number: {
    /**
     * @param {number} lower 
     * @param {number | undefined} upper 
     * @returns {number[]}
     */
    Range: function range(lower, upper) {
      if (upper === undefined) {
        upper = lower;
        lower = 0;
      }

      const ret = [];
      for (let i = lower; i < upper; i++) {
        ret.push(i);
      }
      return ret;
    },
  },
  Task: {
    Chain: tasks => tasks.reduce((task, next) => task.then(next), Promise.resolve()),
  },
};

const $ENV = {
  world: {
    center: () => new Vector3(32, 16, 32),
  },
  shaders: {
    marchingCubes: {
      workgroupSize: {
        x: 4,
        y: 4,
        z: 4,
      },
      numWorkgroups: {
        x: 2,
        y: 1,
        z: 2,
      },
    },
  },
};

$ENV.shaders.marchingCubes.workgroupSize.total = $ENV.shaders.marchingCubes.workgroupSize.x * $ENV.shaders.marchingCubes.workgroupSize.y * $ENV.shaders.marchingCubes.workgroupSize.z;
$ENV.shaders.marchingCubes.numWorkgroups.total = $ENV.shaders.marchingCubes.numWorkgroups.x * $ENV.shaders.marchingCubes.numWorkgroups.y * $ENV.shaders.marchingCubes.numWorkgroups.z;

$ENV.shaders.marchingCubes.computeShaderGrid = {};
$ENV.shaders.marchingCubes.computeShaderGrid.x = $ENV.shaders.marchingCubes.workgroupSize.x * $ENV.shaders.marchingCubes.numWorkgroups.x;
$ENV.shaders.marchingCubes.computeShaderGrid.y = $ENV.shaders.marchingCubes.workgroupSize.y * $ENV.shaders.marchingCubes.numWorkgroups.y;
$ENV.shaders.marchingCubes.computeShaderGrid.z = $ENV.shaders.marchingCubes.workgroupSize.z * $ENV.shaders.marchingCubes.numWorkgroups.z;
$ENV.shaders.marchingCubes.computeShaderGrid.total = $ENV.shaders.marchingCubes.computeShaderGrid.x * $ENV.shaders.marchingCubes.computeShaderGrid.y * $ENV.shaders.marchingCubes.computeShaderGrid.z;

const SHADER_LIBS = {
  /**
   * @note
   * Original work from https://github.com/keijiro/NoiseShader
   * 
   * Ported to WGSL by inhibitor1217.
   */
  'Lib:Noise': `

fn mod289_3d(x: vec3<f32>) -> vec3<f32> {
  return x - floor(x / 289) * 289;
}

fn mod289_4d(x: vec4<f32>) -> vec4<f32> {
  return x - floor(x / 289) * 289;
}

fn mod49_4d(x: vec4<f32>) -> vec4<f32> {
  return x - floor(x / 49) * 49;
}

fn permute(x: vec4<f32>) -> vec4<f32> {
  return mod289_4d((x * 34 + 1) * x);
}

// - Gradient on xyz components
// - Noise value on w component
fn snoise(v: vec3<f32>) -> vec4<f32> {
  let C = vec2<f32>(1.0 / 6.0, 1.0 / 3.0);
  let ZERO = vec4<f32>(0.0, 0.0, 0.0, 0.0);

  // First corner
  var i  = floor(v + dot(v, C.yyy));
  let x0 = v   - i + dot(i, C.xxx);

  // Other corners
  let g = step(x0.yzx, x0.xyz);
  let l = 1.0 - g;
  let i1 = min(g.xyz, l.zxy);
  let i2 = max(g.xyz, l.zxy);

  let x1 = x0 - i1 + C.x;
  let x2 = x0 - i2 + C.y;
  let x3 = x0 - 0.5;

  // Permutations
  i = mod289_3d(i); // Avoid truncation effects in permutation
  var p = permute(    i.z + vec4<f32>(0, i1.z, i2.z, 1));
      p = permute(p + i.y + vec4<f32>(0, i1.y, i2.y, 1));
      p = permute(p + i.x + vec4<f32>(0, i1.x, i2.x, 1));

  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  let j = mod49_4d(p);

  let gx = (floor(j / 7.0) * 2.0 + 0.5) / 7.0 - 1.0;
  let gy = (floor(j - 7.0 * floor(j / 7.0)) * 2.0 + 0.5) / 7.0 - 1.0;
  let gz = 1.0 - abs(gx) - abs(gy);

  let b0 = vec4<f32>(gx.xy, gy.xy);
  let b1 = vec4<f32>(gx.zw, gy.zw);

  let s0 = floor(b0) * 2.0 + 1.0;
  let s1 = floor(b1) * 2.0 + 1.0;
  let sh = -step(gz, ZERO);

  let a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  let a1 = b1.xzyw + s1.xzyw * sh.zzww;

  let g0 = normalize(vec3<f32>(a0.xy, gz.x));
  let g1 = normalize(vec3<f32>(a0.zw, gz.y));
  let g2 = normalize(vec3<f32>(a1.xy, gz.z));
  let g3 = normalize(vec3<f32>(a1.zw, gz.w));

  // Mix final noise value
  let m = max(0.5 - vec4<f32>(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), ZERO);
  let px = vec4<f32>(dot(x0, g0), dot(x1, g1), dot(x2, g2), dot(x3, g3));

  let m3 = m * m * m;
  let m4 = m3 * m;

  let temp = -8 * m3 * px;
  let grad = m4.x * g0 + temp.x * x0 +
             m4.y * g1 + temp.y * x1 +
             m4.z * g2 + temp.z * x2 +
             m4.w * g3 + temp.w * x3;

  return 107.0 * vec4<f32>(grad, dot(m4, px));
}

  `,
};

const SHADER_SOURCES = {
  'Compute:MarchingCubesMesh': `
struct Vertex {
  position: vec3<f32>,
  normal: vec3<f32>,
};

@group(0) @binding(0)
var<storage, read_write> vertices: array<Vertex>;

@group(0) @binding(1)
var<storage, read> edge_cases: array<u32, 256>;

@group(0) @binding(2)
var<storage, read> triangle_cases: array<i32, 4096>;

@group(1) @binding(0)
var<uniform> global_offset: vec3<f32>;

var<private> cube_offsets: array<vec3<f32>, 8> = array<vec3<f32>, 8>(
  vec3<f32>(0, 0, 0),
  vec3<f32>(1, 0, 0),
  vec3<f32>(1, 1, 0),
  vec3<f32>(0, 1, 0),
  vec3<f32>(0, 0, 1),
  vec3<f32>(1, 0, 1),
  vec3<f32>(1, 1, 1),
  vec3<f32>(0, 1, 1),
);

var<private> edge_vertex_indices: array<vec2<u32>, 12> = array<vec2<u32>, 12>(
  vec2<u32>(0, 1),
  vec2<u32>(1, 2),
  vec2<u32>(2, 3),
  vec2<u32>(3, 0),
  vec2<u32>(4, 5),
  vec2<u32>(5, 6),
  vec2<u32>(6, 7),
  vec2<u32>(7, 4),
  vec2<u32>(0, 4),
  vec2<u32>(1, 5),
  vec2<u32>(2, 6),
  vec2<u32>(3, 7),
);

var<private> EMPTY_VOXEL_CUBE_CASE: u32 = 0x00u;
var<private> FULL_VOXEL_CUBE_CASE: u32 = 0xffu;

var<private> MAX_VERTICES_PER_VOXEL: u32 = 15u;
var<private> NUM_VERTICES_IN_CUBE: u32 = 8u;
var<private> NUM_EDGES_IN_CUBE: u32 = 12u;
var<private> TRIANGLE_CASE_OFFSET: u32 = 16u;

var<private> GLOBAL_AMPLITUDE: f32 = 4.0;
var<private> GLOBAL_ANGULAR_VELOCITY: f32 = 0.2;
var<private> NUM_OCTAVES: u32 = 4u;
var<private> octaves: array<vec2<f32>, 4> = array<vec2<f32>, 4>(
  vec2<f32>(1, 1),
  vec2<f32>(2, 0.5),
  vec2<f32>(4, 0.25),
  vec2<f32>(8, 0.125),
);

var<private> WORLD_MIN   : vec3<f32> = vec3<f32>(0, 0, 0);
var<private> WORLD_MAX   : vec3<f32> = vec3<f32>(64, 32, 64);
var<private> ABSOLUTE_AIR: vec3<f32> = vec3<f32>(-10000, -10000, -10000);
var<private> POSITIVE_ABSOLUTE_GRADIENT: vec3<f32> = vec3<f32>(10000, -10000, 10000);

${SHADER_LIBS['Lib:Noise']}

fn density(position: vec3<f32>) -> vec4<f32> {
  var value    = 16.0 - position.y +
                 dot(step(position, WORLD_MIN), ABSOLUTE_AIR) +
                 dot(step(WORLD_MAX, position), ABSOLUTE_AIR);

  var gradient = vec3<f32>(0, -1, 0) +
                 dot(step(position, WORLD_MIN), -POSITIVE_ABSOLUTE_GRADIENT) +
                 dot(step(WORLD_MAX, position),  POSITIVE_ABSOLUTE_GRADIENT);

  for (var i = 0u; i < NUM_OCTAVES; i++) {
    let sample = snoise(position * octaves[i].yyy * GLOBAL_ANGULAR_VELOCITY);

    value    += sample.w * octaves[i].x * GLOBAL_AMPLITUDE;
    gradient += sample.xyz * octaves[i].yyy * GLOBAL_ANGULAR_VELOCITY * octaves[i].x * GLOBAL_AMPLITUDE;
  }

  return vec4<f32>(gradient, value);
}

@compute @workgroup_size(${$ENV.shaders.marchingCubes.workgroupSize.x}, ${$ENV.shaders.marchingCubes.workgroupSize.y}, ${$ENV.shaders.marchingCubes.workgroupSize.z})
fn main(@builtin(global_invocation_id) global_invocation_id: vec3<u32>,
        @builtin(local_invocation_id) local_invocation_id: vec3<u32>,
        @builtin(local_invocation_index) local_invocation_index: u32) {
  let offset = vec3<f32>(global_invocation_id);

  /* Calculate the cube case. */
  var cube_densities: array<vec4<f32>, 8>;
  var cube_case = 0u;

  for (var i = 0u; i < NUM_VERTICES_IN_CUBE; i++) {
    cube_densities[i] = density(cube_offsets[i] + global_offset + offset);
  }

  for (var i = 0u; i < NUM_VERTICES_IN_CUBE; i++) {
    cube_case |= u32(cube_densities[i].w > 0.0) << i;
  }

  /* This (an empty or fully filled cube) will be the case for most voxels. */
  if (cube_case == EMPTY_VOXEL_CUBE_CASE ||
      cube_case == FULL_VOXEL_CUBE_CASE) {
    return;
  }

  /* Calculate the vertex positions in edges of the cube. */
  let edge_case = edge_cases[cube_case];
  var edge_vertices: array<vec3<f32>, 12>;
  var edge_normals: array<vec3<f32>, 12>;

  for (var i = 0u; i < NUM_EDGES_IN_CUBE; i++) {
    if ((edge_case & (1u << i)) != 0u) {
      let v0 = edge_vertex_indices[i].x;
      let v1 = edge_vertex_indices[i].y;
      let weight = cube_densities[v0].w / (cube_densities[v0].w - cube_densities[v1].w);

      edge_vertices[i] = offset + mix(cube_offsets[v0], cube_offsets[v1], weight);
      edge_normals[i]  = normalize(-mix(cube_densities[v0].xyz, cube_densities[v1].xyz, weight));
    }
  }

  /* Fill the vertices storage buffer. */
  let index_offset = (
    global_invocation_id.x +
    global_invocation_id.y * (${$ENV.shaders.marchingCubes.computeShaderGrid.x}) +
    global_invocation_id.z * (${$ENV.shaders.marchingCubes.computeShaderGrid.x * $ENV.shaders.marchingCubes.computeShaderGrid.y})
  ) * MAX_VERTICES_PER_VOXEL;

  for (var i = 0u; i < MAX_VERTICES_PER_VOXEL; i += 3u) {
    let idx0 = triangle_cases[cube_case * TRIANGLE_CASE_OFFSET + i];
    if (idx0 < 0) { break; }
    let idx1 = triangle_cases[cube_case * TRIANGLE_CASE_OFFSET + i + 1u];
    let idx2 = triangle_cases[cube_case * TRIANGLE_CASE_OFFSET + i + 2u];

    let pos0 = edge_vertices[idx0];
    let pos1 = edge_vertices[idx1];
    let pos2 = edge_vertices[idx2];

    let normal = normalize(cross(pos2 - pos0, pos1 - pos0));

    vertices[index_offset + i].position = pos0;
    vertices[index_offset + i + 1u].position = pos1;
    vertices[index_offset + i + 2u].position = pos2;

    vertices[index_offset + i     ].normal = edge_normals[idx0];
    vertices[index_offset + i + 1u].normal = edge_normals[idx1];
    vertices[index_offset + i + 2u].normal = edge_normals[idx2];
  }
}

  `,

  'Vertex:SimplexNoiseMat': `

#include<sceneUboDeclaration>
#include<meshUboDeclaration>

attribute position: vec3<f32>;

varying vPosition: vec3<f32>;

@stage(vertex)
fn main(input: VertexInputs) -> FragmentInputs {
  gl_Position = scene.viewProjection * mesh.world * vec4<f32>(position, 1.0);
  vPosition = 32.0 * position;
}

`,
  'Fragment:SimplexNoiseMat': `

${SHADER_LIBS['Lib:Noise']}

@stage(fragment)
fn main(input: FragmentInputs) -> FragmentOutputs {
  let out = snoise(vPosition).w;
  gl_FragColor = vec4<f32>((out * 0.5 + 0.5) * vec3<f32>(1.0, 1.0, 1.0), 1.0);
}

`,
}

async function main() {
  const canvas = document.getElementById('root');
  
  const engine = new WebGPUEngine(canvas, { preserveDrawingBuffer: true, stencil: true });
  await engine.initAsync();

  ShaderStore.ShadersStoreWGSL['SimplexNoiseMatVertexShader'] = SHADER_SOURCES['Vertex:SimplexNoiseMat'];
  ShaderStore.ShadersStoreWGSL['SimplexNoiseMatFragmentShader'] = SHADER_SOURCES['Fragment:SimplexNoiseMat'];

  const Buffers = {
    MarchingCubesEdgeCases: new StorageBuffer(engine, Utils.Buffer.Strides.UINT32 * 256),
    MarchingCubesTriangleCases: new StorageBuffer(engine, Utils.Buffer.Strides.INT32 * 4096),
    MarchingCubesGlobalOffset: new UniformBuffer(engine),
  };

  Buffers.MarchingCubesEdgeCases.update(EDGE_CASES);
  Buffers.MarchingCubesTriangleCases.update(TRIANGLE_CASES);

  const Shaders = {
    MarchingCubesMesh: new ComputeShader(
      'marching-cubes-mesh',
      engine,
      { computeSource: SHADER_SOURCES['Compute:MarchingCubesMesh'] },
      {
        bindingsMapping: {
          vertices: { group: 0, binding: 0 },
          edge_cases: { group: 0, binding: 1 },
          triangle_cases: { group: 0, binding: 2 },
          global_offset: { group: 1, binding: 0 },
        },
      },
    ),
  };

  /**
   * @param {BABYLON.Mesh} mesh 
   * @param {BABYLON.Buffer} buffer
   * @returns {BABYLON.Mesh}
   */
  function ApplyVertexBuffers(mesh, numVertices) {
    mesh.setVerticesBuffer(new VertexBuffer(engine, new Float32Array(Utils.Buffer.Strides.VERTEX * numVertices), VertexBuffer.PositionKind, true, undefined, 8, undefined, 0, 3));
    mesh.setVerticesBuffer(new VertexBuffer(engine, new Float32Array(Utils.Buffer.Strides.VERTEX * numVertices), VertexBuffer.NormalKind, true, undefined, 8, undefined, 4, 3));
    mesh.setIndices(Utils.Number.Range(numVertices), numVertices);
    return mesh;
  }

  /**
   * @param {BABYLON.Scene} scene
   * @param {string} name
   * @param {boolean | undefined} wireframe
   * @returns {{
   *  _mesh: BABYLON.Mesh
   *  _verticesBuffer: BABYLON.StorageBuffer
   * }}
   */
  function CreateTerrain(scene, name, wireframe = false) {
    const mesh = new Mesh(name, scene);
    const buffer = new StorageBuffer(engine, Utils.Buffer.Strides.VERTEX * 15 * $ENV.shaders.marchingCubes.computeShaderGrid.total);

    ApplyVertexBuffers(mesh, $ENV.shaders.marchingCubes.computeShaderGrid.total * 15);

    if (wireframe) {
      const mat = new StandardMaterial(name + '-mat', scene);
      mat.wireframe = true;
      mesh.material = mat;
    }

    return {
      _mesh: mesh,
      _verticesBuffer: buffer,
    };
  }

  /**
   * @param {{
   *  _mesh: BABYLON.Mesh
   *  _verticesBuffer: BABYLON.StorageBuffer
   * }} terrain 
   * @param {BABYLON.Vector3} position
   * @returns {Promise<{
   *  _mesh: BABYLON.Mesh
   *  _verticesBuffer: BABYLON.StorageBuffer
   * }>} 
   */
  async function UpdateTerrain(terrain, position) {
    /* Bind target buffers to shader. */
    Shaders.MarchingCubesMesh.setStorageBuffer('vertices', terrain._verticesBuffer);
    Buffers.MarchingCubesGlobalOffset.updateVector3('global_offset', position);
    Buffers.MarchingCubesGlobalOffset.update();

    /* Run the compute shader. */
    await Shaders.MarchingCubesMesh
      .dispatchWhenReady(
        $ENV.shaders.marchingCubes.numWorkgroups.x,
        $ENV.shaders.marchingCubes.numWorkgroups.y,
        $ENV.shaders.marchingCubes.numWorkgroups.z,
      );
    
    /* Read the data back at the CPU side, update vertices buffer */
    const vertices = new Float32Array((await terrain._verticesBuffer.read()).buffer);
    terrain._mesh.getVertexBuffer(VertexBuffer.PositionKind).update(vertices);
    terrain._mesh.getVertexBuffer(VertexBuffer.NormalKind).update(vertices);

    /* Update bounding box of the generated mesh. */
    terrain._mesh.position = position.clone();
    terrain._mesh.setBoundingInfo(new BoundingInfo(Vector3.Zero(), new Vector3($ENV.shaders.marchingCubes.computeShaderGrid.x, $ENV.shaders.marchingCubes.computeShaderGrid.y, $ENV.shaders.marchingCubes.computeShaderGrid.z)));

    return terrain;
  }

  /**
   * @param {BABYLON.Scene} scene
   * @param {string} name
   * @returns {BABYLON.Material} 
   */
  function CreateSimplexNoiseMat(scene, name) {
    const mat = new ShaderMaterial(
      name,
      scene,
      {
        vertex: 'SimplexNoiseMat',
        fragment: 'SimplexNoiseMat',
      },
      {
        attributes: ['position'],
        uniformBuffers: ['Scene', 'Mesh'],
        shaderLanguage: ShaderLanguage.WGSL,
      },
    );

    return mat;
  }

  function createScene() {
    const scene = new Scene(engine);
    const camera = new ArcRotateCamera('camera', 0.25 * PI, 0.25 * PI, 32, $ENV.world.center(), scene);
    camera.attachControl(canvas, false);

    const light = new HemisphericLight('light', Vector3.Up(), scene);

    const terrains = Utils.Number.Range(512).map(i => CreateTerrain(scene, `terrain-${i}`));

    Shaders.MarchingCubesMesh.setStorageBuffer('edge_cases', Buffers.MarchingCubesEdgeCases);
    Shaders.MarchingCubesMesh.setStorageBuffer('triangle_cases', Buffers.MarchingCubesTriangleCases);
    Shaders.MarchingCubesMesh.setUniformBuffer('global_offset', Buffers.MarchingCubesGlobalOffset);

    Utils.Task.Chain(
      terrains.map((terrain, i) =>
        () => UpdateTerrain(
          terrain,
          new Vector3(
            (Math.floor(i / 64) % 8) * $ENV.shaders.marchingCubes.computeShaderGrid.x,
            (Math.floor(i / 8) % 8) * $ENV.shaders.marchingCubes.computeShaderGrid.y,
            (i % 8) * $ENV.shaders.marchingCubes.computeShaderGrid.z,
          ),
      )),
    );

    return scene;
  }

  const scene = createScene();

  engine.runRenderLoop(function(){
    scene.render();
  });

  window.addEventListener('resize', function(){
    engine.resize();
  });
}

main()
