# Production operations

## Runtime and release

Use the locked dependencies, Node 22 and the repository Dockerfile. Railway runs
`npx prisma migrate deploy` before deployment and checks `/api/health`. The web
and movie worker share one supervised container: an unexpected exit of either
stops the other and fails the container for a platform restart.

Keep `APP_URL` equal to the public HTTPS origin. Configure `DATABASE_URL` and a
random `SESSION_SECRET` of at least 32 characters. Provider credentials stay
server-side. Keep a single replica while auth and generation throttles are
per-process; a shared limiter is required before scaling replicas.

## Account acceptance

Configure `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_PUBLIC_URL` and
`EMAIL_VERIFICATION_REQUIRED=true`. The sender domain must be verified in
Resend. A configured key or a generic reset response does not establish inbox
delivery: use an existing test account and confirm the received message.

Test registration, verification, login, logout and password reset. Confirm the
reset link can be used once, older cookies cannot access `/api/auth/me`, and
previous MCP access/refresh credentials and unused codes are rejected. A reset
updates the account, consumes the email token and revokes delegated credentials
in one database transaction. Other accounts are unaffected.

The CI Postgres service applies all migrations and runs a real database test
for rollback and concurrent one-time reset-token use. Local test runs without
`INTEGRATION_DATABASE_ENABLED=true` deliberately skip that integration check.

## Backups and restore

The Railway Postgres volume preserves the database through deployments, but a
volume is not an independent backup. Use a scheduled encrypted off-host
`pg_dump --format=custom` snapshot with access restricted to operators. Do not
print the database connection string in logs or store it in Git. Validate the
dump with `pg_restore --list`, restore into an isolated nonproduction database,
and verify account, generation, ledger and OAuth records before considering
recovery tested. Never restore over the live database for a drill.

Generation output references are stored in Postgres. Confirm the upstream media
retention period separately; database backup does not copy provider-hosted
video/image bytes. Users should download completed assets. A permanent media
archive requires its own private object storage, copy policy and restore test.

## Provider acceptance and monitoring

Use a bounded funded test to verify signed upload, generation submission, status,
completion, preview and download. Test cancellation and failure settlement using
the same request key. Inspect uncertain submissions before retrying them: they
retain their reservation to avoid a duplicate billable request.

Observe worker/container exits, unresolved generations, provider quota, DB storage
and HTTP errors. `/api/health` is a basic runtime/database check, not proof that
every provider endpoint is entitled or that output quality is acceptable.

AI Director and Movie Producer require separate provider credentials, cost
controls and acceptance checks. Keep their public/worker flags disabled until
those checks pass. Do not enable unverified catalog/tariff feeds or claim a fully
automatic voice/video pipeline from a cross-site script handoff.

Payment activation and its acceptance tests are outside this non-payment release.
