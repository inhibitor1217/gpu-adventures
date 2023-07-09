#include <color>
#include <noise/simplex>

varying uv: vec2<f32>;

const NOISE_FREQUENCY: vec3<f32> = vec3<f32>(16.0, 16.0, 0.001);

var<uniform> elapsedTimeMs: f32;

fn intensity_at(pos: vec2<f32>) -> f32 {
  return .5 + .5 * NOISE_SIMPLEX__noise3d__f32(vec3<f32>(pos, elapsedTimeMs) * NOISE_FREQUENCY);
}

@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
  fragmentOutputs.color = vec4<f32>(intensity_at(fragmentInputs.uv) * COLORS.WHITE.rgb, 1.0);
}
