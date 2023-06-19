#include <color>
#include <direction>

varying vNormal: vec3<f32>;

@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
  var diffuse: f32 = clamp(dot(fragmentInputs.vNormal, DIRECTIONS.UP), 0.0, 1.0);
  fragmentOutputs.color = vec4<f32>(diffuse * COLORS.WHITE.rgb, 1.0);
}
