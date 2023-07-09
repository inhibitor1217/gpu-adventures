const _=`#include <mix>
#include <random/sine_fract>
#include <random/sine_fract_linker>
#include <random/ndim>

fn NOISE_VALUE__noise__f32(pos: f32) -> f32 {
  let iPos = floor(pos);
  let fPos = fract(pos);

  return MIX__mix_hermite__f32(
    RANDOM__random__f32(iPos),
    RANDOM__random__f32(iPos + 1.),
    fPos
  );
}

fn NOISE_VALUE__noise2d__f32(pos: vec2<f32>) -> f32 {
  let iPos = floor(pos);
  let fPos = fract(pos);

  let v00 = RANDOM__random__f32_2d(iPos);
  let v10 = RANDOM__random__f32_2d(iPos + vec2<f32>(1., 0.));
  let v01 = RANDOM__random__f32_2d(iPos + vec2<f32>(0., 1.));
  let v11 = RANDOM__random__f32_2d(iPos + vec2<f32>(1., 1.));

  return MIX__mix_hermite__f32(
    MIX__mix_hermite__f32(v00, v10, fPos.x),
    MIX__mix_hermite__f32(v01, v11, fPos.x),
    fPos.y
  );
}

fn NOISE_VALUE__noise3d__f32(pos: vec3<f32>) -> f32 {
  let iPos = floor(pos);
  let fPos = fract(pos);

  let v000 = RANDOM__random__f32_3d(iPos);
  let v100 = RANDOM__random__f32_3d(iPos + vec3<f32>(1., 0., 0.));
  let v010 = RANDOM__random__f32_3d(iPos + vec3<f32>(0., 1., 0.));
  let v110 = RANDOM__random__f32_3d(iPos + vec3<f32>(1., 1., 0.));
  let v001 = RANDOM__random__f32_3d(iPos + vec3<f32>(0., 0., 1.));
  let v101 = RANDOM__random__f32_3d(iPos + vec3<f32>(1., 0., 1.));
  let v011 = RANDOM__random__f32_3d(iPos + vec3<f32>(0., 1., 1.));
  let v111 = RANDOM__random__f32_3d(iPos + vec3<f32>(1., 1., 1.));

  return MIX__mix_hermite__f32(
    MIX__mix_hermite__f32(
      MIX__mix_hermite__f32(v000, v100, fPos.x),
      MIX__mix_hermite__f32(v010, v110, fPos.x),
      fPos.y
    ),
    MIX__mix_hermite__f32(
      MIX__mix_hermite__f32(v001, v101, fPos.x),
      MIX__mix_hermite__f32(v011, v111, fPos.x),
      fPos.y
    ),
    fPos.z
  );
}

fn NOISE_VALUE__noise4d__f32(pos: vec4<f32>) -> f32 {
  let iPos = floor(pos);
  let fPos = fract(pos);

  let v0000 = RANDOM__random__f32_4d(iPos);
  let v1000 = RANDOM__random__f32_4d(iPos + vec4<f32>(1., 0., 0., 0.));
  let v0100 = RANDOM__random__f32_4d(iPos + vec4<f32>(0., 1., 0., 0.));
  let v1100 = RANDOM__random__f32_4d(iPos + vec4<f32>(1., 1., 0., 0.));
  let v0010 = RANDOM__random__f32_4d(iPos + vec4<f32>(0., 0., 1., 0.));
  let v1010 = RANDOM__random__f32_4d(iPos + vec4<f32>(1., 0., 1., 0.));
  let v0110 = RANDOM__random__f32_4d(iPos + vec4<f32>(0., 1., 1., 0.));
  let v1110 = RANDOM__random__f32_4d(iPos + vec4<f32>(1., 1., 1., 0.));
  let v0001 = RANDOM__random__f32_4d(iPos + vec4<f32>(0., 0., 0., 1.));
  let v1001 = RANDOM__random__f32_4d(iPos + vec4<f32>(1., 0., 0., 1.));
  let v0101 = RANDOM__random__f32_4d(iPos + vec4<f32>(0., 1., 0., 1.));
  let v1101 = RANDOM__random__f32_4d(iPos + vec4<f32>(1., 1., 0., 1.));
  let v0011 = RANDOM__random__f32_4d(iPos + vec4<f32>(0., 0., 1., 1.));
  let v1011 = RANDOM__random__f32_4d(iPos + vec4<f32>(1., 0., 1., 1.));
  let v0111 = RANDOM__random__f32_4d(iPos + vec4<f32>(0., 1., 1., 1.));
  let v1111 = RANDOM__random__f32_4d(iPos + vec4<f32>(1., 1., 1., 1.));

  return MIX__mix_hermite__f32(
    MIX__mix_hermite__f32(
      MIX__mix_hermite__f32(
        MIX__mix_hermite__f32(v0000, v1000, fPos.x),
        MIX__mix_hermite__f32(v0100, v1100, fPos.x),
        fPos.y
      ),
      MIX__mix_hermite__f32(
        MIX__mix_hermite__f32(v0010, v1010, fPos.x),
        MIX__mix_hermite__f32(v0110, v1110, fPos.x),
        fPos.y
      ),
      fPos.z
    ),
    MIX__mix_hermite__f32(
      MIX__mix_hermite__f32(
        MIX__mix_hermite__f32(v0001, v1001, fPos.x),
        MIX__mix_hermite__f32(v0101, v1101, fPos.x),
        fPos.y
      ),
      MIX__mix_hermite__f32(
        MIX__mix_hermite__f32(v0011, v1011, fPos.x),
        MIX__mix_hermite__f32(v0111, v1111, fPos.x),
        fPos.y
      ),
      fPos.z
    ),
    fPos.w
  );
}
`;export{_ as default};
