/// <reference path="../../node_modules/babylonjs/babylon.d.ts" />

const {
  ArcRotateCamera,
  HemisphericLight,
  Scene,
  Vector3,
  WebGPUEngine,
} = BABYLON;

const PI = Math.PI;

const Utils = {};

const $ENV = {
  world: {
    center: () => Vector3.Zero(),
  },
};

async function main() {
  const canvas = document.getElementById('root');
  
  const engine = new WebGPUEngine(canvas, { preserveDrawingBuffer: true, stencil: true });
  await engine.initAsync();

  function createScene() {
    const scene = new Scene(engine);
    const camera = new ArcRotateCamera('camera', .25 * PI, .25 * PI, 10, $ENV.world.center(), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, false);

    const light = new HemisphericLight('light', Vector3.Up(), scene);
    
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
