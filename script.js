// --- 1. SQUALOID SOLAR SYSTEM DATA ---
const SQUALOID_SOLAR_SYSTEM = {
    name: "Squaloid",
    star: {
        name: "Phlegm",
        mass: "1.98900 × 10^28 kg",
        diameter: "8657 miles",
        composition: "Nitrogen, Helium",
        color: 0xff0000, 
        rationale: "It is 100 times smaller than our Sun, in both mass and diameter, meaning it is much colder than our Sun."
    },
    planets: [
        // Using scaled distances (distanceFromStar) and rotation speeds (revolution)
        {
            name: "Jeglant", type: "Terrestrial/Oily", mass: "3.28500 × 10^18 kilograms", composition: "Crude oil, greenhouse gas", rotation: "30 days", revolution: 2, distanceFromStar: 50, distanceFromPrevious: "N/A", color: 0x333333, size: 0.5
        },
        {
            name: "Lugubrious", type: "Terrestrial/Rocky", mass: "6.41693 × 10^18 kilograms", composition: "Rock, copper, iron", rotation: "200 days", revolution: 10, distanceFromStar: 100, distanceFromPrevious: "450,000 km", color: 0x8b4513, size: 0.7
        },
        {
            name: "Moist", type: "Ice Giant/Water World", mass: "5.97 × 10^19 kilograms", composition: "Water, ice core", rotation: "530 days", revolution: 26.5, distanceFromStar: 150, distanceFromPrevious: "5,575,000 km", color: 0xadd8e6, size: 1.2
        },
        {
            name: "Gassy", type: "Gas Giant", mass: "5.68 × 10^21 kilograms", composition: "Gas, dust, ring of beans", rotation: "770 days", revolution: 77, distanceFromStar: 220, distanceFromPrevious: "12,875,000 km", color: 0xffa500, size: 2.5
        },
        {
            name: "Oozey Igneus", type: "Molten/Volcanic", mass: "6.41693 × 10^28 kilograms", composition: "Lava, molten rock", rotation: "1331 days", revolution: 133.1, distanceFromStar: 300, distanceFromPrevious: "71,000,000 km", color: 0xff4500, size: 3.0
        }
    ]
};

// --- 2. THREE.JS SETUP ---

// Scene, Camera, Renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solar-system-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// --- WIDER CAMERA POSITION FOR VISIBILITY ---
// Setting camera very high (Y=800) and far back (Z=500)
camera.position.set(0, 800, 500); 
camera.lookAt(0, 0, 0);

// Orbit Controls (allows click/drag rotation and scrolling to zoom)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; 
controls.dampingFactor = 0.05;
// --- END SETUP ---

// Lighting
const light = new THREE.PointLight(0xffffff, 1, 0, 0);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// Star: Phlegm
const starGeometry = new THREE.SphereGeometry(10, 32, 32);
const starMaterial = new THREE.MeshBasicMaterial({ color: SQUALOID_SOLAR_SYSTEM.star.color });
const star = new THREE.Mesh(starGeometry, starMaterial);
star.userData = SQUALOID_SOLAR_SYSTEM.star; 
star.name = SQUALOID_SOLAR_SYSTEM.star.name;
scene.add(star);

const planetMeshes = [];

// Create Planets and Orbits
SQUALOID_SOLAR_SYSTEM.planets.forEach(data => {
    // Planet Mesh
    const planetGeometry = new THREE.SphereGeometry(data.size, 32, 32);
    const planetMaterial = new THREE.MeshPhongMaterial({ color: data.color });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);

    planet.userData = { ...data, angle: 0 }; 
    planet.name = data.name; 
    
    planet.position.x = data.distanceFromStar;
    
    scene.add(planet);
    planetMeshes.push(planet);

    // Orbit Path 
    const orbitGeometry = new THREE.RingGeometry(data.distanceFromStar - 0.1, data.distanceFromStar + 0.1, 128);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2; // Lay flat
    scene.add(orbit);
});


// --- 3. ANIMATION AND INTERACTIVITY ---

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const statsArea = document.getElementById('stats-display-area');

// Animation loop (runs every frame)
function animate() {
    requestAnimationFrame(animate);

    // Update controls (Crucial for rotation/zoom)
    controls.update(); 

    // Make the planets orbit
    planetMeshes.forEach(planet => {
        const data = planet.userData;
        const orbitSpeed = 0.001 / data.revolution; 
        data.angle += orbitSpeed;
        
        planet.position.x = data.distanceFromStar * Math.cos(data.angle);
        planet.position.z = data.distanceFromStar * Math.sin(data.angle);
        
        planet.rotation.y += 0.01;
    });

    renderer.render(scene, camera);
}
animate();


// Handle Clicks
function onPlanetClick(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(planetMeshes);

    if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object;
        displayStats(clickedPlanet.userData);
    }
}

// Function to display planet statistics
function displayStats(data) {
    let stats = `
        <h2>${data.name} Stats 🚀</h2>
        <ul>
            <li><strong>Type:</strong> ${data.type}</li>
            <li><strong>Mass:</strong> ${data.mass}</li>
            <li><strong>Composition:</strong> ${data.composition}</li>
            <li><strong>Rotation Rate:</strong> ${data.rotation}</li>
            <li><strong>Orbital Period (Revolution):</strong> ${data.revolution} days/years</li>
            <li><strong>Distance from Star:</strong> ${data.distanceFromStar * 1000} km (Scaled)</li>
            <li><strong>Distance from Previous Planet:</strong> ${data.distanceFromPrevious}</li>
        </ul>
    `;
    
    statsArea.innerHTML = stats + statsArea.querySelector('button').outerHTML;
    statsArea.classList.remove('hidden');
}

// Event Listeners
window.addEventListener('click', onPlanetClick);
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

});
