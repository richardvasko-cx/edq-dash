# User Permissions & Enterprise Access Control

Braze provides robust, workspace-level role permissions to safeguard your customer communication workflows. Each account administrator can provision specific authorization tiers to maintain governance and cross-department security.

## Standard Roles
- **Workspace Administrator**: Unrestricted read/write capabilities across segments, campaigns, API keys, exports, and integrations. Administrators can delete profiles, configure SAML, and manage permissions.
- **Editor**: Full creation access. Can draft, run, and modify segments, campaigns, templates, but cannot manage billing or workspace-level preferences.
- **Viewer / Reader**: Strictly read-only access. Helpful for analysts and product managers checking active analytics or existing campaign structures.
- **Custom / Team Roles**: Enterprise accounts can leverage fine-grained access criteria (e.g., restrict SMS sending to a regional marketing squad).

## Compliance & Security Guidelines
- Restrict S3 export configurations to S3 Export Admin credentials.
- Periodically prune unused API credentials with write permission.
- Ensure automated user provisioning uses SCIM protocols.