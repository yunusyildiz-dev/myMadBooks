# Async Hata Yönetimi

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
`try/catch` ile tipli hata yönetimi. Custom error class hiyerarşisi. `Result<T>` pattern — hata fırlatmak yerine wrapper ile döndürme. `finally` ile cleanup. Gerçek dünya AI chat servisi.

</div>

---

## 📖 catch'te Error Tipi: unknown

TypeScript'te `catch (error)` bloğunda `error` tipi **`unknown`**'dur (strict modda). `error.message` yazmak derleme hatası verir. Daima `instanceof` ile daralt:

```typescript
async function riskyOperation(): Promise<string> {
    if (Math.random() > 0.5) throw new Error("Şans yaver gitmedi");
    return "Başarılı!";
}

async function safeOperation(): Promise<string> {
    try {
        return await riskyOperation();
    } catch (error) {
        // error.message; // ❌ hata — unknown
        if (error instanceof Error) {
            console.error(error.message); // ✅ instanceof sonrası güvenli
        }
        return "Varsayılan değer";
    }
}
```

<hr class="section-divider">

## 📖 Custom Error Hiyerarşisi

Hataları sınıflandırmak için custom error class'lar yaz. Bu sayede `instanceof` ile tipi daraltabilir ve her hata türüne farklı davranabilirsin:

```typescript
// Base error — ortak alanlar
class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500
    ) {
        super(message);
        this.name = "AppError";
    }
}

// Spesifik hatalar
class NetworkError extends AppError {
    constructor(message: string, statusCode: number) {
        super(message, "NETWORK_ERROR", statusCode);
        this.name = "NetworkError";
    }
}

class ValidationError extends AppError {
    constructor(message: string, public fields: Record<string, string>) {
        super(message, "VALIDATION_ERROR", 400);
        this.name = "ValidationError";
    }
}

class AuthError extends AppError {
    constructor() {
        super("Yetkilendirme gerekli", "AUTH_ERROR", 401);
        this.name = "AuthError";
    }
}

// Merkezi hata işleyici — instanceof ile sınıflandır
function handleError(error: unknown): void {
    if (error instanceof NetworkError) {
        console.error(`Network hatası (${error.statusCode}): ${error.message}`);
    } else if (error instanceof ValidationError) {
        console.error(`Validasyon hatası:`, error.fields);
    } else if (error instanceof AuthError) {
        window.location.href = "/login";
    } else if (error instanceof AppError) {
        console.error(`[${error.code}] ${error.message}`);
    } else if (error instanceof Error) {
        console.error("Beklenmedik hata:", error.message);
    } else {
        throw error; // bilinmeyen tip — yukarı fırlat
    }
}
```

<hr class="section-divider">

## 📖 Result\<T\> Pattern — Hata Fırlatma Yerine Wrapper

Fonksiyonel programlama yaklaşımı: `throw` yerine sonucu wrapper objeyle döndür. Çağıran taraf `try/catch` yazmak zorunda kalmaz, ama hatayı görmezden de gelemez:

```typescript
type Result<T, E = Error> =
    | { success: true; data: T }
    | { success: false; error: E };

async function safeGetUser(id: number): Promise<Result<User>> {
    try {
        const user = await getUser(id);
        return { success: true, data: user };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error : new Error("Bilinmeyen hata")
        };
    }
}

// Kullanım — try/catch gerekmez
async function useResult(): Promise<void> {
    const result = await safeGetUser(1);

    if (result.success) {
        console.log(result.data.name); // TypeScript biliyor: User
    } else {
        console.error(result.error.message); // TypeScript biliyor: Error
    }
}
```

**Ne zaman `Result<T>`, ne zaman `throw`?**
- `throw` → Gerçekten beklenmedik hata, kurtarılması mümkün değil
- `Result<T>` → Hata beklenen bir durum, çağıran taraf handle etmeli

<hr class="section-divider">

## 📖 finally — Cleanup

`finally` bloğu hata olsa da olmasa da her zaman çalışır. Bağlantı kapatma, kilit serbest bırakma, kaynak temizleme için kullanılır:

```typescript
async function withCleanup(): Promise<void> {
    let connection: { close: () => void } | null = null;
    try {
        // connection = await openConnection();
        await delay(100);
    } catch (error) {
        console.error("İşlem başarısız");
    } finally {
        connection?.close(); // hata olsa da olmasa da kapat
    }
}

// ReadableStream örneği — stream'i her zaman kapat
async function processStream(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.body) throw new Error("Stream yok");

    const reader = res.body.getReader();
    let result = "";

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            result += new TextDecoder().decode(value);
        }
    } finally {
        reader.releaseLock(); // hata alınsa bile çalışır
    }

    return result;
}
```

<hr class="section-divider">

