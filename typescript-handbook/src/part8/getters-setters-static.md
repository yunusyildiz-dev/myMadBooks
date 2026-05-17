# Getters, Setters & Static

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
`get` / `set` ile private alana kontrollü erişim. Hesaplanmış özellikler. `static` ile class'a ait alanlar ve metodlar. Singleton pattern ve factory method.

</div>

---

## 📖 Getter — Hesaplanmış Özellik

`get` keyword'ü ile tanımlanan metodlar, dışarıdan property gibi görünür ama içeride metod gibi çalışır. Hesaplanmış değerler için idealdir:

```typescript
class Person {
    private _firstName: string;
    private _lastName: string;
    private _age: number;
    private _email: string;

    constructor(firstName: string, lastName: string, age: number, email: string) {
        this._firstName = firstName;
        this._lastName = lastName;
        this._age = age;
        this._email = email;
    }

    // Getter — birden fazla alandan türetilen hesaplanmış değer
    get fullName(): string {
        return `${this._firstName} ${this._lastName}`;
    }

    // Computed boolean
    get isAdult(): boolean {
        return this._age >= 18;
    }
}

const person = new Person("Yunus", "Yıldız", 25, "yunus@mail.com");
console.log(person.fullName); // → "Yunus Yıldız" (method gibi değil, property gibi)
console.log(person.isAdult);  // → true
// person.fullName = "...";   // ❌ setter yok — sadece getter
```

<hr class="section-divider">

## 📖 Setter — Validation ile Atama

`set` ile private alana kontrollü yazma sağlanır. Validation, normalization ve yan etki burada yapılır:

```typescript
class Person {
    // ... yukarıdaki alanlar ...

    // Getter & Setter çifti — kontrollü erişim
    get age(): number {
        return this._age;
    }

    set age(value: number) {
        if (value < 0 || value > 150) {
            throw new Error("Geçersiz yaş değeri");
        }
        this._age = value; // validation geçtikten sonra ata
    }

    get email(): string {
        return this._email;
    }

    set email(value: string) {
        if (!value.includes("@")) {
            throw new Error("Geçersiz email formatı");
        }
        this._email = value.toLowerCase(); // normalization — küçük harfe çevir
    }
}

const person = new Person("Yunus", "Yıldız", 25, "Yunus@Mail.com");
console.log(person.email);  // → "yunus@mail.com" (lowercase — normalization)

person.age = 30;            // ✅ setter çalışır
// person.age = -5;         // ❌ Error: Geçersiz yaş değeri
person.email = "yeni@mail.com"; // ✅ setter validate eder
// person.email = "geçersiz";   // ❌ Error: Geçersiz email formatı
```

### Lazy Computed Getter

```typescript
class ReportGenerator {
    private _data: number[];
    private _cachedTotal: number | null = null; // cache

    constructor(data: number[]) {
        this._data = data;
    }

    // Lazy getter — ilk erişimde hesapla, sonra cache'den döndür
    get total(): number {
        if (this._cachedTotal === null) {
            this._cachedTotal = this._data.reduce((a, b) => a + b, 0);
        }
        return this._cachedTotal;
    }

    get average(): number {
        return this._data.length > 0 ? this.total / this._data.length : 0;
    }
}
```

<hr class="section-divider">

## 📖 Static — Class'a Ait, Instance'a Değil

`static` alanlar ve metodlar instance'a değil class'a aittir. `new` gerekmeden `ClassName.method()` ile çağrılır:

```typescript
class AppConfig {
    // Static sabitler — class adıyla erişilir
    static readonly DEFAULT_TIMEOUT = 5000;
    static readonly MAX_RETRIES = 3;
    static readonly API_VERSION = "v2";

    readonly baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    // Static utility method — instance gerekmez
    static buildApiUrl(path: string, baseUrl: string): string {
        return `${baseUrl}/api/${AppConfig.API_VERSION}/${path}`;
    }
}

// Instance gerekmeden kullan
console.log(AppConfig.DEFAULT_TIMEOUT); // → 5000
console.log(AppConfig.MAX_RETRIES);     // → 3
console.log(AppConfig.buildApiUrl("users", "https://api.example.com"));
// → "https://api.example.com/api/v2/users"
```

### Singleton Pattern

Singleton, bir class'tan yalnızca bir instance oluşturulmasını garantiler:

```typescript
class Database {
    private static instance: Database | null = null;
    private connectionCount = 0;

    // private constructor — dışarıdan new yapılamaz
    private constructor(private connectionString: string) {}

    // Static factory method — tek instance
    static getInstance(connectionString?: string): Database {
        if (!Database.instance) {
            if (!connectionString) {
                throw new Error("İlk çağrıda connectionString gerekli");
            }
            Database.instance = new Database(connectionString);
        }
        return Database.instance;
    }

    query(sql: string): void {
        this.connectionCount++;
        console.log(`[Query #${this.connectionCount}] ${sql}`);
    }

    // Test için instance'ı sıfırla
    static reset(): void {
        Database.instance = null;
    }
}

// Kullanım — her zaman aynı instance döner
const db1 = Database.getInstance("postgres://localhost/mydb");
const db2 = Database.getInstance(); // bağlantı string'i gerekmez — zaten var

console.log(db1 === db2); // → true — aynı instance

