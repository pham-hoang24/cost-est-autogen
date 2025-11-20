// EU AI Act & GDPR Compliant Data Sharing Agreement Templates

export interface DataSharingAgreementData {
  project_name: string;
  project_type: 'research' | 'ai_development' | 'data_analysis' | 'model_training';
  legal_basis: 'consent' | 'contract' | 'legitimate_interest' | 'research_exemption';
  data_categories: string[];
  processing_purposes: string[];
  cross_border_transfers: boolean;
  destination_countries?: string[];
  ai_processing: boolean;
  automated_decision_making: boolean;
  retention_period_days: number;
  data_controller: string;
  data_processor: string;
}

export const generateDataSharingAgreement = (data: DataSharingAgreementData): string => {
  const currentDate = new Date().toLocaleDateString('en-GB');
  
  return `
# DATA SHARING AGREEMENT
## EU AI Act & GDPR Compliant Research Collaboration

**Project:** ${data.project_name}
**Date:** ${currentDate}
**Agreement Version:** 1.0

---

## 1. PARTIES AND ROLES

**Data Controller:** ${data.data_controller}
**Data Processor:** ${data.data_processor}
**Project Type:** ${data.project_type.replace('_', ' ').toUpperCase()}

---

## 2. LEGAL BASIS (GDPR Article 6)

**Primary Legal Basis:** ${data.legal_basis.replace('_', ' ').toUpperCase()}

${data.legal_basis === 'research_exemption' ? `
**Research Exemption (GDPR Article 89):**
This data processing is conducted for scientific research purposes and benefits from the research exemption under GDPR Article 89, providing additional safeguards for data subjects while enabling legitimate scientific research.

**Additional Safeguards Applied:**
- Technical and organizational measures to ensure data minimization
- Pseudonymization where technically feasible
- Prohibition of processing for other purposes
- Specific security measures for research data
` : ''}

${data.legal_basis === 'consent' ? `
**Explicit Consent Requirements:**
- Freely given, specific, informed, and unambiguous consent
- Clear information about processing purposes and data use
- Right to withdraw consent at any time
- Consent records maintained for audit purposes
` : ''}

---

## 3. EU AI ACT COMPLIANCE

${data.ai_processing ? `
**AI System Classification:**
This project involves AI system development and is subject to EU AI Act requirements:

**Risk Assessment:**
- ${data.project_type === 'ai_development' ? 'HIGH RISK' : 'LIMITED RISK'} AI system classification
- Compliance with EU AI Act Title III requirements
- Human oversight measures implemented
- Transparency and explainability requirements

**AI System Obligations:**
- Technical documentation maintained
- Risk management system in place
- Data governance and quality measures
- Human oversight and intervention capabilities
- Accuracy, robustness, and cybersecurity measures

**Prohibited Practices:**
- No subliminal techniques or exploitation of vulnerabilities
- No social scoring for general purposes
- No real-time remote biometric identification (unless authorized)
- No emotion recognition in workplace/education (unless authorized)
` : `
**AI Processing:** This project does not involve high-risk AI systems but follows AI Act principles for responsible AI development.
`}

---

## 4. DATA CATEGORIES AND PROCESSING

**Data Categories:**
${data.data_categories.map(category => `- ${category}`).join('\n')}

**Processing Purposes:**
${data.processing_purposes.map(purpose => `- ${purpose}`).join('\n')}

**Processing Activities:**
- Data collection and aggregation
- Statistical analysis and research
- ${data.ai_processing ? 'AI model training and inference' : 'Traditional data analysis'}
- Collaborative research and knowledge sharing
- Publication of anonymized research results

---

## 5. CROSS-BORDER TRANSFERS

${data.cross_border_transfers ? `
**International Transfers:** ENABLED

**Destination Countries:** ${data.destination_countries?.join(', ') || 'To be determined'}

**Transfer Safeguards:**
- Standard Contractual Clauses (SCCs) - Commission Implementing Decision (EU) 2021/914
- Adequacy decisions where applicable
- Additional technical and organizational measures
- Transfer impact assessment completed
- Data subject notification requirements met

**Article 44-49 GDPR Compliance:**
- Appropriate safeguards in place
- Enforceable data subject rights
- Effective legal remedies available
- Regular monitoring of transfer conditions
` : `
**International Transfers:** DISABLED - Data processing restricted to EU/EEA
`}

---

## 6. DATA SUBJECT RIGHTS

**Individual Rights (GDPR Chapter III):**
- **Right of Access (Art. 15):** Request copy of personal data
- **Right to Rectification (Art. 16):** Correct inaccurate data
- **Right to Erasure (Art. 17):** Request deletion of data
- **Right to Restrict Processing (Art. 18):** Limit data use
- **Right to Data Portability (Art. 20):** Receive data in structured format
- **Right to Object (Art. 21):** Object to processing
- **Right to Withdraw Consent:** Where consent is the legal basis

**Exercise of Rights:**
- Contact: privacy@sw4e.org
- Response time: 30 days maximum
- Identity verification required
- Free of charge (unless excessive)

---

## 7. SECURITY MEASURES

**Technical Safeguards:**
- End-to-end encryption for data in transit
- AES-256 encryption for data at rest
- Multi-factor authentication required
- Regular security assessments and penetration testing
- Secure backup and disaster recovery procedures

**Organizational Safeguards:**
- Data minimization principles applied
- Purpose limitation strictly enforced
- Access controls based on need-to-know
- Regular staff training on data protection
- Incident response procedures in place

**EU AI Act Security Requirements:**
- Cybersecurity measures throughout AI system lifecycle
- Resilience against attempts to alter use or performance
- Protection against cybersecurity threats
- Logging capabilities for traceability

---

## 8. DATA RETENTION AND DELETION

**Retention Period:** ${data.retention_period_days} days from project completion

**Deletion Schedule:**
- Automatic deletion after retention period
- Secure deletion using NIST 800-88 standards
- Deletion certificates provided upon request
- Legal hold procedures for litigation

**Research Data Archiving:**
- Anonymized research outputs may be retained for scientific purposes
- Personal identifiers removed before archiving
- Compliance with institutional data management policies

---

## 9. BREACH NOTIFICATION

**Incident Response (GDPR Article 33-34):**
- Data Controller notification: Within 72 hours
- Data Subject notification: Without undue delay (if high risk)
- Supervisory Authority notification: As required
- Documentation of all security incidents

**Breach Assessment Criteria:**
- Risk to rights and freedoms of data subjects
- Nature, scope, and consequences of breach
- Measures taken to address the breach
- Recommendations to mitigate adverse effects

---

## 10. COMPLIANCE MONITORING

**Regular Assessments:**
- Quarterly compliance reviews
- Annual data protection impact assessments
- AI system performance monitoring
- Data subject rights exercise tracking

**Audit Requirements:**
- Access to processing records
- Cooperation with supervisory authorities
- Documentation of compliance measures
- Regular third-party security assessments

---

## 11. TERMINATION AND DATA RETURN

**Upon Project Termination:**
- Secure return or deletion of all shared data
- Destruction certificates provided
- Audit trail of data handling maintained
- Compliance with data retention requirements

**Data Subject Withdrawal:**
- Immediate cessation of processing upon consent withdrawal
- Secure deletion of personal data
- Notification to all data processors
- Documentation of withdrawal and actions taken

---

## 12. CONTACT INFORMATION

**Data Protection Officer:** dpo@sw4e.org
**Privacy Contact:** privacy@sw4e.org
**Security Contact:** security@sw4e.org
**Legal Contact:** legal@sw4e.org

**Supervisory Authority:** Relevant EU Data Protection Authority
**Dispute Resolution:** EU jurisdiction, mediation preferred

---

## ACKNOWLEDGMENT

By accepting this invitation and providing consent, you acknowledge that you have read, understood, and agree to be bound by the terms of this Data Sharing Agreement and the associated privacy notices.

**Last Updated:** ${currentDate}
**Next Review Date:** ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}

---

*This agreement is automatically generated and complies with EU AI Act, GDPR, and other applicable EU data protection regulations.*
`;
};

