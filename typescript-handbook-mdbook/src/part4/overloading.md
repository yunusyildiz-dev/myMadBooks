# Function Overloading

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
TypeScript'te function overloading — aynı fonksiyonun farklı parametre kombinasyonlarına göre farklı davranması. Ne zaman kullanılır, ne zaman generic daha iyi bir çözümdür.

</div>

---

## 📖 Function Overloading Nedir?

Overloading, aynı fonksiyon isminin farklı tip kombinasyonlarıyla çağrılabilmesidir. TypeScript'te iki aşamada yazılır:

1. **Overload signatures** — kontrat tanımı (sadece tip, implementasyon yok)
2. **Implementation signature** — gerçek kodu (union tipler ile)

```typescript
// Aşama 1: Overload signatures — "ne alıp ne döndüreceğini" tanımla
function format(value: string): string;
function format(value: number): string;
function format(value: boolean): string;

// Aşama 2: Implementation — gerçek kodu yaz
function format(value: string | number | boolean): string {
    if (typeof value === "string") return value.trim();
    if (typeof value === "number") return value.toFixed(2);
    return value ? "Evet" : "Hayır";
}

// Kullanım — her overload signature ayrı kontrat
console.log(format("  Merhaba  ")); // → "Merhaba"
console.log(format(3.14159));       // → "3.14"
console.log(format(true));          // → "Evet"
```

<div class="callout callout-warning">

**⚠️ Implementation Signature Dışarıya Açık Değildir**

Dışarıdan sadece overload signature'ları görülür, implementation signature görünmez:

```typescript
format("test");                        // ✅ overload 1
format(42);                            // ✅ overload 2
format(true);                          // ✅ overload 3
format("test" as string | number);     // ❌ hata — bu imza dışarıya açık değil
```

</div>

<hr class="section-divider">

## 📖 Farklı Parametreye Göre Farklı Return

En güçlü overload kullanımı: giriş tipine göre farklı çıkış tipi:

```typescript
// string gelince number döner, number gelince string döner
function parse(value: string): number;
function parse(value: number): string;
function parse(value: string | number): string | number {
    if (typeof value === "string") return parseInt(value, 10);
    return value.toString();
}

const parsed1 = parse("42");  // number — TypeScript bilir
const parsed2 = parse(42);    // string — TypeScript bilir

console.log(parsed1 + 8);      // → 50 (number işlemi)
console.log(parsed2 + "!");    // → "42!" (string işlemi)
```

### Strict Mode ile getElementById

```typescript
// strict parametresine göre null olabilir ya da olmaz
function getElementById(id: string): HTMLElement | null;
function getElementById(id: string, strict: true): HTMLElement;
function getElementById(id: string, strict?: boolean): HTMLElement | null {
    const el = document.getElementById(id);
    if (!el && strict) {
        throw new Error(`Element bulunamadı: #${id}`);
    }
    return el;
}

const maybeEl = getElementById("header");       // HTMLElement | null
const definiteEl = getElementById("header", true); // HTMLElement — null değil

// definiteEl.textContent = "Merhaba"; // ✅ güvenli — null kontrolü gerekmez
// maybeEl.textContent = "...";         // ❌ hata — null olabilir
```

<hr class="section-divider">

## 📖 Array Boyutuna Göre Overload

```typescript
// 1 argüman → tek değer, 2 argüman → tuple döner
function getMinMax(numbers: number[]): number;
function getMinMax(numbers: number[], returnBoth: true): [min: number, max: number];
function getMinMax(numbers: number[], returnBoth?: boolean): number | [number, number] {
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    if (returnBoth) return [min, max];
    return min;
}

const min = getMinMax([3, 1, 7, 2]);           // number
const range = getMinMax([3, 1, 7, 2], true);   // [number, number]

console.log(min);    // → 1
const [lo, hi] = range;
console.log(lo, hi); // → 1, 7
```

<hr class="section-divider">

## 📖 Overload vs Generic — Ne Seçmeli?

Overloading her zaman doğru çözüm değildir. Generic çoğu zaman daha temiz:

```typescript
// Overloading ile — her tip için ayrı imza
function wrapInArray(value: string): string[];
function wrapInArray(value: number): number[];
function wrapInArray(value: boolean): boolean[];
function wrapInArray(value: string | number | boolean): (string | number | boolean)[] {
    return [value];
}

