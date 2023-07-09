const _=`fn RANDOM__random__f32(value: f32) -> f32 {
  return RANDOM_SINE_FRACT__random__f32(value);
}

fn RANDOM__random__f32_2d(value: vec2<f32>) -> f32 {
  return RANDOM_SINE_FRACT__random__f32_2d(value);
}

fn RANDOM__random__f32_3d(value: vec3<f32>) -> f32 {
  return RANDOM_SINE_FRACT__random__f32_3d(value);
}

fn RANDOM__random__f32_4d(value: vec4<f32>) -> f32 {
  return RANDOM_SINE_FRACT__random__f32_4d(value);
}
`;export{_ as default};
