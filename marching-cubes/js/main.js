/// <reference path="../../node_modules/babylonjs/babylon.d.ts" />

const {
  ArcRotateCamera,
  Buffer,
  Color3,
  ComputeShader,
  HemisphericLight,
  Mesh,
  Scene,
  StandardMaterial,
  StorageBuffer,
  Vector3,
  VertexBuffer,
  VertexData,
  WebGPUEngine,
} = BABYLON;

const PI = Math.PI;

const Utils = {
  Buffer: {
    Strides: {
      VERTEX: 32,
      VEC3_F32: 16,
    },
  },
  Number: {
    /**
     * @param {number} lower 
     * @param {number | undefined} upper 
     * @returns {number[]}
     */
    Range: function range(lower, upper) {
      if (upper === undefined) {
        upper = lower;
        lower = 0;
      }

      const ret = [];
      for (let i = lower; i < upper; i++) {
        ret.push(i);
      }
      return ret;
    },
  },
};

const $ENV = {
  world: {
    center: () => Vector3.Zero(),
  },
};

const SHADER_SOURCES = {
  'Compute:MarchingCubesMesh': `

struct Vertex {
  position: vec3<f32>,
  normal: vec3<f32>,
};

@group(0) @binding(0)
var<storage, read_write> vertices: array<Vertex>;

@compute @workgroup_size(1, 1, 1)
fn main(@builtin(workgroup_id) workgroup_id: vec3<u32>) {
  vertices[0].position = vec3<f32>(0, 0, 0);
  vertices[1].position = vec3<f32>(1, 0, 0);
  vertices[2].position = vec3<f32>(1, 0, 1);
  vertices[3].position = vec3<f32>(0, 0, 0);
  vertices[4].position = vec3<f32>(1, 0, 1);
  vertices[5].position = vec3<f32>(0, 0, 1);

  vertices[0].normal = vec3<f32>(0, 1, 0);
  vertices[1].normal = vec3<f32>(0, 1, 0);
  vertices[2].normal = vec3<f32>(0, 1, 0);
  vertices[3].normal = vec3<f32>(0, 1, 0);
  vertices[4].normal = vec3<f32>(0, 1, 0);
  vertices[5].normal = vec3<f32>(0, 1, 0);
}

  `,
}

async function main() {
  const canvas = document.getElementById('root');
  
  const engine = new WebGPUEngine(canvas, { preserveDrawingBuffer: true, stencil: true });
  await engine.initAsync();

  const Buffers = {
    MarchingCubesVertices: new StorageBuffer(engine, Utils.Buffer.Strides.VERTEX * 6),
  };

  const Shaders = {
    MarchingCubesMesh: new ComputeShader(
      'marching-cubes-mesh',
      engine,
      { computeSource: SHADER_SOURCES['Compute:MarchingCubesMesh'] },
      {
        bindingsMapping: {
          vertices: { group: 0, binding: 0 },
        },
      },
    ),
  };

  const INDICES_WITH_MAX_VERTICES = Utils.Number.Range(1 << 12);

  /**
   * @param {BABYLON.Mesh} mesh 
   * @param {BABYLON.Buffer} buffer
   * @returns {BABYLON.Mesh}
   */
  function ApplyVertexBuffers(mesh, numVertices) {
    mesh.setVerticesBuffer(new VertexBuffer(engine, new Float32Array(Utils.Buffer.Strides.VERTEX * numVertices), VertexBuffer.PositionKind, true, undefined, 8, undefined, 0, 3));
    mesh.setVerticesBuffer(new VertexBuffer(engine, new Float32Array(Utils.Buffer.Strides.VERTEX * numVertices), VertexBuffer.NormalKind, true, undefined, 8, undefined, 4, 3));
    mesh.setIndices(INDICES_WITH_MAX_VERTICES, numVertices, true);
    return mesh;
  }

  function createScene() {
    const scene = new Scene(engine);
    const camera = new ArcRotateCamera('camera', .25 * PI, .25 * PI, 10, $ENV.world.center(), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, false);

    const light = new HemisphericLight('light', Vector3.Up(), scene);

    const mesh = new Mesh('mesh', scene);
    const wireframeMat = new StandardMaterial('wireframe-mat', scene);
    wireframeMat.wireframe = true;
    mesh.material = wireframeMat;
  
    ApplyVertexBuffers(mesh, 6);

    Shaders.MarchingCubesMesh.setStorageBuffer('vertices', Buffers.MarchingCubesVertices);

    Shaders.MarchingCubesMesh
      .dispatchWhenReady(1, 1, 1)
      .then(() => Buffers.MarchingCubesVertices.read())
      .then(data => new Float32Array(data.buffer))
      .then(vertices => {
        mesh.getVertexBuffer(VertexBuffer.PositionKind).update(vertices);
        mesh.getVertexBuffer(VertexBuffer.NormalKind).update(vertices);
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
