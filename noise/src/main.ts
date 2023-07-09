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
  
  const camera = new ArcRotateCamera('camera', -0.5 * Math.PI, 0.5 * Math.PI, 8, Vector3.Zero(), scene)
  camera.setTarget(Vector3.Zero())
  camera.attachControl(engine.getRenderingCanvas(), true)

  const stepNoiseMat = await createShaderMaterial(engine, scene, 'stepNoise2d')
  const gradientNoiseMat = await createShaderMaterial(engine, scene, 'gradientNoise2d')
  const simplexNoiseMat = await createShaderMaterial(engine, scene, 'simplexNoise2d')
  const swirlyLinesMat = await createShaderMaterial(engine, scene, 'swirlyLines')
  const splatterMat = await createShaderMaterial(engine, scene, 'splatter')

  const stepNoiseQuad = MeshBuilder.CreatePlane('quad', { size: 2 }, scene)
  stepNoiseQuad.position = new Vector3(-1.1, -1.1, 0)
  stepNoiseQuad.material = stepNoiseMat

  const gradientNoiseQuad = MeshBuilder.CreatePlane('quad', { size: 2 }, scene)
  gradientNoiseQuad.position = new Vector3(1.1, -1.1, 0)
  gradientNoiseQuad.material = gradientNoiseMat

  const simplexNoiseQuad = MeshBuilder.CreatePlane('quad', { size: 2 }, scene)
  simplexNoiseQuad.position = new Vector3(3.3, -1.1, 0)
  simplexNoiseQuad.material = simplexNoiseMat

  const swirlyLinesQuad = MeshBuilder.CreatePlane('quad', { size: 2 }, scene)
  swirlyLinesQuad.position = new Vector3(-1.1, 1.1, 0)
  swirlyLinesQuad.material = swirlyLinesMat

  const splatterQuad = MeshBuilder.CreatePlane('quad', { size: 2 }, scene)
  splatterQuad.position = new Vector3(1.1, 1.1, 0)
  splatterQuad.material = splatterMat

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
