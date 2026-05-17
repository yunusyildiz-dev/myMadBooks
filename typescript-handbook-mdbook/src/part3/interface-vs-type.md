# Interface vs Type

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
`interface` ve `type` arasındaki farklar, hangisini ne zaman seçmen gerektiği ve proje genelinde nasıl tutarlı bir strateji belirlenebileceği.

</div>

---

## 📖 Temel Soru: Hangisi Ne Zaman?

TypeScript geliştirirken en çok sorulan sorulardan biri budur: **`interface` mi, `type` mı?**

Kısa cevap: İkisi de çoğu durumda birbirinin yerini tutabilir. Ama bazı durumlar için biri açıkça üstündür.

<hr class="section-divider">

## 📖 Tam Karşılaştırma Tablosu

| Özellik | `interface` | `type` |
|---------|-------------|--------|
| Obje şekli tanımı | ✅ | ✅ |
| `extends` ile miras | ✅ `extends Y` | ✅ `& Y` (intersection) |
| Class `implements` | ✅ | ✅ |
| Declaration merging | ✅ (aynı isim otomatik birleşir) | ❌ |
| Union type | ❌ | ✅ `"a" \| "b"` |
| Intersection type | ✅ `extends` gibi | ✅ `A & B` |
| Primitive alias | ❌ | ✅ `type ID = number` |
| Tuple tanımı | ❌ | ✅ `[string, number]` |
| Mapped types | ❌ | ✅ `{ [K in keyof T]: ... }` |
| Conditional types | ❌ | ✅ `T extends X ? A : B` |
| Generic support | ✅ | ✅ |
| IDE hover görünümü | Ad gösterir | Yapıyı açar |

<hr class="section-divider">

## 📖 Sadece `type` Yapabilir

```typescript
// 1. Union type — interface yapamaz
type Status = "active" | "inactive" | "pending"; // ✅ type
// interface Status = "active" | ...; // ❌ SYNTAX HATASI

// 2. Primitive alias
type ID = string | number;

// 3. Tuple
type Point = [x: number, y: number];

// 4. Mapped type
type Readonly<T> = { readonly [K in keyof T]: T[K] };

// 5. Conditional type
type IsString<T> = T extends string ? true : false;
type Test1 = IsString<string>; // true
type Test2 = IsString<number>; // false
```

## 📖 Sadece `interface` Yapabilir

```typescript
// 1. Declaration merging — kütüphane geliştirmede kullanışlı
interface Window {
    myCustomProperty: string; // tarayıcının Window tipine alan ekler
}

// 2. Class kontratı — implements ile zorunlu kılma
interface Loggable {
    log(message: string): void;
}

class UserService implements Loggable {
    log(message: string): void {
        console.log(`[UserService] ${message}`);
    }
}
```

<hr class="section-divider">

## 📖 Extend Sözdizimi Farkı

```typescript
// interface extends — daha açık ve okunabilir
interface Animal {
    name: string;
}
interface Dog extends Animal {
    breed: string;
}

// type intersection — aynı sonuç, farklı syntax
type Animal2 = { name: string };
type Dog2 = Animal2 & { breed: string };

// İkisi de aynı şeyi üretir:
// { name: string, breed: string }
```

<hr class="section-divider">

## 📖 IDE Deneyimi Farkı

```typescript
interface UserInterface { id: number; name: string; }
type UserType = { id: number; name: string; };

let ui: UserInterface = { id: 1, name: "Yunus" };
let ut: UserType      = { id: 1, name: "Yunus" };

// Fare ile üstüne gelince:
// ui → "UserInterface" gösterir (isim)
// ut → "{ id: number; name: string; }" açar (yapı)
```

Bu küçük bir fark gibi görünse de büyük projelerde `interface` ismi daha hızlı tanımlanır.

<hr class="section-divider">

## 📖 Toplulukta Tercih

TypeScript topluluğunda iki ana kamp vardır:

**"Her şey için interface" kampı (geleneksel):**
- Angular, NestJS gibi OOP odaklı projeler
- Google, Airbnb style guide'ları (eski versiyonlar)
- Class-based mimariler

