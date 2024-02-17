import gsap from 'gsap'
import * as THREE from 'three';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl';
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl';
import Countries from './data/countries.json';
const globeUrl = './assets/img/globe.jpeg';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);

const renderer = new THREE.WebGL1Renderer({
    antialias: true
});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const loadTexture = async (url: string): Promise<THREE.Texture> => {
    let textureLoader = new THREE.TextureLoader();

    console.log(url);

    return new Promise(resolve => {
        textureLoader.load(url, texture => {
            resolve(texture)
        })
    })
}

// create earth sphere
const globeMap = await loadTexture(globeUrl);
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50),
    new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            globeTexture: {
                // value: new THREE.TextureLoader().load('./assets/img/globe.jpeg')
                value: globeMap
            }
        }
    })
);

// create atmosphere
const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50),
    new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    })
)

atmosphere.scale.set(1.1, 1.1, 1.1)

const group = new THREE.Group()
group.add(sphere)
group.add(atmosphere)
scene.add(group)


// create stars
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff
});

const starVertices = [];
for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = -Math.random() * 1000;
    starVertices.push(x, y, z);
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);


camera.position.z = 15;


// create Boxs on earth
function createBox(lat: number, lng: number) {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.1, 0.8),
        new THREE.MeshBasicMaterial({
            color: 0x3bf7ff
        })
    );

    const latitude: number = (lat / 180) * Math.PI;
    const longitude: number = (lng / 180) * Math.PI;
    const radius: number = 5; // radius of the earh

    const x = radius * Math.cos(latitude) * Math.sin(longitude)
    const y = radius * Math.sin(latitude)
    const z = radius * Math.cos(latitude) * Math.cos(longitude)

    box.position.x = x;
    box.position.y = y;
    box.position.z = z;

    box.lookAt(0, 0, 0);
    box.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, -0.4))

    group.add(box);

    gsap.to(box.scale, {
        z: 0,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: 'linear',
        delay: Math.random()
    });
}

console.log(Countries);

for (let i = 0; i < Countries.length; i++) {
    let latitude = Countries[i].latitude.value;
    let longitude = Countries[i].longitude.value;

    if (Countries[i].latitude.cardinalDirection === 'S') latitude = -Math.abs(latitude);
    if (Countries[i].longitude.cardinalDirection === 'W') longitude = -Math.abs(longitude);

    createBox(latitude, longitude);
}

// rotate sphere to math the points location
sphere.rotation.y = -Math.PI / 2;




const mouse: any = {
    x: 0,
    y: 0
}

function animate(): void {
    requestAnimationFrame(animate)
    renderer.render(scene, camera);
    // sphere.rotation.y += 0.002
    gsap.to(group.rotation, {
        x: -mouse.y * 0.9,
        y: mouse.x * 1.9,
        duration: 2
    })
}

animate();

addEventListener('mousemove', (event: MouseEvent) => {
    mouse.x = (event.clientX / innerWidth) * 2 - 1
    mouse.y = -(event.clientY / innerHeight) * 2 + 1
})