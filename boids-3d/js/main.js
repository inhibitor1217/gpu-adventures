/// <reference path="../../node_modules/babylonjs/babylon.d.ts" />

const {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  KeyboardEventTypes,
  MeshBuilder,
  Ray,
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
    const ret = Vector3.Zero();
    if (position.x > $ENV.world.x.max) { ret.x += $ENV.world.x.max - position.x; }
    if (position.x < $ENV.world.x.min) { ret.x += $ENV.world.x.min - position.x; }
    if (position.y > $ENV.world.y.max) { ret.y += $ENV.world.y.max - position.y; }
    if (position.y < $ENV.world.y.min) { ret.y += $ENV.world.y.min - position.y; }
    if (position.z > $ENV.world.z.max) { ret.z += $ENV.world.z.max - position.z; }
    if (position.z < $ENV.world.z.min) { ret.z += $ENV.world.z.min - position.z; }
    return ret.scale(120);
  },

  /**
   * @param {BABYLON.Vector3} position
   * @param {BABYLON.Vector3} attraction
   * @returns {BABYLON.Vector3}
   */
  Attraction: function Attraction(position, attraction) {
    const towards = attraction.subtract(position).normalize();
    return towards.scale($ENV.force.attraction.weight);
  },

  /**
   * @param {BABYLON.Vector3} position
   * @param {BABYLON.Vector3} other
   * @returns {BABYLON.Vector3}
   */
  Repulsion: function Repulsion(position, other) {
    const diff = position.subtract(other);
    const scale = Scalar.Clamp($ENV.force.repulsion.weight / diff.lengthSquared(), undefined, $ENV.force.repulsion.max);
    return diff.normalize().scale(scale);
  },

  /**
   * @param {BABYLON.Vector3} position
   * @param {BABYLON.Vector3} other 
   * @returns {BABYLON.Vector3}
   */
  Cohesion: function Cohesion(position, other) {
    const diff = other.subtract(position);
    return diff.scale($ENV.force.cohesion.weight);
  },

  /**
   * @param {BABYLON.Vector3} direction
   * @param {BABYLON.Vector3} targetDirection
   * @returns {BABYLON.Vector3}
   */
  Alignment: function Alignment(direction, targetDirection) {
    return targetDirection.subtract(direction).normalize().scale($ENV.force.alignment.weight);
  },
};

const Utils = {
  Vector3: {
    /**
     * @param {BABYLON.Vector3} vector 
     * @param {number | undefined} minLength 
     * @param {number | undefined} maxLength 
     * @returns {BABYLON.Vector3}
     */
    ClampLength: function ClampLength(vector, minLength, maxLength) {
      if (minLength !== undefined && vector.length() < minLength) { return vector.clone().normalize().scale(minLength); }
      if (maxLength !== undefined && vector.length() > maxLength) { return vector.clone().normalize().scale(maxLength); }
      return vector;
    },
  },

  Flock: {
    /**
     * @param {BABYLON.Vector3} position
     * @param {BABYLON.Vector3} direction
     * @param {BABYLON.Vector3} other
     * @returns {boolean}
     */
    IsVisible: function IsVisible(position, direction, other) {
      const diff = other.subtract(position);
      const dot = Vector3.Dot(direction, diff.clone().normalize());
      return diff.length() <= $ENV.boids.flock.range && dot >= Math.cos($ENV.boids.flock.viewport);
    },
  },

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
    center: () => Vector3.Zero(),
    size: { x: 100, y: 50, z: 100 },
  },
  boids: {
    population: 500,
    speed: { min: 12, max: 16 },
    color: { low: Utils.Color.Hex('6ec6ff'), high: Utils.Color.Hex('0069c0') },
    flock: { range: 12, viewport: 0.7 * Math.PI },
  },
  force: {
    attraction: { weight: 50 },
    repulsion: { weight: 40, max: 500 },
    cohesion: { weight: 10 },
    alignment: { weight: 10 },
  },
};

