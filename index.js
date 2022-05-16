import * as THREE from 'three'
import {GLTFLoader} from 'GLTFLoader'
import {OrbitControls} from 'OrbitControls'

let camera, scene, renderer
let controls

let mixer
const animationActions = []
let activeAnimationIndex = 0
let animateEgorovAgencyCube = true

let egorovAgencyCube = null
let rotateEgorovAgencyCube = true
let rotateCamera = false

const btCubeAnimation = document.querySelector('.bt-cube-animation')
const btCubeRotation = document.querySelector('.bt-cube-rotation')
const btCameraRotation = document.querySelector('.bt-camera-rotation')

init()
animate()

function init() {
  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(-3, 3, 10)
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  //cubemap

  const path = 'assets/img/';
  const format = '.jpg';
  const urls = [
    path + 'posx' + format, path + 'negx' + format,
    path + 'posy' + format, path + 'negy' + format,
    path + 'posz' + format, path + 'negz' + format
  ];

  const reflectionCube = new THREE.CubeTextureLoader().load(urls);
  const refractionCube = new THREE.CubeTextureLoader().load(urls);
  refractionCube.mapping = THREE.CubeRefractionMapping;

  scene.background = reflectionCube;

  //add lights

  const spotLightOne = new THREE.SpotLight(0xeeeece, 5)
  spotLightOne.position.set(10, 100, 100)
  scene.add(spotLightOne)

  const spotLightTwo = new THREE.SpotLight(0xeeeece, 5)
  spotLightTwo.position.set(-10, 100, -100)
  scene.add(spotLightTwo)

  //cube

  const cubeGeometry = new THREE.BoxGeometry(2, 2, 2)
  const cubeMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ffff
  })
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
  cube.position.set(2, 3, -2)
  scene.add(cube)

  //sphere

  const sphereGeometry = new THREE.SphereGeometry(1, 32, 16)
  const sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0000
  })
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.position.set(4, 0, 2)
  scene.add(sphere)

  //cylinder

  const cylinderGeometry = new THREE.CylinderGeometry(0, 1, 2, 32)
  const cylinderMaterial = new THREE.MeshPhongMaterial({
    color: 0xffff00
  })
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
  cylinder.position.set(-4, 0, 2)
  scene.add(cylinder)

  //egorovAgencyCube

  const loader = new GLTFLoader()

  loader.load('https://html.aaee.by/study/models/EgorovAgencyCube.gltf', function (gltf) {
    egorovAgencyCube = gltf.scene

    mixer = new THREE.AnimationMixer(egorovAgencyCube)

    gltf.animations.forEach(animation => {
      const animationAction = mixer.clipAction(animation)
      animationAction
          .setDuration(1)
          .setLoop(THREE.LoopPingPong, 2)

      animationActions.push(animationAction)
    })

    mixer.addEventListener('finished', onAnimationFinished)

    onAnimationFinished()

    scene.add(egorovAgencyCube)

    logModelAnimationNames(gltf)
  }, undefined, function (error) {
    console.error(error)
  })

  //renderer

  renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  //controls

  controls = new OrbitControls(camera, renderer.domElement)
  controls.autoRotate = true
  controls.autoRotateSpeed = 1

  window.addEventListener('resize', onWindowResize, false)
  btCubeRotation.addEventListener('click', onBtCubeRotationClick)
  btCameraRotation.addEventListener('click', onBtCameraRotationClick)
  btCubeAnimation.addEventListener('click', onBtCubeAnimationClick)
}

const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)

  if (egorovAgencyCube) {
    if (rotateEgorovAgencyCube) {
      egorovAgencyCube.rotation.y += 0.01
    }

    if (animateEgorovAgencyCube) {
      mixer.update(clock.getDelta())
    }
  }

  if (rotateCamera) {
    controls.update()
  }

  render()
}

function render() {
  renderer.render(scene, camera)
}

function onAnimationFinished() {
  animationActions[activeAnimationIndex].stop().play()

  activeAnimationIndex += 1

  if (activeAnimationIndex > animationActions.length - 1) {
    activeAnimationIndex = 0
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  render()
}

function onBtCubeRotationClick(event) {
  rotateEgorovAgencyCube = !rotateEgorovAgencyCube
  event.target.textContent = rotateEgorovAgencyCube ? 'Stop cube rotation' : 'Start cube rotation'
}

function onBtCameraRotationClick(event) {
  rotateCamera = !rotateCamera
  event.target.textContent = rotateCamera ? 'Stop camera rotation' : 'Start camera rotation'
}

function onBtCubeAnimationClick(event) {
  animateEgorovAgencyCube = !animateEgorovAgencyCube
  event.target.textContent = animateEgorovAgencyCube ? 'Stop cube animation' : 'Start cube animation'
}

function logModelAnimationNames(model) {
  const animationNames = model.animations.map(item => item.name)
  console.log('Cube animation names:', ...animationNames)
}