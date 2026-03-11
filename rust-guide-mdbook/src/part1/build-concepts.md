# Build Concepts

> **cargo build — Compilation**
> Compiles your project in **debug mode** (fast compilation, slower runtime, includes debug info).

*Node.js equivalent: Running `npm run build` in development mode.*

```bash
cargo build              # Debug build  ->  target/debug/
cargo build --release    # Optimized build  ->  target/release/
```

---

> **Build Profiles — dev vs release**
> Build profiles control the optimization level.

| Profile   | Command                    | Compile Speed | Optimized |
|-----------|----------------------------|---------------|-----------|
| dev       | `cargo build`              | Fast          | No        |
| release   | `cargo build --release`    | Slow          | Yes       |

*Node.js equivalent: `NODE_ENV=development` vs `NODE_ENV=production`*

---

> **cargo run — Build and Execute**
> Compiles and immediately runs your project in one step.

*Node.js equivalent: `node index.js` or `npm start`*

---

> **cargo check — Type-Check Only**
> Type-checks your code without producing a binary. Much faster than a full build.

*Node.js equivalent: `tsc --noEmit` — checks for type errors without outputting files.*
