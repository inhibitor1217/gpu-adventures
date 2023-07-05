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

async function createShaderMaterial(
  engine: Engine,
  scene: Scene,
  shader: string
): Promise<ShaderMaterial> {
  const elapsedTimeUbo = await createElapsedTimeUniformBuffer(engine)

  const material = new ShaderMaterial(
    'stepNoise2d',
    scene,
    {
      vertex: shader,
      fragment: shader,
    },
    {
      attributes: ['position', 'normal', 'uv'],
      uniformBuffers: ['Scene', 'Mesh'],
      shaderLanguage: ShaderLanguage.WGSL,
    },
  )

  material.setUniformBuffer('elapsedTimeMs', elapsedTimeUbo)

  return material
}

async function createScene(engine: Engine): Promise<Scene> {
  const scene = new Scene(engine)
  
  const camera = new ArcRotateCamera('camera', -0.5 * Math.PI, 0.5 * Math.PI, 5, Vector3.Zero(), scene)
  camera.setTarget(Vector3.Zero())
  camera.attachControl(engine.getRenderingCanvas(), true)

  const stepNoiseMat = await createShaderMaterial(engine, scene, 'stepNoise2d')
  const gradientNoiseMat = await createShaderMaterial(engine, scene, 'gradientNoise2d')
  const swirlyLinesMat = await createShaderMaterial(engine, scene, 'swirlyLines')

  const stepNoiseQuad = MeshBuilder.CreatePlane('quad', { size: 2 }, scene)
  stepNoiseQuad.position = new Vector3(-2.2, 0, 0)
  stepNoiseQuad.material = stepNoiseMat

  const gradientNoiseQuad = MeshBuilder.CreatePlane('quad', { size: 2 }, scene)
  gradientNoiseQuad.position = new Vector3(2.2, 0, 0)
  gradientNoiseQuad.material = gradientNoiseMat

  const swirlyLinesQuad = MeshBuilder.CreatePlane('quad', { size: 2 }, scene)
  swirlyLinesQuad.position = new Vector3(0, 0, 0)
  swirlyLinesQuad.material = swirlyLinesMat

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
