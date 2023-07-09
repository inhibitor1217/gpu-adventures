#include <color>
#include <noise/perlin>

varying uv: vec2<f32>;

const FREQUENCY: vec3<f32> = vec3<f32>(5.0, 5.0, 0.0003);

var<uniform> elapsedTimeMs: f32;

fn rotate2d(angle: f32) -> mat2x2<f32> {
  return mat2x2<f32>(
    cos(angle), -sin(angle),
    sin(angle), cos(angle),
  );
}

fn intensity_at(pos: vec2<f32>) -> f32 {
  const HOLES_FREQUENCY: vec3<f32> = vec3<f32>(4.0, 4.0, 1.0);

  var sampledPos = vec3<f32>(pos, 0.0) * FREQUENCY;
  sampledPos += 10. * sin(elapsedTimeMs * FREQUENCY.z) * (-1. + 2. * NOISE_PERLIN__noise3d__f32(sampledPos));

  var intensity = smoothstep(-.20, -.18, (-1. + 2. * NOISE_PERLIN__noise3d__f32(sampledPos)));
  intensity -= smoothstep(.15, .20, (-1. + 2. * NOISE_PERLIN__noise3d__f32(sampledPos * HOLES_FREQUENCY)));
  intensity += smoothstep(.35, .40, (-1. + 2. * NOISE_PERLIN__noise3d__f32(sampledPos * HOLES_FREQUENCY)));
  return intensity;
}

@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
  fragmentOutputs.color = vec4<f32>(intensity_at(fragmentInputs.uv) * COLORS.WHITE.rgb, 1.0);
}
