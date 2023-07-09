const e=`fn _NOISE_SIMPLEX__mod289_2d(pos: vec2<f32>) -> vec2<f32> {
  return pos - floor(pos / 289.) * 289.;
}

fn _NOISE_SIMPLEX__mod289_3d(pos: vec3<f32>) -> vec3<f32> {
  return pos - floor(pos / 289.) * 289.;
}

fn _NOISE_SIMPLEX__mod289_4d(pos: vec4<f32>) -> vec4<f32> {
  return pos - floor(pos / 289.) * 289.;
}

fn _NOISE_SIMPLEX__mod49_4d(pos: vec4<f32>) -> vec4<f32> {
  return pos - floor(pos / 49.) * 49.;
}

fn _NOISE_SIMPLEX__permute_3d(pos: vec3<f32>) -> vec3<f32> {
  return _NOISE_SIMPLEX__mod289_3d((pos * 34. + 1.) * pos);
}

fn _NOISE_SIMPLEX__permute_4d(pos: vec4<f32>) -> vec4<f32> {
  return _NOISE_SIMPLEX__mod289_4d((pos * 34. + 1.) * pos);
}

// 2D simplex noise by Stefan Gustavson and Ahima Arts
// https://github.com/keijiro/NoiseShader
fn NOISE_SIMPLEX__noise2d__f32(pos: vec2<f32>) -> f32 {
  const C1: f32 = (3. - sqrt(3.)) / 6.;
  const C2: f32 = (sqrt(3.) - 1.) / 2.;

  // First corner
  var i  = floor(pos + dot(pos, vec2<f32>(C2)));
  let x0 = pos - i + dot(i, vec2<f32>(C1));

  // Other corners
  let i1 = select(vec2<f32>(0., 1.), vec2<f32>(1., 0.), x0.x > x0.y);
  let x1 = x0 - i1 + C1;
  let x2 = x0 - 1. + 2. * C1;

  // Permutations
  i = _NOISE_SIMPLEX__mod289_2d(i);
  var p = _NOISE_SIMPLEX__permute_3d(    i.y + vec3<f32>(0, i1.y, 1));
      p = _NOISE_SIMPLEX__permute_3d(p + i.x + vec3<f32>(0, i1.x, 1));

  // Gradients: 41 points uniformly over a unit circle.
  // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)
  let phi = p / 41 * 3.14159265359 * 2;
  let g0 = vec2<f32>(cos(phi.x), sin(phi.x));
  let g1 = vec2<f32>(cos(phi.y), sin(phi.y));
  let g2 = vec2<f32>(cos(phi.z), sin(phi.z));

  // Compute noise and gradient at P
  var m  = vec3<f32>(dot(x0, x0), dot(x1, x1), dot(x2, x2));
  let px = vec3<f32>(dot(g0, x0), dot(g1, x1), dot(g2, x2));

  m = max(0.5 - m, vec3<f32>(0.));
  let m4 = m * m * m * m;

  return 99.2 * dot(m4, px);
}

// 3D simplex noise by Stefan Gustavson and Ahima Arts
// https://github.com/keijiro/NoiseShader
fn NOISE_SIMPLEX__noise3d__f32(pos: vec3<f32>) -> f32 {
  const C: vec2<f32> = vec2<f32>(1. / 6., 1. / 3.);
  const ZERO: vec4<f32> = vec4<f32>(0.);

  // First corner
  var i  = floor(pos + dot(pos, C.yyy));
  let x0 = pos - i + dot(i, C.xxx);

  // Other corners
  let g = step(x0.yzx, x0.xyz);
  let l = 1.0 - g;
  let i1 = min(g.xyz, l.zxy);
  let i2 = max(g.xyz, l.zxy);

  let x1 = x0 - i1 + C.x;
  let x2 = x0 - i2 + C.y;
  let x3 = x0 - 0.5;

  // Permutations
  i = _NOISE_SIMPLEX__mod289_3d(i); // Avoid truncation effects in permutation
  var p = _NOISE_SIMPLEX__permute_4d(    i.z + vec4<f32>(0, i1.z, i2.z, 1));
      p = _NOISE_SIMPLEX__permute_4d(p + i.y + vec4<f32>(0, i1.y, i2.y, 1));
      p = _NOISE_SIMPLEX__permute_4d(p + i.x + vec4<f32>(0, i1.x, i2.x, 1));

  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  let j = _NOISE_SIMPLEX__mod49_4d(p);

  let gx = (floor(j / 7.0) * 2.0 + 0.5) / 7.0 - 1.0;
  let gy = (floor(j - 7.0 * floor(j / 7.0)) * 2.0 + 0.5) / 7.0 - 1.0;
  let gz = 1.0 - abs(gx) - abs(gy);

  let b0 = vec4<f32>(gx.xy, gy.xy);
  let b1 = vec4<f32>(gx.zw, gy.zw);

  let s0 = floor(b0) * 2.0 + 1.0;
  let s1 = floor(b1) * 2.0 + 1.0;
  let sh = -step(gz, ZERO);

  let a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  let a1 = b1.xzyw + s1.xzyw * sh.zzww;

  let g0 = normalize(vec3<f32>(a0.xy, gz.x));
  let g1 = normalize(vec3<f32>(a0.zw, gz.y));
  let g2 = normalize(vec3<f32>(a1.xy, gz.z));
  let g3 = normalize(vec3<f32>(a1.zw, gz.w));

  // Mix final noise value
  let m = max(0.5 - vec4<f32>(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), ZERO);
  let px = vec4<f32>(dot(x0, g0), dot(x1, g1), dot(x2, g2), dot(x3, g3));

  let m4 = m * m * m * m;

  return 107. * dot(m4, px);
}
`;export{e as default};
