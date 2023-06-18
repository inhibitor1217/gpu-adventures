varying vNormal: vec3<f32>;

@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
  var diffuse: f32 = clamp(dot(fragmentInputs.vNormal, vec3<f32>(0.0, 1.0, 0.0)), 0.0, 1.0);
  var lightColor: vec3<f32> = vec3<f32>(1.0, 1.0, 1.0);
  fragmentOutputs.color = vec4<f32>(diffuse * lightColor, 1.0);
}
