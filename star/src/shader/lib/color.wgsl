struct _Colors {
  WHITE: vec4<f32>,
  BLACK: vec4<f32>,
  RED: vec4<f32>,
  GREEN: vec4<f32>,
  BLUE: vec4<f32>,
  YELLOW: vec4<f32>,
  MAGENTA: vec4<f32>,
  CYAN: vec4<f32>,
}

const COLORS: _Colors = _Colors(
  vec4<f32>(1.0, 1.0, 1.0, 1.0),
  vec4<f32>(0.0, 0.0, 0.0, 1.0),
  vec4<f32>(1.0, 0.0, 0.0, 1.0),
  vec4<f32>(0.0, 1.0, 0.0, 1.0),
  vec4<f32>(0.0, 0.0, 1.0, 1.0),
  vec4<f32>(1.0, 1.0, 0.0, 1.0),
  vec4<f32>(1.0, 0.0, 1.0, 1.0),
  vec4<f32>(0.0, 1.0, 1.0, 1.0)
);
