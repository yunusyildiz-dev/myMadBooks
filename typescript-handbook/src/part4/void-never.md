# void & never

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
`void`: değer döndürmeyen fonksiyonlar. `never`: hiçbir zaman tamamlanmayan fonksiyonlar. İkisi arasındaki kritik fark ve her birinin gerçek projelerde kullanımı.

</div>

---

## 📖 void — Değer Döndürmeyen Fonksiyonlar

`void`, bir fonksiyonun anlamlı bir değer döndürmediğini belirtir. Sadece iş yapar, bir şey hesaplamaz.

```typescript
// void — sadece iş yapar, return etmez
function logMessage(message: string): void {
    console.log(`[LOG]: ${message}`);
    // return yok — ya da return; yazılabilir (değersiz)
}

function saveUser(user: User): void {
    database.save(user);
    // bir şey döndürmüyor — sadece kaydetti
}

function sendNotification(userId: number, message: string): void {
    notificationService.send(userId, message);
}
```

### void ile Karşılaştırma

```typescript
// void — bir şey döndürmez
function printName(name: string): void {
    console.log(name);
}
const result1 = printName("Yunus"); // result1: void — kullanılamaz

// string döndürür
function formatName(name: string): string {
    return name.trim().toUpperCase();
}
const result2 = formatName("yunus"); // result2: string — "YUNUS"

// number döndürür
function getAge(): number {
    return 25;
}
const result3 = getAge(); // result3: number — 25
```

<div class="callout callout-tip">

**✅ void Ne Zaman Kullanılır?**

Çok yaygın — aşağıdakilerin hepsi `void` döndürür:
- `console.log()` çağrıları
- React `setState`, `dispatch`
- Event handler'lar: `onClick`, `onChange`
- `forEach` callback'leri
- Kaydetme/silme işlemleri
- Bildirim gönderme

</div>

<hr class="section-divider">

## 📖 never — Hiç Tamamlanmayan

`never`, bir fonksiyonun **normal yoldan asla tamamlanamayacağını** belirtir. İki senaryoda kullanılır:

1. Fonksiyon her zaman hata fırlatır
2. Fonksiyon sonsuz döngüde çalışır

```typescript
// Senaryo 1: Her zaman hata fırlatan
function throwError(message: string): never {
    throw new Error(message);
    // Bu satıra asla ulaşılmaz
}

// Senaryo 2: Sonsuz döngü
function runForever(): never {
    while (true) {
        processQueue();
    }
}

// never'dan sonraki kod asla çalışmaz
function failedOperation(): never {
    throw new Error("İşlem başarısız");
}

const x = failedOperation(); // x: never
// x kullanılabilirse tip hatası — asla buraya gelinmez
```

### void vs never Farkı

```typescript
// void: fonksiyon tamamlanır ama değer döndürmez
function doSomething(): void {
    console.log("Bitti");
    return; // normal bitiş
}

// never: fonksiyon asla tamamlanmaz
function crashNow(): never {
    throw new Error("Çöktü");
    // return bile yazılamaz — TypeScript hatası verir
}
```

| Özellik | `void` | `never` |
|---------|--------|---------|
| Fonksiyon tamamlanır mı? | ✅ Evet | ❌ Hayır |
| Değer döndürür mü? | ❌ Hayır | ❌ Hayır |
| `return;` yazılabilir mi? | ✅ | ❌ |
| Hata fırlatır mı? | Bazen | Her zaman |

<hr class="section-divider">

## 📖 never — Exhaustive Check (Eksiksiz Kontrol)

`never`ın en güçlü kullanımı: bir union tip'te tüm durumların işlenip işlenmediğini **compile anında** kontrol etmek:

```typescript
type OrderStatus = "pending" | "processing" | "shipped" | "delivered";

function getStatusMessage(status: OrderStatus): string {
    switch (status) {
        case "pending":    return "Sipariş alındı";
        case "processing": return "Hazırlanıyor";
        case "shipped":    return "Kargoda";
        case "delivered":  return "Teslim edildi";
        default:
            // Tüm durumlar yukarıda işlendi — buraya asla gelinmez
            // Eğer yeni bir status eklenirse ve burası güncellenmezse:
            // TypeScript compile hatası verir ✅
            const _exhaustive: never = status;
            throw new Error(`Bilinmeyen status: ${_exhaustive}`);
    }
}
```

