# Generic Fonksiyonlar

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
Generic fonksiyon syntax'ı, pratik örnekler (first, reverse, swap), API fetch wrapper ve TypeScript'in T'yi nasıl çıkardığı.

</div>

---

## 📖 Generic Fonksiyon Syntax'ı

```typescript
// Syntax: function ismi<T>(parametre: T): T { ... }
function identity<T>(value: T): T {
    return value;
}

// Arrow function versiyonu
const identityArrow = <T>(value: T): T => value;
```

<hr class="section-divider">

## 📖 Dizi Yardımcı Fonksiyonları

Generic'in en doğal kullanımı dizi fonksiyonlarıdır:

```typescript
// İlk elemanı döndür — undefined olabilir (boş dizi)
function first<T>(arr: T[]): T | undefined {
    return arr[0];
}

const firstNum = first([1, 2, 3]);         // number | undefined
const firstStr = first(["a", "b", "c"]);   // string | undefined
const firstUser = first([{ id: 1 }, { id: 2 }]); // { id: number } | undefined

// Son elemanı döndür
function last<T>(arr: T[]): T | undefined {
    return arr[arr.length - 1];
}

// Diziyi ters çevir (orijinali değiştirme)
function reverse<T>(arr: T[]): T[] {
    return [...arr].reverse();
}

console.log(reverse([1, 2, 3]));          // → [3, 2, 1]
console.log(reverse(["a", "b", "c"]));   // → ["c", "b", "a"]

// Diziyi chunk'lara böl
function chunk<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

console.log(chunk([1,2,3,4,5,6], 2)); // → [[1,2],[3,4],[5,6]]

// Tekil olarak döndür (duplicate'ları kaldır) — primitive için
function unique<T>(arr: T[]): T[] {
    return [...new Set(arr)];
}

console.log(unique([1, 2, 2, 3, 3, 3])); // → [1, 2, 3]
```

<hr class="section-divider">

## 📖 İki Generic Parametre

```typescript
// İki değeri swap et
function swap<T, U>(a: T, b: U): [U, T] {
    return [b, a];
}

const [num, str] = swap("Yunus", 25); // [number, string]
console.log(num, str); // → 25, "Yunus"

// T'yi U'ya dönüştür — transform
function transform<T, U>(value: T, fn: (input: T) => U): U {
    return fn(value);
}

const length = transform("Yunus", s => s.length);     // number
const doubled = transform(21, n => n * 2);             // number
const parsed  = transform("42", s => parseInt(s, 10)); // number
const asStr   = transform(42, n => String(n));         // string

// Dizi dönüşümü
function mapArray<T, U>(arr: T[], fn: (item: T) => U): U[] {
    return arr.map(fn);
}

const users = [
    { id: 1, name: "Yunus", email: "y@mail.com" },
    { id: 2, name: "Ahmet", email: "a@mail.com" }
];

const names  = mapArray(users, u => u.name);  // string[]
const ids    = mapArray(users, u => u.id);    // number[]
const emails = mapArray(users, u => u.email); // string[]
```

<hr class="section-divider">

## 📖 API Fetch Wrapper

En önemli real-world generic pattern:

```typescript
interface ApiResponse<T> {
    data: T;
    success: boolean;
    message: string;
    timestamp: string;
}

interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
}

// Generic GET
async function apiGet<T>(endpoint: string): Promise<T> {
    const res = await fetch(`/api${endpoint}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${endpoint}`);
    const json: ApiResponse<T> = await res.json();
    return json.data;
}

// Generic POST
async function apiPost<TBody, TResponse>(
    endpoint: string,
    body: TBody
): Promise<TResponse> {
    const res = await fetch(`/api${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: ApiResponse<TResponse> = await res.json();
    return json.data;
}

// Generic paginated liste
async function apiList<T>(
    endpoint: string,
    page: number = 1,
    limit: number = 10
): Promise<PaginatedResponse<T>> {
    const res = await fetch(`/api${endpoint}?page=${page}&limit=${limit}`);
    return res.json();
}

// Kullanım — her tip için çalışır
interface User    { id: number; name: string; email: string; }
interface Product { id: number; name: string; price: number; }

const user    = await apiGet<User>("/users/1");         // User
const product = await apiGet<Product>("/products/5");   // Product
const userList = await apiList<User>("/users", 1, 20);  // PaginatedResponse<User>

console.log(user.email);      // ✅ User field
console.log(product.price);   // ✅ Product field
console.log(userList.hasNextPage); // ✅
```

<hr class="section-divider">

## 🏭 Real-World: Generic Cache & Store

<div class="callout callout-real-world">

**🏭 Generic Cache Sistemi**

```typescript
class Cache<T> {
    private store = new Map<string, { data: T; expiresAt: number }>();

    set(key: string, data: T, ttlMs: number = 60_000): void {
        this.store.set(key, {
            data,
            expiresAt: Date.now() + ttlMs
        });
    }

    get(key: string): T | null {
        const entry = this.store.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.data;
    }

    invalidate(key: string): void {
        this.store.delete(key);
    }

    clear(): void {
        this.store.clear();
    }
}

// Her tip için ayrı cache instance
const userCache    = new Cache<User>();
const productCache = new Cache<Product>();

userCache.set("user:1", { id: 1, name: "Yunus", email: "y@m.com" }, 30_000);
const cachedUser = userCache.get("user:1"); // User | null
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Generic Fonksiyon Best Practices:**
- Array yardımcıları için her zaman generic kullan — `first<T>`, `chunk<T>`
- API wrapper'ları generic yap — her endpoint farklı tip döndürür
- Type inference'a güven — explicit `<T>` yazmak zorunda değilsin
- Çok sayıda generic parametre (4+) varsa tasarımı gözden geçir

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Generic içinde any kullanmak — amacı boşa çıkar
function identity<T>(value: T): any { // any return — generic anlamsız
    return value;
}

// ❌ Generic olmadan dizi yardımcısı
function firstNumber(arr: number[]): number | undefined { return arr[0]; }
function firstString(arr: string[]): string | undefined { return arr[0]; }
// ✅ Generic:
function first<T>(arr: T[]): T | undefined { return arr[0]; }
```

</div>

<hr class="section-divider">

## 📋 Özet

| Pattern | Syntax | Kullanım |
|---------|--------|----------|
| Tek generic | `<T>(x: T): T` | identity, first, last |
| Dizi generic | `<T>(arr: T[]): T[]` | reverse, chunk, unique |
| Transform | `<T, U>(x: T, fn: T→U): U` | map, transform |
| API wrapper | `apiGet<T>(url): Promise<T>` | Tüm fetch işlemleri |
| Generic class | `class Cache<T>` | Store, repository |
