# Generic Nedir?

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
Generic'in ne sorunu çözdüğü, `any`'den neden daha iyi olduğu ve `<T>` notasyonunun ne anlama geldiği. Generic'i anlamak TypeScript'in en güçlü özelliklerinden birine kapı açar.

</div>

---

## 📖 Problem: Tekrar Etmek ya da Güvensiz Olmak

Bir fonksiyon düşün: "verilen değeri olduğu gibi döndür." Basit. Ama birden fazla tip için yazmak zorunda kalırsın:

```typescript
// ❌ Her tip için ayrı fonksiyon yazmak — DRY ihlali
function returnString(value: string): string   { return value; }
function returnNumber(value: number): number   { return value; }
function returnBoolean(value: boolean): boolean { return value; }

// ❌ any ile — DRY sağlandı ama tip güvencesi yok
function returnAny(value: any): any { return value; }
const result = returnAny("Yunus"); // result: any — string olduğunu TypeScript bilmiyor!
result.toFixed(2); // ❌ TypeScript izin verir ama runtime'da patlar
```

**Ne istiyoruz?** Hem tekrar yok, hem tip güvenceli. İşte tam olarak generic bunu sağlar.

<hr class="section-divider">

## 📖 Generic Çözümü

`<T>` — tip parametresi:

```typescript
// ✅ Generic ile — tek fonksiyon, her tip için çalışır, tip güvenli
function identity<T>(value: T): T {
    return value;
}

const r1 = identity("Yunus");  // r1: string — TypeScript bilir
const r2 = identity(42);       // r2: number — TypeScript bilir
const r3 = identity(true);     // r3: boolean — TypeScript bilir
const r4 = identity({ id: 1 }); // r4: { id: number }

// r1.toUpperCase(); ✅ string metodu
// r2.toFixed(2);   ✅ number metodu
// r1.toFixed(2);   ❌ Compile hatası — r1 string, toFixed yok
```

**`<T>` nasıl okunur:**
> "Bu fonksiyon T adında bir tip parametresi alır. T'nin ne olduğunu, fonksiyonu çağırırken vereceğimiz değerden öğreneceğiz."

Benzetme: Generic, **kalıp** gibidir. Kalıbın şeklini sen belirlersin, malzemeyi (tipi) dışarıdan alırsın.

<hr class="section-divider">

## 📖 T Nasıl Belirlenir?

TypeScript çoğu zaman T'yi otomatik çıkarır — explicit yazmak zorunda değilsin:

```typescript
// Tip çıkarımı — TypeScript identity("Yunus")'tan T=string anlar
const a = identity("Yunus");    // T: string — otomatik
const b = identity(42);         // T: number — otomatik

// Explicit tip parametresi — API çağrılarında okunabilirlik için
const c = identity<string>("Yunus");  // T: string — açık
const d = identity<number>(42);       // T: number — açık

// API çağrısında explicit önerilir
async function apiGet<T>(url: string): Promise<T> {
    const res = await fetch(url);
    return res.json();
}

const user = await apiGet<User>("/api/user/1");    // T=User açık — ne döneceği belli
const product = await apiGet<Product>("/api/product/5"); // T=Product
```

<hr class="section-divider">

## 📖 T'nin İsimlendirmesi

`T` convention — `Type`'ın kısaltması. Ama daha anlamlı isimler de verebilirsin:

```typescript
// Tek generic — T yaygın
function first<T>(arr: T[]): T | undefined { return arr[0]; }

// Çoklu generic — anlamlı isimler
function transform<TInput, TOutput>(
    value: TInput,
    fn: (input: TInput) => TOutput
): TOutput {
    return fn(value);
}

// İki tip — T, U yaygın
function swap<T, U>(a: T, b: U): [U, T] { return [b, a]; }

// İçerik vs kap — TItem, TValue
interface Repository<TItem> {
    findById(id: number): TItem | null;
    findAll(): TItem[];
}

// API tipler — TData, TError
interface ApiResult<TData, TError = string> {
    data: TData | null;
    error: TError | null;
}
```

<hr class="section-divider">

## 📖 Generic ile any Karşılaştırması

```typescript
// any — tip bilgisi kaybolur, her işleme izin verir
function processAny(value: any): any {
    return value;
}
const result1 = processAny("Yunus");
result1.toFixed(2); // ❌ runtime hata — ama TypeScript uyarmaz!

// Generic — tip bilgisi korunur
function processGeneric<T>(value: T): T {
    return value;
}
const result2 = processGeneric("Yunus"); // result2: string
// result2.toFixed(2); // ✅ TypeScript hata verir — string'in toFixed'ı yok
result2.toUpperCase(); // ✅ string metodu — güvenli
```

| Özellik | `any` | Generic `<T>` |
|---------|-------|---------------|
| Tip güvencesi | ❌ Yok | ✅ Var |
| Autocomplete | ❌ Yok | ✅ Var |
| Hata yakalama | ❌ Runtime | ✅ Compile-time |
| Esneklik | ✅ Her tip | ✅ Her tip |
| Tekrar kullanım | ✅ | ✅ |

<hr class="section-divider">

## 🏭 Real-World: Generic Neden Şart?

<div class="callout callout-real-world">

**🏭 API Response Wrapper**

```typescript
// Generic olmadan — her endpoint için ayrı wrapper
interface UserResponse    { data: User;    success: boolean; message: string; }
interface ProductResponse { data: Product; success: boolean; message: string; }
interface OrderResponse   { data: Order;   success: boolean; message: string; }
// 10 farklı endpoint = 10 farklı interface — saçmalık!

// Generic ile — tek interface, her endpoint için çalışır
interface ApiResponse<T> {
    data: T;
    success: boolean;
    message: string;
    timestamp: string;
}

async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
    const res = await fetch(`/api${endpoint}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

// Her endpoint için tip güvenceli
const userRes    = await apiGet<User>("/users/1");
const productRes = await apiGet<Product>("/products/5");
const orderRes   = await apiGet<Order>("/orders/10");

console.log(userRes.data.email);      // ✅ User field
console.log(productRes.data.price);   // ✅ Product field
console.log(orderRes.data.total);     // ✅ Order field
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Generic Best Practices:**
- `any` görünce ilk soru: "Bunu generic yapabilir miyim?"
- Tip çıkarımına güven — explicit yazmak zorunda değilsin
- API çağrılarında explicit generic yaz: `apiGet<User>()`
- Anlamlı isim ver: `<T>` yerine `<TItem>`, `<TData>` büyük projelerde
- Generic'i zorlamak için değil, ihtiyaç olduğunda kullan

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ any yerine generic ama gereksiz kısıtlama yok — ok
// ❌ Her şeyi generic yapmaya çalışmak — basit tutun
function addOne<T extends number>(n: T): T {
    return (n + 1) as T; // gereksiz karmaşıklık — sadece number kullan
}
// ✅ Basit:
function addOne(n: number): number { return n + 1; }

// ❌ Generic'i any gibi kullanmak
function process<T>(value: T): any { // ❌ dönüşte any — generic'in anlamı yok
    return (value as any).someMethod();
}
```

</div>

<hr class="section-divider">

## 📋 Özet

| Kavram | Açıklama |
|--------|----------|
| `<T>` | Tip parametresi — "dışarıdan tip al" |
| Type inference | TypeScript T'yi otomatik çıkarır |
| Explicit generic | `fn<User>(...)` — açıkça belirt |
| Generic vs any | Generic tip güvenli, any değil |
| İsimlendirme | T, U, TItem, TData, TKey, TValue |
