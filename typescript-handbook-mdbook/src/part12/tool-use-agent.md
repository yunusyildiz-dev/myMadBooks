# Tool Use & Agent Döngüsü

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
LLM'e araç kullanma yeteneği vermek. `ClaudeTool` interface'i ile JSON Schema tipleme. `ToolRegistry` — fonksiyon kaydı. `stop_reason: "tool_use"` döngüsü. TypeScript ile tam tip güvenli agent mimarisi.

</div>

---

## 📖 Tool Use Nedir?

LLM kendi başına yapamadığı işleri (gerçek zamanlı veri, hesaplama, dosya okuma, web arama) harici fonksiyonlara devreder. Bu "function calling" veya "tool use" olarak adlandırılır:

```
Kullanıcı: "İstanbul bugün kaç derece?"
      ↓
Claude: "get_weather fonksiyonunu çağırmalıyım" → stop_reason: "tool_use"
      ↓
Kod: get_weather({ city: "İstanbul" }) → { temp: 24, condition: "Güneşli" }
      ↓
Claude: "İstanbul'da bugün 24°C ve güneşli."  → stop_reason: "end_turn"
```

TypeScript burada şu soruları cevaplar: Tool tanımı nasıl tiplendirilir? Fonksiyon kaydı nasıl tutulur? Döngü nasıl güvenli kurulur?

<hr class="section-divider">

## 📖 ClaudeTool — Tool Tanımı Tipi

```typescript
// Tool tanımı — Claude'a "hangi araçlar var" diye söyler
interface ClaudeToolProperty {
    type: string;
    description: string;
    enum?: string[];      // izin verilen değerler
    items?: { type: string }; // array ise item tipi
}

interface ClaudeTool {
    name: string;
    description: string;
    input_schema: {
        type: "object";
        properties: Record<string, ClaudeToolProperty>;
        required: string[];
    };
}

// Tool uygulama fonksiyon tipi
type ToolFn = (input: Record<string, unknown>) => Promise<unknown>;

// Tool registry — isim → fonksiyon
type ToolRegistry = Record<string, ToolFn>;
```

<hr class="section-divider">

## 📖 Tool Tanımlama — Örnekler

```typescript
// Hava durumu tool'u
const weatherTool: ClaudeTool = {
    name: "get_weather",
    description: "Verilen şehrin güncel hava durumu bilgisini getirir.",
    input_schema: {
        type: "object",
        properties: {
            city: {
                type: "string",
                description: "Şehir adı, örn: 'İstanbul', 'Ankara'"
            },
            unit: {
                type: "string",
                description: "Sıcaklık birimi",
                enum: ["celsius", "fahrenheit"]
            }
        },
        required: ["city"]
    }
};

// Matematiksel hesaplama tool'u
const calculatorTool: ClaudeTool = {
    name: "calculate",
    description: "Matematiksel ifade hesaplar. Basit aritmetik için kullan.",
    input_schema: {
        type: "object",
        properties: {
            expression: {
                type: "string",
                description: "Hesaplanacak ifade, örn: '2 + 2 * 3', 'sqrt(16)'"
            }
        },
        required: ["expression"]
    }
};

// Web arama tool'u
const searchTool: ClaudeTool = {
    name: "web_search",
    description: "Güncel bilgi için web'de arama yapar.",
    input_schema: {
        type: "object",
        properties: {
            query: { type: "string", description: "Arama sorgusu" },
            max_results: { type: "string", description: "Maksimum sonuç sayısı (1-10)" }
        },
        required: ["query"]
    }
};

// Fonksiyon implementasyonları
interface WeatherResult {
    city: string;
    temp: number;
    condition: string;
    humidity: number;
}

async function getWeather(input: Record<string, unknown>): Promise<WeatherResult> {
    const city = input.city as string;
    // Gerçek implementasyonda weather API çağrısı yapılır
    return { city, temp: 22, condition: "Güneşli", humidity: 65 };
}

async function calculate(input: Record<string, unknown>): Promise<{ result: number | string }> {
    const expression = input.expression as string;
    try {
        // NOT: Prodüksiyonda eval yerine mathjs kütüphanesi kullan
        const result = Function(`"use strict"; return (${expression})`)() as number;
        return { result };
    } catch {
        return { result: "Geçersiz ifade" };
    }
}

async function webSearch(input: Record<string, unknown>): Promise<{ results: string[] }> {
    const query = input.query as string;
    // Gerçek implementasyonda Tavily veya Serper API kullanılır
    return { results: [`"${query}" için arama sonuçları...`] };
}

// Registry oluştur
const toolRegistry: ToolRegistry = {
    get_weather: getWeather,
    calculate: calculate,
    web_search: webSearch
};

const tools: ClaudeTool[] = [weatherTool, calculatorTool, searchTool];
```

