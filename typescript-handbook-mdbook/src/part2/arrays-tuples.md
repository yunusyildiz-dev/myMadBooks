# Arrays & Tuples

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
TypeScript'te dizileri (arrays) ve sabit uzunluklu, tipli dizileri (tuples) nasıl tanımlarsın. Hangi syntax ne zaman kullanılır, `readonly` array nedir, tuple'ın gerçek dünyada kullanımı.

</div>

---

## 📖 Array (Dizi) Tipleri

TypeScript'te dizi tanımlamanın iki yolu var — ikisi de aynı anlama gelir:

```typescript
// Yöntem 1: tip[] — en yaygın, kısa yazım
let numbers: number[] = [1, 2, 3, 4, 5];
let names: string[] = ["Yunus", "Ahmet", "Mehmet"];
let flags: boolean[] = [true, false, true];

// Yöntem 2: Array<tip> — generic syntax
let numbers2: Array<number> = [1, 2, 3, 4, 5];
let names2: Array<string> = ["Yunus", "Ahmet"];
```

<div class="callout callout-tip">

**✅ Hangisi Ne Zaman?**
- `number[]` → kısa, günlük kullanımda yaygın, tercih edilir
- `Array<number>` → karmaşık generic yapılarda okunabilirlik artırır (örn: `Array<Map<string, User>>`)
- Proje içinde tutarlı ol — ikisini karıştırma

</div>

<hr class="section-divider">

## 📖 Dizi Metodları ile TypeScript

TypeScript, dizi metodlarında da tip güvencesi sağlar:

```typescript
let prices: number[] = [29.99, 49.99, 14.99, 99.99];

// map — her elemanı dönüştür
let doubled: number[] = prices.map(p => p * 2);

// filter — koşula uyanları al
let expensive: number[] = prices.filter(p => p > 30);

// find — ilk uyanı bul
let first: number | undefined = prices.find(p => p > 50); // number | undefined — bulunamayabilir

// reduce — tek değere indir
let total: number = prices.reduce((acc, p) => acc + p, 0);

// forEach — sadece döner, değer döndürmez
prices.forEach((price: number) => {
    console.log(`${price.toFixed(2)}₺`);
});

// sort — sırala (DİKKAT: orijinal diziyi değiştirir)
let sorted: number[] = [...prices].sort((a, b) => a - b); // kopya al, sırala
```

<hr class="section-divider">

## 📖 Karışık Tip Dizileri — Union Array

Birden fazla tipte eleman içeren dizi:

```typescript
// ❌ Kaçın — any[] tip güvencesi olmayan karışık dizi
let mixed: any[] = [1, "yunus", true]; // tehlikeli

// ✅ Daha iyi — union type ile kontrollü karışık dizi
let mixed2: (number | string)[] = [1, "yunus", 2, "ahmet"];
let values: (string | number | boolean)[] = [1, "yunus", true];

// Kullanırken kontrol et
mixed2.forEach(item => {
    if (typeof item === "string") {
        console.log(item.toUpperCase()); // güvenli
    } else {
        console.log(item.toFixed(2)); // güvenli
    }
});
```

<hr class="section-divider">

## 📖 Readonly Array — Değiştirilemez Dizi

Oluşturulduktan sonra değiştirilmemesi gereken diziler için:

```typescript
// readonly — dizi değiştirilemez
const supportedLanguages: readonly string[] = ["tr", "en", "de", "fr"];

// supportedLanguages.push("es");    // ❌ Compile hatası — readonly
// supportedLanguages[0] = "zh";     // ❌ Compile hatası — readonly
// supportedLanguages.pop();         // ❌ Compile hatası — readonly

console.log(supportedLanguages[0]); // ✅ Okumak serbet

// ReadonlyArray<T> syntax'ı da aynı şey
const colors: ReadonlyArray<string> = ["red", "green", "blue"];
```

<div class="callout callout-tip">

