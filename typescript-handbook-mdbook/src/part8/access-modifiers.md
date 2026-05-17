# Access Modifiers

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
`public`, `private`, `protected` erişim belirteçleri. Class dışından neyin görüneceğini kontrol etmek. "En az yetki" prensibi ve encapsulation (kapsülleme).

</div>

---

## 📖 Üç Erişim Seviyesi

TypeScript'te her alan ve method için erişim seviyesi belirlenebilir:

| Modifier | Erişim | Ne zaman |
|----------|--------|----------|
| `public` | Her yerden | Dışarıya açık API, metodlar |
| `private` | Sadece aynı class | İç state, helper method, hassas veri |
| `protected` | Aynı class + alt class'lar | Alt class'ın kullanacağı ama dışarıya kapalı |

**Varsayılan: `public`.** Explicit yazmak gerekmez ama okunabilirlik için tercih edilir.

<hr class="section-divider">

## 📖 Banka Hesabı Örneği

```typescript
class BankAccount {
    public readonly id: string;           // dışarıdan okunabilir, değiştirilemez
    private balance: number;              // sadece class içi — dışarı kapalı
    private transactionHistory: string[];
    protected ownerName: string;          // alt class'lar erişebilir

    constructor(ownerName: string, initialBalance: number = 0) {
        this.id = Math.random().toString(36).slice(2);
        this.ownerName = ownerName;
        this.balance = initialBalance;
        this.transactionHistory = [];
    }

    // Public method — dışarıya açık API
    deposit(amount: number): void {
        if (amount <= 0) throw new Error("Miktar pozitif olmalı");
        this.balance += amount;
        this.logTransaction(`+${amount}`); // private methodu çağırır
    }

    withdraw(amount: number): void {
        if (amount > this.balance) throw new Error("Yetersiz bakiye");
        this.balance -= amount;
        this.logTransaction(`-${amount}`);
    }

    getBalance(): number {
        return this.balance; // private alanı kontrollü olarak dışarı ver
    }

    // Private method — sadece class içi yardımcı, dışarıya kapalı
    private logTransaction(entry: string): void {
        const timestamp = new Date().toISOString();
        this.transactionHistory.push(`${timestamp}: ${entry}`);
    }

    // Protected method — alt class'lar override edebilir, dışarısı göremez
    protected formatBalance(): string {
        return `${this.balance.toFixed(2)} ₺`;
    }
}

const account = new BankAccount("Yunus", 1000);
account.deposit(500);
account.withdraw(200);

console.log(account.id);           // ✅ public readonly
console.log(account.getBalance()); // ✅ → 1300 (public method)
// account.balance;                // ❌ private — derleme hatası
// account.logTransaction("...");  // ❌ private — derleme hatası
// account.ownerName;              // ❌ protected — sadece alt class
```

<hr class="section-divider">

## 📖 Protected — Kalıtım ile Kullanım

`protected` alan ve metodlar, alt class'lardan erişilebilir ama dışarıdan kapalıdır:

```typescript
class SavingsAccount extends BankAccount {
    private interestRate: number;

    constructor(ownerName: string, initialBalance: number, interestRate: number) {
        super(ownerName, initialBalance);
        this.interestRate = interestRate;
    }

    // ownerName'e erişebiliriz — protected
    getStatement(): string {
        return `${this.ownerName} hesabı — Bakiye: ${this.formatBalance()}`;
        //       ↑ protected alan             ↑ protected method
    }

    applyInterest(): void {
        const interest = this.getBalance() * this.interestRate;
        this.deposit(interest); // public method
        console.log(`Faiz eklendi: +${interest.toFixed(2)} ₺`);
    }
}

const savings = new SavingsAccount("Yunus", 5000, 0.05);
console.log(savings.getStatement()); // ✅
// savings.ownerName; // ❌ protected — dışarıdan hata
```

<hr class="section-divider">

## 📖 JavaScript Native Private Field (#)

TypeScript `private` sadece derleme zamanı kontrolüdür — JavaScript runtime'da korumasızdır. Gerçek runtime koruması için JavaScript'in `#` syntax'ını kullan:

