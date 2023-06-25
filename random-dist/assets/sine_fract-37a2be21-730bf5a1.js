const e=`struct RANDOM__RandomSeed {
  a: vec4<f32>,
  b: f32,
};

fn RANDOM_SINE_FRACT__random__f32(value: f32, seed: RANDOM__RandomSeed) -> f32 {
  return fract(sin(value * seed.a.x) * seed.b);
}

fn RANDOM_SINE_FRACT__random__f32_2d(value: vec2<f32>, seed: RANDOM__RandomSeed) -> f32 {
  return fract(sin(dot(value, seed.a.xy)) * seed.b);
}

fn RANDOM_SINE_FRACT__random__f32_3d(value: vec3<f32>, seed: RANDOM__RandomSeed) -> f32 {
  return fract(sin(dot(value, seed.a.xyz)) * seed.b);
}

fn RANDOM_SINE_FRACT__random__f32_4d(value: vec4<f32>, seed: RANDOM__RandomSeed) -> f32 {
  return fract(sin(dot(value, seed.a)) * seed.b);
}
`;export{e as default};
