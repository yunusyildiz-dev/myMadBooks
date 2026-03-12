<div align="center">

<img src="https://rustacean.net/assets/rustacean-orig-noshadow.svg" width="120" alt="Ferris the Crab" />

# 🦀 Learning Rust — From Zero to Systems Engineer

**A structured, documented journey through the Rust programming language**  
*Following "The Rust Programming Language" book · Backend & Systems Engineering focused*

<br/>

[![Language](https://img.shields.io/badge/language-Rust-orange?style=flat-square&logo=rust)](https://www.rust-lang.org/)
[![Book](https://img.shields.io/badge/source-The%20Rust%20Book-blue?style=flat-square)](https://doc.rust-lang.org/book/)
[![mdBook](https://img.shields.io/badge/built%20with-mdBook-orange?style=flat-square)](https://rust-lang.github.io/mdBook/)
[![Status](https://img.shields.io/badge/status-In%20Progress-yellow?style=flat-square)]()

<br/>

</div>

---

# Rust Developer Guide

An [mdBook](https://rust-lang.github.io/mdBook/) project for the **Rust Developer Guide** — a learning roadmap from zero to systems engineer, with ecosystem reference and Node.js equivalents for easier onboarding.

Part of [myMadBooks](https://github.com/yunusyildiz-dev/myMadBooks).

---

## Quick Start

```bash
# Install mdBook (if needed)
cargo install mdbook

# Serve locally — opens in browser with live reload
mdbook serve --open

# Or build for production
mdbook build

# Apply favicon + custom print header (tab icon, branded print layout)
./post-build.sh
```

**Optional:** Run `./post-build.sh` after `mdbook build` to add custom favicon to the print view and a branded print header (`<Rust Developer Guide /> · yunusyildiz.dev` + date). Requires `favicon.png` in the project root.

The built output goes to `book/` — deploy to any static host (GitHub Pages, Netlify, etc.).

---

## Contents

- **Part I** — Rust Ecosystem (core tools, packages, build concepts, language fundamentals)
- **Part II** — Developer Roadmap (16 phases, day-by-day from Week 1 to backend)
- **Appendix** — Quick reference and extended term definitions

Source: [The Rust Programming Language](https://doc.rust-lang.org/book/) · Backend & systems focused.

---

## Project Layout

```
rust-guide-mdbook/
├── book.toml       # mdBook config
├── favicon.png     # Tab icon (used by post-build.sh)
├── post-build.sh   # Favicon + print header injection
├── src/            # Markdown source
│   ├── README.md   # Book intro (first page)
│   ├── SUMMARY.md  # Table of contents
│   ├── part1/      # Key definitions
│   ├── part2/      # Developer roadmap
│   └── appendix/   # Reference
└── book/           # Generated output (after build)
```

---

<div align="center">

<img src="../assets/images/yunusyildiz.png" width="100" height="100" alt="Yunus YILDIZ" style="border-radius: 50%;" />

### Yunus YILDIZ

*Always learning. Always building.*  
*Transforming ideas into digital experiences.*  
*Passionate about solving real-world challenges through technology.*

<br/>

<a href="https://github.com/yunusyildiz-dev" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white" alt="GitHub"/></a>
<a href="https://www.npmjs.com/~yunusyildiz" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/npm-CB3837?style=flat-square&logo=npm&logoColor=white" alt="npm"/></a>
<a href="https://www.linkedin.com/in/yunusyildiz-dev" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="https://mastodon.social/@yunusyildiz_dev" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Mastodon-6364FF?style=flat-square&logo=mastodon&logoColor=white" alt="Mastodon"/></a>
<a href="https://bsky.app/profile/yunusyildiz.ch" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Bluesky-0085FF?style=flat-square&logo=bluesky&logoColor=white" alt="Bluesky"/></a>
<a href="https://yunusyildiz.dev" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Website-000000?style=flat-square&logo=google-chrome&logoColor=white" alt="Website"/></a>
<a href="mailto:mail@yunusyildiz.dev"><img src="https://img.shields.io/badge/Email-D14836?style=flat-square&logo=gmail&logoColor=white" alt="Email"/></a>


<br/>

*Built with ☕ and ❤️*

<small><em>‹ March 2026 · Geneva, Switzerland ›</em></small>

</div>
