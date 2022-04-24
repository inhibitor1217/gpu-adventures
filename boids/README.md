# 2D Boids

> ### Watch the [Simulation](https://inhibitor1217.github.io/gpu-adventures/boids/) 🚀

Inspired by [Sebastian Lague](https://github.com/SebLague/Boids/tree/master)'s [Coding Adventure - Boids](https://www.youtube.com/watch?v=bqtqltqcQhw).

This is an WebGL (can switch to WebGPU, though) / BabylonJS implementation of 2D Boids.

Each particle is affected by 3 forces:

- **Repulsion**: Particles push other particles away if they are close enough.
- **Alignment**: Particles tend to move toward the same direction.
- **Cohesion**: Particles are attracted to the center of nearby particles.

Also there is a simple collision detection mechanism.