```typescript
// TypeScript private — JS runtime'da erişilebilir (konsol, reflection)
class Config1 {
    private apiKey: string;
    constructor(key: string) { this.apiKey = key; }
}
// (config1 as any).apiKey — runtime'da erişilebilir!

// ✅ JavaScript native private — runtime'da gerçekten korumalı
class SecureConfig {
    #apiKey: string; // # prefix — JavaScript private field

    constructor(apiKey: string) {
        this.#apiKey = apiKey;
    }

    getHeaders(): Record<string, string> {
        return { Authorization: `Bearer ${this.#apiKey}` };
    }
}

const config = new SecureConfig("sk-secret-key");
config.getHeaders(); // ✅
// config.#apiKey; // ❌ syntax hata — runtime'da da erişilemez
// (config as any)["#apiKey"]; // ❌ undefined — gerçekten gizli
```

**Hassas veri** (API key, token, şifre) için `#` kullan. Diğer iç state için TypeScript `private` yeterlidir.

<hr class="section-divider">

## 🏭 Real-World: UserService Encapsulation

<div class="callout callout-real-world">

**🏭 Servis Katmanı — Encapsulation**

```typescript
interface IUserRepository {
    findById(id: number): Promise<{ id: number; name: string; email: string; passwordHash: string } | null>;
    save(user: { id: number; name: string; email: string; passwordHash: string }): Promise<void>;
}

class UserService {
    // Dışarıya kapalı bağımlılıklar
    private readonly repo: IUserRepository;
    private readonly saltRounds = 12;

    constructor(repo: IUserRepository) {
        this.repo = repo;
    }

    // Public API — dışarıya açık
    async register(name: string, email: string, password: string): Promise<{ id: number; name: string; email: string }> {
        this.validateEmail(email);        // private
        this.validatePassword(password);  // private

        const hash = await this.hashPassword(password); // private
        const user = { id: Date.now(), name, email, passwordHash: hash };
        await this.repo.save(user);

        // passwordHash dışarıya verilmez
        return { id: user.id, name, email };
    }

    async login(email: string, password: string): Promise<boolean> {
        const user = await this.findByEmail(email); // private
        if (!user) return false;
        return this.verifyPassword(password, user.passwordHash); // private
    }

    // Private helper'lar — dışarıya kapalı
    private validateEmail(email: string): void {
        if (!email.includes("@")) throw new Error("Geçersiz email");
    }

    private validatePassword(password: string): void {
        if (password.length < 8) throw new Error("Şifre en az 8 karakter");
    }

    private async hashPassword(password: string): Promise<string> {
        return `hash:${password}:${this.saltRounds}`; // gerçekte bcrypt
    }

    private async verifyPassword(password: string, hash: string): Promise<boolean> {
        return hash === `hash:${password}:${this.saltRounds}`;
    }

    private async findByEmail(email: string) {
        // Gerçekte DB sorgusu — şimdi stub
        return null;
    }
}
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Access Modifier Best Practices:**
- Varsayılan olarak her şeyi `private` başlat, gerektiğinde aç — "en az yetki" prensibi
- Dışarıya açık API metodlarını `public` olarak imzala — netlik için
- Alt class'ların kullanacağı ama dışarıya kapalı şeyler için `protected`
- API key, token, şifre hash için `#` (JavaScript native private) kullan
- `private` metodlar class'ın altına yaz — public API'yi üstte tut

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Her şeyi public bırakmak
class BadUser {
    password: string; // ❌ public — herkes okuyabilir ve yazabilir
    balance: number;  // ❌ public — doğrudan değiştirilebilir, kontrol yok
}
// ✅ Doğru: private + getter/setter

// ❌ TypeScript private'ı güvenlik için kullanmak
class Config {
    private secretKey = "sk-123"; // ❌ runtime'da erişilebilir
}
// ✅ Hassas veri için #secretKey kullan

// ❌ Protected'ı her şey için kullanmak
class Base {
    protected doEverything(): void {} // ❌ gereğinden fazla erişim
    // protected sadece gerçekten alt class'ın ihtiyaç duyduğu şeyler için
}
```

</div>

<hr class="section-divider">

## 📋 Özet

| Modifier | Erişim | Runtime Koruması | Kullanım |
|----------|--------|------------------|----------|
| `public` | Her yer | Yok | Dışarıya açık API |
| `private` | Sadece class | Yok (JS'te erişilebilir) | İç state, helper |
| `protected` | Class + alt class | Yok | Kalıtım için |
| `#field` | Sadece class | Var (gerçek gizlilik) | Hassas veri |
| `readonly` | Her yer (okuma) | Yok | Değişmez değer |
