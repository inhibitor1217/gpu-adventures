import {
  ArcRotateCamera,
  Engine,
  MeshBuilder,
  Scene,
  ShaderLanguage,
  ShaderMaterial,
  ShaderStore,
  Vector3,
  WebGPUEngine,
} from 'babylonjs'

import './style.css'

async function prepareShaders(): Promise<void> {
  ShaderStore.ShadersStoreWGSL['customVertexShader'] = `
  #include<sceneUboDeclaration>
  #include<meshUboDeclaration>

  attribute position: vec3<f32>;
  attribute normal: vec3<f32>;

  varying vNormal: vec3<f32>;

  @vertex
  fn main(input: VertexInputs) -> FragmentInputs {
    vertexOutputs.position = scene.viewProjection * mesh.world * vec4<f32>(vertexInputs.position, 1.0);
    vertexOutputs.vNormal = normalize((mesh.world * vec4<f32>(vertexInputs.normal, 0.0)).xyz);
  }
  `

  ShaderStore.ShadersStoreWGSL['customFragmentShader'] = `
  varying vNormal: vec3<f32>;

  @fragment
  fn main(input: FragmentInputs) -> FragmentOutputs {
    var diffuse: f32 = clamp(dot(fragmentInputs.vNormal, vec3<f32>(0.0, 1.0, 0.0)), 0.0, 1.0);
    var lightColor: vec3<f32> = vec3<f32>(1.0, 1.0, 1.0);
    fragmentOutputs.color = vec4<f32>(diffuse * lightColor, 1.0);
  }
  `
}

async function prepare(canvas: HTMLCanvasElement): Promise<WebGPUEngine> {
  const engine = new WebGPUEngine(canvas)

  await engine.initAsync()
  await prepareShaders()

  window.addEventListener('resize', () => {
    engine.resize()
  })

  return engine
}

async function createScene(engine: Engine): Promise<Scene> {
  const scene = new Scene(engine)

  const camera = new ArcRotateCamera('camera', 0.25 * Math.PI, 0.25 * Math.PI, 5, Vector3.Zero(), scene)
  camera.setTarget(Vector3.Zero())
  camera.attachControl(engine.getRenderingCanvas(), true)

  const shaderMaterial = new ShaderMaterial(
    'custom',
    scene,
    {
      vertex: 'custom',
      fragment: 'custom',
    },
    {
      attributes: ['position', 'normal'],
      uniformBuffers: ['Scene', 'Mesh'],
      shaderLanguage: ShaderLanguage.WGSL,
    },
  )

  const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 2 }, scene)
  sphere.material = shaderMaterial
  sphere.position = Vector3.Zero()

  return scene
}

async function main() {
  const canvas = document.getElementById('root') as HTMLCanvasElement

  const engine = await prepare(canvas)
  const scene = await createScene(engine)

  engine.runRenderLoop(() => {
    scene.render()
  })
}

main()
