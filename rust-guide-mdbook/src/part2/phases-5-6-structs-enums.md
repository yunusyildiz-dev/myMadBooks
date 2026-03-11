# Phases 5–6: Structs, Enums & Pattern Matching

## Phase 5 — Structs & Methods (Week 5)

**Chapter 5: Using Structs**

### Day 16 — Defining Structs
- `struct Rectangle { width: u32, height: u32 }`
- Field update syntax: `..other`
- Tuple structs and unit-like structs
- `#[derive(Debug)]` with `{:?}` and `{#:?}`

### Day 17 — Method Syntax
- Methods inside `impl` blocks
- `&self`, `&mut self`, `self` parameters
- Associated functions: `Rectangle::new()` (constructor pattern)

### Day 18 — Practice
- Write `area()`, `perimeter()`, `can_hold()` methods
- **Task:** Write a `BankAccount` struct with `deposit`, `withdraw`, and `balance` methods

---

## Phase 6 — Enums & Pattern Matching (Week 6)

**Chapter 6: Enums and Pattern Matching**

### Day 19 — Enum Basics
- Attach data to variants: `Quit`, `Move { x: i32, y: i32 }`, `Write(String)`
- `Option<T>` — there is no null in Rust
- Using `Some(T)` and `None`

### Day 20 — match Expression
- Exhaustiveness requirement — all variants must be covered
- Binding: `Some(x) => println!("{x}")`
- `_` wildcard pattern and struct/tuple destructuring

### Day 21 — if let & let else
- `if let Some(x) = value { ... }` shorthand
- `let else` pattern (Rust 2024)
- `while let` loop
- **Task:** Write a `Shape` enum (Circle, Rectangle, Triangle) and calculate area
