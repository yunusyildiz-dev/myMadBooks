# Primitive Tipler

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
TypeScript'in temel (primitive) tipleri: `number`, `string`, `boolean`. Tip annotasyonları nasıl yazılır, tip çıkarımı (type inference) nedir ve ne zaman tipi elle yazman gerekir.

</div>

---

## 📖 Primitive Tip Nedir?

JavaScript'te 7 primitive tip vardır. TypeScript bunların hepsini destekler, ama en sık kullandığın üçü şunlar:

| Tip | Ne Tutar? | Örnek |
|-----|-----------|-------|
| `number` | Tüm sayılar (tam, ondalıklı) | `42`, `3.14`, `-10` |
| `string` | Metin | `"Yunus"`, `'hello'`, `` `template` `` |
| `boolean` | Doğru / Yanlış | `true`, `false` |

<hr class="section-divider">

## 📖 number Tipi

JavaScript'te `int`, `float`, `double` gibi ayrımlar yoktur — hepsi `number`dır.

```typescript
// Tam sayı
let age: number = 25;
let year: number = 2025;

// Ondalıklı sayı
let pi: number = 3.14;
let price: number = 99.99;

// Negatif sayı
let temperature: number = -15;

// Binary, octal, hexadecimal — hepsi number
let binary: number = 0b1010;    // 10
let octal: number = 0o744;      // 484
let hex: number = 0xff;         // 255

// Özel değerler
let infinity: number = Infinity;
let notANumber: number = NaN;   // "Not a Number" — geçersiz işlem sonucu
```

<div class="callout callout-tip">

**✅ Type Inference ile Kısa Yazım**
Eğer değer ilk atamada bellidir, tipi yazmak zorunda değilsin — TypeScript kendisi anlar:

```typescript
let age = 25;    // TypeScript anlar: age → number
let pi = 3.14;   // TypeScript anlar: pi → number
```

Ama fonksiyon parametrelerinde her zaman tipi yaz — TypeScript orada çıkaramaz.

</div>

### Sayısal İşlemler

```typescript
let a: number = 10;
let b: number = 3;

console.log(a + b);    // 13
console.log(a - b);    // 7
console.log(a * b);    // 30
console.log(a / b);    // 3.3333...
console.log(a % b);    // 1 (mod)
console.log(a ** b);   // 1000 (üs)

// toFixed — ondalık basamak sayısını belirle
let result: number = a / b;
console.log(result.toFixed(2)); // "3.33" (string döner!)
```

<hr class="section-divider">

## 📖 string Tipi

Metinleri tutar. Üç farklı yazım şekli var:

```typescript
// Çift tırnak
let name: string = "Yunus";

// Tek tırnak — aynı şey
let city: string = 'İstanbul';

// Template literal (backtick) — dinamik string için en pratik
let greeting: string = `Merhaba, ${name}!`;
console.log(greeting); // → "Merhaba, Yunus!"

// Çok satırlı string
let message: string = `
    Merhaba!
    Bu çok satırlı
    bir mesajdır.
`;
```

### Template Literal — Günlük Kullanım

```typescript
let productName: string = "Laptop";
let productPrice: number = 2499.99;
let inStock: boolean = true;

// Eski yöntem — birleştirme operatörü (+)
let info1 = "Ürün: " + productName + ", Fiyat: " + productPrice + "₺";

// Modern yöntem — template literal (çok daha okunabilir)
let info2 = `Ürün: ${productName}, Fiyat: ${productPrice}₺`;

// İfade kullanabilirsin
let info3 = `${productName} ${inStock ? "stokta" : "tükendi"} — ${productPrice.toFixed(2)}₺`;
console.log(info3); // → "Laptop stokta — 2499.99₺"
```

### Yaygın String Metodları

```typescript
let text: string = "  TypeScript Harika!  ";

console.log(text.trim());           // "TypeScript Harika!"
console.log(text.toLowerCase());    // "  typescript harika!  "
console.log(text.toUpperCase());    // "  TYPESCRIPT HARIKA!  "
console.log(text.includes("Hrika")); // false (büyük-küçük harf duyarlı)
console.log(text.replace("Harika", "Muhteşem")); // "  TypeScript Muhteşem!  "
console.log(text.split(" "));       // dizi döner
console.log(text.length);           // 22
```

<hr class="section-divider">

## 📖 boolean Tipi

Sadece iki değer alabilir: `true` veya `false`.

```typescript
let isLoggedIn: boolean = true;
let isActive: boolean = false;
let hasPermission: boolean = true;

// Karşılaştırma ifadeleri boolean döndürür
let isAdult: boolean = age >= 18;      // true (age = 25)
let isExpensive: boolean = price > 100; // true (price = 99.99... false aslında)

// Koşullu kullanım
if (isLoggedIn) {
    console.log("Hoş geldiniz!");
} else {
    console.log("Lütfen giriş yapın.");
}
```

<div class="callout callout-warning">

**⚠️ Dikkat:** JavaScript'te `"false"` string'i `true` olarak değerlendirilir!

