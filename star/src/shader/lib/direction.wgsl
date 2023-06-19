struct _Directions {
  UP: vec3<f32>,
  DOWN: vec3<f32>,
  RIGHT: vec3<f32>,
  LEFT: vec3<f32>,
  FORWARD: vec3<f32>,
  BACKWARD: vec3<f32>,
  ZERO: vec3<f32>,
  ONE: vec3<f32>,
}

const DIRECTIONS: _Directions = _Directions(
  vec3<f32>(0.0, 1.0, 0.0),
  vec3<f32>(0.0, -1.0, 0.0),
  vec3<f32>(1.0, 0.0, 0.0),
  vec3<f32>(-1.0, 0.0, 0.0),
  vec3<f32>(0.0, 0.0, 1.0),
  vec3<f32>(0.0, 0.0, -1.0),
  vec3<f32>(0.0, 0.0, 0.0),
  vec3<f32>(1.0, 1.0, 1.0),
);