**✅ Readonly Array Ne Zaman Kullan?**
- Config ve sabit değer listeleri
- Fonksiyon parametresi olarak — "bu diziyi değiştirmeyeceğim" garantisi
- Redux/Zustand state — immutable data pattern

</div>

<hr class="section-divider">

## 📖 Objeler İçeren Dizi

Gerçek projelerde en sık bu yapı kullanılır:

```typescript
// Interface + dizi kombinasyonu
interface Product {
    id: number;
    name: string;
    price: number;
    inStock: boolean;
}

let products: Product[] = [
    { id: 1, name: "Laptop", price: 15999, inStock: true },
    { id: 2, name: "Mouse",  price: 299,   inStock: true },
    { id: 3, name: "SSD",    price: 1299,  inStock: false }
];

// Tip güvenceli işlemler
let inStockProducts: Product[] = products.filter(p => p.inStock);
let productNames: string[] = products.map(p => p.name);
let totalValue: number = products.reduce((sum, p) => sum + p.price, 0);

let foundProduct: Product | undefined = products.find(p => p.id === 2);
if (foundProduct) {
    console.log(`${foundProduct.name}: ${foundProduct.price}₺`);
}
```

<hr class="section-divider">

## 📖 Tuple — Sabit Uzunluklu, Tipli Dizi

**Tuple**, her indexin tipi ve dizinin uzunluğu **önceden belirlenmiş** özel bir dizi türüdür.

```typescript
// Normal dizi: tüm elemanlar aynı tip, uzunluk değişebilir
let numbers: number[] = [1, 2, 3, 4, 5]; // 0 ile n eleman

// Tuple: her indexin tipi belli, uzunluk sabittir
let person: [string, number, boolean] = ["Yunus", 25, true];
//                  [0]       [1]   [2]
// person[0] → string
// person[1] → number
// person[2] → boolean
```

### Tuple'a Erişim

```typescript
let user: [string, number, boolean] = ["Yunus", 25, true];

console.log(user[0]); // "Yunus" — string
console.log(user[1]); // 25 — number
console.log(user[2]); // true — boolean

// Destructuring ile — çok temiz
const [name, age, isActive] = user;
console.log(name);     // "Yunus"
console.log(age);      // 25
console.log(isActive); // true
```

### Hatalı Kullanımlar

```typescript
// ❌ Yanlış tip
let point: [number, number] = ["x", "y"]; // Hata: string ≠ number

// ❌ Yanlış uzunluk
let coords: [number, number] = [1, 2, 3]; // Hata: 3 eleman, 2 bekleniyor

// ❌ Yanlış sıra
let data: [string, number] = [42, "Yunus"]; // Hata: index 0 string olmalı
```

<hr class="section-divider">

## 📖 Named Tuple — İsimli Tuple

TypeScript 4.0'dan itibaren tuple elemanlarına isim verilebilir — çok daha okunabilir:

```typescript
// İsimsiz tuple — index'e bakman gerekiyor
let point: [number, number] = [10, 20];
// point[0] ne? point[1] ne? — belli değil

// Named tuple — isimler belgeleyici görevi görür
let namedPoint: [x: number, y: number] = [10, 20];
let userInfo: [name: string, age: number, isActive: boolean] = ["Yunus", 25, true];

// Function parameter olarak
function createUser(info: [name: string, age: number]): void {
    const [name, age] = info;
    console.log(`${name} — ${age} yaşında`);
}

createUser(["Yunus", 25]); // → "Yunus — 25 yaşında"
```

<hr class="section-divider">

## 📖 Optional Tuple Elemanı

```typescript
// 3. eleman opsiyonel
let coords: [number, number, number?] = [10, 20]; // ✅ 2 eleman da geçerli
let coords2: [number, number, number?] = [10, 20, 30]; // ✅ 3 eleman da geçerli

// Kullanırken kontrol et
const [x, y, z] = coords;
if (z !== undefined) {
    console.log(`3D nokta: ${x}, ${y}, ${z}`);
} else {
    console.log(`2D nokta: ${x}, ${y}`);
}
```

<hr class="section-divider">

