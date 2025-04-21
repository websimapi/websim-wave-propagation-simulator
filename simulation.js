import * as THREE from 'three';

class WavePropagationSimulator {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(
            0, canvas.width, 
            canvas.height, 0, 
            0.1, 1000
        );
        this.renderer = new THREE.WebGLRenderer({ canvas });
        this.waves = [];
    }

    createWave(type, origin, strength) {
        const waveConfig = {
            wifi: { color: 0x4CAF50, decay: 0.95, speed: 1 },
            sound: { color: 0x2196F3, decay: 0.98, speed: 0.5 },
            am: { color: 0xFF9800, decay: 0.96, speed: 0.75 },
            fm: { color: 0x9C27B0, decay: 0.99, speed: 1.2 }
        }[type];

        const geometry = new THREE.RingGeometry(0, strength, 64);
        const material = new THREE.MeshBasicMaterial({ 
            color: waveConfig.color, 
            transparent: true, 
            opacity: 0.5 
        });
        const waveMesh = new THREE.Mesh(geometry, material);
        
        waveMesh.position.set(origin.x, origin.y, 0);
        this.scene.add(waveMesh);

        return {
            mesh: waveMesh,
            config: waveConfig,
            age: 0
        };
    }

    simulate() {
        this.waves.forEach((wave, index) => {
            wave.mesh.scale.x += wave.config.speed;
            wave.mesh.scale.y += wave.config.speed;
            wave.mesh.material.opacity *= wave.config.decay;

            wave.age++;

            if (wave.age > 100 || wave.mesh.material.opacity < 0.01) {
                this.scene.remove(wave.mesh);
                this.waves.splice(index, 1);
            }
        });

        this.renderer.render(this.scene, this.camera);
    }

    start() {
        const animate = () => {
            this.simulate();
            requestAnimationFrame(animate);
        };
        animate();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('simulation-canvas');
    canvas.width = 800;
    canvas.height = 600;

    const simulator = new WavePropagationSimulator(canvas);

    document.getElementById('start-simulation').addEventListener('click', () => {
        const waveType = document.getElementById('wave-type').value;
        const strength = document.getElementById('signal-strength').querySelector('input').value;

        const wave = simulator.createWave(waveType, 
            { x: canvas.width / 2, y: canvas.height / 2 }, 
            strength / 10
        );
        simulator.waves.push(wave);
    });

    simulator.start();
});

