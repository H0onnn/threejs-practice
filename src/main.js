import * as THREE from 'https://unpkg.com/three@0.163.0/build/three.module.js';

// 씬, 카메라, 렌더러 설정
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 50);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 입자용 배열
let particles = [];

class Firework {
  constructor(position) {
    this.position = position.clone();
    this.particles = [];
    this.createParticles();
  }

  createParticles() {
    const count = 100;
    for (let i = 0; i < count; i++) {
      const geometry = new THREE.SphereGeometry(0.3, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(this.position);

      // 랜덤 방향 벡터
      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      )
        .normalize()
        .multiplyScalar(Math.random() * 10 + 5);

      this.particles.push({
        mesh,
        velocity: dir,
        life: 0,
        maxLife: Math.random() * 2 + 1,
      });
      scene.add(mesh);
    }
  }

  update(delta) {
    this.particles.forEach((p) => {
      p.life += delta;
      if (p.life < p.maxLife) {
        // 중력 효과
        p.velocity.y -= 9.8 * delta * 0.5;
        // 위치 업데이트
        p.mesh.position.add(p.velocity.clone().multiplyScalar(delta));
        // 점점 투명하게
        const t = p.life / p.maxLife;
        p.mesh.material.opacity = 1 - t;
        p.mesh.material.transparent = true;
      } else {
        scene.remove(p.mesh);
      }
    });
    // 살아있는 입자가 하나도 없으면 이 불꽃 제거
    this.particles = this.particles.filter((p) => p.life < p.maxLife);
    return this.particles.length > 0;
  }
}

function spawnFirework() {
  const pos = new THREE.Vector3(
    (Math.random() - 0.5) * 40,
    (Math.random() - 0.2) * 40,
    (Math.random() - 0.5) * 40
  );
  particles.push(new Firework(pos));
}

let lastTime = 0;
function animate(time) {
  requestAnimationFrame(animate);
  const delta = (time - lastTime) / 1000;
  lastTime = time;

  // 정기적으로 불꽃 생성
  if (Math.random() < 0.02) {
    spawnFirework();
  }

  // 업데이트
  particles = particles.filter((fw) => fw.update(delta));

  renderer.render(scene, camera);
}
animate(0);

// 클릭하면 불꽃 한 번 더 생성
window.addEventListener('click', (e) => {
  const mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );
  const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
  vector.unproject(camera);
  const dir = vector.sub(camera.position).normalize();
  const distance = -camera.position.z / dir.z;
  const pos = camera.position.clone().add(dir.multiplyScalar(distance));
  particles.push(new Firework(pos));
});
