import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import {
  TREE_CAMERA_POSITION,
  TREE_CAMERA_TARGET,
  TREE_CYCLE_YEARS,
  TREE_DUST_PILE_HEIGHT_PER_DEATH_RATIO,
  TREE_DUST_PILE_RADIUS_UNITS,
  TREE_DUST_PARTICLE_COUNT,
  TREE_LEAVES_PER_SECONDARY_BRANCH,
  TREE_MAX_HEIGHT_UNITS,
  TREE_MAX_VISIBLE_GENERATIONS,
  TREE_PRIMARY_BRANCH_COUNT,
  TREE_SECONDARY_BRANCHES_PER_PRIMARY,
} from './tunables'
import {
  clamp01,
  decayPileGenerations,
  generationGroundPoint,
  growWindow,
  phaseAtTreeYear,
  smoother,
  visibleTreeGenerations,
  visualTreeYearFromLocalAge,
} from './treeLifecycle'

type SceneVariant = 'earth' | 'space'

type ThreeTreeSceneProps = {
  ageTotal: number
  cameraDistanceScale?: number
  focusOffsetX?: number
  focusOffsetY?: number
  localAge: number
  streamMode: 'local' | 'received'
  variant: SceneVariant
}

type BranchVisual = {
  baseRotation: THREE.Euler
  curve: THREE.CatmullRomCurve3
  depth: number
  group: THREE.Group
  length: number
  mesh: THREE.Mesh
  parent?: BranchVisual
  startAt: number
  tip: THREE.Mesh
  worldCurve: THREE.CatmullRomCurve3
}

type LeafVisual = THREE.Mesh & {
  userData: {
    basePosition: THREE.Vector3
    baseRotation: THREE.Euler
    baseScale: number
    fallDelay: number
    phase: number
    startAt: number
  }
}

type TreeGeneration = {
  branches: BranchVisual[]
  cycleStartYear: number
  dust: THREE.Points
  dustStarts: Float32Array
  generationIndex: number
  group: THREE.Group
  leaves: LeafVisual[]
  materials: TreeMaterials
  rootlets: THREE.Mesh[]
  seed: THREE.Mesh
}

type DecayPile = {
  generationIndex: number
  mesh: THREE.Mesh
}

type TreeMaterials = {
  bark: THREE.MeshStandardMaterial
  leaf: THREE.MeshStandardMaterial
  root: THREE.MeshStandardMaterial
  seed: THREE.MeshStandardMaterial
  young: THREE.MeshStandardMaterial
}

type SceneObjects = {
  camera: THREE.PerspectiveCamera
  decayPiles: DecayPile[]
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  trees: TreeGeneration[]
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0xffffffff
  }
}

function generationGroundPosition(generationIndex: number) {
  const point = generationGroundPoint(generationIndex)

  return new THREE.Vector3(point.x, 0, point.z)
}

function makeGradientTexture(top: string, middle: string, bottom: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 512
  const context = canvas.getContext('2d')

  if (!context) {
    return undefined
  }

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, top)
  gradient.addColorStop(0.46, middle)
  gradient.addColorStop(1, bottom)
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace

  return texture
}

function makeLeafTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')

  if (!context) {
    return undefined
  }

  context.translate(64, 66)
  const gradient = context.createLinearGradient(-40, -42, 44, 42)
  gradient.addColorStop(0, '#d8ff9a')
  gradient.addColorStop(0.48, '#56b94b')
  gradient.addColorStop(1, '#126236')
  context.fillStyle = gradient
  context.beginPath()
  context.moveTo(0, -54)
  context.bezierCurveTo(47, -34, 49, 24, 0, 55)
  context.bezierCurveTo(-49, 24, -47, -34, 0, -54)
  context.fill()
  context.globalAlpha = 0.5
  context.strokeStyle = '#efffd4'
  context.lineWidth = 2.4
  context.beginPath()
  context.moveTo(0, -44)
  context.quadraticCurveTo(2, -2, 0, 48)
  context.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace

  return texture
}

function makeBarkTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 384
  canvas.height = 384
  const context = canvas.getContext('2d')

  if (!context) {
    return undefined
  }

  const random = seededRandom(1907)
  context.fillStyle = '#5b351f'
  context.fillRect(0, 0, canvas.width, canvas.height)
  for (let x = 0; x < canvas.width; x += 6) {
    const shade = 45 + random() * 85
    context.strokeStyle = `rgba(${shade + 32},${shade * 0.72},${shade * 0.45},${0.08 + random() * 0.14})`
    context.lineWidth = 1 + random() * 4
    context.beginPath()
    let y = -20
    context.moveTo(x + random() * 10, y)
    while (y < canvas.height + 24) {
      y += 18 + random() * 28
      context.lineTo(x + Math.sin(y * 0.035 + x) * (7 + random() * 8), y)
    }
    context.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2.2, 5.8)

  return texture
}

function makeRadialTexture(size: number, color: string) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')

  if (!context) {
    return undefined
  }

  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, color)
  gradient.addColorStop(0.36, color.replace('0.95', '0.55'))
  gradient.addColorStop(1, color.replace('0.95', '0'))
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace

  return texture
}

function createMaterials(variant: SceneVariant): TreeMaterials {
  const barkTexture = makeBarkTexture()
  const leafTexture = makeLeafTexture()
  const space = variant === 'space'

  return {
    bark: new THREE.MeshStandardMaterial({
      color: space ? 0xd99558 : 0x7a4729,
      emissive: space ? 0x5f2418 : 0x000000,
      emissiveIntensity: space ? 0.72 : 0,
      map: barkTexture,
      metalness: space ? 0.08 : 0,
      roughness: space ? 0.78 : 0.86,
      transparent: true,
    }),
    leaf: new THREE.MeshStandardMaterial({
      alphaTest: 0.22,
      color: space ? 0x7dd9ff : 0x58b84c,
      emissive: space ? 0x08243a : 0x041a07,
      map: leafTexture,
      metalness: 0,
      roughness: 0.74,
      side: THREE.DoubleSide,
      transparent: true,
    }),
    root: new THREE.MeshStandardMaterial({
      color: space ? 0x425564 : 0x4a2b18,
      roughness: 0.9,
      transparent: true,
    }),
    seed: new THREE.MeshStandardMaterial({
      color: space ? 0x91c3d0 : 0x2e1a0c,
      roughness: 0.84,
      transparent: true,
    }),
    young: new THREE.MeshStandardMaterial({
      color: space ? 0xf2b06a : 0x6f8f42,
      emissive: space ? 0x6a2f1e : 0x000000,
      emissiveIntensity: space ? 0.52 : 0,
      metalness: space ? 0.08 : 0,
      roughness: 0.76,
      transparent: true,
    }),
  }
}

