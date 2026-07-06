# Email Setup: Authenticators & Security Keys

Ensuring clean deliverability begins with establishing correct sender signatures. Braze emails require custom DKIM, SPF, and DMARC parameters to bypass modern mailbox filters and secure domain reputation.

## Deliverability Fundamentals
1. **SPF (Sender Policy Framework)**: A standard DNS TXT record determining which servers are authorized to send marketing and transactional email on your domain's behalf.
2. **DKIM (DomainKeys Identified Mail)**: Cryptographically binds your brand's digital signature to outgoing mail, verifying the header content has not been tampered with.
3. **DMARC (Domain-based Message Authentication, Reporting, and Conformance)**: Coordinates SPF and DKIM behavior. A healthy rule is `v=DMARC1; p=reject; rua=mailto:dmarc@yourdomain.com` mapping automatic reports of abuse.

## Automated IP Warming Schedules
For newly provisioned IP addresses, a graduated volume cadence is requested:
- **Week 1**: Maximum 50,000 messages daily, focused on highly engaged segments.
- **Week 2**: 100,000 daily messages.
- **Week 3**: Incremental doubling hasta reaching full operational targets.