## 🏭 Real-World Tuple Kullanımı

<div class="callout callout-real-world">

**🏭 1. React useState — Tuple Döndürür**

```typescript
// useState'in dönüş tipi bir tuple: [değer, setter]
const [count, setCount] = useState<number>(0);
// count: number
// setCount: Dispatch<SetStateAction<number>>

const [user, setUser] = useState<User | null>(null);
// user: User | null
// setUser: Dispatch<SetStateAction<User | null>>
```

</div>

<div class="callout callout-real-world">

**🏭 2. Koordinat Sistemi**

```typescript
type Point2D = [x: number, y: number];
type Point3D = [x: number, y: number, z: number];
type RGB = [red: number, green: number, blue: number];
type RGBA = [red: number, green: number, blue: number, alpha: number];

const center: Point2D = [0, 0];
const origin: Point3D = [0, 0, 0];
const red: RGB = [255, 0, 0];
const transparentBlue: RGBA = [0, 0, 255, 0.5];

// Fonksiyon — tuple döndürür
function getMinMax(numbers: number[]): [min: number, max: number] {
    return [Math.min(...numbers), Math.max(...numbers)];
}

const [min, max] = getMinMax([3, 1, 7, 2, 9, 4]);
console.log(`Min: ${min}, Max: ${max}`); // → "Min: 1, Max: 9"
```

</div>

<div class="callout callout-real-world">

**🏭 3. CSV Satırı Parse Etme**

```typescript
// CSV'deki kullanıcı satırı: "Yunus,25,true,admin"
type UserCsvRow = [name: string, age: number, isActive: boolean, role: string];

function parseCsvUser(line: string): UserCsvRow {
    const parts = line.split(",");
    return [
        parts[0],
        parseInt(parts[1], 10),
        parts[2] === "true",
        parts[3]
    ];
}

const [name, age, isActive, role] = parseCsvUser("Yunus,25,true,admin");
console.log(name, age, isActive, role);
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Array & Tuple Best Practices:**
- `T[]` syntax'ını tercih et — `Array<T>`'den daha kısa
- Karışık tip dizileri için `any[]` yerine `(T | U)[]` kullan
- Sabit değer listeleri için `readonly` kullan
- Tuple sadece 2-3 eleman için uygundur — daha fazlası için interface kullan
- Named tuple kullan — `[number, number]` yerine `[x: number, y: number]`
- Tuple'dan destructuring ile al — `const [x, y] = point`

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ any[] — tip güvencesi yok
let data: any[] = [1, "yunus", true, null];

// ❌ Çok uzun tuple — bunun yerine interface kullan
let user: [string, number, boolean, string, string, Date] = [...]; // okunaksız
// ✅ Bunun yerine:
interface User { name: string; age: number; isActive: boolean; ... }

// ❌ Tuple'a push ile eleman ekleme — TypeScript izin verse de mantıklı değil
let point: [number, number] = [10, 20];
(point as number[]).push(30); // TypeScript uyarmayabilir ama semantik olarak yanlış

// ❌ Çok elemanlı dizi sıralamasını ezberlemek zorunda kalmak
let data2: [string, number, boolean, string] = ["Yunus", 25, true, "admin"];
data2[3]; // bu ne? — named tuple olsaydı belirdi
```

</div>

<hr class="section-divider">

## 📋 Özet

| Yapı | Syntax | Ne Zaman? |
|------|--------|-----------|
| Dizi | `number[]` | Aynı tipte, değişken sayıda eleman |
| Generic dizi | `Array<number>` | Karmaşık generic yapılarda |
| Union dizi | `(string \| number)[]` | Farklı tipte ama kontrollü elemanlar |
| Readonly dizi | `readonly string[]` | Değişmemesi gereken listeler |
| Tuple | `[string, number]` | Sabit uzunluk, farklı tipler, sıra önemli |
| Named tuple | `[name: string, age: number]` | Okunabilir tuple |
| Optional tuple | `[number, number?]` | Son eleman opsiyonel |
