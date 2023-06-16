import {
  Engine,
  FreeCamera,
  HemisphericLight,
  MeshBuilder,
  Scene,
  Vector3,
  WebGPUEngine,
} from 'babylonjs'

import './style.css'

function createScene(engine: Engine) {
  const scene = new Scene(engine)

  const camera = new FreeCamera("pov", new Vector3(0, 5, -10), scene)
  camera.setTarget(Vector3.Zero())
  camera.attachControl(engine.getRenderingCanvas(), true)

  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene)
  light.intensity = 0.7

  const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene)
  sphere.position.y = 0

  return scene
}

async function main() {
  const canvas = document.getElementById('root') as HTMLCanvasElement

  const engine = new WebGPUEngine(canvas)
  await engine.initAsync()
  
  const scene = createScene(engine)

  engine.runRenderLoop(() => {
    scene.render()
  })

  window.addEventListener('resize', () => {
    engine.resize()
  })
}

main()
