#include <color>
#include <random/sine_fract>

varying worldPosition: vec3<f32>;

var<uniform> randomSeed: RANDOM__RandomSeed;
var<uniform> elapsedTimeMs: f32;

const RESOLUTION: vec2<f32> = vec2<f32>(16.0, 16.0);
const MIN_SPEED: f32 = 0.03;
const MAX_SPEED: f32 = 0.20;
const MIN_DENSITY: f32 = 0.8;
const MAX_DENSITY: f32 = 1.5;
const STREAM_WIDTH: f32 = 0.03;

fn random1d(value: f32) -> f32 {
  return RANDOM_SINE_FRACT__random__f32(value, randomSeed);
}

fn random2d(value: vec2<f32>) -> f32 {
  return RANDOM_SINE_FRACT__random__f32_2d(value, randomSeed);
}

fn intensity_at(position: vec3<f32>) -> f32 {
  let iRow = random1d(floor(position.y * RESOLUTION.y));
  let speed = mix(MIN_SPEED, MAX_SPEED, iRow);
  let density = mix(MIN_DENSITY, MAX_DENSITY, iRow);
  let sampledPos = vec2<f32>(position.xy * RESOLUTION + vec2<f32>(-speed * elapsedTimeMs, 0.0));
  let sample = (
    random2d(floor(sampledPos)) +
    sin((1 / STREAM_WIDTH) * iRow + sampledPos.x * STREAM_WIDTH)
  );
  return step(sample, density);
}

@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
  fragmentOutputs.color = vec4<f32>(intensity_at(fragmentInputs.worldPosition) * COLORS.WHITE.rgb, 1.0);
}
