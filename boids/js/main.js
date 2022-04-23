/// <reference path="../../node_modules/babylonjs/babylon.d.ts" />

/**
 * @returns {Promise<void>}
 */
async function main() {
  const canvas = document.getElementById('root');
  
  const engine = new BABYLON.WebGPUEngine(canvas, { preserveDrawingBuffer: true, stencil: true });
  await engine.initAsync();

  /**
   * @returns {BABYLON.Scene}
   */
  function createScene(){
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(.1, .1, .1, 1);
    const axesViewer = new BABYLON.AxesViewer(scene);

    const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 20, BABYLON.Vector3.Zero(), scene);

    const light = new BABYLON.HemisphericLight("Light", new BABYLON.Vector3(0, 1, 0), scene);

    const triangle = BABYLON.MeshBuilder.CreateDisc('Triangle', { tessellation: 3 }, scene);
  
    const SPS = new BABYLON.SolidParticleSystem('BoidSPS', scene);
    SPS.addShape(triangle, 64);

    triangle.dispose();

    const mesh = SPS.buildMesh();

    const colors = {
      light: new BABYLON.Color3(.43, .78, 1),
      dark: new BABYLON.Color3(0, .41, .75),
    };
    const speed = 5.0;
    const worldBoundary = {
      x: { max: 15, min: -15 },
      y: { max: 10, min: -10 },
    }

    /**
     * @param {BABYLON.Color3} one 
     * @param {BABYLON.Color3} other 
     * @param {number} t 
     * @returns 
     */
    function mixColor(one, other, t) {
      const lerp = (a, b, t) => a * (1 - t) + b * t;
      return new BABYLON.Color3(
        lerp(one.r, other.r, t),
        lerp(one.g, other.g, t),
        lerp(one.b, other.b, t),
      );
    }

    /**
     * @param {BABYLON.Vector3} position
     * @param {{ x: { max: number, min: number }, y: { max: number, min: number } }} boundary 
     * @returns {BABYLON.Vector3}
     */
    function sanitizePosition(position, boundary) {
      if (position.x > boundary.x.max) { position.x += boundary.x.min - boundary.x.max; }
      if (position.x < boundary.x.min) { position.x += boundary.x.max - boundary.x.min; }
      if (position.y > boundary.y.max) { position.y += boundary.y.min - boundary.y.max; }
      if (position.y < boundary.y.min) { position.y += boundary.y.max - boundary.y.min; }
      return position;
    }

    SPS.initParticles = () => {
      for (let i = 0; i < SPS.nbParticles; i++) {
        const particle = SPS.particles[i];

        particle.position.x = BABYLON.Scalar.RandomRange(worldBoundary.x.min, worldBoundary.x.max);
        particle.position.y = BABYLON.Scalar.RandomRange(worldBoundary.y.min, worldBoundary.y.max);
        particle.position.z = 0;

        const angle = BABYLON.Scalar.RandomRange(-Math.PI, +Math.PI);
        const velocity = new BABYLON.Vector3(Math.cos(angle), Math.sin(angle), 0).scale(speed);

        particle.rotation.z = angle;

        particle.props = { velocity };

        particle.scale = new BABYLON.Vector3(1, .5, 1);

        particle.color = mixColor(colors.light, colors.dark, BABYLON.Scalar.RandomRange(0, 1));
      }
    }

    SPS.updateParticle = particle => {
      const dt = engine.getDeltaTime();

      particle.position.addInPlace(particle.props.velocity.scale(dt * .001));
      sanitizePosition(particle.position, worldBoundary);
    }

    SPS.initParticles();
    SPS.setParticles();

    scene.onBeforeRenderObservable.add(() => {
      SPS.setParticles();
    })

    return scene;
  }

  const scene = createScene();
  engine.runRenderLoop(function(){
    scene.render();
  });

  window.addEventListener('resize', function(){
    engine.resize();
  });
}

main()
