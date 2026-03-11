# Phases 1–3: Foundations

## Phase 1 — Environment Setup (Week 1)

**Chapter 1: Getting Started**

### Day 1 — Installation
- Install Rust via `rustup` (stable channel)
- Get familiar with `rustc`, `cargo`, `rustfmt`, `clippy`
- Open the offline book: `rustup doc --book`
- Set up IDE: VSCode + `rust-analyzer` extension

### Day 2 — Hello World & Cargo
- Compile manually with `rustc main.rs`
- Create a project: `cargo new hello_world`
- Learn `cargo build`, `cargo run`, `cargo check`
- Explore `Cargo.toml`
- Build optimized binary: `cargo build --release`

### Day 3 — Practice & Consolidation
- Write 3 small programs (take arguments, write to file, read env variables)
- Generate docs: `cargo doc --open`
- Browse [crates.io](https://crates.io) and explore the ecosystem

---

## Phase 2 — First Project: Guessing Game (Week 2)

**Chapter 2: Programming a Guessing Game**

### Day 4 — Basic Structure
- Use `let mut`, `String::new()`, `io::stdin().read_line()`
- Import: `use std::io`
- Understand the `println!` macro and format strings

### Day 5 — Using External Crates
- Add the `rand` crate to `Cargo.toml`
- Use `rand::thread_rng().gen_range(1..=100)`
- Understand `cargo update` and semantic versioning

### Day 6 — match & Loops
- Compare with `Ordering` using `match` expressions
- Use `loop`, `break`, `continue`
- Convert types: `guess.trim().parse()`
- Study the `Ok(num) => num, Err(_) => continue` pattern

### Day 7 — Complete & Analyze
- Finish and run the full guessing game
- **Task:** Add an attempt counter — how many guesses did it take?

---

## Phase 3 — Common Programming Concepts (Week 3)

**Chapter 3: Common Programming Concepts**

### Day 8 — Variables & Mutability
- `let` vs `let mut` — immutability is the default
- **Shadowing:** `let x = x + 1;`
- Difference between `const` and `static`

### Day 9 — Data Types
- Scalar: `i8..i128`, `u8..u128`, `f32`, `f64`, `bool`, `char`
- Integer overflow in `--release` mode
- Compound: tuple `(i32, f64, u8)` and array `[3; 5]`
- Difference between array and slice

### Day 10 — Functions
- Function definition, parameters, return types
- **Statement vs Expression** — critical Rust-specific concept
- Returning values without `return` on the last line

### Day 11 — Control Flow
- `if` / `else if` / `else` used as expressions: `let x = if cond { 5 } else { 6 };`
- `loop`, `while`, `for` loops
- `for x in (1..4).rev()`
- **Task:** Write FizzBuzz, Fibonacci, and a temperature converter
