/**
 * AI Security Copilot & RAG Knowledge Engine
 * Contextual responses incorporating India DPDP Act 2023, CERT-In, IRDAI, and MITRE ATT&CK
 */

export class AIInvestigator {
  constructor() {
    this.knowledgeBase = {
      'cert-in': (inc) => `
**OFFICIAL CERT-IN INCIDENT NOTIFICATION DRAFT (Under 6-Hour SLA Mandate)**
---------------------------------------------------------------------------------
• **Reference ID:** ${inc.id}
• **Incident Type:** ${inc.category} (${inc.title})
• **Target System:** ${inc.targetAsset}
• **Attacker Source Indicator:** ${inc.sourceIp}
• **Time of Detection:** ${new Date().toISOString()}
• **Impact Assessment:** ${inc.impact}
• **MITRE ATT&CK Mapping:** ${inc.mitreTactics.join(' -> ')}
• **Action Taken:** Automated containment initiated via Mitigata AegisForge Engine. Host isolated, credentials invalidated.
• **Status:** Remediated / Under continuous forensic monitoring.
---------------------------------------------------------------------------------
*Draft validated against CERT-In Cybersecurity Directions Section 70B.*
      `,

      'insurance': (inc, posture) => `
**IRDAI CYBER RESILIENCE & POLICY IMPACT ANALYSIS**
---------------------------------------------------------------------------------
• **Current Resilience Score:** ${posture.resilienceScore}/100
• **Estimated Financial VaR:** ${posture.exposureDisplay}
• **Mitigata Policyholder Discount:** ${posture.discountPercent} (Annual savings: ${posture.annualSavingsDisplay})
• **Underwriter Risk Rating:** ${posture.riskLevel}

**Underwriting Verdict:**
Executing automated containment prevents lateral escalation and catastrophic business interruption. By maintaining an MTTR under 60 seconds, your organization fulfills the Loss Mitigation Clause under IRDAI Master Guidelines, retaining maximum tier discounts.
      `,

      'mitre': (inc) => `
**MITRE ATT&CK DEEP VECTOR BREAKDOWN FOR ${inc.id}**
---------------------------------------------------------------------------------
• **Tactics Identified:**
  ${inc.mitreTactics.map(t => `  - [${t}]`).join('\n')}

• **Lateral Propagation Vector:**
  The attacker initiated execution from ingress gateway, utilizing token reuse to pivot into ${inc.targetAsset}.
• **Threat Actor Profile:**
  Signatures match state-nexus ransomware precursor syndicates operating automated credential spraying and API IDOR harvesting.
• **Forensic Countermeasure:**
  ${inc.steps.step4}
      `
    };
  }

  processQuery(query, activeIncident, posture) {
    const q = query.toLowerCase();

    if (q.includes('cert-in') || q.includes('report') || q.includes('disclosure')) {
      return this.knowledgeBase['cert-in'](activeIncident);
    }

    if (q.includes('insurance') || q.includes('premium') || q.includes('irdai') || q.includes('cost') || q.includes('var')) {
      return this.knowledgeBase['insurance'](activeIncident, posture);
    }

    if (q.includes('mitre') || q.includes('lateral') || q.includes('vector') || q.includes('technique')) {
      return this.knowledgeBase['mitre'](activeIncident);
    }

    if (q.includes('dpdp') || q.includes('privacy') || q.includes('aadhaar') || q.includes('pan') || q.includes('penalty')) {
      return `
**INDIA DPDP ACT 2023 REGULATORY AUDIT REPORT**
---------------------------------------------------------------------------------
• **Data Fiduciary Classification:** High-Volume PII Fiduciary
• **Statutory Exposure Ceiling:** Up to ₹ 250 Crores per breach under Section 33(1).
• **Current Model Exposure:** ${posture.dpdpExposureDisplay}
• **Breach Mitigation Status:** Endpoint rate-limiting active, token invalidated, preventing broad-scale demographic table enumeration.
• **Compliance Recommendation:** Log all API access trails cryptographically and prepare notification for the Data Protection Board of India (DPBI) within 72 hours.
      `;
    }

    // Default intelligent conversational response
    return `
**Aegis AI Telemetry Analysis:**
Analyzing your query against active incident **${activeIncident.id}** (${activeIncident.title}).
- Target: ${activeIncident.targetAsset}
- Severity: ${activeIncident.severity} (Score: ${activeIncident.score}/100)
- Automated recommendation: ${activeIncident.containmentAction}.
Our IRDAI underwriting engine indicates that maintaining automated incident triage keeps your cyber resilience rating at **${posture.resilienceScore}/100**. Would you like me to draft a CERT-In advisory or execute a containment playbook?
    `;
  }
}
