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
    // const axesViewer = new BABYLON.AxesViewer(scene);

    const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 40, BABYLON.Vector3.Zero(), scene);

    const light = new BABYLON.HemisphericLight("Light", new BABYLON.Vector3(0, 1, 0), scene);

    const triangle = BABYLON.MeshBuilder.CreateDisc('Triangle', { tessellation: 3 }, scene);
  
    const SPS = new BABYLON.SolidParticleSystem('BoidSPS', scene);
    SPS.addShape(triangle, 200);

    triangle.dispose();

    const mesh = SPS.buildMesh();

    const colors = {
      light: new BABYLON.Color3(.43, .78, 1),
      dark: new BABYLON.Color3(0, .41, .75),
      target: BABYLON.Color3.Red(),
    };
    const speed = 5.0;
    const visibleRadius = 4.0;
    const viewingAngle = 2/3 * Math.PI;

    /**
     * @param {BABYLON.SolidParticle} me 
     * @param {BABYLON.SolidParticle} other 
     * @returns {boolean}
     */
    function isVisibleParticle(me, other) {
      const diff = other.position.subtract(me.position);
      return (
        diff.length() < visibleRadius &&
        BABYLON.Vector3.Dot(
          diff.clone().normalize(),
          me.props.velocity.clone().normalize(),
        ) >= Math.cos(viewingAngle)
      );
    }

    const worldBoundary = {
      x: { max: 20, min: -20 },
      y: { max: 15, min: -15 },
    };

    const targetParticleIndex = 0;

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

        particle.props = {
          velocity,
          acceleration: BABYLON.Vector3.Zero(),
        };

        particle.scale = new BABYLON.Vector3(1, .5, 1);

        particle.color = (
          i === targetParticleIndex
            ? colors.target
            : mixColor(colors.light, colors.dark, BABYLON.Scalar.RandomRange(0, 1))
        );

        particle.props.color = particle.color;
      }
    }

    SPS.updateParticle = particle => {
      const dt = engine.getDeltaTime() * .001;

      particle.props.velocity.addInPlace(particle.props.acceleration.scale(dt));

      particle.position.addInPlace(particle.props.velocity.scale(dt));
      sanitizePosition(particle.position, worldBoundary);

      particle.rotation.z = Math.atan2(particle.props.velocity.y, particle.props.velocity.x);
    }

    SPS.initParticles();
    SPS.setParticles();

    const viewingAreaMesh = CreateArcMesh(viewingAngle);

    scene.onBeforeRenderObservable.add(() => {
      function markVisibleParticles() {
        for (let i = 0; i < SPS.nbParticles; i++) {
          if (i === targetParticleIndex) { continue; }
          if (isVisibleParticle(SPS.particles[targetParticleIndex], SPS.particles[i])) {
            SPS.particles[i].color = BABYLON.Color3.Yellow();
          } else {
            SPS.particles[i].color = SPS.particles[i].props.color;
          }
        }
      }

      function updateViewingAreaMesh() {
        viewingAreaMesh.position.copyFrom(SPS.particles[targetParticleIndex].position);
        viewingAreaMesh.rotation.copyFrom(SPS.particles[targetParticleIndex].rotation);
        viewingAreaMesh.scaling.copyFromFloats(visibleRadius, visibleRadius, visibleRadius);
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
