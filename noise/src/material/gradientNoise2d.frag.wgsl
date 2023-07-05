#include <color>
#include <mix>
#include <random/sine_fract>
#include <random/sine_fract_linker>
#include <random/ndim>

varying uv: vec2<f32>;

const NOISE_FREQUENCY: vec3<f32> = vec3<f32>(32.0, 32.0, 0.001);

var<uniform> elapsedTimeMs: f32;

fn randomGradient3d(pos: vec3<f32>) -> vec3<f32> {
  return -1.0 + RANDOM__random3d__f32_3d(pos) * 2.0;
}

fn gradientNoise3d(pos: vec3<f32>) -> f32 {
  let iPos = floor(pos);
  let fPos = fract(pos);

  let v000 = randomGradient3d(iPos + vec3<f32>(0.0, 0.0, 0.0));
  let v100 = randomGradient3d(iPos + vec3<f32>(1.0, 0.0, 0.0));
  let v010 = randomGradient3d(iPos + vec3<f32>(0.0, 1.0, 0.0));
  let v110 = randomGradient3d(iPos + vec3<f32>(1.0, 1.0, 0.0));
  let v001 = randomGradient3d(iPos + vec3<f32>(0.0, 0.0, 1.0));
  let v101 = randomGradient3d(iPos + vec3<f32>(1.0, 0.0, 1.0));
  let v011 = randomGradient3d(iPos + vec3<f32>(0.0, 1.0, 1.0));
  let v111 = randomGradient3d(iPos + vec3<f32>(1.0, 1.0, 1.0));

  return 0.5 + 0.5 * MIX__mix_hermite__f32(
    MIX__mix_hermite__f32(
      MIX__mix_hermite__f32(
        dot( v000, fPos - vec3<f32>(0.0, 0.0, 0.0) ),
        dot( v100, fPos - vec3<f32>(1.0, 0.0, 0.0) ),
        fPos.x,
      ),
      MIX__mix_hermite__f32(
        dot( v010, fPos - vec3<f32>(0.0, 1.0, 0.0) ),
        dot( v110, fPos - vec3<f32>(1.0, 1.0, 0.0) ),
        fPos.x,
      ),
      fPos.y,
    ),
    MIX__mix_hermite__f32(
      MIX__mix_hermite__f32(
        dot( v001, fPos - vec3<f32>(0.0, 0.0, 1.0) ),
        dot( v101, fPos - vec3<f32>(1.0, 0.0, 1.0) ),
        fPos.x,
      ),
      MIX__mix_hermite__f32(
        dot( v011, fPos - vec3<f32>(0.0, 1.0, 1.0) ),
        dot( v111, fPos - vec3<f32>(1.0, 1.0, 1.0) ),
        fPos.x,
      ),
      fPos.y,
    ),
    fPos.z,
  );
}

fn intensity_at(pos: vec2<f32>) -> f32 {
  return gradientNoise3d(vec3<f32>(pos, elapsedTimeMs) * NOISE_FREQUENCY);
}

@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
  fragmentOutputs.color = vec4<f32>(intensity_at(fragmentInputs.uv) * COLORS.WHITE.rgb, 1.0);
}
