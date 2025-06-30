const canvas = document.getElementById('flowerCanvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Evita el área central horizontal (puedes ajustar el porcentaje)
function isInCentralZone(x) {
  const marginX = canvas.width * 0.3; // Deja un 40% central
  return x > marginX && x < canvas.width - marginX;
}

// Clase para representar ramas que crecen en curva
class Branch {
  constructor(x, y, angle, depth) {
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.length = 30 + Math.random() * 50;
    this.grown = 0;
    this.depth = depth;
    this.children = [];
    this.curveControl = (Math.random() - 0.5) * 50;
    this.finished = false;
    this.leaves = [];
    this.hasFlower = false;
  }

  grow() {
    const growthSpeed = 2;
    if (this.grown < this.length) {
      this.grown += growthSpeed;
      let t = this.grown / this.length;

      const cx = this.startX + Math.cos(this.angle) * this.length / 2 + this.curveControl;
      const cy = this.startY + Math.sin(this.angle) * this.length / 2;

      const x = (1 - t) * (1 - t) * this.startX + 2 * (1 - t) * t * cx + t * t * (this.startX + Math.cos(this.angle) * this.length);
      const y = (1 - t) * (1 - t) * this.startY + 2 * (1 - t) * t * cy + t * t * (this.startY + Math.sin(this.angle) * this.length);

      ctx.strokeStyle = '#1a7809';
      ctx.lineWidth = Math.max(6 - this.depth, 1.5);
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(x, y);
      ctx.stroke();

      this.x = x;
      this.y = y;

      if (Math.random() < 0.1 && this.depth > 1) {
        this.leaves.push(new Leaf(this.x, this.y));
      }

      if (t >= 1 && !this.finished) {
        this.finished = true;
        if (this.depth < 5) {
          const branchesCount = 1 + Math.floor(Math.random() * 3);
          for (let i = 0; i < branchesCount; i++) {
            let newAngle = this.angle + (Math.random() * Math.PI / 2 - Math.PI / 4);
            this.children.push(new Branch(this.x, this.y, newAngle, this.depth + 1));
          }
        } else if (Math.random() > 0.3) {
          this.hasFlower = true;
        }
      }
    }

    this.leaves.forEach(leaf => leaf.draw());

    if (this.hasFlower) {
      this.drawFlower();
    }

    this.children.forEach(child => child.grow());
  }

  drawFlower() {
    const petals = 7;
    const radius = 8;
    for (let i = 0; i < petals; i++) {
      const angle = (Math.PI * 2 / petals) * i;
      const px = this.x + Math.cos(angle) * radius;
      const py = this.y + Math.sin(angle) * radius;

      const gradient = ctx.createRadialGradient(px, py, 1, px, py, 6);
      gradient.addColorStop(0, '#c183f9');
      gradient.addColorStop(1, '#6b34a9');
      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.ellipse(px, py, 6, 3, angle, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.fillStyle = '#fffa87';
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Leaf {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = Math.random() * Math.PI * 2;
    this.size = 6 + Math.random() * 5;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    const gradient = ctx.createLinearGradient(0, 0, this.size, 0);
    gradient.addColorStop(0, '#3db83d');
    gradient.addColorStop(1, '#0f660f');
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const branches = [];
const spacing = 60;

// Solo crea raíces si están fuera del área central
for (let i = 0; i < canvas.width; i += spacing) {
  const startX = i + (Math.random() * spacing) / 2;

  if (isInCentralZone(startX)) continue;

  const startY = canvas.height;
  const angle = -Math.PI / 2 + (Math.random() * 0.2 - 0.1);
  branches.push(new Branch(startX, startY, angle, 0));
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  branches.forEach(branch => branch.grow());
  requestAnimationFrame(animate);
}

animate();