<hr class="section-divider">

## 📖 Agentic Loop — Tool Döngüsü

```typescript
async function runAgent(
    userMessage: string,
    tools: ClaudeTool[],
    registry: ToolRegistry,
    options: { maxIterations?: number; systemPrompt?: string } = {}
): Promise<string> {
    const { maxIterations = 10, systemPrompt } = options;
    const messages: ChatMessage[] = [{ role: "user", content: userMessage }];
    let iterations = 0;

    while (iterations < maxIterations) {
        iterations++;

        const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 4096,
                system: systemPrompt,
                tools,
                messages
            })
        });

        if (!res.ok) throw new Error(`API hata: ${res.status}`);

        const data = await res.json() as ClaudeMessage;

        // stop_reason'a göre dallan
        if (data.stop_reason === "end_turn") {
            // Bitti — metin yanıtı döndür
            return data.content
                .filter((b): b is TextBlock => b.type === "text")
                .map(b => b.text)
                .join("");
        }

        if (data.stop_reason === "tool_use") {
            // Asistan yanıtını geçmişe ekle
            messages.push({
                role: "assistant",
                content: JSON.stringify(data.content)
            });

            // Tüm tool çağrılarını işle
            const toolResults: ToolResultBlock[] = [];

            for (const block of data.content) {
                if (block.type !== "tool_use") continue;

                const fn = registry[block.name];
                if (!fn) throw new Error(`Tool bulunamadı: ${block.name}`);

                console.log(`Tool çağrılıyor: ${block.name}`, block.input);
                const result = await fn(block.input);
                console.log(`Tool sonucu:`, result);

                toolResults.push({
                    type: "tool_result",
                    tool_use_id: block.id,
                    content: JSON.stringify(result)
                });
            }

            // Tool sonuçlarını geçmişe ekle
            messages.push({
                role: "user",
                content: JSON.stringify(toolResults)
            });

            // Döngü devam eder — Claude sonuçlara göre tekrar yanıtlayacak
            continue;
        }

        if (data.stop_reason === "max_tokens") {
            throw new Error("Agent yanıtı max_tokens nedeniyle kesildi");
        }

        // Beklenmedik stop_reason
        throw new Error(`Beklenmedik stop_reason: ${data.stop_reason}`);
    }

    throw new Error(`Agent ${maxIterations} iterasyon sınırına ulaştı`);
}
```

<hr class="section-divider">

## 🏭 Real-World: Research Agent

<div class="callout callout-real-world">

**🏭 Üretim Kalitesinde Research Agent**

```typescript
// Tool tanımları — research agent için
const researchTools: ClaudeTool[] = [
    {
        name: "search_web",
        description: "Güncel bilgi için web araması yapar. Haber, istatistik veya güncel veri için kullan.",
        input_schema: {
            type: "object",
            properties: {
                query: { type: "string", description: "Arama sorgusu" },
                language: { type: "string", description: "Dil (tr/en)", enum: ["tr", "en"] }
            },
            required: ["query"]
        }
    },
    {
        name: "get_page_content",
        description: "Bir web sayfasının içeriğini okur.",
        input_schema: {
            type: "object",
            properties: {
                url: { type: "string", description: "Okunacak sayfanın URL'si" }
            },
            required: ["url"]
        }
    },
    {
        name: "summarize_text",
        description: "Uzun metni özetler. İçeriği kısaltmak için kullan.",
        input_schema: {
            type: "object",
            properties: {
                text: { type: "string", description: "Özetlenecek metin" },
                max_words: { type: "string", description: "Maksimum kelime sayısı" }
            },
            required: ["text"]
        }
    }
];

// Tool implementasyonları
const researchRegistry: ToolRegistry = {
    search_web: async (input) => {
        // Tavily API entegrasyonu
        const query = input.query as string;
        const res = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                api_key: process.env.TAVILY_API_KEY,
                query,
                max_results: 5
            })
        });
        return res.json();
    },

    get_page_content: async (input) => {
        const url = input.url as string;
        const res = await fetch(url);
        const html = await res.text();
        // Gerçekte cheerio veya playwright ile parse edilir
        return { url, content: html.slice(0, 5000) };
    },

    summarize_text: async (input) => {
        const text = input.text as string;
        const maxWords = Number(input.max_words ?? 200);
        const words = text.split(" ").slice(0, maxWords);
        return { summary: words.join(" ") + "..." };
    }
};

// Research agent çalıştır
async function researchAgent(topic: string): Promise<string> {
    return runAgent(topic, researchTools, researchRegistry, {
        maxIterations: 5,
        systemPrompt: `Sen bir araştırma asistanısın. Verilen konu hakkında:
