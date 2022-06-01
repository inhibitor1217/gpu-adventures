/// <reference path="../../node_modules/babylonjs/babylon.d.ts" />

const {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  KeyboardEventTypes,
  Mesh,
  MeshBuilder,
  Ray,
  Scalar,
  Scene,
  SolidParticleSystem,
  StandardMaterial,
  Vector3,
  VertexData,
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
    return ret.scale($ENV.force.avoidCollision.weight);
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

  /**
   * @param {BABYLON.Vector3} direction
   * @param {BABYLON.Vector3} targetDirection
   * @returns {BABYLON.Vector3}
   */
  AvoidCollision: function AvoidCollision(direction, targetDirection) {
    return targetDirection.subtract(direction).normalize().scale($ENV.force.avoidCollision.weight);
  },

  /**
   * @param {BABYLON.Vector3} p0 
   * @param {BABYLON.Vector3} p1 
   * @param {BABYLON.Vector3} p2 
   * @param {BABYLON.Vector3} direction
   * @returns {boolean}
   */
  IsFrontFacing: function isFrontFacing(p0, p1, p2, direction) {
    const normal = Vector3.Cross(p1.subtract(p0), p2.subtract(p0));
    return Vector3.Dot(direction, normal) > 0;
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

    Probes: (() => {
      const angleIncrement = Math.PI * (1 + Math.sqrt(5));
      const ret = [];
      const len = 16;
      for (let i = 0; i < len; i += 1) {
          const t = i / len;
          const inclination = Math.acos(1 - 2 * t);
          const azimuth = angleIncrement * i;

          const x = Math.sin(inclination) * Math.cos(azimuth);
          const y = Math.sin(inclination) * Math.sin(azimuth);
          const z = Math.cos(inclination);

          ret.push(new Vector3(x, y, z));
      }

      /**
       * @param {BABYLON.Vector3} direction
       * @returns {BABYLON.Vector3[]}
       */
      return function Probes(direction) {
        const forward = direction;
        const right = Vector3.Cross(forward, Vector3.Right()).normalize();
        const up = Vector3.Cross(forward, right).normalize();

        return ret.map(probe =>
          forward.scale(probe.z)
            .add(right.scale(probe.x))
            .add(up.scale(probe.y))
        );
      };
    })(),
  },

  Flock: {
    /**
     * @param {number} index
     * @returns {string}
     */
    Type: function Type(index) {
      return ['A', 'A', 'A', 'B', 'B', 'C'][index % 6];
    },

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
    size: { x: 80, y: 30, z: 80 },
  },
  boids: {
    population: 600,
    speed: { min: 12, max: 16 },
    color: {
      A: { low: Utils.Color.Hex('6ec6ff'), high: Utils.Color.Hex('0069c0') },
      B: { low: Utils.Color.Hex('fb8c00'), high: Utils.Color.Hex('ff8a65') },
      C: { low: Utils.Color.Hex('cddc39'), high: Utils.Color.Hex('aed581') },
    },
    flock: { range: 12, viewport: .8 * Math.PI },
    collision: { range: 4 },
  },
  force: {
    max: 500,
    attraction: { weight: 50 },
    repulsion: { weight: 40, max: 500 },
    cohesion: { weight: 8 },
    alignment: { weight: 8 },
    avoidCollision: { weight: 200 },
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
    world.isVisible = false;
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
   * @param {BABYLON.Vector3} position
   * @returns {BABYLON.Mesh}
   */
  function PillarObstacle(scene, position) {
    const pillar = MeshBuilder.CreateBox('pillar', { width: 4, height: $ENV.world.size.y, depth: 4 }, scene);
    pillar.position = position;
    pillar.position.y = 0;
    pillar.material = new StandardMaterial('pillar-mat', scene);
    pillar.material.diffuseColor = Utils.Color.Hex('9e9e9e');
    return pillar;
  }

  /**
   * @param {BABYLON.Scene} scene 
   * @param {BABYLON.Vector3} position 
   * @param {number} size 
   * @returns {BABYLON.Mesh}
   */
  function TorusObstacle(scene, position, size, thickness) {
    const torus = MeshBuilder.CreateTorus('torus', { diameter: size, thickness, tessellation: 32 }, scene);
    torus.position = position;
    torus.rotation = new Vector3(0.5 * Math.PI, 0, 0);
    torus.material = new StandardMaterial('torus-mat', scene);
    torus.material.diffuseColor = Utils.Color.Hex('f9a825');
    return torus;
  }

  /**
   * @param {BABYLON.Scene} scene
   * @returns {BABYLON.Mesh} 
   */
  function ElevatedGroundObstacle(scene) {
    const side = [
      new Vector3($ENV.world.x.min, $ENV.world.y.min - 5, $ENV.world.z.min - 5),
      new Vector3($ENV.world.x.max, $ENV.world.y.min - 5, $ENV.world.z.min - 5),
      new Vector3($ENV.world.x.max, $ENV.world.y.min + 1, $ENV.world.z.min - 5),
      new Vector3(              20, $ENV.world.y.min + 1, $ENV.world.z.min - 5),
      new Vector3(              10, $ENV.world.y.min + 5, $ENV.world.z.min - 5),
      new Vector3(             -10, $ENV.world.y.min + 5, $ENV.world.z.min - 5),
      new Vector3(             -20, $ENV.world.y.min + 1, $ENV.world.z.min - 5),
      new Vector3($ENV.world.x.min, $ENV.world.y.min + 1, $ENV.world.z.min - 5),
      new Vector3($ENV.world.x.min, $ENV.world.y.min - 5, $ENV.world.z.min - 5),
    ];
    const extrudePath = [
      new Vector3(0, 0, 0),
      new Vector3(0, 0, $ENV.world.size.z + 10),
    ];
    const elevatedGround = MeshBuilder.ExtrudeShape(
      "elevated-ground",
      {
        shape: side,
        path: extrudePath,
        cap: Mesh.CAP_ALL,
      },
      scene,
    );
    elevatedGround.material = new StandardMaterial('elevated-ground-mat', scene);
    elevatedGround.material.diffuseColor = Utils.Color.Hex('424242');
    return elevatedGround;
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
   * @param {BABYLON.Vector3} position
   * @param {BABYLON.Vector3} direction 
   * @param {number} radius
   * @returns {boolean} 
   */
  function IsColliding(scene, position, direction, radius) {
    const ray = new Ray(position, direction, radius);
    const hitInfo = scene.pickWithRay(
      ray,
      undefined,
      undefined,
      (p0, p1, p2, ray) => Physics.IsFrontFacing(p0, p1, p2, ray.direction),
    );
    return hitInfo.hit;
  }

  /**
   * @param {BABYLON.Scene} scene 
   * @param {BABYLON.Vector3} position
   * @param {BABYLON.Vector3} direction 
   * @param {number} radius
   * @returns {BABYLON.Vector3} 
   */
  function Navigate(scene, position, direction, radius) {
    const navigateDirections = Utils.Vector3.Probes(direction);
    for (const probe of navigateDirections) {
      const ray = new Ray(position, probe, radius);
      const hitInfo = scene.pickWithRay(
        ray,
        undefined,
        undefined,
        (p0, p1, p2, ray) => Physics.IsFrontFacing(p0, p1, p2, ray.direction),
      );
      if (!hitInfo.hit) {
        return probe;
      }
    }
    
    return direction.scale(-1);
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
        
        boid.position.x = Scalar.RandomRange($ENV.world.x.min + 5, $ENV.world.x.max);
        boid.position.y = Scalar.RandomRange($ENV.world.y.min + 5, $ENV.world.y.max);
        boid.position.z = Scalar.RandomRange($ENV.world.z.min + 5, $ENV.world.z.max);
        
        const direction = Utils.Rotation.Random();
        const velocity = direction.scale(Scalar.RandomRange($ENV.boids.speed.min, $ENV.boids.speed.max));

        boid.rotation = Utils.Rotation.FromDirection(direction);

        boid.props = {
          velocity,
        };

        boid.color = Color3.Lerp($ENV.boids.color[Utils.Flock.Type(i)].low, $ENV.boids.color[Utils.Flock.Type(i)].high, Scalar.RandomRange(0, 1));
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
        if (Utils.Flock.Type(i) !== Utils.Flock.Type(boid.idx)) { continue; }
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

      if (IsColliding(scene, boid.position, direction, $ENV.boids.collision.range)) {
        const steerDirection = Navigate(scene, boid.position, direction, $ENV.boids.collision.range);
        force.addInPlace(Physics.AvoidCollision(direction, steerDirection));
      }

      force.addInPlace(Physics.SanitizePosition(boid.position));

      if (force.length() > $ENV.force.max) {
        force.normalize().scaleInPlace($ENV.force.max);
      }

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
    const obstacles = [
      PillarObstacle(scene, new Vector3(-25, 0,  25)),
      PillarObstacle(scene, new Vector3(-25, 0, -25)),
      PillarObstacle(scene, new Vector3( 25, 0,  25)),
      PillarObstacle(scene, new Vector3( 25, 0, -25)),

      TorusObstacle(scene, new Vector3(-32, 5, 0), 15, 4),
      TorusObstacle(scene, new Vector3( 32, 5, 0), 15, 4),

      ElevatedGroundObstacle(scene),
    ];

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
