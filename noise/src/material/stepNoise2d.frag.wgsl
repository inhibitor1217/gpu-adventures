#include <color>
#include <mix>
#include <random/sine_fract>

varying uv: vec2<f32>;

const NOISE_FREQUENCY: vec3<f32> = vec3<f32>(8.0, 8.0, 0.001);

var<uniform> elapsedTimeMs: f32;
var<uniform> randomSeed : RANDOM__RandomSeed;

fn random3d(pos: vec3<f32>) -> f32 {
  return RANDOM_SINE_FRACT__random__f32_3d(pos, randomSeed);
}

fn noise3d(pos: vec3<f32>) -> f32 {
  let iPos = floor(pos);
  let fPos = fract(pos);

  return MIX__mix_hermite__f32(
    MIX__mix_hermite__f32(
      MIX__mix_hermite__f32(
        random3d(iPos + vec3<f32>(0.0, 0.0, 0.0)),
        random3d(iPos + vec3<f32>(1.0, 0.0, 0.0)),
        fPos.x,
      ),
      MIX__mix_hermite__f32(
        random3d(iPos + vec3<f32>(0.0, 1.0, 0.0)),
        random3d(iPos + vec3<f32>(1.0, 1.0, 0.0)),
        fPos.x,
      ),
      fPos.y,
    ),
    MIX__mix_hermite__f32(
      MIX__mix_hermite__f32(
        random3d(iPos + vec3<f32>(0.0, 0.0, 1.0)),
        random3d(iPos + vec3<f32>(1.0, 0.0, 1.0)),
        fPos.x,
      ),
      MIX__mix_hermite__f32(
        random3d(iPos + vec3<f32>(0.0, 1.0, 1.0)),
        random3d(iPos + vec3<f32>(1.0, 1.0, 1.0)),
        fPos.x,
      ),
      fPos.y,
    ),
    fPos.z,
  );
}

fn intensity_at(pos: vec2<f32>) -> f32 {
  return noise3d(vec3<f32>(pos, elapsedTimeMs) * NOISE_FREQUENCY);
}

@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
  fragmentOutputs.color = vec4<f32>(intensity_at(fragmentInputs.uv) * COLORS.WHITE.rgb, 1.0);
}
