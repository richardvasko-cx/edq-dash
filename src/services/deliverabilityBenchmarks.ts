/**
 * Source-backed operating guidance for the demo dashboard. These are guardrails,
 * not universal campaign-performance targets: audience, message type, and mailbox
 * provider still determine the right comparison cohort.
 *
 * Sources:
 * - Local Braze User Guide: channels/email/email_setup/ip_warming
 * - Google Email Sender Guidelines (Postmaster spam rate)
 * - Litmus deliverability guidance (bounce and complaint escalation)
 */
export const DELIVERABILITY_BENCHMARKS = {
  deliveryRate: {
    healthy: 0.99,
    source: 'Braze IP warming: healthy delivery is around 99%.',
  },
  bounceRate: {
    healthyMaximum: 0.01,
    investigate: 0.02,
    warmingEscalation: 0.03,
    source: 'Braze IP warming and Litmus deliverability guidance.',
  },
  spamComplaintRate: {
    targetMaximum: 0.001,
    critical: 0.003,
    source: 'Google Sender Guidelines: keep daily user-reported spam below 0.10%; avoid 0.30% or higher.',
  },
  warmupOpenRate: {
    positiveSignal: 0.25,
    source: 'Braze IP warming only: unique opens above 25% can indicate positive inbox placement.',
  },
  unsubscribeRate: {
    targetMaximum: 0.005,
    source: 'Litmus: a practical unsubscribe target is below 0.5%.',
  },
} as const;

export const GEMINI_BENCHMARK_POLICY = `
SOURCE-BACKED METRIC POLICY:
- Delivery is mailbox acceptance, not inbox placement. Treat around 99% as the healthy Braze operating target; do not call 94-98% healthy without qualifying the source and scope.
- Bounce rate: at or below 1% is healthy; investigate above 2%; during IP warming, 3% or more requires list-hygiene and sending-pattern review. Do not create separate hard- or soft-bounce targets unless the data source supplies them.
- User-reported spam complaints are a daily Gmail/Postmaster metric: keep below 0.10%; 0.30% or more is critical. State the denominator and provider scope when comparing a dashboard complaint rate.
- Opens, clicks, unsubscribes, deferrals, and inbox placement require campaign, audience, and provider context. Do not label them healthy/unhealthy from a universal threshold. The Braze >25% unique-open signal applies only while IP warming; Apple MPP also limits open-rate reliability.
- Treat SPF, DKIM, and DMARC as categorical authentication requirements. For bulk Gmail sending, SPF, DKIM, DMARC alignment, PTR, TLS, and one-click unsubscribe are required; do not invent a pass-rate percentage target.
- Reputation is provider-reported and qualitative (for example Google Postmaster High/Medium/Low/Bad). Never derive a reputation score from bounce or open rate alone.
`;
