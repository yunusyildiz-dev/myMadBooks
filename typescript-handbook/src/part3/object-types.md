# Object Types

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
TypeScript'te bir objenin şeklini tanımlamanın 3 yolu: inline tip, `interface`, `type alias`. Her birinin avantajları ve ne zaman kullanılacağı.

</div>

---

## 📖 Neden Obje Tipi Tanımlamak Gerekiyor?

JavaScript'te her obje her şeyi tutabilir:

```javascript
// JavaScript — tip güvencesi yok
const user = { name: "Yunus", age: 25 };
user.emali = "yunus@mail.com"; // typo! ama JavaScript şikayet etmez
console.log(user.phone);       // undefined — ama hata yok
```

TypeScript'te objenin şeklini tanımlarsan, bu hataların hepsi compile anında yakalanır.

<hr class="section-divider">

## 📖 Yöntem 1 — Inline Tip Tanımı

Doğrudan değişken tipini yazarak tanımlama:

```typescript
// Tek kullanımlık, küçük objeler için
let user: {
    name: string;
    age: number;
    isActive: boolean;
} = {
    name: "Yunus",
    age: 25,
    isActive: true
};

// Fonksiyon parametresi — inline
function greet(person: { name: string; age: number }): string {
    return `Merhaba ${person.name}, ${person.age} yaşındasın.`;
}

greet({ name: "Yunus", age: 25 }); // ✅
// greet({ name: "Yunus" });        // ❌ age eksik
// greet({ name: "Yunus", age: "yirmibeş" }); // ❌ age number olmalı
```

<div class="callout callout-warning">

**⚠️ Inline Tipin Dezavantajı**

Aynı obje şeklini başka bir yerde de kullanmak istersen, tipi tekrar yazmak zorundasın. Bu DRY (Don't Repeat Yourself) prensibini ihlal eder:

```typescript
let user1: { name: string; age: number } = { name: "Yunus", age: 25 };
let user2: { name: string; age: number } = { name: "Ahmet", age: 30 }; // tekrar!
let user3: { name: string; age: number } = { name: "Mehmet", age: 28 }; // tekrar!
```

Bunun yerine `interface` veya `type alias` kullan.

</div>

<hr class="section-divider">

## 📖 Yöntem 2 — Interface

`interface` ile tekrar kullanılabilir obje şekli tanımla:

```typescript
// Interface — bir kez tanımla, her yerde kullan
interface User {
    name: string;
    age: number;
    isActive: boolean;
}

let user1: User = { name: "Yunus",  age: 25, isActive: true };
let user2: User = { name: "Ahmet",  age: 30, isActive: false };
let user3: User = { name: "Mehmet", age: 28, isActive: true };

function greet(user: User): string {
    return `Merhaba ${user.name}!`;
}

function getActiveUsers(users: User[]): User[] {
    return users.filter(u => u.isActive);
}
```

Interface tanımladıktan sonra tüm TypeScript özelliklerinden yararlanırsın:
- Autocomplete: `user.` yazdığında `name`, `age`, `isActive` seçenekleri gelir
- Hata kontrolü: yanlış alan adı yazarsan anında uyarı alırsın
- Refactoring: alan adını değiştirince tüm yerleri otomatik günceller

<hr class="section-divider">

## 📖 Yöntem 3 — Type Alias

`type` keyword'ü ile de obje tipi tanımlayabilirsin:

```typescript
type Product = {
    id: number;
    name: string;
    price: number;
    inStock: boolean;
};

let laptop: Product = { id: 1, name: "MacBook", price: 35000, inStock: true };
let mouse: Product  = { id: 2, name: "Mouse",   price: 299,   inStock: true };

function getTotalValue(products: Product[]): number {
    return products.reduce((sum, p) => sum + p.price, 0);
}
```

<hr class="section-divider">

## 📖 Üç Yöntemin Karşılaştırması

```typescript
// Yöntem 1: Inline — tek kullanımlık
function showProfile(profile: { name: string; bio: string }): void {
    console.log(`${profile.name}: ${profile.bio}`);
}

// Yöntem 2: Interface — tekrar kullanılabilir, extend edilebilir
interface Profile {
    name: string;
    bio: string;
}
function showProfile2(profile: Profile): void { ... }

// Yöntem 3: Type alias — tekrar kullanılabilir, union/intersection için güçlü
type Profile3 = {
    name: string;
    bio: string;
};
function showProfile3(profile: Profile3): void { ... }
```

| Yöntem | Ne Zaman Kullan? |
|--------|-----------------|
| **Inline** | Tek seferlik, küçük, geçici objeler |
| **Interface** | API modelleri, React props, class contract'ları |
| **Type alias** | Union tipler, tuple, primitive alias + obje |

<hr class="section-divider">

## 🏭 Real-World: Eksiksiz API Modeli

<div class="callout callout-real-world">

**🏭 E-ticaret Backend — Obje Tipleri**

```typescript
// Her modeli ayrı interface ile tanımla
interface Address {
    street: string;
    city: string;
    country: string;
    zipCode: string;
}

interface Customer {
    id: number;
    name: string;
    email: string;
    address: Address;
}

interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
}

interface Order {
    id: number;
    customer: Customer;
    items: OrderItem[];
    total: number;
    status: "pending" | "processing" | "shipped" | "delivered";
    createdAt: string;
}

// Kullanım — tip güvenceli
function calculateTotal(items: OrderItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

const order: Order = {
    id: 1,
    customer: {
        id: 101,
        name: "Yunus Yıldız",
        email: "yunus@mail.com",
        address: { street: "Bağdat Cad.", city: "İstanbul", country: "TR", zipCode: "34710" }
    },
    items: [
        { productId: 1, productName: "Laptop", quantity: 1, unitPrice: 15999 },
        { productId: 2, productName: "Mouse",  quantity: 2, unitPrice: 299 }
    ],
    total: 16597,
    status: "pending",
    createdAt: "2025-01-15T10:30:00Z"
};
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Object Type Best Practices:**
- Inline tipi sadece tek seferlik ve çok küçük objeler için kullan
- Tekrar kullanılacaksa `interface` veya `type` ile isimlendir
- Interface isimlerini **PascalCase** yaz: `User`, `Order`, `ApiResponse`
- Büyük iç içe objeleri ayrı interface'lere böl — hem okunabilir hem tekrar kullanılabilir
- Proje genelinde tutarlı ol: hep `interface` ya da hep `type` — karıştırma

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Büyük projelerde inline obje tipi — okunaksız, tekrar kullanılamaz
function processOrder(order: {
    id: number;
    customer: { name: string; email: string; address: { city: string; country: string } };
    items: { productId: number; quantity: number; price: number }[];
    total: number;
}): void { ... }

// ✅ Bunun yerine — ayrı interface'ler
function processOrder2(order: Order): void { ... }

// ❌ Obje alanına güvenerek kontrol etmeden erişmek
function showCity(user: User): void {
    console.log(user.address.city); // address optional ise patlar
}
// ✅ Güvenli:
console.log(user.address?.city ?? "Belirtilmemiş");
```

</div>

<hr class="section-divider">

## 📋 Özet

| Yöntem | Syntax | Kullanım |
|--------|--------|----------|
| Inline | `let x: { a: string }` | Tek kullanımlık, küçük |
| Interface | `interface X { a: string }` | API modeli, props, contract |
| Type alias | `type X = { a: string }` | Obje + union/tuple/alias |
