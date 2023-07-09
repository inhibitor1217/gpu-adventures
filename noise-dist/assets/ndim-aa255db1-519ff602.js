const _=`const _RANDOM_NDIM__seed: vec4<f32> = vec4<f32>(
  29.307,
  91.234,
  45.987,
  78.281,
);

fn RANDOM__random2d__f32(value: f32) -> vec2<f32> {
  return vec2<f32>(
    RANDOM__random__f32(value + _RANDOM_NDIM__seed.x),
    RANDOM__random__f32(value + _RANDOM_NDIM__seed.y),
  );
}

fn RANDOM__random3d__f32(value: f32) -> vec3<f32> {
  return vec3<f32>(
    RANDOM__random__f32(value + _RANDOM_NDIM__seed.x),
    RANDOM__random__f32(value + _RANDOM_NDIM__seed.y),
    RANDOM__random__f32(value + _RANDOM_NDIM__seed.z),
  );
}

fn RANDOM__random4d__f32(value: f32) -> vec4<f32> {
  return vec4<f32>(
    RANDOM__random__f32(value + _RANDOM_NDIM__seed.x),
    RANDOM__random__f32(value + _RANDOM_NDIM__seed.y),
    RANDOM__random__f32(value + _RANDOM_NDIM__seed.z),
    RANDOM__random__f32(value + _RANDOM_NDIM__seed.w),
  );
}

fn RANDOM__random2d__f32_2d(value: vec2<f32>) -> vec2<f32> {
  return vec2<f32>(
    RANDOM__random__f32_2d(value + _RANDOM_NDIM__seed.xy),
    RANDOM__random__f32_2d(value + _RANDOM_NDIM__seed.zw),
  );
}

fn RANDOM__random3d__f32_2d(value: vec2<f32>) -> vec3<f32> {
  return vec3<f32>(
    RANDOM__random__f32_2d(value + _RANDOM_NDIM__seed.xy),
    RANDOM__random__f32_2d(value + _RANDOM_NDIM__seed.zw),
    RANDOM__random__f32_2d(value + _RANDOM_NDIM__seed.wx),
  );
}

fn RANDOM__random4d__f32_2d(value: vec2<f32>) -> vec4<f32> {
  return vec4<f32>(
    RANDOM__random__f32_2d(value + _RANDOM_NDIM__seed.xy),
    RANDOM__random__f32_2d(value + _RANDOM_NDIM__seed.zw),
    RANDOM__random__f32_2d(value + _RANDOM_NDIM__seed.wx),
    RANDOM__random__f32_2d(value + _RANDOM_NDIM__seed.yz),
  );
}

fn RANDOM__random2d__f32_3d(value: vec3<f32>) -> vec2<f32> {
  return vec2<f32>(
    RANDOM__random__f32_3d(value + _RANDOM_NDIM__seed.xyz),
    RANDOM__random__f32_3d(value + _RANDOM_NDIM__seed.zwx),
  );
}

fn RANDOM__random3d__f32_3d(value: vec3<f32>) -> vec3<f32> {
  return vec3<f32>(
    RANDOM__random__f32_3d(value + _RANDOM_NDIM__seed.xyz),
    RANDOM__random__f32_3d(value + _RANDOM_NDIM__seed.zwx),
    RANDOM__random__f32_3d(value + _RANDOM_NDIM__seed.wxy),
  );
}

fn RANDOM__random4d__f32_3d(value: vec3<f32>) -> vec4<f32> {
  return vec4<f32>(
    RANDOM__random__f32_3d(value + _RANDOM_NDIM__seed.xyz),
    RANDOM__random__f32_3d(value + _RANDOM_NDIM__seed.zwx),
    RANDOM__random__f32_3d(value + _RANDOM_NDIM__seed.wxy),
    RANDOM__random__f32_3d(value + _RANDOM_NDIM__seed.yzw),
  );
}

fn RANDOM__random2d__f32_4d(value: vec4<f32>) -> vec2<f32> {
  return vec2<f32>(
    RANDOM__random__f32_4d(value + _RANDOM_NDIM__seed.xyzw),
    RANDOM__random__f32_4d(value + _RANDOM_NDIM__seed.zwxy),
  );
}

fn RANDOM__random3d__f32_4d(value: vec4<f32>) -> vec3<f32> {
  return vec3<f32>(
    RANDOM__random__f32_4d(value + _RANDOM_NDIM__seed.xyzw),
    RANDOM__random__f32_4d(value + _RANDOM_NDIM__seed.zwxy),
    RANDOM__random__f32_4d(value + _RANDOM_NDIM__seed.wxyz),
  );
}

fn RANDOM__random4d__f32_4d(value: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(
    RANDOM__random__f32_4d(value + _RANDOM_NDIM__seed.xyzw),
    RANDOM__random__f32_4d(value + _RANDOM_NDIM__seed.zwxy),
    RANDOM__random__f32_4d(value + _RANDOM_NDIM__seed.wxyz),
    RANDOM__random__f32_4d(value + _RANDOM_NDIM__seed.yzwx),
  );
}
`;export{_ as default};
