# Arrow Functions & Fonksiyon Tipleri

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
Arrow function sözdizimi TypeScript ile, implicit return, fonksiyon tiplerini `type alias` ile adlandırma, higher-order functions (fonksiyon alan/döndüren fonksiyonlar) ve callback tip tanımlaması.

</div>

---

## 📖 Arrow Function Sözdizimi

Arrow function ve `function` keyword — ikisi de geçerli:

```typescript
// function keyword
function add(a: number, b: number): number {
    return a + b;
}

// Arrow function — değişkene atanır
const addArrow = (a: number, b: number): number => {
    return a + b;
};

// Implicit return — tek satır, {} ve return yok
const multiply  = (a: number, b: number): number => a * b;
const double    = (n: number): number => n * 2;
const isEven    = (n: number): boolean => n % 2 === 0;
const getLength = (s: string): number => s.length;

console.log(multiply(3, 4));  // → 12
console.log(double(7));       // → 14
console.log(isEven(8));       // → true
```

### Obje Döndürürken Parantez Gerekli

```typescript
// {} block mu, obje mi? TypeScript anlayamaz — parantez ile belirt
const toPoint = (x: number, y: number): { x: number; y: number } => ({
    x,
    y
});
// ↑ ({}) içine al — { x, y } obje olduğunu belirtir

const createUser = (name: string, age: number) => ({ name, age, createdAt: new Date() });
```

<div class="callout callout-tip">

**✅ function vs Arrow Function — Ne Zaman Hangisi?**

```typescript
// Arrow function — callback, kısa işlem
const doubled = numbers.map(n => n * 2);
const evens   = numbers.filter(n => n % 2 === 0);

// function keyword — React component, karmaşık fonksiyon, hoisting gerekiyorsa
function UserCard({ user }: UserCardProps) {
    return <div>{user.name}</div>;
}

// Arrow function — class method (this bağlamı için)
class UserService {
    private users: User[] = [];
    
    // Arrow: this her zaman class instance'ını gösterir
    getActiveUsers = (): User[] => {
        return this.users.filter(u => u.isActive);
    };
}
```

</div>

<hr class="section-divider">

## 📖 Fonksiyon Tipi Alias

Fonksiyon tipini `type` ile isimlendir — tekrar kullanılabilir ve okunabilir:

```typescript
// Fonksiyon tipi tanımı
type MathOperation = (a: number, b: number) => number;
type StringTransform = (text: string) => string;
type Predicate<T> = (item: T) => boolean;
type EventHandler = (event: MouseEvent) => void;

// Tanımlanan tipleri kullan
const subtract: MathOperation = (a, b) => a - b;
const toUpper: StringTransform = text => text.toUpperCase();
const isPositive: Predicate<number> = n => n > 0;

console.log(subtract(10, 3));    // → 7
console.log(toUpper("yunus"));   // → "YUNUS"
console.log(isPositive(5));      // → true
console.log(isPositive(-3));     // → false
```

<hr class="section-divider">

## 📖 Higher-Order Functions — Fonksiyon Alan/Döndüren

```typescript
// Fonksiyon alan fonksiyon (callback)
function applyOperation(
    a: number,
    b: number,
    operation: MathOperation
): number {
    return operation(a, b);
}

console.log(applyOperation(10, 5, subtract));          // → 5
console.log(applyOperation(10, 5, (a, b) => a * b));   // → 50
console.log(applyOperation(10, 5, (a, b) => a + b));   // → 15

// Fonksiyon döndüren fonksiyon
function multiplier(factor: number): (n: number) => number {
    return (n: number) => n * factor;
}

const triple = multiplier(3);
const half   = multiplier(0.5);

console.log(triple(10)); // → 30
console.log(half(20));   // → 10

// Array metodlarında callback tipi
function filterAndMap<T, U>(
    items: T[],
    predicate: (item: T) => boolean,
    transform: (item: T) => U
): U[] {
    return items.filter(predicate).map(transform);
}

const products = [
    { id: 1, name: "Laptop", price: 15999, inStock: true },
    { id: 2, name: "Mouse", price: 299, inStock: false },
    { id: 3, name: "Keyboard", price: 899, inStock: true }
];

const inStockNames = filterAndMap(
    products,
    p => p.inStock,        // predicate
    p => p.name            // transform
);
console.log(inStockNames); // → ["Laptop", "Keyboard"]
```

<hr class="section-divider">

## 📖 Callback Tipini Parametrede Tanımla