// Generic ile — tek imza, her tip için çalışır
function wrapInArray<T>(value: T): T[] {
    return [value];
}

// Generic çok daha temiz — aynı sonucu daha az kodla verir
const arr1 = wrapInArray("Yunus");  // string[]
const arr2 = wrapInArray(42);       // number[]
const arr3 = wrapInArray(true);     // boolean[]
```

**Overload ne zaman generic'ten üstün?**

Giriş tipi → çıkış tipi dönüşümü farklıysa:

```typescript
// Generic yapamaz bunu — T gelince U dönecek
function process(value: string): number;
function process(value: number): string;
function process(value: string | number): string | number {
    if (typeof value === "string") return value.length; // string → number
    return value.toFixed(2);                           // number → string
}

// Generic ile denersen:
function process<T>(value: T): T extends string ? number : string {
    // Conditional type — çok karmaşık, genellikle overload daha temiz
}
```

<hr class="section-divider">

## 🏭 Real-World Kullanım

<div class="callout callout-real-world">

**🏭 Veritabanı Sorgu Fonksiyonu**

```typescript
interface User { id: number; name: string; email: string; }
interface Product { id: number; name: string; price: number; }

// Farklı entity tiplerine göre farklı sonuç
function findOne(table: "users", id: number): Promise<User | null>;
function findOne(table: "products", id: number): Promise<Product | null>;
function findOne(
    table: "users" | "products",
    id: number
): Promise<User | Product | null> {
    // gerçek DB sorgusu
    return fetch(`/api/${table}/${id}`).then(r => r.ok ? r.json() : null);
}

// Tip güvenceli kullanım
const user = await findOne("users", 1);       // User | null
const product = await findOne("products", 5); // Product | null

if (user) {
    console.log(user.email);   // ✅ User field'ı
}
if (product) {
    console.log(product.price); // ✅ Product field'ı
}
```

</div>

<div class="callout callout-real-world">

**🏭 Event Listener Pattern**

```typescript
// jQuery-benzeri event sistemi
interface EventMap {
    "click": MouseEvent;
    "keydown": KeyboardEvent;
    "input": InputEvent;
    "focus": FocusEvent;
}

function on<K extends keyof EventMap>(
    event: K,
    handler: (e: EventMap[K]) => void
): void;
function on(event: string, handler: (e: Event) => void): void;
function on(event: string, handler: (e: Event) => void): void {
    document.addEventListener(event, handler);
}

// Tip güvenceli event handler
on("click", e => {
    console.log(e.clientX, e.clientY); // MouseEvent özellikleri ✅
});

on("keydown", e => {
    console.log(e.key); // KeyboardEvent özellikleri ✅
});
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Overloading Best Practices:**
- "Giriş tipi X → çıkış tipi Y" farklıysa overload kullan
- Aynı giriş → aynı çıkış ise generic kullan
- Overload sayısını minimumda tut — 4'ten fazlası kafa karıştırır
- Implementation signature'ı dışarıya açmak için overload kullanma
- Her overload signature'ı açıklayıcı yorum ile belge

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Gereksiz overload — generic daha temiz
function identity(value: string): string;
function identity(value: number): number;
function identity(value: string | number): string | number { return value; }
// ✅ Generic:
function identity<T>(value: T): T { return value; }

// ❌ Implementation signature'ı export etme
export function process(value: string | number): string | number { ... }
// Caller bu geniş tipi görür — overload imzaları ekle

// ❌ Çok fazla overload — bakımı zorlaşır
function fn(a: string): string;
function fn(a: number): number;
function fn(a: boolean): boolean;
function fn(a: null): null;
function fn(a: undefined): undefined;
// 5+ overload varsa tasarımı gözden geçir
```

</div>

<hr class="section-divider">

## 📋 Özet

| Durum | Çözüm |
|-------|-------|
| Giriş tipi = Çıkış tipi (T → T) | Generic kullan |
| Giriş tipi → farklı çıkış tipi | Overloading kullan |
| İsteğe bağlı parametre → farklı sonuç | Overloading kullan |
| Aynı davranış, farklı tip | Generic kullan |

**Overload syntax:**
```typescript
function fn(a: string): string;   // imza 1
function fn(a: number): number;   // imza 2
function fn(a: string | number): string | number { ... } // implementasyon
```
