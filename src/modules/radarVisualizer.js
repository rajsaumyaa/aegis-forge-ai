/**
 * Interactive Attack Surface Mesh & Threat Radar Canvas Visualizer
 */

export class ThreatRadarVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.links = [];
    this.animationId = null;
    this.pulsePhase = 0;
    this.activeThreatNodeIndices = [0, 1]; // Default active threat
    this.containedNodeIndices = [];

    this.initCanvasSize();
    this.initTopology();
    this.bindEvents();
    this.startAnimation();
  }

  initCanvasSize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio || 600;
    this.canvas.height = (rect.height || 250) * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  initTopology() {
    const w = this.canvas.width / window.devicePixelRatio;
    const h = this.canvas.height / window.devicePixelRatio;

    // Define core infrastructure assets
    this.nodes = [
      { id: 0, label: 'DC-PRIMARY-01', x: w * 0.22, y: h * 0.45, type: 'core', status: 'threat' },
      { id: 1, label: 'svc-backup', x: w * 0.12, y: h * 0.65, type: 'agent', status: 'threat' },
      { id: 2, label: 'API-Gateway-KYC', x: w * 0.48, y: h * 0.32, type: 'api', status: 'normal' },
      { id: 3, label: 'AWS-IAM-Role', x: w * 0.75, y: h * 0.35, type: 'cloud', status: 'normal' },
      { id: 4, label: 'Storage-VSS-SAN', x: w * 0.28, y: h * 0.80, type: 'storage', status: 'normal' },
      { id: 5, label: 'Aadhaar/PAN DB', x: w * 0.58, y: h * 0.70, type: 'db', status: 'normal' },
      { id: 6, label: 'Cloudflare WAF', x: w * 0.45, y: h * 0.12, type: 'waf', status: 'normal' },
      { id: 7, label: 'S3-Artifacts', x: w * 0.88, y: h * 0.65, type: 'cloud', status: 'normal' },
      { id: 8, label: 'Corporate Copilot', x: w * 0.72, y: h * 0.78, type: 'ai', status: 'normal' },
      { id: 9, label: 'Vector-DB (Milvus)', x: w * 0.84, y: h * 0.85, type: 'db', status: 'normal' },
      { id: 10, label: 'Internal HR Subnet', x: w * 0.60, y: h * 0.88, type: 'sub', status: 'normal' }
    ];

    // Interconnect mesh links
    this.links = [
      { from: 1, to: 0 },
      { from: 0, to: 4 },
      { from: 6, to: 2 },
      { from: 2, to: 5 },
      { from: 3, to: 7 },
      { from: 8, to: 9 },
      { from: 10, to: 8 },
      { from: 2, to: 3 },
      { from: 0, to: 2 }
    ];
  }

  setThreatNodes(indices = []) {
    this.activeThreatNodeIndices = indices;
    this.nodes.forEach((node, idx) => {
      if (this.containedNodeIndices.includes(idx)) {
        node.status = 'contained';
      } else if (indices.includes(idx)) {
        node.status = 'threat';
      } else {
        node.status = 'normal';
      }
    });
  }

  containCurrentThreat() {
    this.activeThreatNodeIndices.forEach(idx => {
      if (!this.containedNodeIndices.includes(idx)) {
        this.containedNodeIndices.push(idx);
      }
    });
    this.nodes.forEach((node, idx) => {
      if (this.containedNodeIndices.includes(idx)) {
        node.status = 'contained';
      }
    });
  }

  resetContainment() {
    this.containedNodeIndices = [];
    this.setThreatNodes(this.activeThreatNodeIndices);
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.initCanvasSize();
      this.initTopology();
    });

    const recenterBtn = document.getElementById('btnRecenterRadar');
    if (recenterBtn) {
      recenterBtn.addEventListener('click', () => {
        this.initCanvasSize();
        this.initTopology();
      });
    }
  }

  startAnimation() {
    const render = () => {
      this.pulsePhase += 0.04;
      this.draw();
      this.animationId = requestAnimationFrame(render);
    };
    render();
  }

  draw() {
    const w = this.canvas.width / window.devicePixelRatio;
    const h = this.canvas.height / window.devicePixelRatio;

    this.ctx.clearRect(0, 0, w, h);

    // Draw background subtle concentric radar rings
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    this.ctx.lineWidth = 1;
    const cx = w * 0.5;
    const cy = h * 0.5;
    for (let r = 50; r <= 220; r += 55) {
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    this.ctx.restore();

    // Draw links
    this.links.forEach(link => {
      const n1 = this.nodes[link.from];
      const n2 = this.nodes[link.to];
      if (!n1 || !n2) return;

      const isThreatLink = n1.status === 'threat' && n2.status === 'threat';
      const isContainedLink = n1.status === 'contained' || n2.status === 'contained';

      this.ctx.beginPath();
      this.ctx.moveTo(n1.x, n1.y);
      this.ctx.lineTo(n2.x, n2.y);

      if (isThreatLink) {
        this.ctx.strokeStyle = 'rgba(255, 51, 102, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([6, 4]);
      } else if (isContainedLink) {
        this.ctx.strokeStyle = 'rgba(0, 245, 160, 0.6)';
        this.ctx.lineWidth = 1.5;
        this.ctx.setLineDash([]);
      } else {
        this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([]);
      }
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    });

    // Draw nodes
    this.nodes.forEach(node => {
      const isThreat = node.status === 'threat';
      const isContained = node.status === 'contained';

      // Pulse ring for threats
      if (isThreat) {
        const pulseR = 12 + Math.sin(this.pulsePhase) * 6;
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 51, 102, 0.2)';
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(255, 51, 102, 0.6)';
        this.ctx.stroke();
      }

      // Shield ring for contained
      if (isContained) {
        const shieldR = 11 + Math.sin(this.pulsePhase * 0.7) * 2;
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, shieldR, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(0, 245, 160, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }

      // Core Node Dot
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);

      if (isThreat) {
        this.ctx.fillStyle = '#ff3366';
        this.ctx.shadowColor = '#ff3366';
        this.ctx.shadowBlur = 10;
      } else if (isContained) {
        this.ctx.fillStyle = '#00f5a0';
        this.ctx.shadowColor = '#00f5a0';
        this.ctx.shadowBlur = 8;
      } else {
        this.ctx.fillStyle = '#38bdf8';
        this.ctx.shadowColor = '#38bdf8';
        this.ctx.shadowBlur = 4;
      }
      this.ctx.fill();
      this.ctx.shadowBlur = 0; // reset

      // Node label
      this.ctx.fillStyle = isThreat ? '#ff99aa' : isContained ? '#99ffd3' : '#94a3b8';
      this.ctx.font = '9px "JetBrains Mono", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(node.label, node.x, node.y - 10);
    });
  }
}
