/// <reference path="../../node_modules/babylonjs/babylon.d.ts" />

async function main() {
  const canvas = document.getElementById('root');
  
  const engine = new BABYLON.WebGPUEngine(canvas, { preserveDrawingBuffer: true, stencil: true });
  await engine.initAsync();

  function createScene(){
    const scene = new BABYLON.Scene(engine);
    const axesViewer = new BABYLON.AxesViewer(scene);

    const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 20, BABYLON.Vector3.Zero(), scene);

    const light = new BABYLON.HemisphericLight("Light", new BABYLON.Vector3(0, 1, 0), scene);

    const triangle = BABYLON.MeshBuilder.CreateDisc('Triangle', { tessellation: 3 }, scene);
  
    const SPS = new BABYLON.SolidParticleSystem('BoidSPS', scene);
    SPS.addShape(triangle, 64);

    triangle.dispose();

    const mesh = SPS.buildMesh();

    SPS.initParticles = () => {
      for (let i = 0; i < SPS.nbParticles; i++) {
        const particle = SPS.particles[i];

        particle.position.x = BABYLON.Scalar.RandomRange(-10, 10)
        particle.position.y = BABYLON.Scalar.RandomRange(-5, 5);
        particle.position.z = 0;
      }
    }

    SPS.initParticles();
    SPS.setParticles();

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
