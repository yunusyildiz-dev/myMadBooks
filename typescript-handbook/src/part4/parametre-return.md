# Parametre & Return Tipleri

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
Fonksiyon parametrelerine ve return değerine nasıl tip verilir. Fonksiyon "kontratı" nedir, neden önemlidir. Explicit ve inferred return tipler arasındaki fark.

</div>

---

## 📖 Fonksiyon Kontratı

TypeScript'te bir fonksiyon, **ne aldığını ve ne döndürdüğünü** tip sistemi aracılığıyla belgeler. Bu belgeleme, hem hataları önler hem de fonksiyonu okuyan kişiye (veya 3 ay sonraki sana) anında bilgi verir.

```typescript
// JavaScript — kontrat yok
function add(a, b) { return a + b; }
add("5", 3); // "53" — string + number birleşimi, hata yok!

// TypeScript — kontrat var
function add(a: number, b: number): number {
    return a + b;
}
// add("5", 3); // ❌ Compile hatası — "5" number değil
add(5, 3);     // ✅ 8
```

<hr class="section-divider">

## 📖 Parametre Tipleri

Her parametreye tip yazmak **zorunludur** — TypeScript fonksiyon parametrelerini çıkaramaz:

```typescript
// Temel parametre tipleri
function greet(name: string): string {
    return `Merhaba, ${name}!`;
}

function multiply(a: number, b: number): number {
    return a * b;
}

function isEven(n: number): boolean {
    return n % 2 === 0;
}

// Obje parametresi
function createProfile(data: { name: string; age: number; bio?: string }): void {
    console.log(`${data.name} (${data.age}): ${data.bio ?? "Bio yok"}`);
}

// Array parametresi
function sumAll(numbers: number[]): number {
    return numbers.reduce((acc, n) => acc + n, 0);
}

// Önceden tanımlı interface
interface User {
    id: number;
    name: string;
    email: string;
}

function formatUser(user: User): string {
    return `[${user.id}] ${user.name} <${user.email}>`;
}
```

<hr class="section-divider">

## 📖 Return Tipi

Fonksiyonun döndürdüğü değerin tipi:

```typescript
// Açık return tipi — explicit
function divide(a: number, b: number): number | string {
    if (b === 0) return "Sıfıra bölme hatası"; // string
    return a / b;                               // number
}

// Inference — TypeScript return tipini çıkarır
function square(n: number) {
    return n * n; // TypeScript: number döner
}

// Async fonksiyon — her zaman Promise<T> döner
async function fetchUser(id: number): Promise<User> {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
}
```

### Explicit vs Inferred Return Tipi

```typescript
// ✅ Inference yeterli — kısa fonksiyon, return açık
const double = (n: number) => n * 2;
const greetUser = (name: string) => `Merhaba ${name}`;

// ✅ Explicit tercih edilir — public API, karmaşık fonksiyon
function getOrderTotal(items: OrderItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

// ✅ Explicit şart — birden fazla return path
function parseId(value: string | number): number | null {
    if (typeof value === "string") {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? null : parsed;
    }
    return value;
}
```

<div class="callout callout-tip">

**✅ Ne Zaman Explicit Return Tipi Yaz?**
- Public API fonksiyonlarında — başkası çağıracak
- Birden fazla return path olan fonksiyonlarda
- Async fonksiyonlarda — `Promise<T>` her zaman yaz
- Fonksiyon uzunsa / karmaşıksa — okunabilirlik için

</div>

<hr class="section-divider">

## 📖 Union Return Tipi

Fonksiyon farklı durumlarda farklı tipte değer döndürebilir:

```typescript
function findUser(id: number): User | null {
    // bulunamazsa null döner
    return users.find(u => u.id === id) ?? null;
}

function processInput(input: unknown): string | number | boolean {
    if (typeof input === "string") return input.trim();
    if (typeof input === "number") return input * 2;
    if (typeof input === "boolean") return !input;
    return String(input);
}

// Caller'da union kontrolü
const result = processInput("  merhaba  ");
if (typeof result === "string") {
    console.log(result.toUpperCase()); // ✅ güvenli
}
```

<hr class="section-divider">

## 🏭 Real-World: Eksiksiz Fonksiyon Kontratları

<div class="callout callout-real-world">

**🏭 E-ticaret Servis Fonksiyonları**

```typescript
interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    category: string;
}

interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    hasNextPage: boolean;
}

interface SearchFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
}

// Her fonksiyon tam kontrat belirtir
async function getProducts(
    page: number,
    limit: number,
    filters?: SearchFilters
): Promise<PaginatedResult<Product>> {
    // implementasyon...
    return { data: [], total: 0, page, hasNextPage: false };
}

async function getProductById(id: number): Promise<Product | null> {
    return products.find(p => p.id === id) ?? null;
}

async function createProduct(
    data: Omit<Product, "id">
): Promise<Product> {
    const newProduct = { id: Date.now(), ...data };
    products.push(newProduct);
    return newProduct;
}

function calculateDiscount(
    price: number,
    discountPercent: number
): { originalPrice: number; discountedPrice: number; savings: number } {
    const savings = price * (discountPercent / 100);
    return {
        originalPrice: price,
        discountedPrice: price - savings,
        savings
    };
}
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Fonksiyon Tipi Best Practices:**
- Her parametre tipini yaz — TypeScript çıkaramaz
- Public API fonksiyonlarda return tipini explicit yaz
- Kısa, tek satır arrow function'larda inference yeterli
- `any` parametresi yerine generic kullan: `function fn<T>(value: T): T`
- Callback parametrelerini tiplendir: `onClick: (id: number) => void`

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Parametresiz tip — any gibi davranır
function process(data): void { ... }
// ✅ Her parametreye tip ver
function process(data: User): void { ... }

// ❌ Gereksiz return tipi tekrarı — inference yeterken
const add = (a: number, b: number): number => a + b;
// ✅ Kısa fonksiyonda inference yeterli:
const add2 = (a: number, b: number) => a + b;

// ❌ Çok fazla parametre — options objesine geç
function createOrder(userId, productId, qty, address, paymentMethod, coupon) { ... }
// ✅ Options pattern:
function createOrder(options: CreateOrderOptions): Promise<Order> { ... }
```

</div>

<hr class="section-divider">

## 📋 Özet

| Konu | Syntax | Açıklama |
|------|--------|----------|
| Parametre tipi | `(a: number)` | Her parametre için zorunlu |
| Return tipi | `(): string` | Explicit tercih edilir |
| Void | `(): void` | Değer döndürmeyen |
| Nullable return | `(): User \| null` | Bulunamayabilir |
| Promise | `(): Promise<T>` | Async fonksiyon |
| Union return | `(): string \| number` | Birden fazla tip |