function createTaperedTubeGeometry(
  curve: THREE.CatmullRomCurve3,
  radiusStart: number,
  radiusEnd: number,
) {
  const tubularSegments = 24
  const radialSegments = 10
  const frames = curve.computeFrenetFrames(tubularSegments, false)
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let i = 0; i <= tubularSegments; i += 1) {
    const t = i / tubularSegments
    const point = curve.getPoint(t)
    const radius = THREE.MathUtils.lerp(radiusStart, radiusEnd, smoother(t))
    const normal = frames.normals[i]
    const binormal = frames.binormals[i]

    for (let j = 0; j < radialSegments; j += 1) {
      const angle = (j / radialSegments) * Math.PI * 2
      const x = Math.cos(angle)
      const y = Math.sin(angle)
      positions.push(
        point.x + radius * (x * normal.x + y * binormal.x),
        point.y + radius * (x * normal.y + y * binormal.y),
        point.z + radius * (x * normal.z + y * binormal.z),
      )
      uvs.push(j / radialSegments, t)
    }
  }

  for (let i = 0; i < tubularSegments; i += 1) {
    for (let j = 0; j < radialSegments; j += 1) {
      const a = i * radialSegments + j
      const b = i * radialSegments + ((j + 1) % radialSegments)
      const c = (i + 1) * radialSegments + ((j + 1) % radialSegments)
      const d = (i + 1) * radialSegments + j
      indices.push(a, d, b, b, d, c)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()

  return geometry
}

function branchDirection(angle: number, elevation: number) {
  return new THREE.Vector3(
    Math.cos(angle) * Math.cos(elevation),
    Math.sin(elevation),
    Math.sin(angle) * Math.cos(elevation),
  ).normalize()
}

function setMaterialOpacity(material: THREE.Material, opacity: number) {
  material.opacity = clamp01(opacity)
  material.transparent = material.opacity < 0.999
  material.depthWrite = material.opacity > 0.72
}

function createTreeGeneration(cycleStartYear: number, generationIndex: number, variant: SceneVariant) {
  const random = seededRandom((variant === 'earth' ? 1001 : 2203) + generationIndex * 997)
  const group = new THREE.Group()
  group.position.copy(generationGroundPosition(generationIndex))
  const materials = createMaterials(variant)
  const tree: TreeGeneration = {
    branches: [],
    cycleStartYear,
    dust: new THREE.Points(),
    dustStarts: new Float32Array(),
    generationIndex,
    group,
    leaves: [],
    materials,
    rootlets: [],
    seed: new THREE.Mesh(),
  }

  function addBranch(options: {
    depth: number
    length: number
    parent?: BranchVisual
    parentAlong?: number
    radiusEnd: number
    radiusStart: number
    start: THREE.Vector3
    startAt: number
    worldDirection: THREE.Vector3
  }) {
    const { depth, length, parent, parentAlong, radiusEnd, radiusStart, start, startAt, worldDirection } = options
    const anchorWorld = parent ? parent.worldCurve.getPoint(parentAlong ?? 0) : start
    const anchorLocal = parent ? parent.curve.getPoint(parentAlong ?? 0) : start
    const side = new THREE.Vector3(-worldDirection.z, 0, worldDirection.x).normalize().multiplyScalar((random() - 0.5) * 0.55)
    const localPoints = Array.from({ length: 8 }, (_, index) => {
      const t = index / 7
      return worldDirection.clone().multiplyScalar(length * t)
        .add(side.clone().multiplyScalar(Math.sin(t * Math.PI)))
        .add(new THREE.Vector3(0, -0.12 * t * t * depth, 0))
    })
    const worldPoints = localPoints.map((point) => anchorWorld.clone().add(point))
    const curve = new THREE.CatmullRomCurve3(localPoints)
    const worldCurve = new THREE.CatmullRomCurve3(worldPoints)
    const geometry = createTaperedTubeGeometry(curve, radiusStart, radiusEnd)
    const material = depth > 1 ? materials.young : materials.bark
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    const branchGroup = new THREE.Group()
    branchGroup.add(mesh)
    branchGroup.position.copy(parent ? anchorLocal : start)
    branchGroup.scale.setScalar(0.001)
    if (parent) {
      parent.group.add(branchGroup)
    } else {
      group.add(branchGroup)
    }

    const tip = new THREE.Mesh(new THREE.SphereGeometry(Math.max(radiusEnd * 1.35, 0.012), 10, 6), material)
    tip.position.copy(curve.getPoint(1))
    tip.castShadow = true
    branchGroup.add(tip)

    const branch: BranchVisual = {
      baseRotation: branchGroup.rotation.clone(),
      curve,
      depth,
      group: branchGroup,
      length,
      mesh,
      parent,
      startAt,
      tip,
      worldCurve,
    }
    tree.branches.push(branch)

    return branch
  }

  const trunk = addBranch({
    depth: 0,
    length: 5.4,
    radiusEnd: 0.105,
    radiusStart: 0.34,
    start: new THREE.Vector3(0, 0.1, 0),
    startAt: 0.04,
    worldDirection: new THREE.Vector3(0.018, 1, 0.035).normalize(),
  })

  const primaryBranches: BranchVisual[] = []
  for (let index = 0; index < TREE_PRIMARY_BRANCH_COUNT; index += 1) {
    const along = 0.14 + index * 0.057 + (random() - 0.5) * 0.018
    const angle = index * 2.399 + 0.6 + generationIndex * 0.22
    const length = 1.55 + random() * 1.3 + along * 0.55
    const elevation = 0.24 + random() * 0.36
    primaryBranches.push(addBranch({
      depth: 1,
      length,
      parent: trunk,
      parentAlong: along,
      radiusEnd: 0.032,
      radiusStart: 0.095 + (1 - along) * 0.095,
      start: trunk.worldCurve.getPoint(along),
      startAt: 0.15 + along * 0.23,
      worldDirection: branchDirection(angle, elevation),
    }))
  }

  for (const primary of primaryBranches) {
    for (let index = 0; index < TREE_SECONDARY_BRANCHES_PER_PRIMARY; index += 1) {
      const along = 0.36 + random() * 0.55
      const origin = primary.worldCurve.getPoint(along)
      const angle = Math.atan2(origin.z, origin.x) + (index % 2 ? 1 : -1) * (0.65 + random() * 0.8)
      const branch = addBranch({
        depth: 2,
        length: 0.75 + random() * 1.45,
        parent: primary,
        parentAlong: along,
        radiusEnd: 0.016,
        radiusStart: 0.045 + random() * 0.035,
        start: origin,
        startAt: primary.startAt + 0.14 + random() * 0.12,
        worldDirection: branchDirection(angle, 0.26 + random() * 0.62),
      })

      for (let leafIndex = 0; leafIndex < TREE_LEAVES_PER_SECONDARY_BRANCH; leafIndex += 1) {
        const anchor = branch.worldCurve.getPoint(0.35 + random() * 0.65)
        const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.74, 4, 6), materials.leaf.clone()) as unknown as LeafVisual
        leaf.position.copy(anchor).add(new THREE.Vector3((random() - 0.5) * 0.34, (random() - 0.2) * 0.24, (random() - 0.5) * 0.34))
        leaf.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI)
        leaf.userData = {
          basePosition: leaf.position.clone(),
          baseRotation: leaf.rotation.clone(),
          baseScale: 0.62 + random() * 0.88,
          fallDelay: random() * 0.42,
          phase: random() * 100,
          startAt: branch.startAt + 0.08 + random() * 0.16,
        }
        leaf.scale.setScalar(0.001)
        leaf.visible = false
        leaf.castShadow = true
        group.add(leaf)
        tree.leaves.push(leaf)
      }
    }
  }

  for (let index = 0; index < 16; index += 1) {
    const angle = (index / 16) * Math.PI * 2
    const length = 0.38 + random() * 0.58
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(angle) * 0.16, 0.055, Math.sin(angle) * 0.16),
      new THREE.Vector3(Math.cos(angle) * 0.44, 0.025, Math.sin(angle) * 0.44),
      new THREE.Vector3(Math.cos(angle + 0.14) * length, 0.012, Math.sin(angle + 0.14) * length),
    ])
    const radius = 0.012 + random() * 0.014
    const root = new THREE.Mesh(createTaperedTubeGeometry(curve, radius, radius * 0.55), materials.root)
    root.castShadow = true
    root.scale.setScalar(0.001)
    root.userData = { endAt: 0.43 + random() * 0.2, startAt: 0.08 + random() * 0.14 }
    group.add(root)
    tree.rootlets.push(root)
  }

  const seed = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 16), materials.seed)
  seed.position.set(0, 0.16, 0)
  seed.scale.set(1, 0.62, 1)
  seed.castShadow = true
  group.add(seed)
  tree.seed = seed

  const dustGeometry = new THREE.BufferGeometry()
  const dustStarts = new Float32Array(TREE_DUST_PARTICLE_COUNT * 3)
  for (let index = 0; index < TREE_DUST_PARTICLE_COUNT; index += 1) {
    const source = tree.branches[Math.floor(random() * tree.branches.length)].worldCurve.getPoint(random())
    dustStarts[index * 3] = source.x + (random() - 0.5) * 0.32
    dustStarts[index * 3 + 1] = Math.max(0.08, source.y + (random() - 0.2) * 0.22)
    dustStarts[index * 3 + 2] = source.z + (random() - 0.5) * 0.32
  }
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustStarts.slice(), 3))
  const dustTexture = makeRadialTexture(64, variant === 'earth' ? 'rgba(207,164,104,0.95)' : 'rgba(155,220,255,0.95)')
  tree.dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({
      blending: THREE.AdditiveBlending,
      color: variant === 'earth' ? 0xcfa468 : 0x9bdcff,
      depthWrite: false,
      map: dustTexture,
      opacity: 0,
      size: 0.045,
      transparent: true,
    }),
  )
  tree.dust.visible = false
  tree.dustStarts = dustStarts
  group.add(tree.dust)

  group.visible = false

  return tree
}

