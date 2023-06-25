import {
  ArcRotateCamera,
  AxesViewer,
  Engine,
  MeshBuilder,
  Scene,
  ShaderLanguage,
  ShaderMaterial,
  Vector3,
  WebGPUEngine,
} from '@babylonjs/core'
import { loadWGSLShaders } from '@inhibitor1217/babylonjs-wgsl'

import './style.css'
import {
  createElapsedTimeUniformBuffer,
  createRandomSeedUniformBuffer,
} from './uniform'

async function prepare(canvas: HTMLCanvasElement): Promise<WebGPUEngine> {
  const engine = new WebGPUEngine(canvas)

  await engine.initAsync()
  await loadWGSLShaders(await import.meta.glob('./material/**/*.wgsl', { as: 'raw' }))

  window.addEventListener('resize', () => {
    engine.resize()
  })

  return engine
}

async function createScene(engine: Engine): Promise<Scene> {
  const scene = new Scene(engine)

  const camera = new ArcRotateCamera('camera', -0.7 * Math.PI, 0.4 * Math.PI, 16, Vector3.Zero(), scene)
  camera.setTarget(Vector3.Zero())
  camera.attachControl(engine.getRenderingCanvas(), true)
  
  const elapsedTimeUbo = await createElapsedTimeUniformBuffer(engine)
  const randomSeedUbo = await createRandomSeedUniformBuffer(engine)

  const ikedaCellsMat = new ShaderMaterial(
    'ikedaCells',
    scene,
    {
      vertex: 'ikedaCells',
      fragment: 'ikedaCells',
    },
    {
      attributes: ['position', 'normal'],
      uniformBuffers: ['Scene', 'Mesh'],
      shaderLanguage: ShaderLanguage.WGSL,
    },
  )
  ikedaCellsMat.setUniformBuffer('elapsedTimeMs', elapsedTimeUbo)
  ikedaCellsMat.setUniformBuffer('randomSeed', randomSeedUbo)

  const ikedaStreamMat = new ShaderMaterial(
    'ikedaStream',
    scene,
    {
      vertex: 'ikedaStream',
      fragment: 'ikedaStream',
    },
    {
      attributes: ['position', 'normal'],
      uniformBuffers: ['Scene', 'Mesh'],
      shaderLanguage: ShaderLanguage.WGSL,
    },
  )
  ikedaStreamMat.setUniformBuffer('elapsedTimeMs', elapsedTimeUbo)
  ikedaStreamMat.setUniformBuffer('randomSeed', randomSeedUbo)

  const ikedaCellsQuad = MeshBuilder.CreatePlane('quad', { width: 16, height: 2 }, scene)
  ikedaCellsQuad.material = ikedaCellsMat
  ikedaCellsQuad.position = new Vector3(0, 0, 0)

  const ikedaStreamQuad = MeshBuilder.CreatePlane('quad', { width: 16, height: 8 }, scene)
  ikedaStreamQuad.material = ikedaStreamMat
  ikedaStreamQuad.position = new Vector3(0, 0, 8)

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
