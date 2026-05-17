# Interface

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
`interface` nedir, nasıl tanımlanır, `extends` ile nasıl genişletilir, declaration merging nedir ve gerçek projelerde nerede kullanılır.

</div>

---

## 📖 Interface Nedir?

Interface, bir objenin **hangi alanlara sahip olacağını ve bu alanların tiplerini** tanımlayan bir sözleşmedir (contract). TypeScript'te arayüz olarak da adlandırılır.

Bir benzetme: Interface, bir formun hangi alanları doldurmak zorunda olduğunu söyleyen şablondur. Formu doldurmak zorunda olan kişi (obje), şablona (interface) uymak zorundadır.

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
}

// ✅ Tüm alanlar dolu — geçerli
const user1: User = {
    id: 1,
    name: "Yunus",
    email: "yunus@mail.com",
    isActive: true
};

// ❌ email eksik — hata
// const user2: User = { id: 2, name: "Ahmet", isActive: true };

// ❌ Fazla alan — hata (excess property check)
// const user3: User = { id: 3, name: "Mehmet", email: "m@m.com", isActive: true, phone: "555" };
```

<hr class="section-divider">

## 📖 Interface Extends — Miras Alma

Interface, başka interface'leri `extends` edebilir. Bu, tekrar eden alanları merkeze alır:

```typescript
// Temel model — her entity'de bulunur
interface BaseEntity {
    id: number;
    createdAt: string;
    updatedAt: string;
}

// BaseEntity'i genişletiyoruz
interface User extends BaseEntity {
    name: string;
    email: string;
    role: "admin" | "editor" | "viewer";
}

// User artık şuna eşit:
// { id, createdAt, updatedAt, name, email, role }

const user: User = {
    id: 1,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-15",
    name: "Yunus",
    email: "yunus@mail.com",
    role: "admin"
};

// Birden fazla interface extends
interface Timestamped {
    createdAt: string;
}

interface Identifiable {
    id: number;
}

interface Product extends Identifiable, Timestamped {
    name: string;
    price: number;
    stock: number;
}
// Product = { id, createdAt, name, price, stock }
```

<div class="callout callout-tip">

**✅ BaseEntity Pattern — Büyük Projelerde Standart**

Her veritabanı kaydında `id`, `createdAt`, `updatedAt` genellikle bulunur. Bunları `BaseEntity` olarak merkeze al:

```typescript
interface BaseEntity {
    id: number;
    createdAt: string;
    updatedAt: string;
}

// Tüm entity'ler buradan türer
interface User    extends BaseEntity { name: string; email: string; }
interface Product extends BaseEntity { name: string; price: number; }
interface Order   extends BaseEntity { userId: number; total: number; }
```

Bu sayede `id`'nin tipi değişirse (örn: `number` → `string`) sadece bir yerde değiştirirsin.

</div>

<hr class="section-divider">

## 📖 Interface Declaration Merging

Aynı isimde iki interface tanımlarsan TypeScript bunları birleştirir:

```typescript
interface Product {
    name: string;
}

interface Product {
    price: number;
}

// Sonuç: her ikisi de zorunlu
const laptop: Product = { name: "MacBook", price: 35000 }; // ✅
```

<div class="callout callout-warning">

**⚠️ Declaration Merging Ne Zaman Kullanılır?**

Bu özellik genellikle **kütüphane geliştirmede** kullanılır — mevcut kütüphanenin tip tanımına alan eklemek için:

```typescript
// Express Request objesine custom alan ekleme
declare namespace Express {
    interface Request {
        currentUser?: User;
    }
}
```

Uygulama kodunda declaration merging kullanmaktan kaçın — kafa karıştırır. Interface yerine `extends` kullan.

</div>

<hr class="section-divider">

## 📖 Fonksiyon Tanımı Interface İçinde

```typescript
interface Calculator {
    add(a: number, b: number): number;
    subtract(a: number, b: number): number;
    multiply(a: number, b: number): number;
}

const calc: Calculator = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    multiply: (a, b) => a * b
};
```

<hr class="section-divider">

## 📖 Interface ile Class Kontratı

Interface, class'ların hangi metodları ve alanları uygulayacağını belirler (`implements`):

```typescript
interface Serializable {
    serialize(): string;
    deserialize(data: string): void;
}

interface Validatable {
    validate(): boolean;
    getErrors(): string[];
}

