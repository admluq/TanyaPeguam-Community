// lib/email-donna.ts
// Email service for Donna AI notifications
// Sends intake summaries, triage results, and magic links to lawyers

import { sendEmail } from './email';
import type { RecommendationOutput, TriageOutput } from './donna-types';

/**
 * Send intake summary email to lawyer with results
 */
export async function sendDonnaIntakeSummary(options: {
  lawyerEmail: string;
  lawyerName: string;
  firmName: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  practiceArea?: string;
  issueSummary?: string;
  triage: TriageOutput;
  recommendation: RecommendationOutput;
  bridgeShortCode: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const {
      lawyerEmail,
      lawyerName,
      firmName,
      clientName,
      clientEmail,
      clientPhone,
      practiceArea,
      triage,
      recommendation,
      bridgeShortCode,
    } = options;

    // Generate magic links
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const bridgeUrl = `${baseUrl}/bridges/${bridgeShortCode}`;

    // Build email HTML
    const html = `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #2d1b69; color: #fff; padding: 20px; border-radius: 8px 8px 0 0; }
      .header h1 { margin: 0; font-size: 24px; }
      .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
      .section { margin-bottom: 20px; }
      .section h2 { color: #2d1b69; font-size: 16px; margin-top: 0; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
      .score-box { background: #fff; padding: 15px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #7c3aed; }
      .score-box strong { color: #2d1b69; }
      .action-buttons { margin: 20px 0; }
      .btn { display: inline-block; padding: 12px 24px; margin-right: 10px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-bottom: 10px; }
      .btn-accept { background: #10b981; color: #fff; }
      .btn-accept:hover { background: #059669; }
      .btn-view { background: #3b82f6; color: #fff; }
      .btn-view:hover { background: #2563eb; }
      .footer { background: #f0f0f0; padding: 15px 20px; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; border: 1px solid #ddd; border-top: none; }
      .urgency-critical { color: #dc2626; font-weight: bold; }
      .urgency-high { color: #ea580c; font-weight: bold; }
      .urgency-medium { color: #f59e0b; font-weight: bold; }
      .urgency-low { color: #10b981; font-weight: bold; }
      table { width: 100%; border-collapse: collapse; margin: 10px 0; }
      table td { padding: 8px; border-bottom: 1px solid #eee; }
      table td:first-child { font-weight: bold; color: #2d1b69; width: 150px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>📋 New Intake Received</h1>
        <p style="margin: 10px 0 0 0; font-size: 14px;">Donna AI has processed a new client inquiry</p>
      </div>

      <div class="content">
        <!-- Client Info -->
        <div class="section">
          <h2>👤 Client Information</h2>
          <table>
            ${clientName ? `<tr><td>Name:</td><td>${clientName}</td></tr>` : ''}
            ${clientEmail ? `<tr><td>Email:</td><td>${clientEmail}</td></tr>` : ''}
            ${clientPhone ? `<tr><td>Phone:</td><td>${clientPhone}</td></tr>` : ''}
            ${practiceArea ? `<tr><td>Practice Area:</td><td>${practiceArea}</td></tr>` : ''}
          </table>
        </div>

        <!-- Triage Scores -->
        <div class="section">
          <h2>⚖️ Triage Scores</h2>

          <div class="score-box">
            <strong>Concrete Score:</strong> ${triage.concreteScore}/100
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${triage.reasoning.concrete}</p>
          </div>

          <div class="score-box">
            <strong>Urgency:</strong> <span class="urgency-${triage.urgencyTag.toLowerCase()}">${triage.urgencyTag}</span>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${triage.reasoning.urgency}</p>
          </div>

          <div class="score-box">
            <strong>Client Sophistication:</strong> ${triage.sophistication}
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${triage.reasoning.sophistication}</p>
          </div>

          <div class="score-box">
            <strong>Suggested Tier:</strong> ${triage.suggestedTier}
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${triage.reasoning.tier}</p>
          </div>

          ${triage.shouldDeflect ? `<div class="score-box" style="border-left-color: #dc2626;"><strong style="color: #dc2626;">⚠️ Deflection Recommended</strong><p style="margin: 5px 0 0 0; font-size: 12px;">${triage.deflectReason || 'Outside practice areas'}</p></div>` : ''}
        </div>

        <!-- Strengths & Risks -->
        <div class="section">
          <h2>✓ Key Strengths</h2>
          <ul style="margin: 10px 0; padding-left: 20px;">
            ${triage.keyStrengths.map((s) => `<li>${s}</li>`).join('')}
          </ul>
        </div>

        ${triage.risks.length > 0 ? `
        <div class="section">
          <h2>⚠️ Risks</h2>
          <ul style="margin: 10px 0; padding-left: 20px; color: #dc2626;">
            ${triage.risks.map((r) => `<li>${r}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        <!-- Recommendation -->
        <div class="section">
          <h2>🎯 Recommendation</h2>
          <div class="score-box" style="border-left-color: ${recommendation.finalRecommendation === 'ACCEPT' ? '#10b981' : '#dc2626'};">
            <strong>Decision:</strong> ${recommendation.finalRecommendation === 'ACCEPT' ? '✓ ACCEPT' : '✗ REJECT'}
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">${recommendation.lawyerNotes}</p>
          </div>

          <p style="margin: 15px 0 0 0; font-size: 13px;"><strong>Next Steps:</strong></p>
          <ol style="margin: 5px 0; padding-left: 20px; font-size: 13px;">
            ${recommendation.nextSteps.map((step) => `<li>${step}</li>`).join('')}
          </ol>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <a href="${bridgeUrl}" class="btn btn-view">📖 View Full Intake</a>
        </div>
      </div>

      <div class="footer">
        <p style="margin: 0;"><strong>TanyaPeguam Donna AI Notification</strong></p>
        <p style="margin: 5px 0 0 0;">This is an automated notification from Donna, your AI intake assistant.</p>
        <p style="margin: 5px 0 0 0;">Bridge Code: <code>${bridgeShortCode}</code></p>
      </div>
    </div>
  </body>
</html>
    `;

    // Send email
    const result = await sendEmail({
      to: lawyerEmail,
      subject: `[Donna AI] New Intake: ${clientName || 'Unnamed Client'} - ${triage.urgencyTag} Urgency`,
      html,
      text: `New intake received: ${clientName || 'Unnamed Client'}. Concrete Score: ${triage.concreteScore}/100. Urgency: ${triage.urgencyTag}. Recommendation: ${recommendation.finalRecommendation}`,
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending Donna intake summary email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Send simple intake summary to lawyer (lean MVP)
 */
export async function sendSimpleIntakeSummary(options: {
  lawyerEmail: string;
  lawyerName: string;
  firmName: string;
  clientEmail?: string;
  clientPhone?: string;
  issue: string;
  transcript: string;
  bridgeShortCode: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const {
      lawyerEmail,
      lawyerName,
      firmName,
      clientEmail,
      clientPhone,
      issue,
      transcript,
      bridgeShortCode,
    } = options;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const bridgeUrl = `${baseUrl}/bridges/${bridgeShortCode}`;

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #2d1b69; color: #fff; padding: 20px; border-radius: 8px 8px 0 0; }
      .header h1 { margin: 0; font-size: 24px; }
      .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
      .section { margin-bottom: 20px; }
      .section h2 { color: #2d1b69; font-size: 16px; margin-top: 0; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
      .info-box { background: #fff; padding: 15px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #7c3aed; }
      .transcript { background: #fff; padding: 15px; border-radius: 6px; border: 1px solid #ddd; font-family: monospace; font-size: 12px; white-space: pre-wrap; word-wrap: break-word; }
      .btn { display: inline-block; padding: 12px 24px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; }
      .btn:hover { background: #2563eb; }
      .footer { background: #f0f0f0; padding: 15px 20px; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; border: 1px solid #ddd; border-top: none; }
      table { width: 100%; border-collapse: collapse; }
      table td { padding: 8px; border-bottom: 1px solid #eee; }
      table td:first-child { font-weight: bold; color: #2d1b69; width: 100px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>📞 New Client Intake</h1>
        <p style="margin: 10px 0 0 0; font-size: 14px;">Client submitted intake form</p>
      </div>

      <div class="content">
        <div class="section">
          <h2>Issue</h2>
          <div class="info-box">
            <strong>${issue}</strong>
          </div>
        </div>

        ${clientEmail || clientPhone ? `
        <div class="section">
          <h2>Contact Information</h2>
          <table>
            ${clientEmail ? `<tr><td>Email:</td><td>${clientEmail}</td></tr>` : ''}
            ${clientPhone ? `<tr><td>Phone:</td><td>${clientPhone}</td></tr>` : ''}
          </table>
        </div>
        ` : ''}

        <div class="section">
          <h2>Full Intake Transcript</h2>
          <div class="transcript">${transcript}</div>
        </div>

        <div class="section">
          <a href="${bridgeUrl}" class="btn">📖 View Full Intake</a>
        </div>
      </div>

      <div class="footer">
        <p style="margin: 0;"><strong>${firmName}</strong></p>
        <p style="margin: 5px 0 0 0;">Lean MVP Intake Form - Code: ${bridgeShortCode}</p>
      </div>
    </div>
  </body>
</html>
    `;

    const result = await sendEmail({
      to: lawyerEmail,
      subject: `[New Intake] ${issue.substring(0, 50)}...`,
      html,
      text: `New client intake: ${issue}\n\n${transcript}`,
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending simple intake summary email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Send follow-up message to client based on lawyer's recommendation
 */
export async function sendClientFollowUp(options: {
  clientEmail: string;
  clientName: string;
  lawyerName: string;
  firmName: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { clientEmail, clientName, lawyerName, firmName, subject, message } =
      options;

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #2d1b69; color: #fff; padding: 20px; border-radius: 8px 8px 0 0; }
      .header h1 { margin: 0; font-size: 24px; }
      .content { background: #fff; padding: 20px; border: 1px solid #ddd; }
      .footer { background: #f0f0f0; padding: 15px 20px; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; border: 1px solid #ddd; border-top: none; }
      .message { line-height: 1.6; color: #444; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>${firmName}</h1>
        <p style="margin: 10px 0 0 0; font-size: 14px;">Response to Your Legal Inquiry</p>
      </div>

      <div class="content">
        <p>Dear ${clientName},</p>

        <div class="message">
          ${message.replace(/\n/g, '<br />')}
        </div>

        <p style="margin-top: 20px;">Best regards,<br /><strong>${lawyerName}</strong><br />${firmName}</p>
      </div>

      <div class="footer">
        <p style="margin: 0;">© ${new Date().getFullYear()} ${firmName}. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
    `;

    const result = await sendEmail({
      to: clientEmail,
      subject,
      html,
      text: message,
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending client follow-up email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}
