import '../public/styles.css';
import gsap from 'gsap';
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
function createBox(lat: number, lng: number, country: any) {
    const scale = country.population / 1000000000;
    const zScale = 0.8 * scale;
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(
            Math.max(0.1, 0.2 * scale), 
            Math.max(0.1, 0.2 * scale), 
            Math.max(zScale, 0.4 * Math.random())
        ),
        new THREE.MeshBasicMaterial({
            color: 0x3bf7ff,
            opacity: 0.4,
            transparent: true
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
    box.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, -zScale / 2))

    group.add(box);

    gsap.to(box.scale, {
        z: 0,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: 'linear',
        delay: Math.random()
    });

    country.uuid = box.uuid;
}

for (let i = 0; i < Countries.length; i++) {
    let latitude = Countries[i].latlng[0];
    let longitude = Countries[i].latlng[1];

    createBox(latitude, longitude, Countries[i]);
}


// rotate sphere to math the points location
sphere.rotation.y = -Math.PI / 2;


const mouse: any = {
    x: 0,
    y: 0
}

const raycaster = new THREE.Raycaster();
const popElm = document.getElementById('popElm'), 
    populationEl = document.getElementById('populationEl'), 
    populationValueEl = document.getElementById('populationValueEl');


function animate(): void {
    requestAnimationFrame(animate)
    renderer.render(scene, camera);
    group.rotation.y += 0.002

    // gsap.to(group.rotation, {
    //     x: -mouse.y * 0.3,
    //     y: mouse.x * 1.5,
    //     duration: 2
    // })

    // update the picking ray with the camera and pointer position
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects(group.children.filter(mesh => {
        return (mesh as THREE.Mesh).geometry.type === 'BoxGeometry';
    }));

    group.children.forEach((mesh) => {
        if ((mesh as THREE.Mesh).material instanceof THREE.Material) {
            const material = (mesh as THREE.Mesh).material as THREE.Material;
            if ('opacity' in material) {
                material.opacity = 0.4;
            }
        }
    })

    gsap.set(popElm, {
        display: 'none'
    })

	for ( let i = 0; i < intersects.length; i ++ ) {
        const object = intersects[i].object as THREE.Mesh;
        const material = object.material as THREE.Material;
        const country = Countries.find((c: any) => c.uuid === object.uuid);

        if (material instanceof THREE.Material && 'opacity' in material) {
            material.opacity = 1;
            gsap.set(popElm, {
                display: 'block'
            })
        }

        if (
            country !== undefined && 
            populationEl !== null && 
            populationValueEl !== null
        ) {
            populationEl.innerHTML = country.name;
            populationValueEl.innerHTML = new Intl.NumberFormat().format(country.population);
        }
	}

	renderer.render(scene, camera);
}

animate();

addEventListener('mousemove', (event: MouseEvent) => {
    mouse.x = (event.clientX / innerWidth) * 2 - 1
    mouse.y = -(event.clientY / innerHeight) * 2 + 1

    gsap.set(popElm, {
        x: event.clientX,
        y: event.clientY
    })
})