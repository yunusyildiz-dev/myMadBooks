# Language Fundamentals

This chapter introduces core language concepts. For extended definitions (Lifetimes, Generics, Smart Pointers, Error Handling, Send/Sync), see the [Appendix](../appendix/extended-reference.md).

---

> **Ownership — Memory Management**
> Rust's unique memory management system. Every value has exactly one "owner". When the owner goes out of scope, the value is automatically freed. No garbage collector needed.

*Node.js equivalent: JavaScript has a garbage collector. In Rust, you (with the compiler's help) manage memory explicitly at compile time.*

---

> **Borrowing — Temporary References**
> Instead of transferring ownership, you can temporarily lend a value using references (`&T`). The original owner keeps the value; the borrower gets read access.

*Node.js equivalent: Passing an object by reference in JavaScript — the original isn't copied, just referenced.*

---

> **Trait — Shared Interface**
> A shared interface that defines behavior. Types implement traits to promise they support certain methods.

*Node.js equivalent: A TypeScript `interface` — defines a contract that a class/object must fulfill.*

```rust
trait Greet {
    fn hello(&self) -> String;
}

impl Greet for User {
    fn hello(&self) -> String {
        format!("Hello, {}!", self.name)
    }
}
```

---

> **Macro — Compile-Time Code Generation**
> Code that writes code, identified by a `!` suffix. Macros expand at compile time to generate repetitive or complex code.

*Node.js equivalent: Similar in concept to Babel plugins or code generation tools.*

```rust
println!("Hello, {}!", name);  // This is a macro, not a function
```

---

> **rust-analyzer — Language Server**
> A language server powering IDE features: auto-complete, inline error highlighting, go-to-definition, refactoring, and more.

*Node.js equivalent: The TypeScript language server built into VS Code — IntelliSense, error highlighting, etc.*
