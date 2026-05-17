# Inheritance & Abstract Class

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
`extends` ile kalıtım, `super()` ile parent constructor çağrısı, `implements` ile interface kontratı, `abstract class` ile template method pattern. Hangi durumda hangisini kullanacaksın?

</div>

---

## 📖 extends — Kalıtım

`extends`, bir class'ın başka bir class'ın tüm özelliklerini miras almasını sağlar. "Bu class, o class'ın bir türüdür" (is-a) ilişkisinde kullanılır:

```typescript
class BaseEntity {
    readonly id: number;
    readonly createdAt: string;
    updatedAt: string;

    constructor(id: number) {
        this.id = id;
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    // Alt class'lar kullanır
    touch(): void {
        this.updatedAt = new Date().toISOString();
    }

    toString(): string {
        return `[${this.constructor.name}] id:${this.id}`;
    }
}

class UserEntity extends BaseEntity {
    constructor(
        id: number,
        public name: string,
        public email: string,
        private password: string
    ) {
        super(id); // parent constructor — extends kullanınca şart
    }

    // Method override — parent toString'i ezer
    toString(): string {
        return `[User] ${this.name} <${this.email}>`;
    }

    verifyPassword(input: string): boolean {
        return this.password === input; // gerçekte hash karşılaştırılır
    }
}

class AdminEntity extends UserEntity {
    constructor(
        id: number,
        name: string,
        email: string,
        password: string,
        public permissions: string[]
    ) {
        super(id, name, email, password); // UserEntity constructor'ını çağır
    }

    hasPermission(permission: string): boolean {
        return this.permissions.includes(permission);
    }

    toString(): string {
        return `[Admin] ${this.permissions.length} izin`;
    }
}

const admin = new AdminEntity(1, "Yunus", "y@mail.com", "hash", ["read", "write"]);
console.log(admin.toString());              // → "[Admin] 2 izin"
console.log(admin.hasPermission("write")); // → true
console.log(admin.createdAt);             // ✅ BaseEntity'den gelir
admin.touch();                             // ✅ BaseEntity methodu
console.log(admin instanceof AdminEntity); // → true
console.log(admin instanceof UserEntity);  // → true (kalıtım zinciri)
console.log(admin instanceof BaseEntity);  // → true
```

<div class="callout callout-warning">

**⚠️ extends Kural: İlk Satır super() Olmalı**

Alt class constructor'ında `this`'e erişmeden önce `super()` çağrılmalıdır. Yoksa derleme hatası verir.

```typescript
class Child extends Parent {
    constructor() {
        // this.x = 5; // ❌ hata — super() önce çağrılmalı
        super();
        this.x = 5; // ✅
    }
}
```

</div>

<hr class="section-divider">

## 📖 implements — Interface Kontratı

`implements`, bir class'ın belirli bir interface'in tüm metodlarını ve alanlarını karşılaması gerektiğini söyler. "Bu class bu işleri yapabilir" (can-do) ilişkisidir:

```typescript
interface IUserRepository {
    findById(id: number): Promise<UserEntity | null>;
    findAll(): Promise<UserEntity[]>;
    save(user: UserEntity): Promise<UserEntity>;
    delete(id: number): Promise<void>;
}

// PostgreSQL implementasyonu
class PostgresUserRepository implements IUserRepository {
    async findById(id: number): Promise<UserEntity | null> {
        console.log(`DB: SELECT user ${id}`);
        return null; // gerçekte: DB sorgusu
    }

    async findAll(): Promise<UserEntity[]> {
        return []; // gerçekte: DB sorgusu
    }

    async save(user: UserEntity): Promise<UserEntity> {
        console.log(`DB: INSERT/UPDATE user ${user.id}`);
        return user;
    }

    async delete(id: number): Promise<void> {
        console.log(`DB: DELETE user ${id}`);
    }
}

// Mock implementasyon — test için (DB'ye bağlanmaz)
class MockUserRepository implements IUserRepository {
    private users: UserEntity[] = [];

    async findById(id: number): Promise<UserEntity | null> {
        return this.users.find(u => u.id === id) ?? null;
    }

    async findAll(): Promise<UserEntity[]> { return this.users; }

    async save(user: UserEntity): Promise<UserEntity> {
        this.users.push(user);
        return user;
    }

    async delete(id: number): Promise<void> {
        this.users = this.users.filter(u => u.id !== id);
    }
}

// Dependency Injection — interface tipi kullan
class UserService {
    constructor(private userRepo: IUserRepository) {} // interface — herhangi bir impl çalışır

    async getUser(id: number): Promise<UserEntity | null> {
        return this.userRepo.findById(id);
    }
}

// Production — gerçek DB
const prodService = new UserService(new PostgresUserRepository());

// Test — mock ile (DB gerekmez)
const testService = new UserService(new MockUserRepository());
```

