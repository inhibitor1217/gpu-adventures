#include <color>
#include <random/sine_fract>
#include <random/sine_fract_linker>
#include <random/ndim>

varying uv: vec2<f32>;

var<uniform> elapsedTimeMs: f32;

const NOISE_FREQUENCY: vec3<f32> = vec3<f32>(4., 4., 0.001);

fn intensity_at(pos: vec2<f32>) -> f32 {
  let sampledPos = vec2<f32>(pos) * NOISE_FREQUENCY.xy;
  
  let iPos = floor(sampledPos);
  let fPos = fract(sampledPos);

  var dist = 1.;

  for (var i = -1; i <= 1; i = i + 1) {
    for (var j = -1; j <= 1; j = j + 1) {
      let neighbor = vec2<f32>(f32(i), f32(j));
      var point = RANDOM__random2d__f32_2d(iPos + neighbor);
      point = .5 + .5 * sin(4. * point + elapsedTimeMs * NOISE_FREQUENCY.zz);
      let diff = neighbor + point - fPos;
      dist = min(dist, length(diff));
    }
  }

  var intensity = dist;

  // Draw the point
  intensity += 1. - step(.02, dist);

  // Draw the grid
  // intensity += 1. - step(.02, fract(sampledPos.x)) * step(.02, fract(sampledPos.y));

  return intensity;
}

@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
  fragmentOutputs.color = vec4<f32>(intensity_at(fragmentInputs.uv) * COLORS.WHITE.rgb, 1.0);
}
