/// <reference path="../../node_modules/babylonjs/babylon.d.ts" />

const {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} = BABYLON;

const $ENV = {
  world: {
    center: Vector3.Zero(),
    size: 20,
  },
};

function main() {
  const canvas = document.getElementById('root');
  
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

  function createScene(){
    const scene = new Scene(engine);
    const camera = new ArcRotateCamera('camera', .25 * Math.PI, .25 * Math.PI, 40, Vector3.Zero(), scene);
    camera.attachControl(canvas, false);

    const world = MeshBuilder.CreateBox('world', { size: $ENV.world.size }, scene);
    world.position = $ENV.world.center;
    world.material = new StandardMaterial('world-mat', scene);
    world.material.wireframe = true;
  
    const light = new HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
    const sphere = MeshBuilder.CreateSphere('sphere1', {segments: 16, diameter: 2, sideOrientation: Mesh.FRONTSIDE}, scene);
    sphere.position.y = 1;
    const ground = MeshBuilder.CreateGround("ground1", { width: 6, height: 6, subdivisions: 2, updatable: false }, scene);
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
