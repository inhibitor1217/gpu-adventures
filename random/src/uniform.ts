import { Engine, UniformBuffer } from '@babylonjs/core'

export async function createElapsedTimeUniformBuffer(engine: Engine): Promise<UniformBuffer> {
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

export async function createRandomSeedUniformBuffer(engine: Engine): Promise<UniformBuffer> {
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
