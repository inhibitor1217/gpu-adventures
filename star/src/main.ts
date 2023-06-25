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

  const camera = new ArcRotateCamera('camera', 0.25 * Math.PI, 0.25 * Math.PI, 16, Vector3.Zero(), scene)
  camera.setTarget(Vector3.Zero())
  camera.attachControl(engine.getRenderingCanvas(), true)
  
  const elapsedTimeUbo = await createElapsedTimeUniformBuffer(engine)
  const randomSeedUbo = await createRandomSeedUniformBuffer(engine)

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
  shaderMaterial.setUniformBuffer('elapsedTimeMs', elapsedTimeUbo)
  shaderMaterial.setUniformBuffer('randomSeed', randomSeedUbo)

  const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 10 }, scene)
  sphere.material = shaderMaterial
  sphere.position = Vector3.Zero()

  const _axes = new AxesViewer(scene)

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