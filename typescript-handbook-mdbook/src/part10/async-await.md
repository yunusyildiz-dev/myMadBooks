# async/await & fetch Tipleme

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
`async/await` ile tip güvenli asenkron kod. `fetch()` ile API yanıtı tipleme — güvensiz casting tuzağı. Tip güvenli fetch wrapper. Streaming response ve `AsyncGenerator<T>`.

</div>

---

## 📖 async/await ile Tip Çıkarımı

`async` fonksiyon her zaman `Promise<T>` döndürür. `return T` yazsan bile TypeScript bunu `Promise<T>` olarak görür. `await`, `Promise<T>`'yi açar ve sana `T`'yi verir:

```typescript
async function getUser(id: number): Promise<User> {
    await delay(100);
    return { id, name: "Yunus", email: "yunus@mail.com", role: "editor" };
    // return User — ama gerçekte Promise<User> döndürülür
}

async function main(): Promise<void> {
    const user = await getUser(1); // await Promise<User>'ı açar → User
    console.log(user.name);       // TypeScript biliyor: string
    console.log(user.role);       // "admin" | "editor" | "viewer" — güvenli
}
```

<hr class="section-divider">

## 📖 fetch ile API Yanıtı Tipleme

`fetch()` her zaman `Promise<Response>` döner. `response.json()` ise `Promise<any>` döner — TypeScript tipi bilmez. Bu tehlikelidir:

```typescript
// ❌ Kötü — güvensiz casting
async function badFetch(): Promise<User> {
    const res = await fetch("/api/user/1");
    const data = await res.json() as User; // runtime'da doğrulama yok
    return data;
}

// ❌ Daha da kötü — HTTP hatayı görmez
async function worseFetch(): Promise<User> {
    const res = await fetch("/api/user/1");
    // res.ok kontrolü yok — 404, 500 hataları sessizce geçer!
    return res.json(); // Promise<any> — tip güvencesi yok
}
```

### Tip Güvenli fetch Wrapper

```typescript
// Tek bir wrapper — tüm API çağrılarında kullan
async function typedFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, options);

    // HTTP hata kontrolü — fetch bunu otomatik YAPMAZ
    if (!res.ok) {
        throw new NetworkError(`HTTP ${res.status}: ${res.statusText}`, res.status);
    }

    const data: unknown = await res.json(); // unknown — güvenli başlangıç
    return data as T; // casting tek noktada — wrapper'da
}

// CRUD wrapper'ları
async function apiGet<T>(url: string): Promise<T> {
    return typedFetch<T>(url);
}

async function apiPost<TBody, TResponse>(url: string, body: TBody): Promise<TResponse> {
    return typedFetch<TResponse>(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
}

async function apiPatch<TBody, TResponse>(url: string, body: Partial<TBody>): Promise<TResponse> {
    return typedFetch<TResponse>(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
}

async function apiDelete(url: string): Promise<void> {
    await typedFetch<void>(url, { method: "DELETE" });
}

// Kullanım
const user    = await apiGet<User>("/api/users/1");       // User
const users   = await apiGet<User[]>("/api/users");        // User[]
const newUser = await apiPost<CreateUserDto, User>(
    "/api/users",
    { name: "Yunus", email: "y@mail.com", role: "editor" }
);
await apiDelete("/api/users/1");
```

### Type Guard ile Daha Güvenli Fetch

```typescript
function isUser(value: unknown): value is User {
    return (
        typeof value === "object" && value !== null &&
        "id" in value && "name" in value && "email" in value
    );
}

async function fetchUserSafe(id: number): Promise<User> {
    const data = await typedFetch<unknown>(`/api/users/${id}`);

    if (!isUser(data)) {
        throw new Error("API geçersiz User verisi döndürdü");
    }

    return data; // TypeScript biliyor: User — runtime doğrulandı
}
```

<hr class="section-divider">

## 📖 Streaming Response — AsyncGenerator\<T\>

