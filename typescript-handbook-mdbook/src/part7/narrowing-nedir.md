# Type Narrowing Nedir?

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
Type narrowing (tip daraltma) nedir, TypeScript nasıl tipi otomatik daraltır, ve neden union tip veya `unknown` aldığında kontrol yapmak zorundasın.

</div>

---

## 📖 Problem: Union Tipte Ne Yapacaksın?

Bir fonksiyon `string | number` alıyor. String ise `.toUpperCase()`, number ise `.toFixed(2)` çağırmak istiyorsun. Ama hangisi geldiğini bilmeden ikisini birden çağıramazsın:

```typescript
// ❌ TypeScript neyin geldiğini bilmiyor — hata verir
function printValue(value: string | number): void {
    console.log(value.toUpperCase()); // ❌ number'da yok
    console.log(value.toFixed(2));    // ❌ string'de yok
}
```

**Type narrowing** bu problemi çözer: TypeScript'e "bu blokta tip kesinlikle şu" diye söylersin. TypeScript kontrol ettikten sonra bloğun içinde tipi otomatik daraltır:

```typescript
// ✅ Type narrowing ile — her blokta tek tip
function printValue(value: string | number): void {
    if (typeof value === "string") {
        // Burada TypeScript biliyor: value string
        console.log(value.toUpperCase()); // ✅ string metodu
    } else {
        // Burada TypeScript biliyor: value number
        console.log(value.toFixed(2));    // ✅ number metodu
    }
}

printValue("yunus"); // → "YUNUS"
printValue(3.14);    // → "3.14"
```

TypeScript if bloğuna girince hangi tipte olabileceğini hesaplar. `else` bloğunda kalan tek ihtimali otomatik seçer.

<hr class="section-divider">

## 📖 Type Narrowing Teknikleri

TypeScript aşağıdaki kontrolleri tip daraltma sinyali olarak tanır:

| Teknik | Syntax | Ne zaman |
|--------|--------|----------|
| `typeof` | `typeof x === "string"` | Primitive tipler |
| `instanceof` | `x instanceof Date` | Class instance'ları |
| `in` | `"field" in obj` | Obje alan varlığı |
| Equality | `x === null` | null / undefined kontrolü |
| Truthy/falsy | `if (x)` | Boşluk kontrolü |
| Custom guard | `isUser(x)` | Karmaşık obje doğrulama |
| Discriminated union | `switch (x.type)` | Ortak alan ile ayır |

<hr class="section-divider">

## 📖 unknown ile Type Narrowing

`any` kullanmak tipin kaybolması demektir. `unknown` ise "bu değer var ama tipini bilmiyorum, kullanmadan önce kontrol et" demektir. API'dan gelen veri `unknown` olmalı:

```typescript
// API'dan gelen ham veri — tipi bilinmiyor
function processApiValue(value: unknown): string {
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
    if (typeof value === "boolean") return value ? "true" : "false";
    if (value === null) return "null";
    if (typeof value === "object") return JSON.stringify(value);
    return "bilinmeyen";
}

// value.toUpperCase(); // ❌ unknown'u daraltmadan kullanamazsın
// value.length;        // ❌ unknown'u daraltmadan kullanamazsın
```

`unknown` seni daima daraltmaya zorlar. `any` ise seni uyarmadan çalışır — runtime'da patlayabilir.

<hr class="section-divider">

## 📖 Narrowing Karar Ağacı

```
Değer nedir?
│
├── Primitive (string, number, boolean)?
│   └── typeof kullan
│
├── Class instance (Error, Date, custom class)?
│   └── instanceof kullan
│
├── Plain obje, belirli alan var mı?
│   └── in kullan
│
├── null veya undefined mi?
│   └── === null / === undefined kullan
│
├── Ortak "type" / "kind" alanı var mı?
│   └── Discriminated union + switch kullan
│
└── Hiçbiri yetmedi?
    └── Custom type guard (is) yaz
```

<hr class="section-divider">

## 📋 Özet

| Kavram | Açıklama |
|--------|----------|
| Type narrowing | TypeScript'e "bu blokta tip şu" demek |
| `unknown` | Daraltmadan kullanılamaz — güvenli `any` |
| Control flow analysis | TypeScript if/else/switch'i anlayarak tipi otomatik daraltır |
| Union tip | Her kol için ayrı kontrol gerekir |
