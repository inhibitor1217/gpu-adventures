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

async function createElapsedTimeUniformBuffer(engine: Engine): Promise<UniformBuffer> {
  let elapsedMs = 0
  const timeUbo = new UniformBuffer(engine)
  timeUbo.addUniform('elapsedTimeMs', [elapsedMs])
  timeUbo.update()

  engine.runRenderLoop(() => {
    elapsedMs += engine.getDeltaTime()
    timeUbo.updateFloat('elapsedTimeMs', elapsedMs)
    timeUbo.update()
  })

  return timeUbo
}

async function createScene(engine: Engine): Promise<Scene> {
  const scene = new Scene(engine)
  
  const camera = new ArcRotateCamera('camera', -0.5 * Math.PI, 0.5 * Math.PI, 4, Vector3.Zero(), scene)
  camera.setTarget(Vector3.Zero())
  camera.attachControl(engine.getRenderingCanvas(), true)

  const elapsedTimeUbo = await createElapsedTimeUniformBuffer(engine)

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

  stepNoise2dMat.setUniformBuffer('elapsedTimeMs', elapsedTimeUbo)

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
