# Hooks Tipleme

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
`useState<T>` ile tip güvenli state. `useRef<T>` ile DOM ve mutable değer. `useEffect` ile async çağrı ve cleanup. `useCallback`, `useMemo`. Custom hook yazımı ve dönüş tipi.

</div>

---

## 📖 useState\<T\>

```typescript
function UserProfile() {
    // Type inference — generic gerekmez
    const [name, setName] = useState("Yunus");     // string
    const [age, setAge] = useState(25);            // number
    const [isActive, setIsActive] = useState(true); // boolean

    // Generic ŞART — başlangıç null, sonra User
    const [user, setUser] = useState<User | null>(null);

    // Generic ŞART — boş dizi, tip bilinmiyor
    const [users, setUsers] = useState<User[]>([]);
    const [tags, setTags] = useState<string[]>([]);

    // Union state — discriminated
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    // Obje state — spread ile güncelle
    const [filters, setFilters] = useState<{
        search: string;
        role: User["role"] | "all";
        page: number;
    }>({ search: "", role: "all", page: 1 });

    // Fonksiyonel güncelleme — önceki state'e bağımlı
    const nextPage = () => {
        setFilters(prev => ({ ...prev, page: prev.page + 1 }));
    };
}
```

**Kural:** `useState(initialValue)`'dan tip çıkarılabiliyorsa generic yazmak zorunda değilsin. `null` veya `[]` ile başlıyorsan generic şarttır.

<hr class="section-divider">

## 📖 useRef\<T\>

`useRef` iki kullanım için:
1. **DOM ref** — `null` ile başla, mount sonrası element atanır
2. **Mutable değer** — re-render tetiklemez, initial değer ile başla

```typescript
function SearchInput() {
    // DOM ref — başlangıç null
    const inputRef = useRef<HTMLInputElement>(null);

    // Timer ref — re-render tetiklemez, type güvenli
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Previous value — render arası değeri sakla
    const previousValueRef = useRef<string>("");

    // Render sayacı — state değil, görsel güncelleme gerekmez
    const renderCountRef = useRef<number>(0);

    useEffect(() => {
        renderCountRef.current += 1;
        inputRef.current?.focus(); // null güvenli — optional chaining
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            previousValueRef.current = e.target.value;
        }, 300);
    };

    return (
        <input ref={inputRef} onChange={handleChange} placeholder="Ara..." />
    );
}

// forwardRef — parent'tan child'a ref geçişi
const TextInput = React.forwardRef<HTMLInputElement, {
    placeholder?: string;
    onChange: (value: string) => void;
}>(({ placeholder, onChange }, ref) => (
    <input
        ref={ref}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
    />
));

TextInput.displayName = "TextInput";
```

<hr class="section-divider">

## 📖 useEffect — Async ve Cleanup

```typescript
function DataFetcher({ userId }: { userId: number }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // useEffect callback'i async OLAMAZ — içeride tanımla
        async function fetchUser() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/users/${userId}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json() as User;
                setUser(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Hata");
            } finally {
                setLoading(false);
            }
        }

        fetchUser();

        return () => {
            setUser(null); // unmount cleanup
        };
    }, [userId]); // userId değişince tekrar çalış

    // Event listener — cleanup şart
    useEffect(() => {
        const handleResize = () => console.log(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize); // cleanup
    }, []); // sadece mount/unmount

    if (loading) return <div>Yükleniyor...</div>;
    if (error) return <div>Hata: {error}</div>;
    if (!user) return null;
    return <div>{user.name}</div>;
}
```

<hr class="section-divider">

## 📖 Custom Hook Tipleme

Custom hook'lar `use` ile başlar ve React hook'larını kullanabilir. Dönüş tipini explicit yaz:

```typescript
// useFetch — veri çekme hook'u
interface UseFetchReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

function useFetch<T>(url: string): UseFetchReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setData(await res.json() as T);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Hata");
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => { fetchData(); }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

// useLocalStorage — kalıcı state
function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) as T : initialValue;
        } catch { return initialValue; }
    });

    const setValue: Dispatch<SetStateAction<T>> = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) { console.error(error); }
    };

    return [storedValue, setValue];
}

// useDebounce — input debounce
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

// useToggle — boolean toggle
function useToggle(initialValue: boolean = false): [boolean, () => void] {
    const [value, setValue] = useState(initialValue);
    const toggle = useCallback(() => setValue(prev => !prev), []);
    return [value, toggle];
}
```

### Kullanım

```typescript
function UserList() {
    const { data: users, loading, error, refetch } = useFetch<User[]>("/api/users");
    const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);
    const [isOpen, toggleModal] = useToggle(false);

    // useMemo — hesaplanmış değer, pahalı operasyon için
    const activeUsers = useMemo(() => {
        return users?.filter(u => u.role !== "viewer") ?? [];
    }, [users]);

    return (
        <div>
            {loading && <div>Yükleniyor...</div>}
            {error && <div>{error}</div>}
            {activeUsers.map(u => <div key={u.id}>{u.name}</div>)}
        </div>
    );
}
```

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Hooks Best Practices:**
- `useState<T | null>(null)` — null başlangıçta generic şart
- `useEffect` içinde async fonksiyon tanımla, callback'i async yapma
- Her event listener için cleanup return et
- Custom hook dönüş tipini explicit yaz — inference karmaşık olabilir
- Obje döndür (karmaşık state), tuple döndür (basit state/setter çifti)

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ useEffect'i async yapmak
useEffect(async () => { // ❌ async callback — cleanup döndüremiyor
    const data = await fetchData();
}, []);
// ✅ İçeride async fonksiyon tanımla

// ❌ Boş dizi için generic yazmamak
const [items, setItems] = useState([]); // ❌ never[] — tip yok
const [items, setItems] = useState<User[]>([]); // ✅

// ❌ useCallback/useMemo'yu her yerde kullanmak
const fn = useCallback(() => console.log("hi"), []); // basit fn için gereksiz
// ✅ Sadece prop olarak geçen callback veya ağır hesaplama için
```

</div>

<hr class="section-divider">

## 📋 Özet

| Hook | Tip | Ne zaman generic şart |
|------|-----|----------------------|
| `useState` | `useState<T>` | null, [], obje başlangıç |
| `useRef` DOM | `useRef<HTMLInputElement>(null)` | DOM elementi |
| `useRef` mutable | `useRef<number>(0)` | Mutable değer sakla |
| `useEffect` async | İçeride `async function` tanımla | Her async useEffect |
| Custom hook | Dönüş tipini explicit yaz | Her custom hook |