1. Web'de araştır
2. Güvenilir kaynaklardan içerik oku
3. Özet çıkar
4. Markdown formatında rapor yaz`
    });
}

// Kullanım
const report = await researchAgent("TypeScript 5.0 yenilikleri");
console.log(report);
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Tool Use & Agent Best Practices:**
- `maxIterations` sınırı koy — sonsuz döngüden korun (varsayılan: 10)
- Tool registry'de `if (!fn)` kontrolü yap — bilinmeyen tool'da crash önle
- Her tool çağrısını logla — debug için kritik
- `stop_reason === "max_tokens"` durumunu yakala — agent yanıtı kesilmiş olabilir
- Tool description'larını ayrıntılı yaz — Claude doğru tool'u seçmek için buna bakar
- Tool'lar küçük ve tek sorumluluk ilkesine uygun olsun

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ maxIterations olmadan sonsuz döngü
while (true) {
    const response = await callClaude(messages, tools);
    if (response.stop_reason === "end_turn") break;
    // ❌ stop_reason hiç "end_turn" gelmezse sonsuz döngü
}

// ❌ Tool bulunamadığında crash
const fn = registry[block.name];
const result = await fn(block.input); // ❌ fn undefined ise TypeError

// ✅
const fn = registry[block.name];
if (!fn) throw new Error(`Bilinmeyen tool: ${block.name}`);

// ❌ Tool description'ı çok kısa
{ name: "search", description: "Arama yapar" }
// Claude ne zaman kullanacağını bilemez

// ✅ Spesifik description
{ name: "search_web", description: "Güncel haber, istatistik veya gerçek zamanlı veri için web araması yapar. Bilgin yoksa veya güncel veri gerekiyorsa kullan." }

// ❌ Tool sonucunu olduğu gibi döndürmek — büyük JSON context'i şişirir
return await fetchFullWebPage(url); // 50KB HTML
// ✅ Önemli kısımları çıkar, özetle
return { title, summary: extractText(html).slice(0, 2000) };
```

</div>

<hr class="section-divider">

## 📋 Özet

```
Agent Döngüsü Akışı:

while (iterations < maxIterations):
    │
    ├── callClaude(messages, tools)
    │
    ├── stop_reason === "end_turn"  → yanıtı döndür, çık
    │
    ├── stop_reason === "tool_use"  → tool'ları çalıştır
    │   ├── content.filter(b => b.type === "tool_use")
    │   ├── registry[block.name](block.input)
    │   └── toolResults → messages'a ekle, devam et
    │
    └── stop_reason === "max_tokens" → hata fırlat
```

| Kavram | Tip | Açıklama |
|--------|-----|----------|
| `ClaudeTool` | Interface | Tool tanımı — JSON Schema |
| `ToolRegistry` | `Record<string, ToolFn>` | İsim → fonksiyon |
| `ToolFn` | `(input) => Promise<unknown>` | Tool implementasyonu |
| `ToolUseBlock` | `ContentBlock` | LLM'in tool çağrısı |
| `ToolResultBlock` | `ContentBlock` | Tool sonucu — LLM'e gönderilir |
| `stop_reason` | `"tool_use" \| "end_turn"` | Döngü kontrolü |
