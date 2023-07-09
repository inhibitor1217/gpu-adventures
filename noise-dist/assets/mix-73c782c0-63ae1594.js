const e=`fn MIX__hermite(t: f32) -> f32 {
  return t * t * (3.0 - 2.0 * t);
}

fn MIX__mix_hermite__f32(a: f32, b: f32, t: f32) -> f32 {
  return mix(a, b, MIX__hermite(t));
}

fn MIX__mix_hermite__f32_2d(a: vec2<f32>, b: vec2<f32>, t: f32) -> vec2<f32> {
  return mix(a, b, MIX__hermite(t));
}

fn MIX__mix_hermite__f32_3d(a: vec3<f32>, b: vec3<f32>, t: f32) -> vec3<f32> {
  return mix(a, b, MIX__hermite(t));
}

fn MIX__mix_hermite__f32_4d(a: vec4<f32>, b: vec4<f32>, t: f32) -> vec4<f32> {
  return mix(a, b, MIX__hermite(t));
}
`;export{e as default};
