# any, unknown, never

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
TypeScript'in "kaçış kapıları": `any` (kullanma!), `unknown` (güvenli alternatif), `never` (hiç tamamlanmayan). Bu üç tip ne zaman kullanılır, aralarındaki fark nedir?

</div>

---

## 📖 Neden Bu Üç Tipi Bilmek Lazım?

TypeScript'in en önemli kuralı basit: **her değişkenin bir tipi olsun ve o tipten sapma olmasın.** Ama gerçek dünyada her şey bu kadar net değil:

- Dışarıdan gelen API verisi ne tipte? — bilmiyoruz
- Kullanıcının formu hangi değeri döndürür? — belirsiz
- Bu fonksiyon asla tamamlanmayacak — tipi ne olmalı?

Bu soruların cevapları: `unknown`, `any`, `never`.

<hr class="section-divider">

## 📖 any — Tip Güvencesinden Kaçış

`any`, "bu değişkeni TypeScript kontrolünden çıkar" demektir. Her tip atanabilir, her metot çağrılabilir, TypeScript hiçbir şeyi kontrol etmez.

```typescript
let value: any;

value = 42;          // ✅ tamam
value = "Yunus";     // ✅ tamam
value = true;        // ✅ tamam
value = { id: 1 };   // ✅ tamam
value = null;        // ✅ tamam

// ⚠️ TypeScript hiçbir şeyi kontrol etmez
value.toUpperCase();  // çalışabilir veya patlar — TypeScript umursamaz
value.someMethod();   // var mı yok mu? — TypeScript bilmez
value[0].name;        // runtime'da patlayabilir — TypeScript uyarmaz
```

<div class="callout callout-danger">

**❌ `any` Neden Tehlikeli?**

`any` kullanırsan TypeScript'i kendi elinle kapatmış olursun. Tip güvencesi sıfırlanır ve TypeScript'i kullanmanın tüm faydaları yok olur.

```typescript
function processData(data: any): void {
    // TypeScript hiçbir şeyi kontrol etmez
    console.log(data.toUpperCase()); // runtime'da patlayabilir
}

processData(42);    // TypeError: data.toUpperCase is not a function
processData(null);  // TypeError: Cannot read properties of null
```

</div>

### `any` Ne Zaman Kullanılabilir?

<div class="callout callout-warning">

**⚠️ `any` için 3 Meşru Durum:**

1. **JavaScript'ten TypeScript'e geçiş** — geçici olarak, sonra düzeltilmek üzere
2. **Tip bilgisi gerçekten belirsiz** — third-party kütüphane tipi yoksa
3. **Hızlı prototip** — henüz tasarım aşamasında, tip önemli değil

Bu 3 durum dışında `any` kullanma. Bunun yerine `unknown` kullan.

</div>

<hr class="section-divider">

## 📖 unknown — Güvenli any

`unknown`, `any`'nin tip güvenli versiyonudur. Her değer atanabilir — ama **kullanmadan önce kontrol zorunlu**.

```typescript
let safeInput: unknown;

safeInput = "Yunus";
safeInput = 42;
safeInput = { name: "Ahmet" };
// Bunların hepsi ✅

// ❌ Direkt kullanamassın — TypeScript izin vermez
// safeInput.toUpperCase(); // Hata: Object is of type 'unknown'
// safeInput.length;        // Hata: Object is of type 'unknown'

// ✅ Önce kontrol et, sonra kullan
if (typeof safeInput === "string") {
    console.log(safeInput.toUpperCase()); // güvenli — TypeScript burada string olduğunu biliyor
}

if (typeof safeInput === "number") {
    console.log(safeInput.toFixed(2)); // güvenli
}

if (typeof safeInput === "object" && safeInput !== null) {
    console.log(safeInput); // güvenli
}
```

### `unknown` vs `any` Karşılaştırması

```typescript
let anyValue: any = "Yunus";
let unknownValue: unknown = "Yunus";

// any — TypeScript izin verir ama runtime'da patlayabilir
anyValue.toUpperCase();     // ✅ TypeScript izin verir (tehlikeli!)
anyValue.nonExistent();     // ✅ TypeScript izin verir (tehlikeli!)

// unknown — TypeScript zorunlu kontrol ister
unknownValue.toUpperCase(); // ❌ TypeScript hatası (güvenli!)
if (typeof unknownValue === "string") {
    unknownValue.toUpperCase(); // ✅ Kontrol sonrası güvenli
}
```

### Real-World: API'dan Gelen Veri

```typescript
// API'dan gelen veriyi her zaman unknown olarak al
async function fetchUser(id: number): Promise<unknown> {
    const response = await fetch(`/api/users/${id}`);
    return response.json(); // json() → Promise<any>, biz unknown'a dönüştürüyoruz
}

// Kullanırken kontrol et
async function processApiUser(id: number): Promise<string> {
    const data: unknown = await fetchUser(id);

    // Tip kontrolü
    if (
        typeof data === "object" &&
        data !== null &&
        "name" in data &&
        typeof (data as { name: unknown }).name === "string"
    ) {
        return (data as { name: string }).name;
    }

    throw new Error("Geçersiz kullanıcı verisi");
}
```

