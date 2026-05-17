# Generic Interface & Type

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
Generic interface ve type alias tanımlama. ApiResponse, PaginatedResponse, AsyncState gibi gerçek projelerde her gün kullanılan generic container pattern'leri.

</div>

---

## 📖 Generic Interface

Interface'e de tip parametresi eklenebilir:

```typescript
// Generic interface — T tipi kullanacak
interface Box<T> {
    value: T;
    label: string;
    isEmpty: boolean;
}

// Farklı tip parametreleri ile kullan
const numberBox: Box<number>  = { value: 42,       label: "Sayı", isEmpty: false };
const stringBox: Box<string>  = { value: "Yunus",  label: "İsim", isEmpty: false };
const boolBox:   Box<boolean> = { value: true,     label: "Flag", isEmpty: false };

// Generic interface — obje tutan
interface Container<T> {
    data: T;
    metadata: {
        createdAt: string;
        source: string;
    };
}

const userContainer: Container<User> = {
    data: { id: 1, name: "Yunus", email: "y@mail.com" },
    metadata: { createdAt: "2025-01-15", source: "api" }
};
```

<hr class="section-divider">

## 📖 API Response Pattern

En yaygın generic interface pattern — her API endpoint'i için:

```typescript
// Generic API response wrapper
interface ApiResponse<T> {
    data: T;
    success: boolean;
    message: string;
    timestamp: string;
}

// Paginated liste response
interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

// Kullanım — T'yi belirt
type UserResponse      = ApiResponse<User>;
type ProductResponse   = ApiResponse<Product>;
type UserListResponse  = PaginatedResponse<User>;
type ProductListResponse = PaginatedResponse<Product>;

// Her endpoint farklı tip döndürür ama aynı wrapper kullanır
async function getUser(id: number): Promise<ApiResponse<User>> {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
}

async function getProducts(page: number): Promise<PaginatedResponse<Product>> {
    const res = await fetch(`/api/products?page=${page}`);
    return res.json();
}
```

<hr class="section-divider">

## 📖 Async State Pattern

React'ta data fetching için standart pattern:

```typescript
// Async state — loading/error/data yönetimi
interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

// Kullanım
const userState: AsyncState<User> = {
    data: null,
    loading: true,
    error: null
};

const productState: AsyncState<Product[]> = {
    data: [],
    loading: false,
    error: null
};

// React hook ile
function useAsyncState<T>(initialData: T | null = null): {
    state: AsyncState<T>;
    setData: (data: T) => void;
    setError: (error: string) => void;
    setLoading: (loading: boolean) => void;
} {
    const [state, setState] = useState<AsyncState<T>>({
        data: initialData,
        loading: false,
        error: null
    });

    return {
        state,
        setData: (data: T) => setState({ data, loading: false, error: null }),
        setError: (error: string) => setState(s => ({ ...s, error, loading: false })),
        setLoading: (loading: boolean) => setState(s => ({ ...s, loading }))
    };
}
```

<hr class="section-divider">

## 📖 Generic Type Alias

`type` ile de generic tanım yapılabilir:

```typescript
// Nullable<T> — T veya null
type Nullable<T> = T | null;

// Optional<T> — T, null veya undefined
type Optional<T> = T | null | undefined;

// AsyncResult<T> — Promise döner, null olabilir
type AsyncResult<T> = Promise<T | null>;

// Pair<T, U> — iki değer
type Pair<T, U = T> = { first: T; second: U }; // U için default: T

// Result<T, E> — başarı veya hata
type Result<T, E = Error> =
    | { success: true; data: T }
    | { success: false; error: E };

// Kullanım
const result1: Result<User> = { success: true, data: { id: 1, name: "Yunus", email: "y@m.com" } };
const result2: Result<User> = { success: false, error: new Error("Bulunamadı") };

function processResult(result: Result<User>): string {
    if (result.success) {
        return `Kullanıcı: ${result.data.name}`; // ✅ data field güvenli
    } else {
        return `Hata: ${result.error.message}`;  // ✅ error field güvenli
    }
}
```

<hr class="section-divider">

## 🏭 Real-World: Repository Pattern

<div class="callout callout-real-world">

**🏭 Generic Repository Interface**

```typescript
interface BaseEntity {
    id: number;
    createdAt: string;
    updatedAt: string;
}

// Her entity için aynı CRUD operasyonları — generic ile bir kez yaz
interface Repository<T extends BaseEntity> {
    findById(id: number): Promise<T | null>;
    findAll(options?: { page?: number; limit?: number }): Promise<PaginatedResponse<T>>;
    create(data: Omit<T, keyof BaseEntity>): Promise<T>;
    update(id: number, data: Partial<Omit<T, keyof BaseEntity>>): Promise<T>;
    delete(id: number): Promise<void>;
}

// Gerçek implementasyon
interface UserEntity extends BaseEntity {
    name: string;
    email: string;
    role: "admin" | "editor" | "viewer";
}

class UserRepository implements Repository<UserEntity> {
    private users: UserEntity[] = [];

    async findById(id: number): Promise<UserEntity | null> {
        return this.users.find(u => u.id === id) ?? null;
    }

    async findAll(): Promise<PaginatedResponse<UserEntity>> {
        return { data: this.users, total: this.users.length, page: 1, limit: 10, hasNextPage: false, hasPreviousPage: false };
    }

    async create(data: Omit<UserEntity, keyof BaseEntity>): Promise<UserEntity> {
        const user: UserEntity = {
            id: Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...data
        };
        this.users.push(user);
        return user;
    }

    async update(id: number, data: Partial<Omit<UserEntity, keyof BaseEntity>>): Promise<UserEntity> {
        const idx = this.users.findIndex(u => u.id === id);
        if (idx === -1) throw new Error(`User ${id} bulunamadı`);
        this.users[idx] = { ...this.users[idx], ...data, updatedAt: new Date().toISOString() };
        return this.users[idx];
    }

    async delete(id: number): Promise<void> {
        this.users = this.users.filter(u => u.id !== id);
    }
}
```

</div>

<hr class="section-divider">

## 📋 Özet

| Pattern | Syntax | Kullanım |
|---------|--------|----------|
| Generic interface | `interface Box<T>` | Obje container |
| API response | `ApiResponse<T>` | Her endpoint |
| Paginated | `PaginatedResponse<T>` | Liste endpoint |
| Async state | `AsyncState<T>` | Data fetching |
| Result type | `Result<T, E>` | Hata yönetimi |
| Repository | `Repository<T extends BaseEntity>` | CRUD işlemleri |
