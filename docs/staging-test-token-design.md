# Short-Lived Signed Staging Tokens

This is the second-stage design for shared-demo and staging activation without relying on a permanent static bypass token.

## Goals

- Keep the current explicit `activationMode: "test"` boundary.
- Replace static shared secrets in staging with short-lived signed tokens.
- Preserve a distinct audit trail from normal invite activation.

## Token Shape

- Signed payload fields:
  - `iss`: issuing service or operator tool
  - `aud`: `keon.control.website/activation-test`
  - `sub`: operator or demo identity
  - `tenant_id`: fixed staging tenant or demo workspace id
  - `workspace_name`: display label for the bound demo workspace
  - `env`: usually `sandbox`
  - `iat`: issued-at timestamp
  - `exp`: hard expiry, recommended 5 to 15 minutes
  - `jti`: unique token id for replay prevention
  - `scope`: `activation:test`

## Validation Flow

1. Client continues to call `POST /api/activation/provision` with `activationMode: "test"`.
2. Server verifies signature against a dedicated staging public key or HMAC secret.
3. Server checks `exp`, `aud`, and `scope`.
4. Server rejects replay by storing `jti` in Redis/Postgres until expiry.
5. Server binds the session to the staging tenant/workspace embedded in the token.
6. Server logs `jti`, `sub`, and target tenant as a test activation event.

## Operational Guidance

- Keep this enabled only in non-production by default.
- If production support is ever required, gate it separately from the local static token path.
- Rotate signing keys independently from invite-token keys.
- Emit a visible UI label such as `Demo activation mode` to avoid confusion with real invites.

## Migration Path

- Retain `KEON_TEST_ACTIVATION_TOKEN` for local-only developer workflows.
- Add `KEON_TEST_ACTIVATION_PUBLIC_KEY` or `KEON_TEST_ACTIVATION_SECRET` for staging.
- Support both strategies behind the same explicit `activationMode: "test"` request boundary.