<hr class="section-divider">

## 📖 never — Hiç Tamamlanmayan

`never`, bir fonksiyonun **hiçbir zaman normal bir değer döndürmeyeceği** anlamına gelir. İki durumda kullanılır:

1. Fonksiyon her zaman bir hata fırlatır
2. Fonksiyon sonsuza kadar çalışır

```typescript
// Durum 1: Her zaman hata fırlatan fonksiyon
function throwError(message: string): never {
    throw new Error(message);
    // Buraya asla ulaşılmaz — TypeScript bunu bilir
}

// Durum 2: Sonsuz döngü
function runForever(): never {
    while (true) {
        // Server loop — asla bitmez
    }
}

// never'ın pratik kullanımı: type guard ile
function processInput(input: string | number): string {
    if (typeof input === "string") {
        return input.toUpperCase();
    }
    if (typeof input === "number") {
        return input.toFixed(2);
    }
    // TypeScript burada input'un never olduğunu biliyor
    // Tüm olası tipler yukarıda işlendi
    const _exhaustive: never = input;
    return _exhaustive; // Bu satıra asla ulaşılmaz
}
```

### never — Exhaustive Check (Eksiksiz Kontrol)

Bu, `never`ın en güçlü kullanımıdır. Tüm durumların işlenip işlenmediğini derleme anında kontrol eder:

```typescript
type OrderStatus = "pending" | "processing" | "shipped" | "delivered";

function getStatusMessage(status: OrderStatus): string {
    switch (status) {
        case "pending":    return "Sipariş alındı";
        case "processing": return "Hazırlanıyor";
        case "shipped":    return "Kargoya verildi";
        case "delivered":  return "Teslim edildi";
        default:
            // Eğer yeni bir status eklenirse ve buraya gelirse TypeScript hata verir
            const _never: never = status;
            throw new Error(`Bilinmeyen status: ${status}`);
    }
}

// Şimdi "cancelled" statusu ekleyelim — TypeScript hemen uyarır
// type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
// Artık switch'te "cancelled" case'i eklenmezse compile hatası alırsın ✅
```

<hr class="section-divider">

## 🏭 Real-World Kullanım

<div class="callout callout-real-world">

**🏭 Error Handler — Büyük Projelerde**

```typescript
class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number
    ) {
        super(message);
        this.name = "AppError";
    }
}

// Her zaman hata fırlatan — never döndürür
function assertNotNull<T>(value: T | null | undefined, fieldName: string): T {
    if (value === null || value === undefined) {
        throw new AppError(
            `${fieldName} gereklidir`,
            "VALIDATION_ERROR",
            400
        );
    }
    return value; // burada T tipinde olduğu garantili
}

// unknown ile API veri doğrulama
function parseUserFromApi(data: unknown): { id: number; name: string } {
    if (
        typeof data !== "object" ||
        data === null ||
        !("id" in data) ||
        !("name" in data)
    ) {
        throw new AppError("Geçersiz user verisi", "PARSE_ERROR", 500);
    }
    const { id, name } = data as { id: unknown; name: unknown };
    if (typeof id !== "number" || typeof name !== "string") {
        throw new AppError("User alanları yanlış tipte", "TYPE_ERROR", 500);
    }
    return { id, name };
}
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Karar Ağacı:**
```
Dışarıdan gelen veri (API, kullanıcı girişi)?
  → unknown kullan, kullanmadan kontrol et

Tip gerçekten belirsiz ve kütüphane tipi yok?
  → Geçici any, sonra düzelt

Fonksiyon hata fırlatıyor veya sonsuza çalışıyor?
  → never kullan

Union tipteki tüm durumları işlemek istiyorsun?
  → never ile exhaustive check yap
```

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Her yerde any — TypeScript'i etkisiz kılar
function process(data: any): any { return data; }

// ❌ any döndüren fonksiyon — caller'a bulaşır
async function fetchData(): Promise<any> { // any dışarıya sızar
    return fetch("/api").then(r => r.json());
}

// ✅ Daha iyi:
async function fetchData<T>(): Promise<T> {
    const res = await fetch("/api");
    const data: unknown = await res.json();
    return data as T; // ya da type guard ile doğrula
}

// ❌ unknown'u kontrol etmeden kullanmak
let value: unknown = getExternalData();
// value.name; // ❌ Compile error — ama kod yazarken fark edilirse iyi
```

</div>

<hr class="section-divider">

## 📋 Özet

| Tip | Kullanım | Kontrol Zorunlu mu? | Güvenli mi? |
|-----|----------|---------------------|-------------|
| `any` | Tüm tipler | ❌ Hayır | ❌ Hayır |
| `unknown` | Tüm tipler | ✅ Evet | ✅ Evet |
| `never` | Hiçbir tip | — | ✅ Evet |

**Pratik Kural:**
- `any` → **kaçın** (mecbur değilsen)
- `unknown` → **API verisi, kullanıcı girişi, belirsiz tipler için**
- `never` → **hata fırlatan fonksiyonlar, exhaustive check için**
