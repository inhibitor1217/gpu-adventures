#include <color>
#include <random/sine_fract>

varying worldPosition: vec3<f32>;

var<uniform> randomSeed: RANDOM__RandomSeed;
var<uniform> elapsedTimeMs: f32;

const ROWS_RESOLUTION: f32 = 1.0;
const COLUMNS_MIN_RESOLUTION: f32 = 8.0;
const COLUMNS_MAX_RESOLUTION: f32 = 32.0;
const SPEED_COEFF: f32 = 0.2;
const DENSITY_COEFF: f32 = 0.7;
const UPDATE_INTERVAL_MS: f32 = 3000.0;

fn random1d(value: f32) -> f32 {
  return RANDOM_SINE_FRACT__random__f32(value, randomSeed);
}

fn random2d(value: vec2<f32>) -> f32 {
  return RANDOM_SINE_FRACT__random__f32_2d(value, randomSeed);
}

fn intensity_at(position: vec3<f32>) -> f32 {
  let xSpeed = SPEED_COEFF * (random1d(floor(position.y * ROWS_RESOLUTION) + floor(elapsedTimeMs / UPDATE_INTERVAL_MS)) - 0.5);
  let xResolution = mix(COLUMNS_MIN_RESOLUTION, COLUMNS_MAX_RESOLUTION, random1d(floor(elapsedTimeMs / UPDATE_INTERVAL_MS)));
  let sampledPos = vec2<f32>(
    position.x * xResolution + elapsedTimeMs * xSpeed,
    position.y * ROWS_RESOLUTION
  );
  let sample = random2d(floor(sampledPos));
  return step(sample, DENSITY_COEFF);
}

@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
  fragmentOutputs.color = vec4<f32>(intensity_at(fragmentInputs.worldPosition) * COLORS.WHITE.rgb, 1.0);
}