```typescript
// Callback parametresi — inline tip
function processItems(
    items: string[],
    onItem: (item: string, index: number) => void,
    onComplete: () => void
): void {
    items.forEach((item, i) => onItem(item, i));
    onComplete();
}

processItems(
    ["elma", "armut", "kiraz"],
    (item, i) => console.log(`${i + 1}. ${item}`),
    () => console.log("Tamamlandı!")
);

// Middleware pattern — Express gibi
type Request  = { path: string; method: string; body: unknown };
type Response = { status: (code: number) => Response; json: (data: unknown) => void };
type NextFn   = () => void;
type Middleware = (req: Request, res: Response, next: NextFn) => void;

const logger: Middleware = (req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
};

const authGuard: Middleware = (req, res, next) => {
    // auth kontrolü...
    next();
};
```

<hr class="section-divider">

## 🏭 Real-World Kullanım

<div class="callout callout-real-world">

**🏭 Event Handler Tipleri — React**

```typescript
import { ChangeEvent, MouseEvent, FormEvent, KeyboardEvent } from "react";

// Her event tipi ayrı
type InputChangeHandler   = (event: ChangeEvent<HTMLInputElement>) => void;
type ButtonClickHandler   = (event: MouseEvent<HTMLButtonElement>) => void;
type FormSubmitHandler    = (event: FormEvent<HTMLFormElement>) => void;
type KeyDownHandler       = (event: KeyboardEvent<HTMLInputElement>) => void;

// Kullanım
const handleChange: InputChangeHandler = (e) => {
    setValue(e.target.value); // e.target.value: string
};

const handleSubmit: FormSubmitHandler = (e) => {
    e.preventDefault();
    submitForm(formData);
};

const handleKeyDown: KeyDownHandler = (e) => {
    if (e.key === "Enter") handleSubmit(e as any);
    if (e.key === "Escape") clearInput();
};
```

</div>

<div class="callout callout-real-world">

**🏭 Utility Fonksiyon Tipleri**

```typescript
// Composable transformers
type Transformer<T> = (value: T) => T;

function compose<T>(...fns: Transformer<T>[]): Transformer<T> {
    return (value: T) => fns.reduceRight((acc, fn) => fn(acc), value);
}

function pipe<T>(...fns: Transformer<T>[]): Transformer<T> {
    return (value: T) => fns.reduce((acc, fn) => fn(acc), value);
}

const processName = pipe<string>(
    s => s.trim(),
    s => s.toLowerCase(),
    s => s.charAt(0).toUpperCase() + s.slice(1)
);

console.log(processName("  yUnUs YiLdiZ  ")); // → "Yunus yildiz"

// Retry decorator pattern
type AsyncFn<T> = (...args: unknown[]) => Promise<T>;

function withRetry<T>(fn: AsyncFn<T>, maxRetries: number = 3): AsyncFn<T> {
    return async (...args: unknown[]): Promise<T> => {
        let lastError: Error;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn(...args);
            } catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err));
                console.warn(`Deneme ${i + 1} başarısız: ${lastError.message}`);
            }
        }
        throw lastError!;
    };
}
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Arrow Function & Fonksiyon Tipi Best Practices:**
- Tekrar kullanılacak callback tipi → `type` alias ile isimlendir
- Tek satır arrow function → implicit return kullan
- React component → `function` keyword (debugging için daha iyi)
- Class method → arrow function (this bağlamı)
- Callback'e `any` yazma — tipi tanımla veya generic kullan

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Obje döndürürken {} kullanmak — block olarak algılanır
const getPoint = (x: number, y: number) => { x, y }; // ❌ {} = block!
// ✅ Parantez ile:
const getPoint2 = (x: number, y: number) => ({ x, y });

// ❌ Callback'e any verme
array.forEach((item: any) => { ... });
// ✅ Doğru tip ver:
array.forEach((item: Product) => { ... });

// ❌ Gereksiz karmaşık fonksiyon tipi
type WeirdFn = ((a: string) => ((b: number) => ((c: boolean) => string)));
// Bunu böl ve basitleştir
```

</div>

<hr class="section-divider">

## 📋 Özet

| Kavram | Syntax | Kullanım |
|--------|--------|----------|
| Arrow function | `(a: T) => expr` | Kısa, callback |
| Implicit return | `=> value` | Tek satır |
| Fonksiyon tipi | `type Fn = (a: T) => U` | Tekrar kullanım |
| Callback parametresi | `(fn: Fn) => void` | Higher-order |
| Currying | `(a: T) => (b: U) => V` | Partial application |