db1.query("SELECT * FROM users");
db2.query("SELECT * FROM products");

// new Database("..."); // ❌ hata — private constructor
```

### Static Counter & Registry

```typescript
class ApiRequest {
    private static totalRequests = 0;
    private static activeRequests = 0;

    readonly requestId: number;

    constructor(public endpoint: string) {
        ApiRequest.totalRequests++;
        ApiRequest.activeRequests++;
        this.requestId = ApiRequest.totalRequests;
    }

    async execute(): Promise<void> {
        try {
            await fetch(this.endpoint);
        } finally {
            ApiRequest.activeRequests--;
        }
    }

    // Static — tüm instance'lar için genel bilgi
    static getStats(): { total: number; active: number } {
        return {
            total: ApiRequest.totalRequests,
            active: ApiRequest.activeRequests
        };
    }
}

const r1 = new ApiRequest("/api/users");
const r2 = new ApiRequest("/api/products");
console.log(ApiRequest.getStats()); // → { total: 2, active: 2 }
```

<hr class="section-divider">

## 🏭 Real-World: Product Fiyat Hesaplama

<div class="callout callout-real-world">

**🏭 Getter + Static + Singleton Kombinasyonu**

```typescript
class TaxConfig {
    private static instance: TaxConfig | null = null;
    private _vatRate: number;

    private constructor(vatRate: number) {
        this._vatRate = vatRate;
    }

    static getInstance(): TaxConfig {
        if (!TaxConfig.instance) {
            TaxConfig.instance = new TaxConfig(0.18); // %18 KDV
        }
        return TaxConfig.instance;
    }

    get vatRate(): number {
        return this._vatRate;
    }
}

class Product {
    private _basePrice: number;
    private _discountPercent: number = 0;
    private _quantity: number;

    constructor(
        public readonly name: string,
        basePrice: number,
        quantity: number = 1
    ) {
        this._basePrice = basePrice;
        this._quantity = quantity;
    }

    set discount(percent: number) {
        if (percent < 0 || percent > 100) throw new Error("Geçersiz indirim");
        this._discountPercent = percent;
    }

    get discount(): number {
        return this._discountPercent;
    }

    // Hesaplanmış değerler — getter
    get discountedPrice(): number {
        return this._basePrice * (1 - this._discountPercent / 100);
    }

    get totalWithVat(): number {
        const vatRate = TaxConfig.getInstance().vatRate;
        return this.discountedPrice * this._quantity * (1 + vatRate);
    }

    get priceLabel(): string {
        const vat = (this.discountedPrice * TaxConfig.getInstance().vatRate).toFixed(2);
        return `${this.discountedPrice.toFixed(2)} ₺ + ${vat} ₺ KDV`;
    }

    // Static factory
    static createWithDiscount(name: string, price: number, discount: number): Product {
        const product = new Product(name, price);
        product.discount = discount;
        return product;
    }
}

const laptop = Product.createWithDiscount("Laptop", 25000, 10); // %10 indirim
console.log(laptop.discountedPrice); // → 22500
console.log(laptop.totalWithVat);    // → 26550 (%18 KDV)
console.log(laptop.priceLabel);      // → "22500.00 ₺ + 4050.00 ₺ KDV"
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Getter / Setter / Static Best Practices:**
- Getter yan etki içermemeli — sadece oku veya hesapla, asla yaz
- Setter validation ve normalization yapabilir ama karmaşık iş mantığı koyma
- Her setter için bir getter olmalı — yarım çift anlamsız
- Private alanları `_` ile başlat — `_firstName`, `_email` (getter/setter ile çakışmasın)
- Singleton'ı sadece gerçekten tek instance olması gerektiğinde kullan (DB, Config)
- Static sabitler için `static readonly` kullan — magic string/number önle

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Getter'da yan etki
get userName(): string {
    this.logAccess(); // ❌ getter okunduğunda yan etki — beklenmedik
    return this._name;
}
// ✅ Sadece oku:
get userName(): string { return this._name; }

// ❌ Setter'da karmaşık iş mantığı
set email(value: string) {
    await this.sendVerificationEmail(value); // ❌ async setter — çalışmaz
    await this.updateDatabase(value);        // ❌ iş mantığı setter'da olmamalı
}
// ✅ Bunun için method kullan: async updateEmail(value: string): Promise<void>

// ❌ Singleton'ı her yerde kullanmak
class UserService {
    private static instance = new UserService(); // ❌ test edilmesi zor
    static getInstance() { return UserService.instance; }
}
// ✅ Dependency Injection tercih et

// ❌ Static'i state tutmak için kullanmak (Singleton değil)
class Counter {
    static count = 0; // ❌ global mutable state — test edilmesi zor
}
```

</div>

<hr class="section-divider">

## 📋 Özet

| Kavram | Syntax | Kullanım |
|--------|--------|----------|
| Getter | `get prop(): T { return ... }` | Hesaplanmış değer, private'a okuma |
| Setter | `set prop(v: T) { ... }` | Validation, normalization ile yazma |
| Static alan | `static count = 0` | Class geneli state, sabit |
| Static method | `static build(): T { }` | Factory, utility, Singleton |
| Singleton | `private static instance; static getInstance()` | DB, Config — tek instance |
