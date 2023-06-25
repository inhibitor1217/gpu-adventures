#include <color>
#include <random/sine_fract>

varying worldPosition: vec3<f32>;

var<uniform> randomSeed: RANDOM__RandomSeed;
var<uniform> elapsedTimeMs: f32;

fn random(value: vec4<f32>) -> f32 {
  return RANDOM_SINE_FRACT__random__f32_4d(value, randomSeed);
}

@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
  fragmentOutputs.color = vec4<f32>(random(vec4<f32>(fragmentInputs.worldPosition, elapsedTimeMs * 0.001)) * COLORS.WHITE.rgb, 1.0);
}
