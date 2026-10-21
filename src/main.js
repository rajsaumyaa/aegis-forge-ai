/**
 * Main Application Orchestrator
 * AegisForge AI - Mitigata CyberForge Edition
 */

import { THREAT_SCENARIOS, INITIAL_INCIDENTS } from './data/threatScenarios.js';
import { InsuranceUnderwriter } from './modules/insuranceEngine.js';
import { ThreatRadarVisualizer } from './modules/radarVisualizer.js';
import { AIInvestigator } from './modules/aiInvestigator.js';
import { audioFx } from './modules/audioFx.js';

class AegisApp {
  constructor() {
    this.incidents = JSON.parse(JSON.stringify(INITIAL_INCIDENTS));
    this.selectedIncident = this.incidents[0];
    this.underwriter = new InsuranceUnderwriter();
    this.radar = new ThreatRadarVisualizer('threatRadarCanvas');
    this.copilot = new AIInvestigator();
    this.currentFilter = 'all';

    this.initUI();
    this.bindEvents();
    this.updateDashboard();
  }

  initUI() {
    this.renderIncidentList();
    this.renderSelectedIncident();
    this.updateInsuranceMetrics();
    this.radar.setThreatNodes(this.selectedIncident.nodeIndices);
  }

  bindEvents() {
    // 1. Threat Scenario Injection Buttons
    const simBtns = document.querySelectorAll('.sim-btn');
    simBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const scenarioKey = btn.getAttribute('data-scenario');
        this.injectScenario(scenarioKey);
      });
    });

    // 2. Incident Filter Tabs
    const filterTabs = document.querySelectorAll('.tab-btn');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.getAttribute('data-filter');
        this.renderIncidentList();
      });
    });

    // 3. Containment Execution Button
    const btnExecute = document.getElementById('btnExecuteContainment');
    if (btnExecute) {
      btnExecute.addEventListener('click', () => this.executeContainment());
    }

    // 4. Dismiss Alert Button
    const btnDismiss = document.getElementById('btnDismissAlert');
    if (btnDismiss) {
      btnDismiss.addEventListener('click', () => this.dismissAlert());
    }

    // 5. Audio Toggle
    const audioBtn = document.getElementById('toggleAudioBtn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isEnabled = audioFx.toggle();
        const label = document.getElementById('audioLabel');
        if (isEnabled) {
          audioBtn.classList.add('active');
          if (label) label.textContent = 'AUDIO FX: ON';
          audioFx.playBlip();
        } else {
          audioBtn.classList.remove('active');
          if (label) label.textContent = 'AUDIO FX: OFF';
        }
      });
    }

    // 6. Copilot Chat Form
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    if (chatForm && chatInput) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = chatInput.value.trim();
        if (!query) return;
        this.handleUserChat(query);
        chatInput.value = '';
      });
    }

    // 7. Quick Prompt Chips
    const promptChips = document.querySelectorAll('.chip-btn');
    promptChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        this.handleUserChat(query);
      });
    });

    // 8. Audit Report Modal
    const btnExport = document.getElementById('btnExportReport');
    const modal = document.getElementById('reportModal');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnPrint = document.getElementById('btnPrintReport');
    const btnCopy = document.getElementById('btnCopyReport');

    if (btnExport && modal) {
      btnExport.addEventListener('click', () => {
        this.openReportModal();
      });
    }
    if (btnCloseModal && modal) {
      btnCloseModal.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        this.copyReportToClipboard();
      });
    }
  }

  injectScenario(scenarioKey) {
    audioFx.playAlert();
    const scenarioTemplate = THREAT_SCENARIOS[scenarioKey];
    if (!scenarioTemplate) return;

    // Create a fresh instance with new ID & timestamp
    const newInc = JSON.parse(JSON.stringify(scenarioTemplate));
    newInc.id = 'INC-2026-' + Math.floor(1000 + Math.random() * 9000);
    newInc.timestamp = 'Just now';
    newInc.status = 'ACTIVE_THREAT';

    // Prepend to incidents list
    this.incidents.unshift(newInc);
    this.selectedIncident = newInc;

    // Reset radar containment and focus on this threat
    this.radar.setThreatNodes(newInc.nodeIndices);

    this.renderIncidentList();
    this.renderSelectedIncident();
    this.updateDashboard();

    this.showToast(`🚨 Threat Injected: ${newInc.title}`, 'crimson');

    // Trigger AI Copilot notification
    this.appendChatMessage('ai', `🚨 **Alert Ingestion:** Triaged new security event **${newInc.id}** (${newInc.title}) targeting \`${newInc.targetAsset}\`. AI mitigation playbook is staged.`);
  }

  renderIncidentList() {
    const container = document.getElementById('incidentList');
    if (!container) return;

    let filtered = this.incidents;
    if (this.currentFilter === 'critical') {
      filtered = this.incidents.filter(i => i.severity === 'CRITICAL');
    } else if (this.currentFilter === 'high') {
      filtered = this.incidents.filter(i => i.severity === 'HIGH');
    } else if (this.currentFilter === 'contained') {
      filtered = this.incidents.filter(i => i.status === 'CONTAINED');
    }

    container.innerHTML = '';

    filtered.forEach(inc => {
      const isSelected = this.selectedIncident && this.selectedIncident.id === inc.id;
      const isContained = inc.status === 'CONTAINED';
      const item = document.createElement('div');
      item.className = `incident-item ${isContained ? 'contained' : inc.severity.toLowerCase()} ${isSelected ? 'selected' : ''}`;

      item.innerHTML = `
        <div class="inc-top">
          <span class="inc-id">${inc.id}</span>
          <span class="inc-sev ${isContained ? 'sev-contained' : inc.severity === 'CRITICAL' ? 'sev-critical' : 'sev-high'}">
            ${isContained ? 'CONTAINED' : inc.severity}
          </span>
        </div>
        <div class="inc-title">${inc.title}</div>
        <div class="inc-bottom">
          <span class="inc-target">${inc.targetAsset.split(' ')[0]}</span>
          <span>${inc.timestamp}</span>
        </div>
      `;

      item.addEventListener('click', () => {
        audioFx.playBlip();
        this.selectedIncident = inc;
        this.renderIncidentList();
        this.renderSelectedIncident();
        this.radar.setThreatNodes(inc.nodeIndices);
      });

      container.appendChild(item);
    });

    const activeCount = this.incidents.filter(i => i.status !== 'CONTAINED').length;
    const badge = document.getElementById('activeIncidentCount');
    if (badge) {
      badge.textContent = `${activeCount} Active`;
      badge.style.display = activeCount > 0 ? 'inline-block' : 'none';
    }
  }

  renderSelectedIncident() {
    const inc = this.selectedIncident;
    if (!inc) return;

    const isContained = inc.status === 'CONTAINED';

    // Header & Severity
    const detailTitle = document.getElementById('detailTitle');
    const detailSeverity = document.getElementById('detailSeverity');
    if (detailTitle) detailTitle.textContent = inc.title;
    if (detailSeverity) {
      detailSeverity.textContent = isContained ? 'SHIELDED / CONTAINED' : `${inc.severity} (${inc.score}/100)`;
      detailSeverity.className = `severity-pill ${isContained ? 'text-emerald' : 'text-crimson'}`;
    }

    // Workflow steps
    const s1 = document.getElementById('step1Desc');
    const s2 = document.getElementById('step2Desc');
    const s3 = document.getElementById('step3Desc');
    const s4 = document.getElementById('step4Desc');

    if (s1) s1.textContent = inc.steps.step1;
    if (s2) s2.textContent = inc.steps.step2;
    if (s3) s3.textContent = inc.steps.step3;
    if (s4) s4.textContent = isContained ? 'Playbook executed successfully. Host quarantined, tokens revoked.' : inc.steps.step4;

    // Action bar
    const actionSummary = document.getElementById('actionSummaryText');
    const btnExecute = document.getElementById('btnExecuteContainment');

    if (actionSummary) {
      actionSummary.textContent = isContained ? 'All threat vectors neutralized. Active forensic monitoring ongoing.' : inc.containmentAction;
    }

    if (btnExecute) {
      btnExecute.disabled = isContained;
      btnExecute.innerHTML = isContained
        ? `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg> Contained`
        : `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Execute Containment`;
    }
  }

  executeContainment() {
    if (!this.selectedIncident || this.selectedIncident.status === 'CONTAINED') return;

    audioFx.playSuccess();
    this.selectedIncident.status = 'CONTAINED';

    // Update Radar
    this.radar.containCurrentThreat();

    // Re-render UI
    this.renderIncidentList();
    this.renderSelectedIncident();
    this.updateDashboard();

    this.showToast(`🛡️ Containment Executed for ${this.selectedIncident.id}! Asset Isolated.`, 'emerald');

    // Notify in Copilot
    this.appendChatMessage('ai', `✅ **Autonomous Containment Verified:** Automated playbooks succeeded for **${this.selectedIncident.id}**. Host telemetry isolated, credentials revoked. Loss mitigation criteria satisfied for IRDAI underwriting.`);
  }

  dismissAlert() {
    if (!this.selectedIncident) return;
    audioFx.playBlip();
    this.selectedIncident.status = 'CONTAINED';
    this.renderIncidentList();
    this.renderSelectedIncident();
    this.updateDashboard();
    this.showToast(`Alert ${this.selectedIncident.id} resolved as False Positive / Remediated`, 'cyan');
  }

  updateDashboard() {
    const posture = this.underwriter.evaluateRiskPosture(this.incidents);

    // Navbar stats
    const navScore = document.getElementById('navResilienceScore');
    const navExposure = document.getElementById('navExposureValue');
    const navDiscount = document.getElementById('navDiscountValue');

    if (navScore) navScore.textContent = `${posture.resilienceScore}/100`;
    if (navExposure) navExposure.textContent = posture.exposureDisplay;
    if (navDiscount) navDiscount.textContent = posture.discountPercent;

    // Score Card
    const scoreVal = document.getElementById('scoreVal');
    const radial = document.getElementById('radialProgressCircle');
    if (scoreVal) scoreVal.textContent = posture.resilienceScore;

    if (radial) {
      // 251.2 is circumference of r=40 circle
      const offset = 251.2 - (251.2 * posture.resilienceScore) / 100;
      radial.style.strokeDashoffset = offset;
      radial.style.stroke = posture.resilienceScore >= 80 ? 'var(--emerald-neon)' : posture.resilienceScore >= 70 ? 'var(--cyan-neon)' : 'var(--crimson-neon)';
    }

    // Financial VaR
    const finVal = document.getElementById('finExposureVal');
    const finBadge = document.getElementById('breachRiskLevel');
    const finDpdp = document.getElementById('finDpdpVal');
    const incentiveText = document.getElementById('incentiveSavingsText');

    if (finVal) finVal.textContent = posture.exposureDisplay;
    if (finBadge) finBadge.textContent = posture.riskLevel;
    if (finDpdp) finDpdp.textContent = posture.dpdpExposureDisplay;
    if (incentiveText) {
      incentiveText.innerHTML = `Current SOC efficiency qualifies for <strong>${posture.discountPercent} Premium Discount</strong> (Annual Savings: ${posture.annualSavingsDisplay})`;
    }

    // Compliance Bar
    const barCompliance = document.getElementById('barCompliance');
    const pctCompliance = document.getElementById('pctCompliance');
    if (barCompliance) barCompliance.style.width = `${posture.complianceScore}%`;
    if (pctCompliance) pctCompliance.textContent = `${posture.complianceScore}%`;
  }

  updateInsuranceMetrics() {
    this.updateDashboard();
  }

  handleUserChat(query) {
    audioFx.playBlip();
    this.appendChatMessage('user', query);

    const posture = this.underwriter.evaluateRiskPosture(this.incidents);
    const reply = this.copilot.processQuery(query, this.selectedIncident, posture);

    setTimeout(() => {
      this.appendChatMessage('ai', reply);
    }, 200);
  }

  appendChatMessage(sender, text) {
    const chatContainer = document.getElementById('chatMessages');
    if (!chatContainer) return;

    const msg = document.createElement('div');
    msg.className = `chat-msg msg-${sender}`;

    if (sender === 'ai') {
      msg.innerHTML = `
        <div class="msg-author">Aegis AI SOC Copilot</div>
        <div class="msg-content">${this.formatMarkdown(text)}</div>
      `;
    } else {
      msg.innerHTML = `
        <div class="msg-content">${this.escapeHtml(text)}</div>
      `;
    }

    chatContainer.appendChild(msg);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  formatMarkdown(str) {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08);padding:1px 4px;border-radius:3px;font-family:var(--font-mono);font-size:0.7rem;">$1</code>')
      .replace(/• /g, '<br>• ')
      .replace(/\n/g, '<br>');
  }

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  showToast(message, type = 'cyan') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="dot dot-${type === 'emerald' ? 'contained' : type === 'crimson' ? 'threat' : 'safe'}"></span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  openReportModal() {
    audioFx.playBlip();
    const modal = document.getElementById('reportModal');
    const body = document.getElementById('modalReportContent');
    if (!modal || !body) return;

    const posture = this.underwriter.evaluateRiskPosture(this.incidents);
    const cert = this.underwriter.generateInsuranceAuditCertificate(posture, this.selectedIncident);

    body.innerHTML = `
      <div style="background: rgba(0,0,0,0.3); padding: 1.2rem; border-radius: 8px; border: 1px solid var(--border-subtle); margin-bottom: 1rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem;">
          <div>
            <strong style="color:var(--cyan-neon); font-size:1rem;">AUDIT CERTIFICATE: ${cert.certificateId}</strong><br>
            <span style="font-size:0.72rem; color:var(--text-secondary);">${cert.issuingEntity}</span>
          </div>
          <div style="text-align:right;">
            <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--emerald-neon); font-weight:700;">IRDAI COMPLIANT</span><br>
            <span style="font-size:0.7rem; color:var(--text-muted);">${cert.timestamp}</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <div style="color:var(--text-muted); font-size:0.7rem;">RESILIENCE POSTURE</div>
            <div style="font-size:1.3rem; font-weight:800; font-family:var(--font-mono); color:#fff;">${cert.resilienceScore} / 100</div>
          </div>
          <div>
            <div style="color:var(--text-muted); font-size:0.7rem;">INSURANCE PREMIUM REBATE</div>
            <div style="font-size:1.3rem; font-weight:800; font-family:var(--font-mono); color:var(--emerald-neon);">${cert.dynamicPremiumDiscount} (${cert.annualSavings}/yr)</div>
          </div>
        </div>

        <div style="margin-bottom: 0.75rem;">
          <div style="color:var(--text-muted); font-size:0.7rem; margin-bottom: 0.2rem;">APPLIED MANDATES & STATUTORY FRAMEWORKS</div>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            ${cert.regulatoryStandards.map(s => `<span class="badge-subtle" style="background:rgba(0,242,254,0.1); color:var(--cyan-neon);">${s}</span>`).join('')}
          </div>
        </div>

        <div style="margin-bottom: 0.75rem;">
          <div style="color:var(--text-muted); font-size:0.7rem; margin-bottom: 0.2rem;">CRYPTOGRAPHIC VERIFICATION HASH (PROOF OF AUDIT)</div>
          <div style="font-family:var(--font-mono); font-size:0.68rem; color:var(--text-secondary); background:rgba(255,255,255,0.03); padding:0.4rem; border-radius:4px; word-break:break-all;">
            ${cert.forensicVerificationHash}
          </div>
        </div>

        <div>
          <div style="color:var(--text-muted); font-size:0.7rem; margin-bottom: 0.2rem;">UNDERWRITING VERDICT</div>
          <div style="font-size:0.8rem; color:#fff; font-weight:600;">${cert.underwriterVerdict}</div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }

  copyReportToClipboard() {
    const posture = this.underwriter.evaluateRiskPosture(this.incidents);
    const cert = this.underwriter.generateInsuranceAuditCertificate(posture, this.selectedIncident);
    navigator.clipboard.writeText(JSON.stringify(cert, null, 2)).then(() => {
      this.showToast('Forensic Audit JSON copied to clipboard!', 'emerald');
    });
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new AegisApp();
});
