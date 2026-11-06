import * as THREE from 'three'

/**
 * The chapter logo (people around a gear) rebuilt from particles.
 * - Cursor / touch pushes particles away; they spring back.
 * - Scrolling past the hero scatters the gear into a starfield the camera flies through.
 * - Reaching the Join section reassembles it.
 * All displacement happens in the vertex shader, so the CPU only updates a few uniforms per frame.
 */

const VERT = /* glsl */ `
uniform float uTime;
uniform float uScatter;
uniform float uPixel;
uniform float uSize;
uniform vec3 uMouse;
uniform float uMouseStrength;
uniform float uMotion;
attribute vec3 aHome;
attribute vec3 aScatter;
attribute float aSeed;
attribute float aHot;
varying float vAlpha;
varying vec3 vColor;
varying float vHot;

void main() {
  // Stagger: some particles leave earlier than others, so the gear peels apart.
  float s = clamp(uScatter * 1.35 - aSeed * 0.35, 0.0, 1.0);
  s = s * s * (3.0 - 2.0 * s);
  vec3 p = mix(aHome, aScatter, s);

  float t = uTime * uMotion;
  p += vec3(sin(t * 0.7 + aSeed * 40.0), cos(t * 0.55 + aSeed * 31.0), sin(t * 0.45 + aSeed * 17.0))
       * mix(0.015, 0.22, s);

  vec2 d = p.xy - uMouse.xy;
  float dist2 = dot(d, d);
  float f = exp(-dist2 * 7.0) * uMouseStrength * (1.0 - s);
  p.xy += normalize(d + 1e-5) * f * 0.7;
  p.z += f * 0.9;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.55 + aSeed * 0.9) * uPixel / -mv.z;

  vec3 deep = vec3(0.0, 0.38, 0.61);    // IEEE blue
  vec3 bright = vec3(0.35, 0.78, 1.0);
  vec3 white = vec3(0.92, 0.97, 1.0);
  vec3 c = mix(deep, bright, smoothstep(0.1, 0.9, aSeed));
  c = mix(c, white, clamp(f * 1.6, 0.0, 1.0));
  vColor = c;
  vHot = aHot;
  vAlpha = mix(0.9, 0.55, s);
}
`

const FRAG = /* glsl */ `
uniform float uDim;
varying float vAlpha;
varying vec3 vColor;
varying float vHot;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float a = smoothstep(0.5, 0.0, r);
  vec3 col = mix(vColor, vec3(1.0, 0.81, 0.2), vHot);
  gl_FragColor = vec4(col * a, a * vAlpha * uDim);
}
`

type Opts = { count: number; logoUrl: string; reducedMotion: boolean }

export class GearField {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private group = new THREE.Group()
  private material!: THREE.ShaderMaterial
  private raf = 0
  private last = performance.now()
  private mouseNdc = new THREE.Vector2(10, 10)
  private mouseLocal = new THREE.Vector3(10, 10, 0)
  private mouseTarget = new THREE.Vector3(10, 10, 0)
  private mouseActive = 0
  private plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  private ray = new THREE.Raycaster()
  private tilt = new THREE.Vector2()
  private scatter = 0
  private dim = 1
  private camZ = 6
  /** Set from outside on scroll. */
  targets = { scatter: 0, dim: 1, camZ: 6 }
  private disposed = false
  private opts: Opts

  constructor(canvas: HTMLCanvasElement, opts: Opts) {
    this.opts = opts
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    this.renderer.setClearColor(0x000000, 0)
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    this.camera.position.set(0, 0, 6)
    this.scene.add(this.group)
    this.resize()
    window.addEventListener('resize', this.resize)
    window.addEventListener('pointermove', this.onPointer, { passive: true })
    window.addEventListener('pointerdown', this.onPointer, { passive: true })
    document.addEventListener('pointerleave', this.onLeave)
    document.addEventListener('visibilitychange', this.onVisibility)
  }

