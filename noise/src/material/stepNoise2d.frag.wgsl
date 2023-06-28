#include <color>
#include <mix>
#include <random/sine_fract>

varying uv: vec2<f32>;

const NOISE_FREQUENCY: vec2<f32> = vec2<f32>(8.0, 8.0);

var<uniform> randomSeed : RANDOM__RandomSeed;

fn random2d(pos: vec2<f32>) -> f32 {
  return RANDOM_SINE_FRACT__random__f32_2d(pos, randomSeed);
}

fn intensity_at(pos: vec2<f32>) -> f32 {
  let sampledPos = pos * NOISE_FREQUENCY;
  
  let iPos = floor(sampledPos);
  let fPos = fract(sampledPos);

  return MIX__mix_hermite__f32(
    MIX__mix_hermite__f32(random2d(iPos), random2d(iPos + vec2<f32>(1.0, 0.0)), fPos.x),
    MIX__mix_hermite__f32(random2d(iPos + vec2<f32>(0.0, 1.0)), random2d(iPos + vec2<f32>(1.0, 1.0)), fPos.x),
    fPos.y
  );
}

@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
  fragmentOutputs.color = vec4<f32>(intensity_at(fragmentInputs.uv) * COLORS.WHITE.rgb, 1.0);
}
