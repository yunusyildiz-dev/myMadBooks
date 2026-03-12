# Core Tools

> **rustup — Toolchain Installer**
> The toolchain installer and version manager for Rust. It installs and manages different versions of the Rust compiler and its tools.

*Node.js equivalent: `nvm` (Node Version Manager) — used to install and switch between Node.js versions.*

```bash
# Install Rust via rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Update Rust
rustup update
```

---

> **rustc — The Compiler**
> The Rust compiler. It takes your `.rs` source file and compiles it into an executable binary.

*Node.js equivalent: No direct equivalent — Node.js is interpreted. Closest concept: `tsc` (TypeScript compiler).*

```bash
# Compile a single file manually
rustc main.rs

# Run the resulting binary
./main
```

> **⚠️ Warning:** You rarely use `rustc` directly. `cargo` handles compilation for you in real projects.

---

> **cargo — Build System & Package Manager**
> The build system and package manager for Rust. It handles everything: compiling, managing dependencies, running tests, and publishing packages.

*Node.js equivalent: `npm` (or `yarn` / `pnpm`) — the all-in-one tool for managing packages and running scripts.*

```bash
cargo new my_project      # npm init
cargo build               # npm run build
cargo run                 # node index.js
cargo test                # npm test
cargo add serde           # npm install serde
cargo update              # npm update
```

---

> **rustfmt — Code Formatter**
> The automatic code formatter for Rust. Enforces a consistent code style across all Rust projects.

*Node.js equivalent: `prettier` — automatically formats your JavaScript/TypeScript code.*

```bash
cargo fmt
```

---

> **clippy — Linter**
> A linter (static analysis tool) that catches common mistakes and suggests improvements. Goes beyond the compiler's warnings.

*Node.js equivalent: `eslint` — analyzes your JavaScript code for errors and style issues.*

```bash
cargo clippy
```

---

> **rust-analyzer — Language Server**
> A language server that powers IDE features: autocomplete, inline error highlighting, go-to-definition, refactoring, and more. Runs in the background as you code.

*Node.js equivalent: The TypeScript language server built into VS Code — IntelliSense, error highlighting, etc.*

- Install via extension: VS Code → Extensions → search "rust-analyzer"
- Usually installed automatically with `rustup` (as part of the rust-analyzer component)
