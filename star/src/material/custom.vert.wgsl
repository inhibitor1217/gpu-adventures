#include <sceneUboDeclaration>
#include <meshUboDeclaration>

attribute position: vec3<f32>;
attribute normal: vec3<f32>;

varying vNormal: vec3<f32>;

@vertex
fn main(input: VertexInputs) -> FragmentInputs {
  vertexOutputs.position = scene.viewProjection * mesh.world * vec4<f32>(vertexInputs.position, 1.0);
  vertexOutputs.vNormal = normalize((mesh.world * vec4<f32>(vertexInputs.normal, 0.0)).xyz);
}