```typescript
let value: boolean = "false" as any; // Bu yanlış kullanım!
if (value) {
    // Bu blok çalışır — çünkü boş olmayan string truthy'dir
}

// Doğru:
let isActive: boolean = false; // gerçek boolean
```

</div>

<hr class="section-divider">

## 📖 Type Inference — Tip Çıkarımı

TypeScript, değerden tipi kendisi çıkarabilir. Buna **type inference** denir:

```typescript
// Tip annotasyonu ile (explicit):
let name: string = "Yunus";
let age: number = 25;
let isActive: boolean = true;

// Type inference ile (implicit):
let name2 = "Yunus";    // TypeScript: string
let age2 = 25;          // TypeScript: number
let isActive2 = true;   // TypeScript: boolean

// İkisi tamamen eşdeğer
// name2 = 42; // ❌ Hata — artık string, number atayamazsın
```

### Ne Zaman Tip Yaz, Ne Zaman Yazma?

```typescript
// ✅ Tipi yaz: fonksiyon parametrelerinde — TypeScript çıkaramaz
function add(a: number, b: number): number {
    return a + b;
}

// ✅ Tipi yaz: başlangıç değeri yoksa
let userId: number; // henüz değer yok
userId = 42;

// ✅ Tipi yaz: değer belirsizse
let input: string | number = getInputFromUser(); // union tip — ileride öğreneceksin

// ✅ Yazma (inference yeterli): değer açıkça bellidir
let total = 100;         // sayı olduğu belli
let userName = "Yunus";  // string olduğu belli
let items = [1, 2, 3];   // number[] TypeScript çıkarır
```

<hr class="section-divider">

## 🏭 Real-World Kullanım

<div class="callout callout-real-world">

**🏭 E-ticaret Ürün Modeli**

```typescript
// Bir e-ticaret ürününün temel alanları
let productId: number = 12345;
let productName: string = "Sony WH-1000XM5 Kulaklık";
let productPrice: number = 8499.99;
let isInStock: boolean = true;
let discountPercentage: number = 15;
let description: string = `
    Sektör lideri gürültü engelleme teknolojisi.
    30 saate kadar pil ömrü.
    Katlanabilir tasarım.
`;

// Hesaplama
let discountedPrice: number = productPrice * (1 - discountPercentage / 100);
let productCard: string = `
    ${productName}
    Fiyat: ${discountedPrice.toFixed(2)}₺ (${discountPercentage}% indirim)
    Durum: ${isInStock ? "Stokta" : "Tükendi"}
`;

console.log(productCard);
```

</div>

<div class="callout callout-real-world">

**🏭 Kullanıcı Kimlik Doğrulama**

```typescript
// Auth işlemlerinde sık kullanılan primitive tipler
let userId: number = 1001;
let username: string = "yunus.yildiz";
let email: string = "yunus@example.com";
let isEmailVerified: boolean = true;
let loginAttempts: number = 0;
let isLocked: boolean = loginAttempts >= 5;

// Login denemesi simülasyonu
function tryLogin(enteredPassword: string, correctPassword: string): boolean {
    const isMatch: boolean = enteredPassword === correctPassword;
    if (!isMatch) {
        loginAttempts++;
    }
    return isMatch;
}
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Primitive Tipler için Best Practices:**
- Değer açıkça belliyse tip yazmak zorunda değilsin — type inference güvenli
- Fonksiyon parametrelerine her zaman tip yaz
- `number` yerine `parseInt()` veya `parseFloat()` kullanarak string'i sayıya çevir
- Template literal'ı string birleştirme `+`'ına tercih et — daha okunabilir
- Boolean değişken isimlerini `is`, `has`, `can`, `should` ile başlat: `isActive`, `hasPermission`

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Primitive tipler için büyük harfli (wrapper) kullanma
let name: String = "Yunus";   // String (büyük S) — wrapper object, kaçın
let age: Number = 25;          // Number (büyük N) — kaçın
let flag: Boolean = true;      // Boolean (büyük B) — kaçın

// ✅ Bunları kullan:
let name2: string = "Yunus";
let age2: number = 25;
let flag2: boolean = true;

// ❌ NaN kontrolü için == kullanma (JavaScript tuzağı)
let value = NaN;
console.log(value == NaN);   // false — NaN hiçbir şeye eşit değildir, kendisi dahil!
console.log(isNaN(value));   // ✅ true — doğru yol
console.log(Number.isNaN(value)); // ✅ true — daha güvenli
```

</div>

<hr class="section-divider">

## 📋 Özet

| Tip | Açıklama | Örnek Değer | Type Inference |
|-----|----------|-------------|----------------|
| `number` | Tüm sayılar | `42`, `3.14`, `-5` | `let x = 10` → number |
| `string` | Metin | `"hello"`, `'world'`, `` `template` `` | `let s = "hi"` → string |
| `boolean` | Mantıksal değer | `true`, `false` | `let b = true` → boolean |

**Ne zaman tip yaz?**
- Fonksiyon parametrelerinde → **her zaman**
- Başlangıç değeri yoksa → **yaz**
- Değer açıkça belliyse → **yazma (inference yeterli)**
