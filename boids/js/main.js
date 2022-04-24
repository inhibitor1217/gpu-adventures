/// <reference path="../../node_modules/babylonjs/babylon.d.ts" />

/**
 * @returns {Promise<void>}
 */
async function main() {
  const canvas = document.getElementById('root');
  
  const engine = new BABYLON.Engine(canvas, { preserveDrawingBuffer: true, stencil: true });

  const rect = engine.getRenderingCanvasClientRect();
  const aspectRatio = rect.width / rect.height;

  const HexColor = hex => {
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return new BABYLON.Color3(r, g, b);
  }

  const SETTINGS = {
    particle: {
      colors: {
        themes: [
          {
            light: HexColor('6ec6ff'),
            dark: HexColor('0069c0'),
          },
          {
            light: HexColor('6ff9ff'),
            dark: HexColor('0095a8'),
          },
          {
            light: HexColor('98ee99'),
            dark: HexColor('66bb6a'),
          },
        ],
        target: BABYLON.Color3.Red(),
      },
      viewRange: {
        distance: 8.0,
        angle: 2/3 * Math.PI,
      },
      targetIndex: 0,
      size: 250,
      physics: {
        collision: {
          detectDistance: 8.0,
          nQuery: 4,
          queryStep: .1 * Math.PI,
        },
        speed: {
          initial: 7.0,
          max: 10.0,
          min: 4.0,
        },
        acceleration: {
          max: 1.0,
        },
        force: {
          repulsion: {
            weight: 3,
            detectDistance: 5,
          },
          align: {
            weight: 1,
          },
          cohesion: {
            weight: 5,
          },
          collision: {
            weight: 200,
          },
          min: 0.0,
          max: 30.0,
        },
      },
    },
    world: {
      boundary: {
        x: { max: 30, min: -30 },
        y: { max: 30 / aspectRatio, min: -30 / aspectRatio },
      },
    },
  };

  /**
   * @param {BABYLON.Vector3} vec 
   * @param {number} min 
   * @param {number} max
   * @returns {BABYLON.Vector3} 
   */
  function clampLengthInPlace(vec, min, max) {
    const len = vec.length();
    if (len < 1e-5) { return vec; }
    if (len < min) { return vec.scaleInPlace(min / len); }
    if (len > max) { return vec.scaleInPlace(max / len); }
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


  /**
   * @param {BABYLON.SolidParticle} me 
   * @param {BABYLON.SolidParticle} other 
   * @returns {boolean}
   */
  function isVisibleParticle(me, other) {
    const diff = other.position.subtract(me.position);
    return (
      diff.length() < SETTINGS.particle.viewRange.distance &&
      BABYLON.Vector3.Dot(
        diff.clone().normalize(),
        me.props.velocity.clone().normalize(),
      ) >= Math.cos(SETTINGS.particle.viewRange.angle)
    );
  }

  /**
   * @param {BABYLON.SolidParticle} particle 
   * @param {BABYLON.SolidParticle} other 
   * @returns {BABYLON.Vector3}
   */
  function RepulsionForce(particle, other) {
    const diff = particle.position.subtract(other.position);
    const len = diff.length();

    if (len > SETTINGS.particle.physics.force.repulsion.detectDistance) { return BABYLON.Vector3.Zero(); }

    return diff.normalize().scaleInPlace(1 / (len * len));
  }

  /**
   * @param {BABYLON.SolidParticle} particle 
   * @param {BABYLON.Scene} scene
   * @returns {BABYLON.Vector3} 
   */
  function SearchAvoidCollision(particle, scene) {
    const m = new BABYLON.Matrix();
    particle.getRotationMatrix(m);

    const queriedIndices = [];
    for (let i = 1; i <= SETTINGS.particle.physics.collision.nQuery; i++) {
      queriedIndices.push(i);
      queriedIndices.push(-i);
    }

    for (const i of queriedIndices) {
      const a = i * SETTINGS.particle.physics.collision.queryStep;
      const l = new BABYLON.Vector3(Math.cos(a), Math.sin(a), 0);
      const d = BABYLON.Vector3.TransformCoordinates(l, m);

      const ray = new BABYLON.Ray(particle.position, d, SETTINGS.particle.physics.collision.detectDistance);
      const hit = scene.pickWithRay(ray).hit;

      if (!hit) {
        return d
          .subtractInPlace(particle.props.velocity.clone().normalize())
          .normalize();
      }
    }

    return BABYLON.Vector3.Zero();
  }

  /**
   * @param {BABYLON.SolidParticle} particle 
   * @param {BABYLON.Scene} scene
   * @returns {BABYLON.PickingInfo | boolean}
   */
  function isColliding(particle, scene) {
    const ray = new BABYLON.Ray(particle.position, particle.props.velocity.clone().normalize(), SETTINGS.particle.physics.collision.detectDistance);
    const info = scene.pickWithRay(ray);

    if (!info.hit) { return false; }
    return info;
  }

  /**
   * @returns {BABYLON.Scene}
   */
  function createScene(){
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(.1, .1, .1, 1);
  
    /**
     * @param {number} angle 
     * @returns {BABYLON.Mesh}
     */
    function CreateArcMesh(angle) {
      const nPartitions = Math.max(1, Math.ceil(angle / (.05 * Math.PI)));
      const zeros = [];
      const arc = [];
      for (let i = -nPartitions; i <= nPartitions; i++) {
        const a = (i / nPartitions) * angle;
        arc.push(new BABYLON.Vector3(Math.cos(a), Math.sin(a), 0));
        zeros.push(BABYLON.Vector3.Zero());
      }
      const options = {
        pathArray: [
          zeros,
          arc,
        ],
      };
      
      const mesh = BABYLON.MeshBuilder.CreateRibbon('Arc', options, scene);

      mesh.scaling = BABYLON.Vector3.One().scaleInPlace(SETTINGS.particle.viewRange.distance);

      mesh.material = new BABYLON.StandardMaterial('ArcMesh', scene);
      mesh.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
      mesh.material.alpha = .1;

      return mesh;
    }

    function CreateWorldBoundingBox() {
      const mesh = BABYLON.MeshBuilder.CreateBox(
        'WorldBoundingBox',
        {
          width: SETTINGS.world.boundary.x.max - SETTINGS.world.boundary.x.min,
          height: SETTINGS.world.boundary.y.max - SETTINGS.world.boundary.y.min,
        },
        scene,
      );

      mesh.position = BABYLON.Vector3.Zero();

      mesh.material = new BABYLON.StandardMaterial('WorldBoundingBoxMat', scene);
      mesh.material.wireframe = true;

      return mesh;
    }

    const obstacleMat = new BABYLON.StandardMaterial('ObstacleMat', scene);
    obstacleMat.diffuseColor = HexColor('212121');

    function CreateCylinderObstacle(position, diameter) {
      const mesh = BABYLON.MeshBuilder.CreateCylinder('Obstacle', { diameter }, scene);
      mesh.position = position;
      mesh.rotation = new BABYLON.Vector3(.5 * Math.PI, 0, 0);

      mesh.material = obstacleMat;

      return mesh;
    }

    function CreateBoxObstacle(position, width, height) {
      const mesh = BABYLON.MeshBuilder.CreateBox('Obstacle', { width, height }, scene);
      mesh.position = position;
      mesh.material = obstacleMat;
      return mesh;
    }

    function CreateCollisionVizMesh() {
      const mesh = BABYLON.MeshBuilder.CreateLineSystem('TargetCollisionViz', { lines: [[ BABYLON.Vector3.Zero(), BABYLON.Vector3.Zero() ]], updatable: true }, scene);

      mesh.color = BABYLON.Color3.Green();

      return mesh;
    }

    /**
     * @param {BABYLON.Mesh} mesh 
     * @param {BABYLON.SolidParticle} particle
     * @param {BABYLON.Mesh} target 
     * @returns {BABYLON.Mesh}
     */
    function UpdateCollisionVizMesh(mesh, particle, target) {
      if (!isColliding(particle, scene)) {
        return BABYLON.MeshBuilder.CreateLineSystem('TargetCollisionViz', { lines: [[ BABYLON.Vector3.Zero(), BABYLON.Vector3.Zero() ]], instance: mesh });
      }

      const m = target.getWorldMatrix().getRotationMatrix();

      const queriedIndices = [];
      for (let i = 0; i <= SETTINGS.particle.physics.collision.nQuery; i++) {
        queriedIndices.push(i);
        if (i !== 0) { queriedIndices.push(-i); }
      }

      for (const i of queriedIndices) {
        const a = i * SETTINGS.particle.physics.collision.queryStep;
        const l = new BABYLON.Vector3(Math.cos(a), Math.sin(a), 0);
        const d = BABYLON.Vector3.TransformCoordinates(l, m);

        const ray = new BABYLON.Ray(particle.position, d, SETTINGS.particle.physics.collision.detectDistance);
        const hit = scene.pickWithRay(ray).hit;

        if (!hit) {
          const lines = [
            [
              BABYLON.Vector3.Zero(),
              l.scale(SETTINGS.particle.physics.collision.detectDistance),
            ],
          ];

          return BABYLON.MeshBuilder.CreateLineSystem('TargetCollisionViz', { lines, instance: mesh });
        }
      }

      return mesh;
    }

    const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 40, BABYLON.Vector3.Zero(), scene);
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    camera.orthoTop = SETTINGS.world.boundary.y.max;
    camera.orthoBottom = SETTINGS.world.boundary.y.min;
    camera.orthoLeft = SETTINGS.world.boundary.x.min;
    camera.orthoRight = SETTINGS.world.boundary.x.max;

    const light = new BABYLON.HemisphericLight("Light", new BABYLON.Vector3(0, 1, 0), scene);
  
    const triangle = BABYLON.MeshBuilder.CreateDisc('Triangle', { tessellation: 3 }, scene);

    const SPS = new BABYLON.SolidParticleSystem('BoidSPS', scene);
    SPS.addShape(triangle, SETTINGS.particle.size);

    triangle.dispose();

    const mesh = SPS.buildMesh();

    SPS.initParticles = () => {
      for (let i = 0; i < SPS.nbParticles; i++) {
        const particle = SPS.particles[i];

        particle.position.x = BABYLON.Scalar.RandomRange(SETTINGS.world.boundary.x.min, SETTINGS.world.boundary.x.max);
        particle.position.y = BABYLON.Scalar.RandomRange(SETTINGS.world.boundary.y.min, SETTINGS.world.boundary.y.max);
        particle.position.z = 0;

        const angle = BABYLON.Scalar.RandomRange(-Math.PI, +Math.PI);
        const velocity = new BABYLON.Vector3(Math.cos(angle), Math.sin(angle), 0).scale(SETTINGS.particle.physics.speed.initial);

        particle.rotation.z = angle;

        particle.props = {
          velocity,
          acceleration: BABYLON.Vector3.Zero(),
        };

        particle.scale = new BABYLON.Vector3(1, .5, 1);

        const theme = SETTINGS.particle.colors.themes[i % SETTINGS.particle.colors.themes.length];
        particle.color = BABYLON.Color3.Lerp(theme.light, theme.dark, BABYLON.Scalar.RandomRange(0, 1))

        particle.props.color = particle.color;
      }
    }

    SPS.updateParticle = particle => {
      const dt = engine.getDeltaTime() * .001;

      const repulsionForce = BABYLON.Vector3.Zero();

      let flockSize = 0;
      const avgFlockDirection = BABYLON.Vector3.Zero();
      const avgFlockPosition = BABYLON.Vector3.Zero();

      for (let i = 0; i < SPS.nbParticles; i++) {
        if (i === particle.idx) { continue; }
        if (i % 3 !== particle.idx % 3) { continue; }

        repulsionForce.addInPlace(RepulsionForce(particle, SPS.particles[i]));

        if (isVisibleParticle(particle, SPS.particles[i])) {
          flockSize += 1;
          avgFlockDirection.addInPlace(SPS.particles[i].props.velocity.clone().normalize());
          avgFlockPosition.addInPlace(SPS.particles[i].position);
        }
      }

      const force = BABYLON.Vector3.Zero();
      
      force.addInPlace(repulsionForce.scale(SETTINGS.particle.physics.force.repulsion.weight));

      if (flockSize > 0) {
        const steerDirection = avgFlockDirection
          .normalize()
          .subtract(particle.props.velocity.clone().normalize())
          .normalize();

        force.addInPlace(steerDirection.scale(SETTINGS.particle.physics.force.align.weight));

        const cohesionDirection = avgFlockPosition
          .scaleInPlace(1 / flockSize)
          .subtract(particle.position)
          .normalize();

        force.addInPlace(cohesionDirection.scale(SETTINGS.particle.physics.force.cohesion.weight));
      }

      const collide = isColliding(particle, scene);
      if (collide) {
        const avoidCollisionDirection = SearchAvoidCollision(particle, scene);

        force.addInPlace(
          avoidCollisionDirection
            .scaleInPlace(1 / (collide.distance * collide.distance))
            .scaleInPlace(SETTINGS.particle.physics.force.collision.weight),
        );
      }

      particle.props.acceleration = force;
      clampLengthInPlace(particle.props.acceleration, SETTINGS.particle.physics.force.min, SETTINGS.particle.physics.force.max);

      particle.props.velocity.addInPlace(particle.props.acceleration.scale(dt));
      clampLengthInPlace(particle.props.velocity, SETTINGS.particle.physics.speed.min, SETTINGS.particle.physics.speed.max);

      particle.position.addInPlace(particle.props.velocity.scale(dt));
      sanitizePosition(particle.position, SETTINGS.world.boundary);

      particle.rotation.z = Math.atan2(particle.props.velocity.y, particle.props.velocity.x);
    }

    SPS.initParticles();
    SPS.setParticles();

    // const worldBoundingBox = CreateWorldBoundingBox();
    CreateCylinderObstacle(new BABYLON.Vector3(8, 4, 0), 6);
    CreateCylinderObstacle(new BABYLON.Vector3(-18, -10, 0), 3);
    CreateCylinderObstacle(new BABYLON.Vector3(-10, 9, 0), 8);
    CreateBoxObstacle(new BABYLON.Vector3(-3, -11, 0), 6, 6);
    CreateBoxObstacle(new BABYLON.Vector3(18, -2, 0), 3, 3);

    const target = new BABYLON.Mesh('Target', scene);

    // const viewingAreaMesh = CreateArcMesh(SETTINGS.particle.viewRange.angle);
    // viewingAreaMesh.setParent(target);

    // let targetCollisionViz = CreateCollisionVizMesh();
    // targetCollisionViz.setParent(target);

    scene.onBeforeRenderObservable.add(() => {
      // function markVisibleParticles() {
      //   for (let i = 0; i < SPS.nbParticles; i++) {
      //     if (i === SETTINGS.particle.targetIndex) { continue; }
      //     if (isVisibleParticle(SPS.particles[SETTINGS.particle.targetIndex], SPS.particles[i])) {
      //       SPS.particles[i].color = BABYLON.Color3.Yellow();
      //     } else {
      //       SPS.particles[i].color = SPS.particles[i].props.color;
      //     }
      //   }
      // }

      function updateTargetMesh() {
        target.position.copyFrom(SPS.particles[SETTINGS.particle.targetIndex].position);
        target.rotation.copyFrom(SPS.particles[SETTINGS.particle.targetIndex].rotation);
      }

      // markVisibleParticles();
      updateTargetMesh();
      // targetCollisionViz = UpdateCollisionVizMesh(targetCollisionViz, SPS.particles[SETTINGS.particle.targetIndex], target);

      SPS.setParticles();
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
