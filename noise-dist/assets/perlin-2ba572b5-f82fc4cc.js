const _=`#include <mix>
#include <random/sine_fract>
#include <random/sine_fract_linker>
#include <random/ndim>

fn NOISE_PERLIN__noise__f32(pos: f32) -> f32 {
  let iPos = floor(pos);
  let fPos = fract(pos);

  let v0 = -1. + 2. * RANDOM__random__f32(iPos);
  let v1 = -1. + 2. * RANDOM__random__f32(iPos + 1.);

  return .5 + .5 * MIX__mix_hermite__f32(
    v0 * fPos,
    v1 * (fPos - 1.),
    fPos
  );
}

fn NOISE_PERLIN__noise2d__f32(pos: vec2<f32>) -> f32 {
  let iPos = floor(pos);
  let fPos = fract(pos);

  let v00 = -1. + 2. * RANDOM__random2d__f32_2d(iPos);
  let v10 = -1. + 2. * RANDOM__random2d__f32_2d(iPos + vec2<f32>(1., 0.));
  let v01 = -1. + 2. * RANDOM__random2d__f32_2d(iPos + vec2<f32>(0., 1.));
  let v11 = -1. + 2. * RANDOM__random2d__f32_2d(iPos + vec2<f32>(1., 1.));

  return .5 + .5 * MIX__mix_hermite__f32(
    MIX__mix_hermite__f32(
      dot( v00, fPos ),
      dot( v10, fPos - vec2<f32>(1., 0.) ),
      fPos.x
    ),
    MIX__mix_hermite__f32(
      dot( v01, fPos - vec2<f32>(0., 1.) ),
      dot( v11, fPos - vec2<f32>(1., 1.) ),
      fPos.x
    ),
    fPos.y
  );
}

fn NOISE_PERLIN__noise3d__f32(pos: vec3<f32>) -> f32 {
  let iPos = floor(pos);
  let fPos = fract(pos);

  let v000 = -1. + 2. * RANDOM__random3d__f32_3d(iPos);
  let v100 = -1. + 2. * RANDOM__random3d__f32_3d(iPos + vec3<f32>(1., 0., 0.));
  let v010 = -1. + 2. * RANDOM__random3d__f32_3d(iPos + vec3<f32>(0., 1., 0.));
  let v110 = -1. + 2. * RANDOM__random3d__f32_3d(iPos + vec3<f32>(1., 1., 0.));
  let v001 = -1. + 2. * RANDOM__random3d__f32_3d(iPos + vec3<f32>(0., 0., 1.));
  let v101 = -1. + 2. * RANDOM__random3d__f32_3d(iPos + vec3<f32>(1., 0., 1.));
  let v011 = -1. + 2. * RANDOM__random3d__f32_3d(iPos + vec3<f32>(0., 1., 1.));
  let v111 = -1. + 2. * RANDOM__random3d__f32_3d(iPos + vec3<f32>(1., 1., 1.));

  return .5 + .5 * MIX__mix_hermite__f32(
    MIX__mix_hermite__f32(
      MIX__mix_hermite__f32(
        dot( v000, fPos ),
        dot( v100, fPos - vec3<f32>(1., 0., 0.) ),
        fPos.x
      ),
      MIX__mix_hermite__f32(
        dot( v010, fPos - vec3<f32>(0., 1., 0.) ),
        dot( v110, fPos - vec3<f32>(1., 1., 0.) ),
        fPos.x
      ),
      fPos.y
    ),
    MIX__mix_hermite__f32(
      MIX__mix_hermite__f32(
        dot( v001, fPos - vec3<f32>(0., 0., 1.) ),
        dot( v101, fPos - vec3<f32>(1., 0., 1.) ),
        fPos.x
      ),
      MIX__mix_hermite__f32(
        dot( v011, fPos - vec3<f32>(0., 1., 1.) ),
        dot( v111, fPos - vec3<f32>(1., 1., 1.) ),
        fPos.x
      ),
      fPos.y
    ),
    fPos.z
  );
}

fn NOISE_PERLIN__noise4d__f32(pos: vec4<f32>) -> f32 {
  let iPos = floor(pos);
  let fPos = fract(pos);

  let v0000 = -1. + 2. * RANDOM__random4d__f32_4d(iPos);
  let v1000 = -1. + 2. * RANDOM__random4d__f32_4d(iPos + vec4<f32>(1., 0., 0., 0.));
  let v0100 = -1. + 2. * RANDOM__random4d__f32_4d(iPos + vec4<f32>(0., 1., 0., 0.));
  let v1100 = -1. + 2. * RANDOM__random4d__f32_4d(iPos + vec4<f32>(1., 1., 0., 0.));
  let v0010 = -1. + 2. * RANDOM__random4d__f32_4d(iPos + vec4<f32>(0., 0., 1., 0.));
  let v1010 = -1. + 2. * RANDOM__random4d__f32_4d(iPos + vec4<f32>(1., 0., 1., 0.));
  let v0110 = -1. + 2. * RANDOM__random4d__f32_4d(iPos + vec4<f32>(0., 1., 1., 0.));
  let v1110 = -1. + 2. * RANDOM__random4d__f32_4d(iPos + vec4<f32>(1., 1., 1., 0.));
  let v0001 = -1. + 2. * RANDOM__random4d__f32_4d(iPos + vec4<f32>(0., 0., 0., 1.));
  let v1001 = -1. + 2. * RANDOM__random4d__f32_4d(iPos + vec4<f32>(1., 0., 0., 1.));
  let v0101 = -1. + 2. * RANDOM__random4d__f32_4d(iPos + vec4<f32>(0., 1., 0., 1.));
  let v1101 = -1. + 2. * RANDOM__random4d__f32_4d(iPos + vec4<f32>(1., 1., 0., 1.));
  let v0011 = -1. + 2. * RANDOM__random4d__f32_4d(iPos + vec4<f32>(0., 0., 1., 1.));
  let v1011 = -1. + 2. * RANDOM__random4d__f32_4d(iPos + vec4<f32>(1., 0., 1., 1.));
  let v0111 = -1. + 2. * RANDOM__random4d__f32_4d(iPos + vec4<f32>(0., 1., 1., 1.));
  let v1111 = -1. + 2. * RANDOM__random4d__f32_4d(iPos + vec4<f32>(1., 1., 1., 1.));

  return .5 + .5 * MIX__mix_hermite__f32(
    MIX__mix_hermite__f32(
      MIX__mix_hermite__f32(
        MIX__mix_hermite__f32(
          dot( v0000, fPos ),
          dot( v1000, fPos - vec4<f32>(1., 0., 0., 0.) ),
          fPos.x
        ),
        MIX__mix_hermite__f32(
          dot( v0100, fPos - vec4<f32>(0., 1., 0., 0.) ),
          dot( v1100, fPos - vec4<f32>(1., 1., 0., 0.) ),
          fPos.x
        ),
        fPos.y
      ),
      MIX__mix_hermite__f32(
        MIX__mix_hermite__f32(
          dot( v0010, fPos - vec4<f32>(0., 0., 1., 0.) ),
          dot( v1010, fPos - vec4<f32>(1., 0., 1., 0.) ),
          fPos.x
        ),
        MIX__mix_hermite__f32(
          dot( v0110, fPos - vec4<f32>(0., 1., 1., 0.) ),
          dot( v1110, fPos - vec4<f32>(1., 1., 1., 0.) ),
          fPos.x
        ),
        fPos.y
      ),
      fPos.z
    ),
    MIX__mix_hermite__f32(
      MIX__mix_hermite__f32(
        MIX__mix_hermite__f32(
          dot( v0001, fPos - vec4<f32>(0., 0., 0., 1.) ),
          dot( v1001, fPos - vec4<f32>(1., 0., 0., 1.) ),
          fPos.x
        ),
        MIX__mix_hermite__f32(
          dot( v0101, fPos - vec4<f32>(0., 1., 0., 1.) ),
          dot( v1101, fPos - vec4<f32>(1., 1., 0., 1.) ),
          fPos.x
        ),
        fPos.y
      ),
      MIX__mix_hermite__f32(
        MIX__mix_hermite__f32(
          dot( v0011, fPos - vec4<f32>(0., 0., 1., 1.) ),
          dot( v1011, fPos - vec4<f32>(1., 0., 1., 1.) ),
          fPos.x
        ),
        MIX__mix_hermite__f32(
          dot( v0111, fPos - vec4<f32>(0., 1., 1., 1.) ),
          dot( v1111, fPos - vec4<f32>(1., 1., 1., 1.) ),
          fPos.x
        ),
        fPos.y
      ),
      fPos.z
    ),
    fPos.w,
  );
}
`;export{_ as default};
