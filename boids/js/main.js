/// <reference path="../../node_modules/babylonjs/babylon.d.ts" />

/**
 * @returns {Promise<void>}
 */
async function main() {
  const canvas = document.getElementById('root');
  
  const engine = new BABYLON.WebGPUEngine(canvas, { preserveDrawingBuffer: true, stencil: true });
  await engine.initAsync();

  const SETTINGS = {
    particle: {
      colors: {
        light: new BABYLON.Color3(.43, .78, 1),
        dark: new BABYLON.Color3(0, .41, .75),
        target: BABYLON.Color3.Red(),
      },
      viewRange: {
        distance: 8.0,
        angle: 2/3 * Math.PI,
      },
      targetIndex: 0,
      size: 250,
      physics: {
        speed: {
          initial: 6.0,
          max: 8.0,
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
          min: 0.0,
          max: 20.0,
        },
      },
    },
    world: {
      boundary: {
        x: { max: 40, min: -40 },
        y: { max: 30, min: -30 },
      },
    },
  };

  /**
   * @param {BABYLON.Color3} one 
   * @param {BABYLON.Color3} other 
   * @param {number} t 
   * @returns {BABYLON.Color3}
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

      mesh.material = new BABYLON.StandardMaterial('ArcMesh', scene);
      mesh.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
      mesh.material.alpha = .1;

      return mesh;
    }

    const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 80, BABYLON.Vector3.Zero(), scene);
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

        particle.color = (
          i === SETTINGS.particle.targetIndex
            ? SETTINGS.particle.colors.target
            : mixColor(SETTINGS.particle.colors.light, SETTINGS.particle.colors.dark, BABYLON.Scalar.RandomRange(0, 1))
        );

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

    const viewingAreaMesh = CreateArcMesh(SETTINGS.particle.viewRange.angle);

    scene.onBeforeRenderObservable.add(() => {
      function markVisibleParticles() {
        for (let i = 0; i < SPS.nbParticles; i++) {
          if (i === SETTINGS.particle.targetIndex) { continue; }
          if (isVisibleParticle(SPS.particles[SETTINGS.particle.targetIndex], SPS.particles[i])) {
            SPS.particles[i].color = BABYLON.Color3.Yellow();
          } else {
            SPS.particles[i].color = SPS.particles[i].props.color;
          }
        }
      }

      function updateViewingAreaMesh() {
        viewingAreaMesh.position.copyFrom(SPS.particles[SETTINGS.particle.targetIndex].position);
        viewingAreaMesh.rotation.copyFrom(SPS.particles[SETTINGS.particle.targetIndex].rotation);
        viewingAreaMesh.scaling.copyFromFloats(SETTINGS.particle.viewRange.distance, SETTINGS.particle.viewRange.distance, SETTINGS.particle.viewRange.distance);
      }

      markVisibleParticles();
      updateViewingAreaMesh();

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