function createDecayPile(variant: SceneVariant) {
  const dustPile = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1.22, 1, 56, 3),
    new THREE.MeshStandardMaterial({
      color: variant === 'earth' ? 0x6b4a2c : 0x5c7080,
      metalness: variant === 'earth' ? 0 : 0.16,
      roughness: 0.96,
      transparent: true,
      opacity: 0.78,
    }),
  )
  dustPile.visible = false
  dustPile.receiveShadow = true
  dustPile.castShadow = true

  return dustPile
}

function updateTree(
  tree: TreeGeneration,
  visualTreeYear: number,
  generationIndex: number,
  variant: SceneVariant,
  elapsed: number,
) {
  tree.cycleStartYear = generationIndex * TREE_CYCLE_YEARS
  tree.generationIndex = generationIndex
  tree.group.position.copy(generationGroundPosition(generationIndex))

  const localYear = visualTreeYear - tree.cycleStartYear
  const phase = phaseAtTreeYear(localYear)
  tree.group.visible = phase.isVisible

  if (!phase.isVisible) {
    return
  }

  const visibleOpacity = clamp01(phase.structureOpacity)
  const branchWilt = phase.branchWilt
  const dustBuild = phase.dustBuild

  tree.seed.visible = phase.growth < 0.31 && phase.decay < 0.02
  const seedScale = Math.max(0.001, 1 - growWindow(phase.growth, 0.08, 0.28))
  tree.seed.scale.set(seedScale, seedScale * 0.62, seedScale)
  ;(tree.seed.material as THREE.MeshStandardMaterial).opacity = seedScale
  tree.seed.position.y = 0.16 - growWindow(phase.growth, 0.08, 0.32) * 0.12
  tree.seed.rotation.y = elapsed * 0.18

  for (const root of tree.rootlets) {
    root.scale.setScalar(
      growWindow(phase.growth, root.userData.startAt as number, root.userData.endAt as number) *
      (1 - dustBuild * 0.82),
    )
    setMaterialOpacity(root.material as THREE.Material, visibleOpacity)
  }

  const liveColor = new THREE.Color(variant === 'earth' ? 0x7a4729 : 0xd99558)
  const deadColor = new THREE.Color(variant === 'earth' ? 0x6b5a48 : 0x8e5b5f)
  const youngColor = new THREE.Color(variant === 'earth' ? 0x6f8f42 : 0xf2b06a)
  const liveGlow = new THREE.Color(variant === 'earth' ? 0x000000 : 0x5f2418)
  const deadGlow = new THREE.Color(variant === 'earth' ? 0x000000 : 0x241018)
  const youngGlow = new THREE.Color(variant === 'earth' ? 0x000000 : 0x6a2f1e)
  for (const branch of tree.branches) {
    const temporalGrowth = growWindow(phase.growth, branch.startAt, branch.startAt + 0.3)
    const growth = temporalGrowth * visibleOpacity
    branch.group.visible = growth > 0.002
    branch.group.scale.setScalar(Math.max(0.001, growth * (1 - dustBuild * 0.88)))
    branch.group.rotation.copy(branch.baseRotation)
    branch.group.rotation.z += Math.sin(elapsed * 0.42 + branch.depth + branch.length + tree.generationIndex) * 0.008 * (branch.depth + 1) * visibleOpacity
    branch.group.rotation.x += Math.cos(elapsed * 0.37 + branch.length + tree.generationIndex) * 0.0055 * (branch.depth + 1) * visibleOpacity - branchWilt * (0.035 + branch.depth * 0.075)
    const material = branch.mesh.material as THREE.MeshStandardMaterial
    material.color.copy(branch.depth > 1 ? youngColor : liveColor).lerp(deadColor, branchWilt)
    material.emissive.copy(branch.depth > 1 ? youngGlow : liveGlow).lerp(deadGlow, branchWilt)
    material.emissiveIntensity = variant === 'space' ? 0.62 * visibleOpacity : 0
    setMaterialOpacity(material, visibleOpacity)
    setMaterialOpacity(branch.tip.material as THREE.Material, visibleOpacity)
  }

  const livingLeaf = new THREE.Color(variant === 'earth' ? 0x58b84c : 0x7dd9ff)
  const deadLeaf = new THREE.Color(variant === 'earth' ? 0x8c5a24 : 0xb68dff)
  for (const leaf of tree.leaves) {
    const leafGrowth = growWindow(phase.growth, leaf.userData.startAt, leaf.userData.startAt + 0.22)
    const fall = growWindow(phase.leafFall, leaf.userData.fallDelay, 1)
    const leafDust = growWindow(fall, 0.72, 1)
    const leafOpacity = leafGrowth * (1 - leafDust) * (1 - dustBuild * 0.65) * visibleOpacity
    const material = leaf.material as THREE.MeshStandardMaterial
    leaf.visible = leafGrowth > 0.01 && leafOpacity > 0.01
    leaf.position.copy(leaf.userData.basePosition)
    leaf.position.x += Math.sin(elapsed * 0.9 + leaf.userData.phase) * 0.38 * fall
    leaf.position.y -= fall * (1.05 + leaf.userData.baseScale * 0.35)
    leaf.position.z += Math.cos(elapsed * 0.7 + leaf.userData.phase) * 0.26 * fall
    leaf.scale.setScalar(Math.max(0.001, leafGrowth * leaf.userData.baseScale * (1 - leafDust * 0.55)))
    leaf.rotation.copy(leaf.userData.baseRotation)
    leaf.rotation.x += Math.sin(elapsed * 1.1 + leaf.userData.phase) * (0.035 + fall * 0.72)
    leaf.rotation.y += Math.sin(elapsed * 1.7 + leaf.userData.phase) * (0.055 + fall * 0.58)
    leaf.rotation.z += Math.cos(elapsed * 1.4 + leaf.userData.phase) * (0.042 + fall * 1.1)
    material.color.copy(livingLeaf).lerp(deadLeaf, growWindow(phase.leafFall, 0.03, 0.72))
    setMaterialOpacity(material, leafOpacity)
  }

  const dustMaterial = tree.dust.material as THREE.PointsMaterial
  const positions = tree.dust.geometry.getAttribute('position') as THREE.BufferAttribute
  tree.dust.visible = phase.dustOpacity > 0.01
  dustMaterial.opacity = phase.dustOpacity * 0.95
  for (let index = 0; index < positions.count; index += 1) {
    const x = tree.dustStarts[index * 3]
    const y = tree.dustStarts[index * 3 + 1]
    const z = tree.dustStarts[index * 3 + 2]
    const particleFall = growWindow(dustBuild, (index % 37) / 120, 1)
    const wind = Math.sin(elapsed * 0.9 + index) * 0.34 * particleFall
    positions.setXYZ(
      index,
      x + wind,
      Math.max(0.018, y * (1 - particleFall) * (1 - 0.28 * smoother(dustBuild))),
      z + Math.cos(elapsed * 0.7 + index) * 0.18 * particleFall,
    )
  }
  positions.needsUpdate = true
}

