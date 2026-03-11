# Packages & Projects

> **Crate — Fundamental Unit of Code**
> The fundamental unit of code in Rust. A crate is a compiled package — either a **binary** (runs as a program) or a **library** (used by other code).

*Node.js equivalent: An `npm` package — a self-contained unit of code that can be published and reused.*

- **Binary crate** → has a `main()` function, produces an executable
- **Library crate** → has no `main()`, designed to be used by other crates

---

> **Package — Collection of Crates**
> A collection of one or more crates bundled together, described by a `Cargo.toml` file. Created when you run `cargo new`.

*Node.js equivalent: An npm project with a `package.json` file.*

---

> **Cargo.toml — Project Manifest**
> The manifest file for your Rust project. Defines project name, version, and all external dependencies.

*Node.js equivalent: `package.json` — defines your project metadata and dependencies.*

```toml
[package]
name = "my_project"
version = "0.1.0"
edition = "2021"

[dependencies]
rand = "0.8"
serde = { version = "1.0", features = ["derive"] }
```

---

> **Cargo.lock — Locked Dependencies**
> An auto-generated file that records the exact versions of all dependencies. Ensures every build is reproducible.

*Node.js equivalent: `package-lock.json` (npm) or `yarn.lock` (Yarn).*

> **💡 Tip:** Commit `Cargo.lock` for binary projects. For library crates, add it to `.gitignore`.

---

> **crates.io — Package Registry**
> The official public registry for Rust packages. Search, download, and publish crates here.

[https://crates.io](https://crates.io)

*Node.js equivalent: [npmjs.com](https://npmjs.com) — the public registry for npm packages.*

---

> **Workspace — Monorepo Management**
> A way to manage multiple related packages in a single repository, sharing a common `Cargo.lock` and output directory.

*Node.js equivalent: A monorepo setup using npm workspaces, Turborepo, or Lerna.*

```toml
# Root Cargo.toml
[workspace]
members = [
    "api_server",
    "shared_lib",
    "cli_tool",
]
```
