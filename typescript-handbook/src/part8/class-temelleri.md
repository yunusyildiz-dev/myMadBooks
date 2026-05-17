# Class Temelleri

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
TypeScript'te class tanımı, constructor, method yazımı ve "parameter properties" kısayolu. Class ne zaman kullanılır, ne zaman düz fonksiyon daha iyidir?

</div>

---

## 📖 Class Nedir ve Ne Zaman Kullanılır?

TypeScript'te `class` hem JavaScript class'ı hem de bir tip tanımıdır. Class, **durum (state) ve davranış (method)** birlikte kapsüllenmesi gerektiğinde kullanılır:

```
Ne zaman class → Servis, Repository, Model (state + methods birlikte)
Ne zaman function → Sadece dönüşüm yapıyorsan, state yoksa
```

Frontend'de React hook'ları class'ın yerini almıştır. Ama backend (Node.js, NestJS), servis katmanı, repository pattern ve kütüphane kodunda class hala birinci sınıf vatandaştır.

<hr class="section-divider">

## 📖 Temel Class Tanımı

```typescript
class User {
    // Alanlar üstte tanımlanır — okunabilirlik için
    id: number;
    name: string;
    email: string;
    createdAt: string;

    constructor(id: number, name: string, email: string) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.createdAt = new Date().toISOString();
    }

    // Method — this.name gibi alanlara erişir
    greet(): string {
        return `Merhaba, ben ${this.name}!`;
    }

    // Method — dışarıya obje olarak ver
    toJSON(): object {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            createdAt: this.createdAt
        };
    }
}

const user = new User(1, "Yunus", "yunus@mail.com");
console.log(user.greet());   // → "Merhaba, ben Yunus!"
console.log(user.toJSON());  // → { id: 1, name: "Yunus", ... }
console.log(user instanceof User); // → true
```

<hr class="section-divider">

## 📖 Parameter Properties — Kısa Yol

TypeScript'e özgü bir özellik: constructor parametrelerine `public`, `private`, `protected`, veya `readonly` ekleyince alan tanımı + atama otomatik yapılır:

```typescript
// Uzun yol — alan tanımla, sonra ata
class UserLong {
    id: number;
    name: string;
    private email: string;

    constructor(id: number, name: string, email: string) {
        this.id = id;
        this.name = name;
        this.email = email; // 3 satır atama
    }
}

// ✅ Kısa yol — parameter properties
class UserShort {
    createdAt: string; // constructor'da üretilenler hâlâ dışarıda

    constructor(
        public id: number,     // public alan — this.id = id otomatik
        public name: string,   // public alan
        private email: string  // private alan — dışarıdan erişilemez
    ) {
        this.createdAt = new Date().toISOString();
    }

    getEmail(): string {
        return this.email; // private — sadece class içi
    }
}

const u = new UserShort(1, "Yunus", "yunus@mail.com");
console.log(u.id);       // ✅ public
console.log(u.name);     // ✅ public
// console.log(u.email); // ❌ private — erişilemez
console.log(u.getEmail()); // ✅ method üzerinden
```

<hr class="section-divider">

## 📖 Class Ne Zaman Kullanılır?

```typescript
// ✅ Class için iyi senaryo — state + methods birlikte
class ShoppingCart {
    private items: Array<{ id: number; price: number; qty: number }> = [];

    addItem(id: number, price: number, qty: number = 1): void {
        const existing = this.items.find(i => i.id === id);
        if (existing) {
            existing.qty += qty;
        } else {
            this.items.push({ id, price, qty });
        }
    }

    removeItem(id: number): void {
        this.items = this.items.filter(i => i.id !== id);
    }

    get total(): number {
        return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    }

    get count(): number {
        return this.items.reduce((sum, i) => sum + i.qty, 0);
    }

    clear(): void {
        this.items = [];
    }
}

const cart = new ShoppingCart();
cart.addItem(1, 100, 2);   // ürün 1, 100₺, 2 adet
cart.addItem(2, 50);       // ürün 2, 50₺, 1 adet
console.log(cart.total);   // → 250
console.log(cart.count);   // → 3
```

```typescript
// ✅ Fonksiyon için iyi senaryo — sadece dönüşüm, state yok
function formatUser(user: User): string {
    return `${user.name} <${user.email}>`;
}

function sortUsersByName(users: User[]): User[] {
    return [...users].sort((a, b) => a.name.localeCompare(b.name));
}
```

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Class Best Practices:**
- Class ismi PascalCase: `UserService`, `ProductRepository`
- Constructor'da sadece atama yap — iş mantığı method'lara gider
- Alanları constructor üstünde tanımla — okunabilirlik için
- Parameter properties kullan — boilerplate azaltır
- Eğer state yoksa class yerine fonksiyon tercih et

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Constructor'da iş mantığı
class BadService {
    constructor() {
        this.init(); // ❌ async işlem constructor'da olamaz
        this.validate(); // ❌ karmaşık mantık constructor'da olmamalı
    }
}

// ❌ State olmayan class — fonksiyon yeterli
class StringUtils {
    capitalize(s: string): string { return s[0].toUpperCase() + s.slice(1); }
    // ✅ Bunu class'a koymak gerekmez — direkt fonksiyon yaz
}

// ❌ PascalCase ihlali
class userService {} // ✅ UserService
```

</div>

<hr class="section-divider">

## 📋 Özet

| Kavram | Syntax | Kullanım |
|--------|--------|----------|
| Class tanımı | `class Foo { }` | State + behavior kapsülleme |
| Constructor | `constructor(param) { this.x = param }` | Başlangıç değerleri |
| Method | `greet(): string { }` | Davranış tanımı |
| Parameter property | `constructor(public name: string)` | Alan + atama kısayolu |
| `new` | `const x = new User(1, "A")` | Instance oluşturma |