function updateDustPile(mesh: THREE.Mesh, generationIndex: number, visualTreeYear: number) {
  const localYear = visualTreeYear - generationIndex * TREE_CYCLE_YEARS
  const contribution =
    localYear >= TREE_CYCLE_YEARS
      ? 1
      : localYear >= 0
        ? phaseAtTreeYear(localYear).dustBuild
        : 0
  const pileHeight = TREE_MAX_HEIGHT_UNITS * TREE_DUST_PILE_HEIGHT_PER_DEATH_RATIO * (0.56 + contribution * 0.44)
  const pileRadius = TREE_DUST_PILE_RADIUS_UNITS * (0.78 + contribution * 0.22)

  mesh.visible = contribution > 0.02
  mesh.scale.set(pileRadius, pileHeight, pileRadius)
  mesh.position.copy(generationGroundPosition(generationIndex))
  mesh.position.setY(pileHeight * 0.5)
}

function syncDecayPiles(objects: SceneObjects, visualTreeYear: number, variant: SceneVariant) {
  const generations = decayPileGenerations(visualTreeYear)

  while (objects.decayPiles.length < generations.length) {
    const generationIndex = objects.decayPiles.length
    const mesh = createDecayPile(variant)
    objects.scene.add(mesh)
    objects.decayPiles.push({ generationIndex, mesh })
  }

  for (const pile of objects.decayPiles) {
    updateDustPile(pile.mesh, pile.generationIndex, visualTreeYear)
  }
}

