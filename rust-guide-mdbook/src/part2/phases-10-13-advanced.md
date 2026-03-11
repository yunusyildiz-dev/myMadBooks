# Phases 10–13: Advanced & Concurrent Programming

## Phase 10 — Project: minigrep CLI Tool (Week 13)

**Chapter 12: An I/O Project**

### Days 40–43 — Build minigrep
- Get command line arguments: `std::env::args()`
- Read a file: `fs::read_to_string()`
- Write to stderr: `eprintln!`
- Organize arguments with a `Config` struct
- Separation of `lib.rs` and `main.rs`
- TDD: write tests first for `search()` functions
- Using lifetimes: `Vec<&'a str>`
- `IGNORE_CASE` environment variable
- **Task:** Add a `--count` flag and multi-file search

---

## Phase 11 — Closures, Iterators & Cargo (Weeks 14–15)

**Chapter 13: Functional Language Features**

### Day 44 — Closures
- Closure syntax: `|x| x + 1`
- `Fn`, `FnMut`, `FnOnce` traits
- `move` closure and ownership

### Day 45 — Iterators
- `Iterator` trait and `next()` — lazy evaluation
- `map`, `filter`, `collect`, `sum`, `count`
- Chaining: `.filter().map().collect()`
- Custom iterator: `impl Iterator for MyStruct`
- **Task:** Process numbers using filter + map chains

---

## Phase 12 — Smart Pointers (Weeks 16–17)

**Chapter 15: Smart Pointers**

### Days 49–51 — Box, Rc, RefCell, Weak
- `Box<T>`: heap allocation, recursive types, `Deref` trait
- `Rc<T>`: Reference Counted multiple ownership
- `RefCell<T>`: interior mutability, runtime borrow checking
- `Rc<RefCell<T>>` combined pattern
- `Weak<T>`: preventing reference cycles
- **Task:** Create a reference cycle and fix it with `Weak`

---

## Phase 13 — Fearless Concurrency (Weeks 18–21)

**Chapters 16–17: Concurrency & Async/Await**

### Day 52 — Threads
- `thread::spawn()` and `JoinHandle`
- Transferring ownership with `move` closure

### Day 53 — Message Passing
- `mpsc::channel()` — multiple producer, single consumer
- `tx.send()` and `rx.recv()`
- Multiple producers with `tx.clone()`

### Day 54 — Shared State
- `Mutex<T>` and `lock().unwrap()`
- `Arc<T>` for thread-safe shared ownership
- `Arc<Mutex<T>>` — the most common pattern
- **Task:** N threads incrementing a shared counter

### Days 55–58 — Async/Await
- `async fn` and the `Future` trait
- `.await` and `tokio` runtime
- `tokio::spawn()` — spawning async tasks
- `Stream` trait — async iterator
- **Task:** Async file reading and basic HTTP request