### extends vs implements

```
extends  → "Ben şuyum" — kimlik, "is-a"
           Bir class tek bir class extend edebilir

implements → "Ben şunu yapabilirim" — yetenek, kontrat, "can-do"
              Bir class birden fazla interface implement edebilir
```

```typescript
// Birden fazla interface implement etmek
interface ILoggable {
    log(message: string): void;
}

interface ISerializable {
    toJSON(): object;
    fromJSON(json: object): void;
}

class CompleteService extends BaseEntity implements ILoggable, ISerializable {
    // extends + implements birlikte kullanılabilir
    log(message: string): void { console.log(message); }
    toJSON(): object { return { id: this.id }; }
    fromJSON(json: object): void { /* ... */ }
}
```

<hr class="section-divider">

## 📖 Abstract Class — Yarı Hazır Template

`abstract class` doğrudan `new` ile oluşturulamaz — sadece `extends` edilir. Hem implementasyonu olan metodlar hem de alt class'ların dolduracağı `abstract` metodlar içerebilir:

```typescript
abstract class BaseRepository<T extends BaseEntity> {
    // Ortak implementasyon — her alt class kullanır
    protected items: T[] = [];

    findAll(): T[] {
        return [...this.items]; // kopya döndür — orijinali koru
    }

    findById(id: number): T | null {
        return this.items.find(item => item.id === id) ?? null;
    }

    delete(id: number): void {
        this.items = this.items.filter(item => item.id !== id);
    }

    count(): number {
        return this.items.length;
    }

    // Abstract — her alt class kendi implementasyonunu YAZAR (zorunlu)
    abstract save(item: T): T;
    abstract validate(item: T): boolean;
}

class ProductEntity extends BaseEntity {
    constructor(id: number, public name: string, public price: number) {
        super(id);
    }
}

class ProductRepository extends BaseRepository<ProductEntity> {
    // abstract save'i implement et — zorunlu
    save(product: ProductEntity): ProductEntity {
        const existing = this.findById(product.id);
        if (existing) {
            const index = this.items.indexOf(existing);
            this.items[index] = product;
        } else {
            this.items.push(product);
        }
        product.touch();
        return product;
    }

    // abstract validate'i implement et — zorunlu
    validate(product: ProductEntity): boolean {
        return product.price > 0 && product.name.length > 0;
    }

    // Spesifik method — sadece Product'ta var
    findByPriceRange(min: number, max: number): ProductEntity[] {
        return this.items.filter(p => p.price >= min && p.price <= max);
    }
}

const repo = new ProductRepository();
const p1 = new ProductEntity(1, "Laptop", 2000);
const p2 = new ProductEntity(2, "Mouse", 150);

repo.save(p1);
repo.save(p2);
console.log(repo.count());                      // → 2
console.log(repo.findById(1)?.name);            // → "Laptop"
console.log(repo.findByPriceRange(100, 500));  // → [Mouse]

// new BaseRepository(); // ❌ hata — abstract class doğrudan oluşturulamaz
```

### Interface vs Abstract Class

