#include <color>
#include <noise/perlin>

varying uv: vec2<f32>;

const FREQUENCY: vec3<f32> = vec3<f32>(16.0, 16.0, 0.001);

var<uniform> elapsedTimeMs: f32;

fn lines(pos: vec2<f32>) -> f32 {
  const LINE_NORMAL = normalize(vec2<f32>(1.0, -4.0));

  return smoothstep(
    0.15,
    0.30,
    abs(fract( dot(pos, LINE_NORMAL) ) - 0.5),
  );
}

fn rotate2d(angle: f32) -> mat2x2<f32> {
  return mat2x2<f32>(
    cos(angle), -sin(angle),
    sin(angle), cos(angle),
  );
}

fn intensity_at(pos: vec2<f32>) -> f32 {
  const DEFORM_AMPLITUDE = 0.5;
  const DEFORM_FREQUENCY = vec3<f32>(0.2, 0.4, 0.1);

  var sampledPos = vec3<f32>(pos, elapsedTimeMs) * FREQUENCY;
  return lines(rotate2d( DEFORM_AMPLITUDE * (-1. + 2. * NOISE_PERLIN__noise3d__f32(sampledPos * DEFORM_FREQUENCY)) ) * sampledPos.xy);
}

@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
  fragmentOutputs.color = vec4<f32>(intensity_at(fragmentInputs.uv) * COLORS.WHITE.rgb, 1.0);
}
