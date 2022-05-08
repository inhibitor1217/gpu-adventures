/// <reference path="../../node_modules/babylonjs/babylon.d.ts" />

const {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scalar,
  Scene,
  SolidParticleSystem,
  StandardMaterial,
  Vector3,
} = BABYLON;

const Physics = {
  /**
   * @param {BABYLON.Vector3} position
   * @returns {BABYLON.Vector3}
   */
  SanitizePosition: function SanitizePosition(position) {
    const ret = position.clone();
    if (position.x > $ENV.world.x.max) { ret.x -= $ENV.world.size; }
    if (position.x < $ENV.world.x.min) { ret.x += $ENV.world.size; }
    if (position.y > $ENV.world.y.max) { ret.y -= $ENV.world.size; }
    if (position.y < $ENV.world.y.min) { ret.y += $ENV.world.size; }
    if (position.z > $ENV.world.z.max) { ret.z -= $ENV.world.size; }
    if (position.z < $ENV.world.z.min) { ret.z += $ENV.world.size; }
    return ret;
  },
};

const Utils = {
  Rotation: {
    /**
     * @returns {BABYLON.Vector3}
     */
    Random: function RandomDirection() {
      const v = new Vector3(Scalar.RandomRange(-1, 1), Scalar.RandomRange(-1, 1), Scalar.RandomRange(-1, 1));
      if (v.length() < 1e-6) { return RandomDirection(); }
      return v.normalize();
    },
    /**
     * @param {BABYLON.Vector3} forward 
     * @param {BABYLON.Vector3 | undefined} up
     * @returns {BABYLON.Vector3}
     */
    FromDirection: function FromDirection(forward, up = Vector3.Forward()) {
      const _forward = forward.clone().normalize();
      const _right = Vector3.Cross(_forward, up).normalize();
      const _up = Vector3.Cross(_right, _forward).normalize();

      return Vector3.RotationFromAxis(_up, _right, _forward);
    },
  },
  Color: {
    /**
     * @param {string} hex
     * @returns {BABYLON.Color3}
     */
    Hex: function Hex(hex) {
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      return new BABYLON.Color3(r, g, b);
    },
  },
};

const $ENV = {
  world: {
    center: Vector3.Zero(),
    size: 20,
  },
  boids: {
    population: 10,
    speed: { min: 8, max: 12 },
    color: { low: Utils.Color.Hex('6ec6ff'), high: Utils.Color.Hex('0069c0') },
  },
};

$ENV.world.x = {
  max: $ENV.world.center.x + 0.5 * $ENV.world.size,
  min: $ENV.world.center.x - 0.5 * $ENV.world.size,
};
$ENV.world.y = {
  max: $ENV.world.center.y + 0.5 * $ENV.world.size,
  min: $ENV.world.center.y - 0.5 * $ENV.world.size,
};
$ENV.world.z = {
  max: $ENV.world.center.z + 0.5 * $ENV.world.size,
  min: $ENV.world.center.z - 0.5 * $ENV.world.size,
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

  /**
   * @param {BABYLON.Scene} scene
   * @returns {BABYLON.SolidParticleSystem} 
   */
  function BoidParticleSystem(scene) {
    const sps = new SolidParticleSystem('boid-sps', scene);
    const boidMesh = MeshBuilder.CreatePolyhedron('boid', { sizeX: .4, sizeY: .4, sizeZ: 1 }, scene);
    sps.addShape(boidMesh, $ENV.boids.population);
    boidMesh.dispose();
    sps.buildMesh();

    sps.initParticles = function InitBoids() {
      for (let i = 0; i < sps.nbParticles; i++) {
        const boid = sps.particles[i];
        
        boid.position.x = Scalar.RandomRange($ENV.world.x.min, $ENV.world.x.max);
        boid.position.y = Scalar.RandomRange($ENV.world.y.min, $ENV.world.y.max);
        boid.position.z = Scalar.RandomRange($ENV.world.z.min, $ENV.world.z.max);
        
        const direction = Utils.Rotation.Random();
        const velocity = direction.scale(Scalar.RandomRange($ENV.boids.speed.min, $ENV.boids.speed.max));

        boid.rotation = Utils.Rotation.FromDirection(direction);

        boid.props = {
          velocity,
        };

        boid.color = Color3.Lerp($ENV.boids.color.low, $ENV.boids.color.high, Scalar.RandomRange(0, 1));
      }
    };

    /**
     * @param {BABYLON.SolidParticle} boid 
     * @returns {void}
     */
    sps.updateParticle = function UpdateBoid(boid) {
      const deltaTime = engine.getDeltaTime() * 0.001;

      boid.position = Physics.SanitizePosition(boid.position.add(boid.props.velocity.scale(deltaTime)));
    }
    
    return sps;
  }

  function createScene(){
    const scene = new Scene(engine);
    const camera = new ArcRotateCamera('camera', .25 * Math.PI, .25 * Math.PI, 40, Vector3.Zero(), scene);
    camera.attachControl(canvas, false);

    const world = World(scene);  
    const light = AmbientLight(scene, Vector3.Up());

    const boidParticleSystem = BoidParticleSystem(scene);
    boidParticleSystem.initParticles();
    boidParticleSystem.setParticles();

    scene.onBeforeRenderObservable.add(function UpdateBoidParticleSystem() {
      boidParticleSystem.setParticles();
    });

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