```
interface:
  - Sadece kontrat — implementasyon yok
  - Birden fazla implement edilebilir
  - Runtime'da silinir (sadece tip)
  - Hafif, minimal

abstract class:
  - Kısmi implementasyon + kontrat
  - Tek extends edilebilir
  - Runtime'da var (prototype zinciri)
  - Ortak kod paylaşımı gerektiğinde
```

<hr class="section-divider">

## 🏭 Real-World: Error Hiyerarşisi

<div class="callout callout-real-world">

**🏭 Tip Güvenli Hata Hiyerarşisi**

```typescript
// Base error — ortak özellikler
abstract class AppError extends Error {
    abstract readonly code: string;
    readonly timestamp: string;

    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        this.timestamp = new Date().toISOString();
    }

    // Ortak implementasyon — tüm alt class'lar kullanır
    toJSON(): object {
        return {
            code: this.code,
            message: this.message,
            timestamp: this.timestamp
        };
    }
}

class NetworkError extends AppError {
    readonly code = "NETWORK_ERROR";

    constructor(message: string, public statusCode: number) {
        super(message);
    }
}

class ValidationError extends AppError {
    readonly code = "VALIDATION_ERROR";

    constructor(message: string, public fields: Record<string, string>) {
        super(message);
    }
}

class AuthError extends AppError {
    readonly code = "AUTH_ERROR";

    constructor() {
        super("Yetkilendirme gerekli");
    }
}

// Merkezi hata işleyici
function handleAppError(error: unknown): void {
    if (error instanceof NetworkError) {
        console.error(`[${error.code}] ${error.statusCode}: ${error.message}`);
    } else if (error instanceof ValidationError) {
        console.error(`[${error.code}]`, error.fields);
    } else if (error instanceof AuthError) {
        window.location.href = "/login";
    } else if (error instanceof AppError) {
        console.error(error.toJSON()); // toJSON hepsinde var
    }
}
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Inheritance / Abstract Best Practices:**
- `is-a` ilişkisi varsa `extends` kullan: Admin bir User'dır ✅
- `can-do` ilişkisi varsa `implements` kullan: Service email gönderebilir ✅
- Derin kalıtım hiyerarşisinden kaçın — 2-3 seviye maksimum
- Ortak kod paylaşılacaksa `abstract class`, sadece kontrat için `interface`
- Her `extends` için Liskov Substitution ilkesini düşün: alt class, parent yerine geçebilmeli

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ "has-a" için extends kullanmak — composition daha iyi
class Car extends Engine {} // ❌ Car bir Engine değil — Engine'e sahip
class Car { constructor(private engine: Engine) {} } // ✅ composition

// ❌ Çok derin hiyerarşi
class A extends B extends C extends D extends E {} // ❌ bakımı çok zor

// ❌ Abstract class'ı interface gibi kullanmak (hiç implementasyon yoksa)
abstract class NoImpl {
    abstract doA(): void;
    abstract doB(): void;
    // Hiç implementasyon yok → interface kullan
}
// ✅ interface INoImpl { doA(): void; doB(): void; }

// ❌ Liskov ihlali — alt class, parent davranışını bozuyor
class Rectangle { setWidth(w: number) {} setHeight(h: number) {} }
class Square extends Rectangle {
    setWidth(w: number) { super.setWidth(w); super.setHeight(w); } // ❌ beklenmedik davranış
}
```

</div>

<hr class="section-divider">

## 📋 Özet

| Kavram | Syntax | Kullanım |
|--------|--------|----------|
| `extends` | `class A extends B` | is-a — kalıtım, miras |
| `super()` | `super(params)` | Parent constructor çağrısı |
| `implements` | `class A implements I` | can-do — kontrat |
| `abstract class` | `abstract class A` | Kısmi impl + kontrat, new yapılamaz |
| `abstract method` | `abstract doX(): T` | Alt class'ın dolduracağı boşluk |

```
Sadece kontrat    → interface
Ortak kod + kontrat → abstract class
Tam implementasyon  → concrete class (extends veya implements)
is-a ilişkisi       → extends
can-do ilişkisi     → implements
```
