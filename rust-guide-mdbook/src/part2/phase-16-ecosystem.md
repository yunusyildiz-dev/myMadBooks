# Phase 16 — Ecosystem & Backend Development

## Web Frameworks (Days 68–70)

- **Axum** (tokio ecosystem, recommended starting point)
- Alternatives: Actix-web, Warp, Rocket
- `axum::Router`, handler functions
- JSON: `serde_json`, `serde` derive macros
- Path and query parameters

## Database Integration (Days 71–73)

- **SQLx** — async, compile-time SQL checking
- PostgreSQL connection pooling
- CRUD operations and migrations: `sqlx migrate`
- Alternative: Diesel ORM

## Authentication & Middleware (Days 74–76)

- JWT authentication (`jsonwebtoken` crate)
- Axum middleware (`tower` layers)
- CORS, rate limiting
- Structured logging with `tracing`
- Environment management with `dotenv` / `config`

## Production Readiness (Days 77–80)

```bash
cargo test          # Comprehensive test coverage
cargo clippy        # Linting
cargo fmt           # Formatting
cargo audit         # Security scanning
```

- Containerize with Docker
- CI/CD pipeline with GitHub Actions
