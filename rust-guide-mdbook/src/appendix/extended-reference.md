# B. Extended Term Reference

Compact definitions for terms referenced in the Roadmap but not covered in Part I.

---

## Lifetimes

Compiler annotations that ensure references do not outlive their data.

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

---

## Generics

Type parameters for reusable, zero-cost abstraction.

```rust
fn identity<T>(value: T) -> T {
    value
}
```

---

## Smart Pointers

| Type        | Purpose                          |
|-------------|----------------------------------|
| `Box<T>`    | Heap allocation, recursive types  |
| `Rc<T>`     | Shared ownership (single-thread) |
| `Arc<T>`    | Shared ownership (thread-safe)    |
| `RefCell<T>`| Interior mutability at runtime    |

---

## Error Handling

**`Result<T, E>`** — Success or failure. Use `Ok(T)` and `Err(E)`.

**`Option<T>`** — Optional value. Use `Some(T)` or `None`.

Rust uses these instead of exceptions.

---

## Send and Sync

Marker traits for concurrency:

- **Send** — Safe to transfer across threads
- **Sync** — Safe to share between threads via reference

---

## Async & Concurrency

- **Threads** — `std::thread::spawn()`
- **Channels** — `mpsc::channel()` for message passing
- **Mutex + Arc** — `Arc<Mutex<T>>` for shared state
- **Async/await** — Via `tokio` or other runtimes

---

## Developer Tools

- **rust-analyzer** — IDE language server (autocomplete, errors, refactoring)
- **rustup doc --book** — Open The Rust Book offline
- **rustc --explain E0XXX** — Detailed error code explanations
