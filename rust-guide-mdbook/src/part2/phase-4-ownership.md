# Phase 4 — Ownership: The Heart of Rust

> This is the most critical section that sets Rust apart from every other language. **Do not rush.**

**Chapter 4: Understanding Ownership**

### Day 12 — Ownership Rules
- Understand Stack vs Heap
- The 3 ownership rules:
  1. Every value has a single owner
  2. There can only be one owner at a time
  3. When the owner goes out of scope, the value is dropped
- `String` vs `&str`, `clone()` and `move` semantics

### Day 13 — Move & Clone
- Primitive types: Copy trait, copied on the stack
- `String`: lives on the heap, uses move semantics
- `let s2 = s1;` — s1 is no longer valid
- `let s2 = s1.clone();` — deep copy

### Day 14 — References & Borrowing
- `&T` — immutable reference
- `&mut T` — mutable reference
- Rule: Either 1 mutable reference OR N immutable references at a time
- Why does the compiler reject dangling references?

### Day 15 — Slices
- String slice: `&s[0..5]`, `&str`
- Array slice: `&[i32]`
- **Task:** Return words from a string using slices
- **Task:** Intentionally cause ownership errors, read compiler messages carefully