export const getConsentFormText = (projectData: any) => ({
  data_sharing: {
    title: "Data Sharing Consent",
    description: `I consent to sharing my research data within the "${projectData.name}" project for the purposes of collaborative research and analysis.`,
    details: [
      "Your data will be shared only with approved project members",
      "Data will be used solely for the stated research purposes",
      "You can withdraw consent at any time",
      "Data will be deleted according to the retention policy"
    ]
  },
  ai_processing: {
    title: "AI Processing Consent",
    description: `I consent to the use of artificial intelligence and automated processing of my data within the "${projectData.name}" project.`,
    details: [
      "AI systems will be used for data analysis and pattern recognition",
      "Automated decisions will have human oversight",
      "AI processing complies with EU AI Act requirements",
      "You have the right to explanation of AI decisions affecting you"
    ]
  },
  cross_border: {
    title: "Cross-border Transfer Consent",
    description: `I consent to the transfer of my data outside the EU/EEA for the purposes of international collaboration in the "${projectData.name}" project.`,
    details: [
      "Data will be transferred with appropriate safeguards (SCCs)",
      "Destination countries have been assessed for adequacy",
      "You retain all GDPR rights even for international transfers",
      "Additional security measures applied for international processing"
    ]
  }
});

export const generateInvitationEmail = (invitation: any, project: any, inviter: any, agreement: string) => ({
  subject: `Invitation to join "${project.name}" research project`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #2d3748; margin: 0 0 10px 0;">SW4E Sandbox - Project Invitation</h1>
        <p style="color: #4a5568; margin: 0;">You've been invited to collaborate on a research project</p>
      </div>
      
      <h2 style="color: #2d3748;">Project: ${project.name}</h2>
      <p style="color: #4a5568;">${project.description}</p>
      
      <div style="background: #e6fffa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #234e52; margin: 0 0 10px 0;">Invitation Details</h3>
        <ul style="color: #285e61; margin: 0; padding-left: 20px;">
          <li><strong>Invited by:</strong> ${inviter.firstName} ${inviter.lastName}</li>
          <li><strong>Your role:</strong> ${invitation.role}</li>
          <li><strong>Project type:</strong> ${project.project_type.replace('_', ' ')}</li>
          <li><strong>Legal basis:</strong> ${project.legal_basis.replace('_', ' ')}</li>
        </ul>
      </div>
      
      ${invitation.message ? `
        <div style="background: #f7fafc; padding: 15px; border-left: 4px solid #4299e1; margin: 20px 0;">
          <h4 style="color: #2b6cb0; margin: 0 0 10px 0;">Personal Message</h4>
          <p style="color: #2d3748; margin: 0; font-style: italic;">"${invitation.message}"</p>
        </div>
      ` : ''}
      
      <div style="background: #fff5f5; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fed7d7;">
        <h3 style="color: #c53030; margin: 0 0 10px 0;">🛡️ Legal Compliance Notice</h3>
        <p style="color: #742a2a; margin: 0; font-size: 14px;">
          This invitation includes a comprehensive data sharing agreement compliant with:
        </p>
        <ul style="color: #742a2a; margin: 10px 0 0 0; padding-left: 20px; font-size: 14px;">
          <li>EU AI Act (Regulation 2024/1689)</li>
          <li>General Data Protection Regulation (GDPR)</li>
          <li>Digital Services Act (DSA)</li>
          <li>Research exemption provisions (GDPR Art. 89)</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:3000/invitations?token=${invitation.invitation_token}" 
           style="background: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Review Invitation & Join Project
        </a>
      </div>
      
      <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #4a5568; margin: 0 0 10px 0;">Next Steps:</h4>
        <ol style="color: #4a5568; margin: 0; padding-left: 20px;">
          <li>Click the link above to review the full invitation</li>
          <li>Read the data sharing agreement and privacy notice</li>
          <li>Provide explicit consent for data processing activities</li>
          <li>Join the project and start collaborating</li>
        </ol>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
      
      <div style="font-size: 12px; color: #a0aec0;">
        <p><strong>Data Protection:</strong> Your privacy is protected under GDPR. You have the right to access, rectify, erase, restrict, object, and port your data. Contact privacy@sw4e.org for any data protection queries.</p>
        <p><strong>Invitation Expires:</strong> ${new Date(invitation.expires_at).toLocaleDateString()} - This invitation will expire after 7 days for security purposes.</p>
        <p><strong>SW4E Sandbox:</strong> Secure, compliant research collaboration platform • sw4e.org</p>
      </div>
    </div>
  `,
  text: `
SW4E Sandbox - Project Invitation

You've been invited to join the research project: ${project.name}

Project Description: ${project.description}

Invitation Details:
- Invited by: ${inviter.firstName} ${inviter.lastName}
- Your role: ${invitation.role}
- Project type: ${project.project_type.replace('_', ' ')}
- Legal basis: ${project.legal_basis.replace('_', ' ')}

${invitation.message ? `Personal Message: "${invitation.message}"` : ''}

Legal Compliance:
This invitation includes a comprehensive data sharing agreement compliant with EU AI Act, GDPR, Digital Services Act, and research exemption provisions.

To join the project:
1. Visit: http://localhost:3000/invitations?token=${invitation.invitation_token}
2. Review the data sharing agreement
3. Provide explicit consent for data processing
4. Join the project and start collaborating

Your privacy is protected under GDPR. Contact privacy@sw4e.org for any questions.

This invitation expires on ${new Date(invitation.expires_at).toLocaleDateString()}.

SW4E Sandbox - Secure Research Collaboration Platform
  `
});

export const generateConsentRecord = (
  userId: string,
  projectId: string,
  consentData: any,
  invitationData: any
) => ({
  consent_id: `consent_${userId}_${projectId}_${Date.now()}`,
  user_id: userId,
  project_id: projectId,
  consent_timestamp: new Date().toISOString(),
  consent_version: '1.0',
  legal_basis: invitationData.project.legal_basis,
  consents_given: {
    data_sharing: {
      consent: consentData.data_sharing_consent,
      purpose: 'Collaborative research and data sharing within project',
      data_categories: ['research_data', 'project_metadata', 'user_contributions'],
      processing_activities: ['sharing', 'analysis', 'storage', 'collaboration'],
      retention_period: invitationData.project.data_retention_days || 365
    },
    ai_processing: {
      consent: consentData.ai_processing_consent,
      purpose: 'AI model training and automated processing for research',
      data_categories: ['research_data', 'model_inputs', 'analysis_results'],
      processing_activities: ['ai_training', 'automated_analysis', 'model_inference', 'pattern_recognition'],
      ai_system_type: invitationData.project.project_type,
      human_oversight: true,
      explainability_required: true
    },
    cross_border_transfer: {
      consent: consentData.cross_border_consent || false,
      purpose: 'International collaboration and research sharing',
      destination_countries: invitationData.project.destination_countries || [],
      safeguards: ['standard_contractual_clauses', 'adequacy_decisions'],
      transfer_impact_assessment: true
    }
  },
  withdrawal_mechanism: {
    method: 'online_portal',
    contact: 'privacy@sw4e.org',
    effect: 'immediate',
    data_deletion: 'within_30_days'
  },
  data_subject_rights: {
    access: true,
    rectification: true,
    erasure: true,
    restrict_processing: true,
    data_portability: true,
    object_to_processing: true,
    withdraw_consent: true
  },
  compliance_framework: {
    gdpr: true,
    eu_ai_act: true,
    research_exemption: invitationData.project.legal_basis === 'research_exemption',
    dpia_completed: invitationData.project.requires_dpia
  }
});
