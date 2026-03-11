<div align="center">

<img src="https://rustacean.net/assets/rustacean-orig-noshadow.svg" width="100" alt="Ferris the Crab" />

# 📚 myMadBooks

**A curated collection of technical books built with [mdBook](https://rust-lang.github.io/mdBook/)**  
*Structured documentation · Learning roadmaps · Developer guides*

<br/>

[![mdBook](https://img.shields.io/badge/built%20with-mdBook-orange?style=flat-square&logo=rust)](https://rust-lang.github.io/mdBook/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)]()

</div>

---

## About

**myMadBooks** is a monorepo hosting multiple technical books and documentation projects. Each book is built with **mdBook** — a modern, fast tool that turns Markdown into beautiful, navigable documentation.

Whether you're learning Rust, exploring ecosystems, or building reference materials, this repo serves as a single home for structured, professional technical content.

---

## Books

| Book | Description |
|------|--------------|
| **[Rust Developer Guide](rust-guide-mdbook/)** | 🦀 Learning Rust from zero to systems engineer. Ecosystem reference, 35+ week roadmap, backend & systems focus. Following *The Rust Programming Language*. |

*More books coming soon.*

---

## Repository Structure

```
myMadBooks/
├── rust-guide-mdbook/     # Rust Developer Guide (mdBook project)
├── assets/                # Shared images and media
├── data/                  # Source content (LaTeX, drafts)
└── me/                    # Personal reference docs (mdBook guides)
```

---

## Quick Start

### Build & Serve a Book

```bash
# Navigate to a book
cd rust-guide-mdbook

# Install mdBook (once)
cargo install mdbook

# Serve locally with live reload
mdbook serve --open

# Or build for production
mdbook build
```

Output is generated in each book's `book/` directory — deploy to any static host (GitHub Pages, Netlify, etc.).

---

## Requirements

- [Rust](https://www.rust-lang.org/tools/install) (for `cargo install mdbook`)
- Or: [Pre-compiled mdBook binaries](https://github.com/rust-lang/mdBook/releases)

---

## Contributing

Feedback and contributions are welcome. Open an issue or submit a pull request.

---

<div align="center">

<img src="assets/images/yunusyildiz.png" width="90" height="90" alt="Yunus YILDIZ" style="border-radius: 50%;" />

### Yunus YILDIZ

*Always learning. Always building.*  
*Transforming ideas into digital experiences.*  
*Passionate about solving real-world challenges through technology.*

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white)](https://github.com/yunusyildiz-dev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/yunusyildiz-dev)
[![Mastodon](https://img.shields.io/badge/Mastodon-6364FF?style=flat-square&logo=mastodon&logoColor=white)](https://mastodon.social/@yunusyildiz_dev)
[![Bluesky](https://img.shields.io/badge/Bluesky-0085FF?style=flat-square&logo=bluesky&logoColor=white)](https://bsky.app/profile/yunusyildiz.ch)
[![Website](https://img.shields.io/badge/Website-000000?style=flat-square&logo=google-chrome&logoColor=white)](https://yunusyildiz.dev)
[![Email](https://img.shields.io/badge/Email-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:mail@yunusyildiz.dev)

<br/>

*Built with ☕ and ❤️*

<small><em>‹ March 2026 · Geneva, Switzerland ›</em></small>

</div>