**"Obje için interface, diğerleri için type" kampı (modern):**
- React ekosistemi
- Fonksiyonel programlama stili
- TypeScript resmi dökümantasyonu bu tarafı önerir (güncel)

**"Her şey için type" kampı (minimal):**
- Yalın projeler, her şeyi tutarlı tutmak isteyenler

<hr class="section-divider">

## 📖 Karar Ağacı

```
Bir tip mi tanımlamak istiyorsun?
│
├── Union type mi? ("active" | "inactive")
│   → type kullan (interface yapamaz)
│
├── Tuple mi? ([string, number])
│   → type kullan (interface yapamaz)
│
├── Primitive alias mı? (type ID = number)
│   → type kullan (interface yapamaz)
│
├── Obje şekli mi?
│   ├── Class implements edecek mi?
│   │   → interface tercih et
│   ├── Kütüphane geliştiriyor musun?
│   │   → interface (declaration merging için)
│   └── Normal uygulama kodu mu?
│       → proje kuralına uyu (ikisi de çalışır)
│
└── Emin değil misin?
    → type (her şeyi karşılar)
```

<hr class="section-divider">

## 📖 Pratik Öneri — Proje Standardı

<div class="callout callout-tip">

**✅ En İyi Strateji: Tutarlı Ol**

Birini seç ve projede onu kullan. Karıştırmak kodu okumayı zorlaştırır.

**Önerilen yaklaşım:**
```typescript
// Obje modelleri → interface
interface User     { id: number; name: string; }
interface Product  { id: number; price: number; }
interface ApiResponse<T> { data: T; success: boolean; }

// Union, tuple, alias → type
type Status  = "active" | "inactive";
type ID      = string | number;
type Point   = [number, number];
type Handler = (event: Event) => void;
```

Bu yaklaşım en yaygın ve makul olanıdır.

</div>

<hr class="section-divider">

## 🏭 Gerçek Proje Standardı

<div class="callout callout-real-world">

**🏭 Büyük Ölçekli Proje Tipi Organizasyonu**

```typescript
// src/types/entities.ts — interface kullan
export interface UserEntity {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    createdAt: string;
}

export interface OrderEntity {
    id: number;
    userId: number;
    status: OrderStatus;
    total: number;
}

// src/types/common.ts — type kullan
export type UserRole = "admin" | "editor" | "viewer";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered";
export type ID = number;
export type Nullable<T> = T | null;
export type AsyncState<T> = { data: T | null; loading: boolean; error: string | null };

// src/types/api.ts — her iki karışım
export interface ApiResponse<T> {  // interface — obje
    data: T;
    success: boolean;
    message: string;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; // type — union
```

</div>

<hr class="section-divider">

## ❌ Avoid

<div class="callout callout-danger">

**❌ En Sık Yapılan Hata: Tutarsızlık**

```typescript
// ❌ Aynı projede tutarsız kullanım
interface User { name: string; }
type Product = { name: string; }    // hangisi ne zaman? — kural yok
interface Status { value: string; } // ama Status union olmalı!
type User2 = { age: number; }       // User ve User2 başka şeyler mi?

// ✅ Kural koy ve uygula:
// Obje → interface, diğerleri → type
// VEYA her şey → type
// ANCAK bir standart seç
```

</div>

<hr class="section-divider">

## 📋 Özet — Hızlı Referans

| Durum | Seçim | Neden |
|-------|-------|-------|
| Union type `"a" \| "b"` | **`type`** | Interface yapamaz |
| Tuple `[string, number]` | **`type`** | Interface yapamaz |
| Primitive alias | **`type`** | Interface yapamaz |
| API/Entity modeli | **`interface`** | Convention, merging |
| React props | **`interface`** | Convention |
| Class contract | **`interface`** | implements uyumu |
| Emin değilsen | **`type`** | Her şeyi karşılar |
| Miras/genişletme | Her ikisi | `extends` vs `&` |
