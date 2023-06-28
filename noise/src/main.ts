import {
  ArcRotateCamera,
  Engine,
  MeshBuilder,
  Scene,
  ShaderLanguage,
  ShaderMaterial,
  UniformBuffer,
  Vector3,
  WebGPUEngine,
} from '@babylonjs/core'
import {
  loadWGSLShaders,
} from '@inhibitor1217/babylonjs-wgsl'

import './style.css'

async function prepare(canvas: HTMLCanvasElement): Promise<WebGPUEngine> {
  const engine = new WebGPUEngine(canvas)

  await engine.initAsync()
  await loadWGSLShaders(await import.meta.glob('./material/**/*.wgsl', { as: 'raw' }))

  window.addEventListener('resize', () => {
    engine.resize()
  })

  return engine
}

async function createRandomSeedUniformBuffer(engine: Engine): Promise<UniformBuffer> {
  const randomSeedUbo = new UniformBuffer(engine)
  randomSeedUbo.addUniform('randomSeed', [
    12.9898,
    78.233,
    37.719,
    63.137,
    43758.5453,
  ])
  randomSeedUbo.update()

  return randomSeedUbo
}

async function createScene(engine: Engine): Promise<Scene> {
  const scene = new Scene(engine)
  
  const camera = new ArcRotateCamera('camera', -0.5 * Math.PI, 0.5 * Math.PI, 4, Vector3.Zero(), scene)
  camera.setTarget(Vector3.Zero())
  camera.attachControl(engine.getRenderingCanvas(), true)

  const randomSeedUbo = await createRandomSeedUniformBuffer(engine)

  const stepNoise2dMat = new ShaderMaterial(
    'stepNoise2d',
    scene,
    {
      vertex: 'stepNoise2d',
      fragment: 'stepNoise2d',
    },
    {
      attributes: ['position', 'normal', 'uv'],
      uniformBuffers: ['Scene', 'Mesh'],
      shaderLanguage: ShaderLanguage.WGSL,
    },
  )

  stepNoise2dMat.setUniformBuffer('randomSeed', randomSeedUbo)

  const quad = MeshBuilder.CreatePlane('quad', { size: 2 }, scene)
  quad.position = Vector3.Zero()
  quad.material = stepNoise2dMat

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