$ENV.world.x = {
  max: $ENV.world.center().x + 0.5 * $ENV.world.size.x,
  min: $ENV.world.center().x - 0.5 * $ENV.world.size.x,
};
$ENV.world.y = {
  max: $ENV.world.center().y + 0.5 * $ENV.world.size.y,
  min: $ENV.world.center().y - 0.5 * $ENV.world.size.y,
};
$ENV.world.z = {
  max: $ENV.world.center().z + 0.5 * $ENV.world.size.z,
  min: $ENV.world.center().z - 0.5 * $ENV.world.size.z,
};

function main() {
  const canvas = document.getElementById('root');
  
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

  /**
   * @param {BABYLON.Scene} scene
   * @returns {BABYLON.Mesh}
   */
  function World(scene) {
    const world = MeshBuilder.CreateBox('world', { width: $ENV.world.size.x, height: $ENV.world.size.y, depth: $ENV.world.size.z }, scene);
    world.position = $ENV.world.center();
    world.material = new StandardMaterial('world-mat', scene);
    world.material.wireframe = true;
    return world;
  }

  /**
   * @param {BABYLON.Scene} scene
   * @returns {BABYLON.Mesh}
   */
  function AttractionPoint(scene) {
    const attraction = MeshBuilder.CreateSphere('attraction-point', { diameter: 1 }, scene);
    attraction.position = $ENV.world.center();
    attraction.material = new StandardMaterial('attraction-point-mat', scene);
    attraction.material.diffuseColor = Utils.Color.Hex('ff0000');

    // Add keyboard controls
    scene.onKeyboardObservable.add(keyboardInfo => {
      switch (keyboardInfo.type) {
        case KeyboardEventTypes.KEYDOWN:
          switch (keyboardInfo.event.key) {
            case 'w': { attraction.position.x += 0.5; break; }
            case 'a': { attraction.position.z += 0.5; break; }
            case 's': { attraction.position.x -= 0.5; break; }
            case 'd': { attraction.position.z -= 0.5; break; }
            case 'q': { attraction.position.y += 0.5; break; }
            case 'e': { attraction.position.y -= 0.5; break; }
          }
          break
      }
    });

    return attraction;
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
      const direction = boid.props.velocity.clone().normalize();

      const force = Vector3.Zero();

      const attraction = scene.getMeshByName('attraction-point');
      if (attraction) { force.addInPlace(Physics.Attraction(boid.position, attraction.position)); }

      for (let i = 0; i < sps.nbParticles; i += 1) {
        if (i === boid.idx) { continue; }
        force.addInPlace(Physics.Repulsion(boid.position, sps.particles[i].position));
      }

      const centerOfFlock = Vector3.Zero();
      const directionOfFlock = Vector3.Zero();
      let flockSize = 0;

      for (let i = 0; i < sps.nbParticles; i += 1) {
        if (i === boid.idx) { continue; }

        if (!Utils.Flock.IsVisible(boid.position, direction, sps.particles[i].position)) { continue; }

        flockSize += 1;
        centerOfFlock.addInPlace(sps.particles[i].position);
        directionOfFlock.addInPlace(sps.particles[i].props.velocity.clone().normalize());
      }

      if (flockSize > 0) {
        centerOfFlock.scaleInPlace(1 / flockSize);
        directionOfFlock.scaleInPlace(1 / flockSize);

        force.addInPlace(Physics.Cohesion(boid.position, centerOfFlock));
        force.addInPlace(Physics.Alignment(direction, directionOfFlock));
      }

      force.addInPlace(Physics.SanitizePosition(boid.position));

      boid.props.velocity.addInPlace(force.scale(deltaTime));
      boid.props.velocity = Utils.Vector3.ClampLength(boid.props.velocity, $ENV.boids.speed.min, $ENV.boids.speed.max);

      boid.rotation = Utils.Rotation.FromDirection(boid.props.velocity);
      boid.position = boid.position.add(boid.props.velocity.scale(deltaTime));
    }
    
    return sps;
  }

  function createScene(){
    const scene = new Scene(engine);
    const camera = new ArcRotateCamera('camera', .25 * Math.PI, .25 * Math.PI, 80, Vector3.Zero(), scene);
    camera.attachControl(canvas, false);

    const world = World(scene);  
    const light = AmbientLight(scene, Vector3.Up());
    // const attraction = AttractionPoint(scene);

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
