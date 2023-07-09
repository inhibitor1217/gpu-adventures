const _=`fn NOISE__noise__f32(pos: f32) -> f32 {
  return NOISE_PERLIN__noise_f32(pos);
}

fn NOISE__noise2d__f32(pos: vec2<f32>) -> f32 {
  return NOISE_PERLIN__noise2d_f32(pos);
}

fn NOISE__noise3d__f32(pos: vec3<f32>) -> f32 {
  return NOISE_PERLIN__noise3d_f32(pos);
}

fn NOISE__noise4d__f32(pos: vec4<f32>) -> f32 {
  return NOISE_PERLIN__noise4d_f32(pos);
}
`;export{_ as default};
