# in Guard & Discriminated Union

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
`in` guard ile interface union'larını daralt. Discriminated union ile state machine, event sistemi ve API response'larını tip güvenli yönet. Exhaustive check ile unutulan durumları derleme anında yakala.

</div>

---

## 📖 in Guard — Obje Alan Varlığı

`"key" in obj` kontrolü, bir objede belirli bir alan olup olmadığını kontrol eder. TypeScript bunu tip daraltma sinyali olarak tanır. **Interface'ler runtime'da silindiği için `instanceof` çalışmaz** — interface union'larında `in` kullanılır:

```typescript
interface Cat {
    name: string;
    meow(): void;
}

interface Dog {
    name: string;
    bark(): void;
}

function makeSound(animal: Cat | Dog): void {
    if ("meow" in animal) {
        // Burada TypeScript biliyor: animal Cat
        animal.meow(); // ✅ Cat metodu
    } else {
        // Burada TypeScript biliyor: animal Dog
        animal.bark(); // ✅ Dog metodu
    }
}
```

### API Response Union

```typescript
interface SuccessResponse {
    data: unknown;
    message: string;
}

interface ErrorResponse {
    error: string;
    code: number;
}

type ApiResult = SuccessResponse | ErrorResponse;

function handleApiResult(result: ApiResult): void {
    if ("data" in result) {
        // SuccessResponse — "data" alanı SuccessResponse'a özgü
        console.log("Başarılı:", result.message);
        console.log("Veri:", result.data);
    } else {
        // ErrorResponse
        console.log(`Hata ${result.code}: ${result.error}`);
    }
}
```

### Opsiyonel Alan ile Premium Kontrol

```typescript
interface BasicUser {
    name: string;
    email: string;
}

interface PremiumUser {
    name: string;
    email: string;
    subscription: { plan: string; expiresAt: string };
}

function getUserPlan(user: BasicUser | PremiumUser): string {
    if ("subscription" in user) {
        // PremiumUser — subscription alanı var
        return `Premium — ${user.subscription.plan}`;
    }
    return "Ücretsiz";
}
```

<hr class="section-divider">

## 📖 Discriminated Union — Ortak Alan ile Ayır

Discriminated union, union'daki her tipin ortak bir **discriminant (ayırt edici)** alan taşıdığı pattern'dir. Bu alan literal tip olur (`"success"`, `"error"`, `"loading"` gibi). TypeScript bu alana göre tipi otomatik daraltır. `in` guard'dan çok daha güvenli ve temizdir:

```typescript
// Her tip "status" alanı taşıyor — literal değerler
type ApiSuccess<T> = {
    status: "success";  // discriminant
    data: T;
    message: string;
};

type ApiError = {
    status: "error";    // discriminant
    error: string;
    code: number;
};

type ApiResponse<T> = ApiSuccess<T> | ApiError;

function handleResponse<T>(response: ApiResponse<T>): T | null {
    switch (response.status) {
        case "success":
            // TypeScript biliyor: ApiSuccess<T>
            // data ve message erişimi güvenli
            console.log(response.message);
            return response.data;

        case "error":
            // TypeScript biliyor: ApiError
            // error ve code erişimi güvenli
            console.error(`Hata ${response.code}: ${response.error}`);
            return null;
    }
}
```

### State Machine Pattern

React'ta data fetching state'ini discriminated union ile yönetmek best practice'tir:

```typescript
type LoadingState = {
    status: "loading";
    // data yok — henüz yükleniyor
};

type SuccessState<T> = {
    status: "success";
    data: T;
};

type ErrorState = {
    status: "error";
    message: string;
};

type AsyncState<T> = LoadingState | SuccessState<T> | ErrorState;

// Render fonksiyonu — her state için farklı UI
function renderState<T>(state: AsyncState<T>): string {
    switch (state.status) {
        case "loading":
            return "Yükleniyor...";

        case "success":
            // TypeScript biliyor: data var
            return `Veri: ${JSON.stringify(state.data)}`;

        case "error":
            // TypeScript biliyor: message var
            return `Hata: ${state.message}`;
    }
}

// Kullanım
const loading: AsyncState<User> = { status: "loading" };
const success: AsyncState<User> = {
    status: "success",
    data: { id: 1, name: "Yunus", email: "yunus@mail.com" }
};
const error: AsyncState<User> = { status: "error", message: "Sunucu hatası" };

console.log(renderState(loading));  // → "Yükleniyor..."
console.log(renderState(success)); // → "Veri: {...}"
console.log(renderState(error));   // → "Hata: Sunucu hatası"
```

### Event Sistemi

```typescript
// Redux action veya custom event bus pattern
type ClickEvent = { type: "click"; x: number; y: number };
type KeyPressEvent = { type: "keypress"; key: string; ctrlKey: boolean };
type ResizeEvent = { type: "resize"; width: number; height: number };

type AppEvent = ClickEvent | KeyPressEvent | ResizeEvent;

function handleEvent(event: AppEvent): void {
    switch (event.type) {
        case "click":
            // TypeScript biliyor: x ve y var
            console.log(`Tıklandı: (${event.x}, ${event.y})`);
            break;

        case "keypress":
            // TypeScript biliyor: key ve ctrlKey var
            console.log(`Tuş: ${event.key} ctrl:${event.ctrlKey}`);
            break;

        case "resize":
            // TypeScript biliyor: width ve height var
            console.log(`Boyut: ${event.width}x${event.height}`);
            break;
    }
}
```

