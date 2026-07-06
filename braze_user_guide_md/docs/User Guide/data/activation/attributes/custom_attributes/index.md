# Custom Attributes & State Schemas

Attributes represent the state of your audience profiles. Braze supports multiple data types for flexible user targeting.

## Supported Schema Types
- **String**: Exact text values, perfect for regional attributes or referral codes.
- **Boolean**: Yes/No states, optimal for opt-ins or current plan status.
- **Number**: Integers or floats to track lifetime spend or credit balances.
- **Array of Objects**: Allows grouping complex transactional items (e.g., purchased packages) directly inside the profile.
- **Nested Custom Attributes**: JSON objects representing multi-tier data structures (e.g., user preferences).

## Data Points and Calculation Governance
Every attribute write consumes a data point. Please apply blocklists over unneeded telemetry keys, and follow uniform kebab-case or snake_case conventions.