## 🏭 Real-World: Tam AI Chat Servisi

<div class="callout callout-real-world">

**🏭 Üretim Kalitesinde AI Chat Service**

```typescript
interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

interface ChatOptions {
    model?: string;
    maxTokens?: number;
    systemPrompt?: string;
    timeoutMs?: number;
}

interface TokenUsage {
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number;
}

class AIChatService {
    private readonly DEFAULT_OPTIONS: Required<ChatOptions> = {
        model: "claude-sonnet-4-20250514",
        maxTokens: 1024,
        systemPrompt: "Sen yardımcı bir asistansın.",
        timeoutMs: 30000
    };

    async sendMessage(
        messages: ChatMessage[],
        userMessage: string,
        options: ChatOptions = {}
    ): Promise<{ reply: string; usage: TokenUsage }> {
        const opts = { ...this.DEFAULT_OPTIONS, ...options };

        const allMessages: ChatMessage[] = [
            ...messages,
            { role: "user", content: userMessage }
        ];

        // Timeout wrapper — AI API çağrıları uzun sürebilir
        const replyPromise = this.callClaudeAPI(allMessages, opts);
        const reply = await this.withTimeout(replyPromise, opts.timeoutMs);

        const usage = this.estimateUsage(allMessages, reply);
        return { reply, usage };
    }

    private async callClaudeAPI(
        messages: ChatMessage[],
        opts: Required<ChatOptions>
    ): Promise<string> {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: opts.model,
                max_tokens: opts.maxTokens,
                system: opts.systemPrompt,
                messages: messages.filter(m => m.role !== "system")
            })
        });

        if (!res.ok) {
            // HTTP hatayı tipli hata olarak fırlat
            if (res.status === 401) throw new AuthError();
            throw new NetworkError(`Claude API hatası: ${res.status}`, res.status);
        }

        const data: unknown = await res.json();
        const message = data as { content: Array<{ type: string; text: string }> };

        return message.content
            .filter(block => block.type === "text")
            .map(block => block.text)
            .join("");
    }

    private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
        const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`AI API timeout: ${ms}ms`)), ms)
        );
        return Promise.race([promise, timeout]);
    }

    private estimateUsage(messages: ChatMessage[], reply: string): TokenUsage {
        const inputTokens = messages.reduce(
            (sum, m) => sum + Math.ceil(m.content.length / 4), 0
        );
        const outputTokens = Math.ceil(reply.length / 4);

        return {
            inputTokens,
            outputTokens,
            estimatedCostUsd: inputTokens * 0.000003 + outputTokens * 0.000015
        };
    }
}

// Kullanım
async function chat(userMessage: string): Promise<void> {
    const service = new AIChatService();
    const messages: ChatMessage[] = [];

    try {
        const { reply, usage } = await service.sendMessage(messages, userMessage);
        console.log("Yanıt:", reply);
        console.log(`Maliyet: $${usage.estimatedCostUsd.toFixed(6)}`);
        messages.push(
            { role: "user", content: userMessage },
            { role: "assistant", content: reply }
        );
    } catch (error) {
        handleError(error); // merkezi hata işleyici
    }
}
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Async Hata Yönetimi Best Practices:**
- `catch (error)` içinde daima `instanceof` ile daralt — error tipi `unknown`
- Custom error class hiyerarşisi yaz — sınıflandırılmış hatalar
- `finally` bloğunu resource cleanup için kullan — stream, connection, lock
- AI API çağrılarına mutlaka timeout ekle — sonsuz beklemeden kaçın
- `Result<T>` pattern'ini beklenen hata senaryoları için kullan

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ catch'te tipi kontrol etmemek
try {
    await apiCall();
} catch (err) {
    console.log(err.message); // ❌ hata — unknown'da .message yok
}

// ❌ Boş catch — hatayı yutmak
try {
    await criticalOperation();
} catch {} // ❌ hata kayboldu — debug edilemez

// ❌ Timeout olmadan AI API çağrısı
const reply = await callClaude(messages); // ❌ 60 saniye bekleyebilir

// ❌ finally'yi unutmak
const reader = res.body!.getReader();
while (true) {
    const { done, value } = await reader.read();
    if (done) break; // reader hata alırsa releaseLock çağrılmaz
}
// ✅ try...finally ile kapat
```

</div>

<hr class="section-divider">

## 📋 Özet

| Kavram | Kullanım |
|--------|----------|
| `catch (error: unknown)` | instanceof ile daralt |
| Custom error class | `class NetworkError extends AppError` |
| `Result<T>` pattern | Beklenen hata → throw yerine wrap |
| `finally` | Resource cleanup — her zaman çalışır |
| `withTimeout` | AI API, uzun işlemler için süre sınırı |
| Merkezi handler | `handleError(error)` — instanceof zinciri |
