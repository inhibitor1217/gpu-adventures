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

  /**
   * @param {BABYLON.Scene} scene
   * @returns {BABYLON.Mesh}
   */
  function World(scene) {
    const world = MeshBuilder.CreateBox('world', { size: $ENV.world.size }, scene);
    world.position = $ENV.world.center;
    world.material = new StandardMaterial('world-mat', scene);
    world.material.wireframe = true;
    return world;
  }

  /**
   * @param {BABYLON.Scene} scene
   * @param {BABYLON.Vector3} direction
   * @returns {BABYLON.Light} 
   */
  function AmbientLight(scene, direction) {
    return new HemisphericLight('ambient-light', direction, scene);
  }

  function createScene(){
    const scene = new Scene(engine);
    const camera = new ArcRotateCamera('camera', .25 * Math.PI, .25 * Math.PI, 40, Vector3.Zero(), scene);
    camera.attachControl(canvas, false);

    const world = World(scene);  
    const light = AmbientLight(scene, Vector3.Up());

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
