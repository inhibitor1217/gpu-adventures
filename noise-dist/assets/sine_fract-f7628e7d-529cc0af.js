const _=`struct _RANDOM_SINE_FRACT__RandomSeed {
  a: vec4<f32>,
  b: f32,
};

const _RANDOM_SINCE_FRACT__randomSeed: _RANDOM_SINE_FRACT__RandomSeed = _RANDOM_SINE_FRACT__RandomSeed(
  vec4<f32>(
    29.898,
    78.233,
    37.719,
    63.137,
  ),
  45405.32359,
);

fn RANDOM_SINE_FRACT__random__f32(value: f32) -> f32 {
  return fract(sin(value * _RANDOM_SINCE_FRACT__randomSeed.a.x) * _RANDOM_SINCE_FRACT__randomSeed.b);
}

fn RANDOM_SINE_FRACT__random__f32_2d(value: vec2<f32>) -> f32 {
  return fract(sin(dot(value, _RANDOM_SINCE_FRACT__randomSeed.a.xy)) * _RANDOM_SINCE_FRACT__randomSeed.b);
}

fn RANDOM_SINE_FRACT__random__f32_3d(value: vec3<f32>) -> f32 {
  return fract(sin(dot(value, _RANDOM_SINCE_FRACT__randomSeed.a.xyz)) * _RANDOM_SINCE_FRACT__randomSeed.b);
}

fn RANDOM_SINE_FRACT__random__f32_4d(value: vec4<f32>) -> f32 {
  return fract(sin(dot(value, _RANDOM_SINCE_FRACT__randomSeed.a)) * _RANDOM_SINCE_FRACT__randomSeed.b);
}
`;export{_ as default};
