import {
  ArcRotateCamera,
  Engine,
  MeshBuilder,
  Scene,
  ShaderLanguage,
  ShaderMaterial,
  Vector3,
  WebGPUEngine,
} from 'babylonjs'

import { loadWGSLShaders } from './shader'

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