AI API'ları yanıtı tek seferde değil chunk chunk gönderir. `AsyncGenerator<T>` ve `for await...of` ile okunur:

```typescript
// Async generator — her chunk'ı yield et
async function* streamText(text: string): AsyncGenerator<string> {
    const words = text.split(" ");
    for (const word of words) {
        await delay(100);
        yield word + " "; // her kelimeyi ayrı chunk olarak gönder
    }
}

// for await...of ile tüket
async function consumeStream(): Promise<void> {
    let fullText = "";
    for await (const chunk of streamText("Merhaba bu bir streaming yanıttır")) {
        fullText += chunk;
        process.stdout.write(chunk); // gerçek zamanlı göster
    }
    console.log("\nTam metin:", fullText);
}
```

### Fetch API ile ReadableStream

```typescript
async function fetchStream(url: string): Promise<void> {
    const res = await fetch(url);
    if (!res.body) throw new Error("Stream yok");

    const reader: ReadableStreamDefaultReader<Uint8Array> = res.body.getReader();
    const decoder = new TextDecoder();

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk: string = decoder.decode(value, { stream: true });
            console.log("Chunk:", chunk);
        }
    } finally {
        reader.releaseLock(); // HER ZAMAN serbest bırak — bellek sızıntısı önle
    }
}
```

### Claude API Streaming

```typescript
async function* streamClaude(
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    model: string = "claude-sonnet-4-20250514"
): AsyncGenerator<string, void, unknown> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
            "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({ model, max_tokens: 1024, stream: true, messages })
    });

    if (!res.ok || !res.body) throw new Error(`Stream başlatılamadı: ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter(l => l.startsWith("data: "));

            for (const line of lines) {
                const data = line.slice(6); // "data: " kısmını çıkar
                if (data === "[DONE]") return;
                try {
                    const event = JSON.parse(data) as {
                        type: string;
                        delta?: { type: string; text: string };
                    };
                    if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
                        yield event.delta.text; // text chunk'ı dışarıya gönder
                    }
                } catch {
                    // JSON parse hatası — satırı atla
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}

// Kullanım
let fullReply = "";
for await (const chunk of streamClaude([{ role: "user", content: "TypeScript nedir?" }])) {
    fullReply += chunk;
    process.stdout.write(chunk); // gerçek zamanlı yaz
}
```

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ async/await & fetch Best Practices:**
- `response.json()` sonucunu direkt `as Type` yapma — type guard kullan
- `response.ok` kontrolü her zaman şart — `fetch` HTTP hatayı reject etmez
- `typedFetch<T>` gibi tek bir wrapper yaz — her yerde tekrar etme
- Streaming'i `finally` içinde kapat — `reader.releaseLock()` unutma
- `unknown` ile başla, daralt — `any` kullanma

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ response.ok kontrolü olmadan kullanmak
const res = await fetch("/api/data");
const data = await res.json(); // 404 geldi ama fark etmedi — hatalı veri işlendi

// ❌ any ile başlamak
const data: any = await res.json(); // tip güvencesi yok

// ❌ Stream'i kapatmamak
const reader = res.body!.getReader();
while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    // Hata olursa reader.releaseLock() çağrılmaz — bellek sızıntısı
}
// ✅ Her zaman try...finally kullan
```

</div>

<hr class="section-divider">

## 📋 Özet

| Kavram | Açıklama |
|--------|----------|
| `async fn(): Promise<T>` | Return tipi explicit yaz |
| `res.ok` kontrolü | HTTP hatayı kontrol et — fetch yapmaz |
| `typedFetch<T>()` | Tek tip güvenli fetch wrapper |
| `unknown` → type guard | `as Type` yerine doğrula |
| `AsyncGenerator<T>` | Streaming — chunk chunk yield et |
| `for await...of` | Async iterable tüket |
| `reader.releaseLock()` | Stream'i finally içinde kapat |