function createScene(mount: HTMLDivElement, variant: SceneVariant): SceneObjects {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = variant === 'earth' ? 1.1 : 1.18
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  mount.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(variant === 'earth' ? 0x07110d : 0x02030a, variant === 'earth' ? 0.026 : 0.014)
  const camera = new THREE.PerspectiveCamera(45, 1, 0.03, 180)
  camera.position.set(TREE_CAMERA_POSITION.x, TREE_CAMERA_POSITION.y, TREE_CAMERA_POSITION.z)
  camera.lookAt(TREE_CAMERA_TARGET.x, TREE_CAMERA_TARGET.y, TREE_CAMERA_TARGET.z)

  const ambient = new THREE.HemisphereLight(
    variant === 'earth' ? 0xbfeaff : 0x9fb7ff,
    variant === 'earth' ? 0x2d1608 : 0x050613,
    variant === 'earth' ? 1.16 : 0.94,
  )
  scene.add(ambient)

  const key = new THREE.DirectionalLight(variant === 'earth' ? 0xffdd9d : 0xaed7ff, variant === 'earth' ? 4.3 : 3.35)
  key.position.set(-6, 9, 5)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.left = -13
  key.shadow.camera.right = 13
  key.shadow.camera.top = 13
  key.shadow.camera.bottom = -13
  scene.add(key)

  const rim = new THREE.DirectionalLight(variant === 'earth' ? 0x77b8ff : 0x8f7dff, 1.5)
  rim.position.set(7, 4, -9)
  scene.add(rim)

  const skyTexture = makeGradientTexture(
    variant === 'earth' ? '#101b3a' : '#02030b',
    variant === 'earth' ? '#29436b' : '#101848',
    variant === 'earth' ? '#17130b' : '#03040a',
  )
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(115, 64, 32),
    new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide }),
  )
  scene.add(sky)

  if (variant === 'earth') {
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(72, 128),
      new THREE.MeshStandardMaterial({ color: 0x172914, roughness: 0.95 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

  } else {
    const random = seededRandom(9902)
    const starsGeometry = new THREE.BufferGeometry()
    const stars = new Float32Array(900 * 3)
    for (let index = 0; index < 900; index += 1) {
      stars[index * 3] = (random() - 0.5) * 120
      stars[index * 3 + 1] = random() * 62 - 5
      stars[index * 3 + 2] = -22 - random() * 78
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(stars, 3))
    scene.add(new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0xdceaff, size: 0.07 })))

    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.7, 0.22, 9),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.52, roughness: 0.42 }),
    )
    platform.position.y = -0.03
    platform.receiveShadow = true
    scene.add(platform)

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 48, 24),
      new THREE.MeshStandardMaterial({ color: 0x285e72, emissive: 0x061822, roughness: 0.86 }),
    )
    planet.position.set(8, 4.4, -13)
    scene.add(planet)
  }

  const trees = Array.from({ length: TREE_MAX_VISIBLE_GENERATIONS }, (_, index) => {
    const tree = createTreeGeneration(index * TREE_CYCLE_YEARS, index, variant)
    scene.add(tree.group)
    return tree
  })

  return { camera, decayPiles: [], renderer, scene, trees }
}

