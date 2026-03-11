# Phases 7–9: Modules, Collections, Errors & Tests

## Phase 7 — Modules, Collections & Error Handling (Weeks 7–8)

**Chapter 7: Managing Growing Projects**

### Days 22–23 — Module System
- Package, crate, module hierarchy
- `src/main.rs` vs `src/lib.rs`
- `mod`, `pub`, `use`
- `super::` and `crate::` paths
- **Task:** Write a small calculator library and use it from `main.rs`

---

**Chapter 8: Common Collections**

### Days 25–27 — Vec, String, HashMap
- `Vec<T>`: `Vec::new()`, `vec![]`, `push`, `pop`, `get`
- `String` vs `&str` — deep UTF-8 understanding
- `HashMap<K, V>`: `insert`, `get`, `entry().or_insert()`
- **Task:** Write a text analysis program that counts word frequencies

---

**Chapter 9: Error Handling**

### Days 28–29 — Result & Panic
- `Result<T, E>`: `Ok(T)` and `Err(E)`
- `unwrap()`, `expect()`, and the `?` operator
- `panic!` macro and `RUST_BACKTRACE=1`
- Library vs application: when to panic, when to return Result?
- **Task:** Write a file reading function and handle errors with `?`

---

## Phase 8 — Generics, Traits & Lifetimes (Weeks 9–11)

> **This is the power engine of Rust. Allocate 3 weeks, do not rush.**

**Chapter 10: Generic Types, Traits, and Lifetimes**

### Days 30–31 — Generics
- `fn largest<T>(list: &[T]) -> &T`
- Generics in structs: `struct Point<T>`
- Monomorphization — zero-cost abstraction

### Days 32–34 — Traits
- `pub trait Summary { fn summarize(&self) -> String; }`
- Default implementations
- Trait bounds: `fn notify(item: &impl Summary)`
- Multiple bounds: `T: Summary + Display`, `where` clause
- Return position trait: `-> impl Summary`
- **Task:** Write a `Drawable` trait for multiple shape structs

### Days 35–37 — Lifetimes
- The dangling reference problem
- Annotation syntax: `'a`
- `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str`
- Lifetime elision rules (the three rules)
- `'static` lifetime
- **Task:** Intentionally cause lifetime errors and understand messages

---

## Phase 9 — Writing Tests (Week 12)

**Chapter 11: Writing Automated Tests**

### Days 38–39 — Unit & Integration Tests
- `#[cfg(test)]`, `#[test]`, `#[ignore]`
- `assert!`, `assert_eq!`, `assert_ne!`
- Testing for errors with `should_panic`
- Integration tests in the `tests/` directory
- Filtering: `cargo test <name>`
- **Task:** Write unit and integration tests for the HashMap program