<hr class="section-divider">

## 📖 Exhaustive Check — Tüm Durumlar Ele Alındı Garantisi

Discriminated union'a yeni bir tip eklendiğinde TypeScript'in seni uyarmasını istiyorsun. `never` tipi ile bunu sağlarsın:

```typescript
function assertNever(value: never): never {
    throw new Error(`İşlenmeyen durum: ${JSON.stringify(value)}`);
}

type Shape =
    | { kind: "circle"; radius: number }
    | { kind: "rectangle"; width: number; height: number }
    | { kind: "triangle"; base: number; height: number };

function calculateArea(shape: Shape): number {
    switch (shape.kind) {
        case "circle":
            return Math.PI * shape.radius ** 2;

        case "rectangle":
            return shape.width * shape.height;

        case "triangle":
            return (shape.base * shape.height) / 2;

        default:
            // Tüm case'ler ele alındıysa shape tipi burada never olur
            // Yeni shape eklenirse TypeScript burada hata verir ✅
            return assertNever(shape);
    }
}
```

**Neden çalışır:** Tüm `case`'ler ele alındıktan sonra `default`'a ulaşabilecek tek değer yoktur — TypeScript `shape`'i `never` olarak görür. `assertNever(never)` geçerlidir. Ama `"square"` gibi yeni bir union kolu eklenirse, `shape` `never` olmaz ve `assertNever`'ın parametresi uyuşmaz — derleme hatası verir.

<hr class="section-divider">

## 🏭 Real-World: Redux Action Pattern

<div class="callout callout-real-world">

**🏭 Tip Güvenli Redux Actions**

```typescript
interface AddUserAction {
    type: "users/ADD";
    payload: { id: number; name: string; email: string };
}

interface RemoveUserAction {
    type: "users/REMOVE";
    payload: { id: number };
}

interface UpdateUserAction {
    type: "users/UPDATE";
    payload: { id: number; changes: Partial<{ name: string; email: string }> };
}

interface SetLoadingAction {
    type: "users/SET_LOADING";
    payload: boolean;
}

type UserAction =
    | AddUserAction
    | RemoveUserAction
    | UpdateUserAction
    | SetLoadingAction;

interface UsersState {
    list: Array<{ id: number; name: string; email: string }>;
    loading: boolean;
}

function usersReducer(state: UsersState, action: UserAction): UsersState {
    switch (action.type) {
        case "users/ADD":
            return { ...state, list: [...state.list, action.payload] };

        case "users/REMOVE":
            return {
                ...state,
                list: state.list.filter(u => u.id !== action.payload.id)
            };

        case "users/UPDATE":
            return {
                ...state,
                list: state.list.map(u =>
                    u.id === action.payload.id
                        ? { ...u, ...action.payload.changes }
                        : u
                )
            };

        case "users/SET_LOADING":
            return { ...state, loading: action.payload };

        default:
            // Yeni action eklenince TypeScript uyarır
            return assertNever(action);
    }
}
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ in / Discriminated Union Best Practices:**
- Interface union için `in` guard kullan — `instanceof` interface'te çalışmaz
- Ortak discriminant alan varsa discriminated union tercih et — `in`'den daha güvenli
- Discriminant alan adı için `type`, `kind`, `status` convention'ı takip et
- Her `switch/case`'e exhaustive check (`assertNever`) ekle — yeni tip eklemeyi zorunlu kıl
- State machine'leri daima discriminated union ile yönet — `boolean` flag'ler yerine

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Boolean flag'lerle state yönetimi — anlamsız kombinasyonlar mümkün
type BadState = {
    isLoading: boolean;
    isError: boolean;
    data: User | null;
    // isLoading: true ve isError: true aynı anda geçerli mi? Belirsiz
};

// ✅ Discriminated union — geçersiz kombinasyon imkânsız
type GoodState =
    | { status: "loading" }
    | { status: "success"; data: User }
    | { status: "error"; message: string };

// ❌ in guard yerine interface için instanceof kullanmak
// interface User { id: number }
// value instanceof User // ❌ runtime hata

// ❌ Exhaustive check olmadan switch
function render(state: AsyncState<User>): string {
    switch (state.status) {
        case "loading": return "...";
        case "success": return "ok";
        // "error" unutuldu — TypeScript uyarmaz, runtime'da undefined döner
    }
}
// ✅ Doğru: default'a assertNever ekle
```

</div>

<hr class="section-divider">

## 📋 Özet

| Teknik | Syntax | Kullanım |
|--------|--------|----------|
| `in` guard | `"field" in obj` | Interface union, plain obje kontrolü |
| Discriminated union | `switch (x.type)` | State machine, event, API response |
| Discriminant alan | `type`, `kind`, `status` | Literal union — her tip benzersiz değer |
| Exhaustive check | `assertNever(x)` | Yeni union kolu eklenince derleme hatası |

**Discriminant convention:**
```typescript
// "type" — Redux action
{ type: "ADD_USER", payload: ... }

// "status" — API response, async state
{ status: "success", data: ... }

// "kind" — şekil, kategori gibi domain kavramları
{ kind: "circle", radius: ... }
```