// Class iki interface'i birden implement eder
class UserModel implements Serializable, Validatable {
    constructor(
        public name: string,
        public email: string
    ) {}

    serialize(): string {
        return JSON.stringify({ name: this.name, email: this.email });
    }

    deserialize(data: string): void {
        const parsed = JSON.parse(data);
        this.name = parsed.name;
        this.email = parsed.email;
    }

    validate(): boolean {
        return this.name.length > 0 && this.email.includes("@");
    }

    getErrors(): string[] {
        const errors: string[] = [];
        if (!this.name) errors.push("İsim gerekli");
        if (!this.email.includes("@")) errors.push("Geçerli email girin");
        return errors;
    }
}

const user = new UserModel("Yunus", "yunus@mail.com");
console.log(user.validate());   // true
console.log(user.serialize());  // '{"name":"Yunus","email":"yunus@mail.com"}'
```

<hr class="section-divider">

## 🏭 Real-World Kullanım

<div class="callout callout-real-world">

**🏭 API Response Modelleri — NestJS/Express**

```typescript
// Temel entity
interface BaseEntity {
    id: number;
    createdAt: string;
    updatedAt: string;
}

// Domain modelleri
interface UserEntity extends BaseEntity {
    name: string;
    email: string;
    passwordHash: string;
    role: "admin" | "editor" | "viewer";
    isActive: boolean;
}

interface PostEntity extends BaseEntity {
    title: string;
    content: string;
    authorId: number;
    isPublished: boolean;
    tags: string[];
}

// Repository contract — her repository bu interface'i implement eder
interface Repository<T extends BaseEntity> {
    findById(id: number): Promise<T | null>;
    findAll(): Promise<T[]>;
    create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;
    update(id: number, data: Partial<T>): Promise<T>;
    delete(id: number): Promise<void>;
}

// Servis contract
interface UserService {
    getUser(id: number): Promise<UserEntity>;
    getUsers(page?: number, limit?: number): Promise<UserEntity[]>;
    createUser(data: { name: string; email: string; password: string }): Promise<UserEntity>;
    updateUser(id: number, data: Partial<UserEntity>): Promise<UserEntity>;
    deleteUser(id: number): Promise<void>;
}
```

</div>

<div class="callout callout-real-world">

**🏭 React Component Props — Interface Kullanımı**

```typescript
// Her bileşenin props'u interface ile tanımlanır
interface ButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: "primary" | "secondary" | "danger";
    size?: "sm" | "md" | "lg";
    className?: string;
}

interface CardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

// Bileşeni kullanan geliştirici hangi prop'ları verebileceğini bilir
// IDE'de otomatik tamamlama çalışır
// Yanlış prop vermek compile hatasına neden olur
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Interface Best Practices:**
- İsim **PascalCase**: `User`, `Product`, `ApiResponse` — küçük harf olmaz
- Ortak alanları `BaseEntity` gibi temel interface'e topla
- React props için `ComponentNameProps` isimlendirmesi: `ButtonProps`, `CardProps`
- `extends` ile miras al — declaration merging'den kaçın
- Çok büyük interface'leri daha küçük interface'lere böl
- `interface` ile sadece obje şekli tanımla — union type için `type` kullan

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Çok büyük interface — her şeyi bir arada
interface Everything {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
    permissions: string[];
    address: { city: string; country: string };
    orders: { id: number; total: number }[];
    // 20 tane daha alan...
}
// ✅ Bunun yerine: ayrı interface'ler, BaseEntity pattern

// ❌ Interface ile union type — interface yapamaz
// interface Status = "active" | "inactive"; // SYNTAX HATASI

// ❌ Uygulama kodunda declaration merging
interface User { name: string; }
interface User { email: string; } // kafa karıştırır — bunun yerine extends kullan

// ❌ Küçük harfli interface ismi
interface user { name: string; } // PascalCase olmalı: User
```

</div>

<hr class="section-divider">

## 📋 Özet

| Özellik | Interface | Açıklama |
|---------|-----------|----------|
| Tanım | `interface X { }` | Obje şekli tanımlar |
| Miras | `extends Y` | Başka interface'i genişletir |
| Çoklu miras | `extends Y, Z` | Birden fazla interface'den devralır |
| Class kontratı | `implements X` | Class'a "şunu uygula" der |
| Declaration merging | Aynı isim iki kez | Otomatik birleşir (kütüphane yazımında) |
| Union type | ❌ | Interface yapamaz, `type` kullan |