export function ThreeTreeScene({
  ageTotal,
  cameraDistanceScale = 1,
  focusOffsetX = 0,
  focusOffsetY = 0,
  localAge,
  streamMode,
  variant,
}: ThreeTreeSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const propsRef = useRef({ ageTotal, cameraDistanceScale, focusOffsetX, focusOffsetY, localAge, streamMode, variant })

  useEffect(() => {
    propsRef.current = { ageTotal, cameraDistanceScale, focusOffsetX, focusOffsetY, localAge, streamMode, variant }
  }, [ageTotal, cameraDistanceScale, focusOffsetX, focusOffsetY, localAge, streamMode, variant])

  useEffect(() => {
    const mount = mountRef.current

    if (!mount) {
      return
    }

    if (navigator.userAgent.toLowerCase().includes('jsdom')) {
      mount.dataset.webgl = 'unavailable'
      return
    }

    let objects: SceneObjects
    try {
      objects = createScene(mount, variant)
    } catch {
      mount.dataset.webgl = 'unavailable'
      return
    }

    let frame = 0
    const clock = new THREE.Clock()
    const resize = () => {
      const width = Math.max(1, mount.clientWidth)
      const height = Math.max(1, mount.clientHeight)
      objects.camera.aspect = width / height
      objects.camera.updateProjectionMatrix()
      objects.renderer.setSize(width, height, false)
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    resize()

    const animate = () => {
      frame = window.requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()
      const current = propsRef.current
      const visualTreeYear = visualTreeYearFromLocalAge(current.localAge)
      const generations = visibleTreeGenerations(visualTreeYear)
      const pileGenerations = decayPileGenerations(visualTreeYear)
      mount.dataset.visualTreeYear = visualTreeYear.toFixed(1)
      mount.dataset.visibleGenerations = generations.join(',')
      mount.dataset.decayPileGenerations = pileGenerations.join(',')
      syncDecayPiles(objects, visualTreeYear, current.variant)
      for (let index = 0; index < objects.trees.length; index += 1) {
        const tree = objects.trees[index]
        updateTree(tree, visualTreeYear, generations[index], current.variant, elapsed)
      }
      objects.camera.position.set(
        TREE_CAMERA_POSITION.x * current.cameraDistanceScale,
        TREE_CAMERA_POSITION.y * current.cameraDistanceScale,
        TREE_CAMERA_POSITION.z * current.cameraDistanceScale,
      )
      objects.camera.lookAt(
        TREE_CAMERA_TARGET.x + current.focusOffsetX * 7,
        TREE_CAMERA_TARGET.y + current.focusOffsetY * 4,
        TREE_CAMERA_TARGET.z,
      )
      objects.renderer.render(objects.scene, objects.camera)
    }

    animate()

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      objects.renderer.dispose()
      mount.removeChild(objects.renderer.domElement)
      objects.scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose()
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      })
    }
  }, [variant])

  return (
    <div
      ref={mountRef}
      className="three-tree-scene"
      data-stream-mode={streamMode}
      data-variant={variant}
      role="img"
      aria-label={`${variant === 'earth' ? 'Earth' : 'Traveler'} 3D tree aged to ${formatAge(localAge)}`}
    />
  )
}

function formatAge(value: number): string {
  return `${value.toFixed(1)} y`
}