Bu pattern'in gücü şu: yarın `"cancelled"` eklenirse:

```typescript
type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

// Artık switch'e "cancelled" case'i eklenmeden compile olmaz
// TypeScript: Type '"cancelled"' is not assignable to type 'never'
```

<hr class="section-divider">

## 📖 never — Guard Fonksiyonu

```typescript
// never döndüren yardımcı — her yerde kullanılabilir
function assertNever(x: never): never {
    throw new Error(`Beklenmeyen değer: ${JSON.stringify(x)}`);
}

// Kullanım — tüm shape türlerini işle
type Shape =
    | { kind: "circle"; radius: number }
    | { kind: "rectangle"; width: number; height: number };

function getArea(shape: Shape): number {
    switch (shape.kind) {
        case "circle":    return Math.PI * shape.radius ** 2;
        case "rectangle": return shape.width * shape.height;
        default:          return assertNever(shape); // exhaustive check
    }
}
```

<hr class="section-divider">

## 🏭 Real-World Kullanım

<div class="callout callout-real-world">

**🏭 void — React Event Handler'ları**

```typescript
// void döndüren event handler'lar
interface ButtonProps {
    onClick: () => void;        // değer döndürmez
    onChange: (value: string) => void; // değer döndürmez
    onSubmit: (data: FormData) => void; // değer döndürmez
}

// Dispatch — Redux/Zustand
function handleAddToCart(productId: number): void {
    dispatch({ type: "ADD_TO_CART", payload: productId });
    // dispatch void döndürür
}

// useEffect cleanup — void
useEffect(() => {
    const subscription = subscribe(handleUpdate);
    return () => {
        subscription.unsubscribe(); // cleanup — void
    };
}, []);
```

</div>

<div class="callout callout-real-world">

**🏭 never — API Error Handling**

```typescript
class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code: string
    ) {
        super(message);
        this.name = "ApiError";
    }
}

// never: bu fonksiyon asla normal tamamlanmaz
function throwApiError(statusCode: number, message: string): never {
    throw new ApiError(message, statusCode, `HTTP_${statusCode}`);
}

// Kullanım
async function getUser(id: number): Promise<User> {
    const res = await fetch(`/api/users/${id}`);
    if (res.status === 404) throwApiError(404, "Kullanıcı bulunamadı");
    if (res.status === 401) throwApiError(401, "Yetkisiz erişim");
    if (!res.ok) throwApiError(res.status, "Sunucu hatası");
    return res.json();
}

// never — WebSocket sunucu döngüsü
async function startWebSocketServer(): Promise<never> {
    const server = new WebSocketServer({ port: 8080 });
    console.log("WebSocket sunucusu başlatıldı");
    // Bu fonksiyon asla return etmez — sunucu sürekli çalışır
    await new Promise<never>(() => {}); // sonsuza bekle
}
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ void & never Best Practices:**
- Değer döndürmeyen her fonksiyona `void` yaz — okunabilirlik
- Hata fırlatan yardımcı fonksiyonlara `never` yaz
- Union type switch/if-else'de exhaustive check için `never` kullan
- `assertNever` helper'ını proje genelinde paylaş
- React event handler'larının tipi hep `void`

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ void'i undefined ile karıştırma
function fn(): void { return undefined; } // izin verir ama garip
// void: "değer kullanılmayacak"
// undefined: gerçek undefined değeri

// ❌ never'i yanlış kullanma
function doWork(): never {
    console.log("çalışıyorum");
    return; // ❌ TypeScript hatası — never'dan return edilemez
}

// ❌ Exhaustive check olmadan union işleme
function handleStatus(status: "active" | "inactive" | "pending"): string {
    if (status === "active") return "Aktif";
    if (status === "inactive") return "Pasif";
    return ""; // ❌ "pending" işlenmedi ama TypeScript uyarmaz
    // ✅ never ile default ekle
}
```

</div>

<hr class="section-divider">

## 📋 Özet

| Tip | Anlam | Kullanım |
|-----|-------|----------|
| `void` | Değer döndürmez, ama tamamlanır | Logger, event handler, setState |
| `never` | Asla tamamlanmaz | throw, sonsuz döngü, exhaustive check |