  async init() {
    const pts = await sampleLogo(this.opts.logoUrl, 300)
    if (this.disposed) return
    const n = this.opts.count
    const home = new Float32Array(n * 3)
    const scat = new Float32Array(n * 3)
    const seed = new Float32Array(n)
    const hot = new Float32Array(n)
    const S = 4.4
    for (let i = 0; i < n; i++) {
      const [x, y] = pts[(Math.random() * pts.length) | 0]
      const jx = (Math.random() - 0.5) * (1 / 300)
      const jy = (Math.random() - 0.5) * (1 / 300)
      home[i * 3] = (x + jx - 0.5) * S
      home[i * 3 + 1] = -(y + jy - 0.5) * S
      home[i * 3 + 2] = (Math.random() - 0.5) * 0.18
      // Scatter field: a deep box the camera will fly into.
      scat[i * 3] = (Math.random() - 0.5) * 26
      scat[i * 3 + 1] = (Math.random() - 0.5) * 16
      scat[i * 3 + 2] = -Math.random() * 22 + 4
      seed[i] = Math.random()
      hot[i] = Math.random() < 0.012 ? 1 : 0
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(home.slice(), 3))
    geo.setAttribute('aHome', new THREE.BufferAttribute(home, 3))
    geo.setAttribute('aScatter', new THREE.BufferAttribute(scat, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    geo.setAttribute('aHot', new THREE.BufferAttribute(hot, 1))
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40)

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uScatter: { value: 0 },
        uPixel: { value: this.renderer.getPixelRatio() },
        uSize: { value: window.innerWidth < 700 ? 24 : 26 },
        uMouse: { value: this.mouseLocal },
        uMouseStrength: { value: 0 },
        uMotion: { value: this.opts.reducedMotion ? 0 : 1 },
        uDim: { value: 1 },
      },
    })
    this.group.add(new THREE.Points(geo, this.material))
    this.loop()
  }

  private resize = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    // Keep the gear a sensible size on narrow screens.
    this.camera.fov = w < 700 ? 62 : 45
    this.camera.updateProjectionMatrix()
    // Desktop: gear sits right of the headline. Mobile: above it.
    this.group.position.set(w >= 900 ? 1.7 : 0, w >= 900 ? 0.05 : 1.55, 0)
    this.group.scale.setScalar(w >= 900 ? 1 : 0.82)
  }

  private onPointer = (e: PointerEvent) => {
    this.mouseNdc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
    this.mouseActive = 1
  }
  private onLeave = () => {
    this.mouseActive = 0
  }
  private onVisibility = () => {
    if (document.hidden) cancelAnimationFrame(this.raf)
    else {
      this.last = performance.now()
      this.loop()
    }
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    const now = performance.now()
    const dt = Math.min((now - this.last) / 1000, 0.05)
    this.last = now
    const k = 1 - Math.pow(0.0015, dt) // frame-rate independent easing
    const u = this.material.uniforms
    u.uTime.value += dt

    this.scatter += (this.targets.scatter - this.scatter) * k
    this.dim += (this.targets.dim - this.dim) * k
    this.camZ += (this.targets.camZ - this.camZ) * k
    u.uScatter.value = this.scatter
    u.uDim.value = this.dim

    // Mouse → point on the gear's plane, in the gear's local space.
    this.ray.setFromCamera(this.mouseNdc, this.camera)
    const hit = new THREE.Vector3()
    if (this.ray.ray.intersectPlane(this.plane, hit)) {
      this.group.worldToLocal(hit)
      this.mouseTarget.copy(hit)
    }
    this.mouseLocal.lerp(this.mouseTarget, 1 - Math.pow(0.0001, dt))
    u.uMouseStrength.value += (this.mouseActive * (1 - this.scatter) - u.uMouseStrength.value) * k

    // Slow spin plus a little tilt toward the cursor.
    if (!this.opts.reducedMotion) this.group.rotation.z -= dt * 0.06
    this.tilt.lerp(this.mouseActive ? this.mouseNdc : new THREE.Vector2(), k * 0.5)
    this.group.rotation.x = -this.tilt.y * 0.18
    this.group.rotation.y = this.tilt.x * 0.22

    this.camera.position.z = this.camZ
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.resize)
    window.removeEventListener('pointermove', this.onPointer)
    window.removeEventListener('pointerdown', this.onPointer)
    document.removeEventListener('pointerleave', this.onLeave)
    document.removeEventListener('visibilitychange', this.onVisibility)
    this.renderer.dispose()
  }
}

/** Returns normalised [x, y] positions of opaque pixels in the logo. */
async function sampleLogo(url: string, size: number): Promise<[number, number][]> {
  const img = new Image()
  img.src = url
  await img.decode()
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0, size, size)
  const data = ctx.getImageData(0, 0, size, size).data
  const out: [number, number][] = []
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) if (data[(y * size + x) * 4 + 3] > 110) out.push([x / size, y / size])
  return out
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
