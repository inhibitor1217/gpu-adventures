#include <color>
#include <mix>
#include <random/sine_fract>
#include <random/sine_fract_linker>
#include <random/ndim>

varying uv: vec2<f32>;

const FREQUENCY: vec3<f32> = vec3<f32>(16.0, 16.0, 0.001);

var<uniform> elapsedTimeMs: f32;

fn randomGradient3d(pos: vec3<f32>) -> vec3<f32> {
  return -1.0 + RANDOM__random3d__f32_3d(pos) * 2.0;
}

fn noise(pos: vec3<f32>) -> f32 {
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

  return MIX__mix_hermite__f32(
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
  return lines(rotate2d( DEFORM_AMPLITUDE * noise(sampledPos * DEFORM_FREQUENCY) ) * sampledPos.xy);
}

@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
  fragmentOutputs.color = vec4<f32>(intensity_at(fragmentInputs.uv) * COLORS.WHITE.rgb, 1.0);
}
