# RAG Pipeline Tipleme

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
RAG (Retrieval-Augmented Generation) nedir ve neden kullanılır. `DocumentChunk`, `EmbeddingResult`, `RetrievalResult` tip tanımları. Embedding API tipleme. Vector arama tipi. Tam RAG pipeline TypeScript implementasyonu.

</div>

---

## 📖 RAG Nedir? Neden Lazım?

LLM'lerin iki temel zayıflığı var: bilgi kesim tarihi ve kendi dokümanlarını bilmeme. RAG bu sorunu çözer:

```
Bilgi Tabanı (PDF, Markdown, DB)
    ↓ chunk + embed
Vector Database (ChromaDB, pgvector)
    ↓
Kullanıcı sorusu geldi
    ↓ embed
Semantik arama → En ilgili chunk'lar
    ↓ context olarak ekle
LLM → "Bu bağlama göre yanıt ver"
    ↓
Halüsinasyona gerek yok — yanıt belgede var
```

TypeScript'in buradaki rolü: embedding'den retrieval'a, context oluşturmaya kadar her adımda tip güvencesi sağlamak.

<hr class="section-divider">

## 📖 Temel RAG Tipleri

```typescript
// Embedding sonucu — vektör temsil
interface EmbeddingResult {
    text: string;
    embedding: number[];    // 1536 boyutlu float array (text-embedding-3-small)
    tokenCount: number;
    model: string;
}

// Doküman parçası — chunk'lama sonrası
interface DocumentChunk {
    id: string;
    documentId: string;
    content: string;
    embedding: number[];
    metadata: DocumentMetadata;
    createdAt: string;
}

interface DocumentMetadata {
    source: string;           // dosya adı veya URL
    title?: string;
    page?: number;            // PDF sayfa numarası
    chunkIndex: number;       // o dokümandaki kaçıncı chunk
    totalChunks: number;
    language?: "tr" | "en";
}

// Arama sonucu — chunk + benzerlik skoru
interface RetrievalResult {
    chunk: DocumentChunk;
    similarity: number;       // 0-1 arası, 1 = tam eşleşme
    rank: number;             // 1 = en benzer
}

// Doküman yükleme durumu
type DocumentStatus =
    | { status: "processing"; progress: number }
    | { status: "ready"; chunkCount: number }
    | { status: "error"; message: string };
```

<hr class="section-divider">

## 📖 Embedding API Tipleme

```typescript
// OpenAI Embeddings API yanıt tipi
interface OpenAIEmbeddingResponse {
    object: "list";
    data: Array<{
        object: "embedding";
        embedding: number[];
        index: number;
    }>;
    model: string;
    usage: {
        prompt_tokens: number;
        total_tokens: number;
    };
}

// Tip güvenli embedding fonksiyonu
async function embedText(text: string): Promise<EmbeddingResult> {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY ?? ""}`
        },
        body: JSON.stringify({
            model: "text-embedding-3-small",
            input: text
        })
    });

    if (!res.ok) throw new Error(`Embedding API hata: ${res.status}`);

    const data: unknown = await res.json();
    const response = data as OpenAIEmbeddingResponse;

    return {
        text,
        embedding: response.data[0].embedding,
        tokenCount: response.usage.total_tokens,
        model: response.model
    };
}

// Batch embedding — birden fazla text, tek API çağrısı
async function embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
    if (texts.length === 0) return [];

    const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY ?? ""}`
        },
        body: JSON.stringify({
            model: "text-embedding-3-small",
            input: texts
        })
    });

    if (!res.ok) throw new Error(`Batch embedding hata: ${res.status}`);

    const data = (await res.json()) as OpenAIEmbeddingResponse;

    return data.data.map((item, i) => ({
        text: texts[i],
        embedding: item.embedding,
        tokenCount: Math.ceil(texts[i].length / 4), // yaklaşık
        model: data.model
    }));
}
```

<hr class="section-divider">

## 📖 Document Processing Pipeline

```typescript
// Chunking seçenekleri
interface ChunkOptions {
    chunkSize?: number;       // karakter sayısı (varsayılan: 1000)
    chunkOverlap?: number;    // overlap (varsayılan: 200)
    separator?: string;       // öncelikli bölme noktası
}

// Basit recursive text splitter
function splitText(
    text: string,
    options: ChunkOptions = {}
): string[] {
    const { chunkSize = 1000, chunkOverlap = 200 } = options;
    const separators = ["\n\n", "\n", ". ", " ", ""];
    const chunks: string[] = [];

    function split(text: string, separators: string[]): void {
        if (text.length <= chunkSize) {
            if (text.trim()) chunks.push(text.trim());
            return;
        }

        const sep = separators[0];
        const parts = text.split(sep);
        let current = "";

        for (const part of parts) {
            const candidate = current ? current + sep + part : part;
            if (candidate.length <= chunkSize) {
                current = candidate;
            } else {
                if (current.trim()) chunks.push(current.trim());
                // Overlap: bir önceki chunk'un sonunu al
                const overlap = current.slice(-chunkOverlap);
                current = overlap ? overlap + sep + part : part;
            }
        }

        if (current.trim()) chunks.push(current.trim());
    }

    split(text, separators);
    return chunks;
}

// Doküman işleme — chunk + embed + metadata
async function processDocument(
    content: string,
    documentId: string,
    metadata: Omit<DocumentMetadata, "chunkIndex" | "totalChunks">
): Promise<DocumentChunk[]> {
    const texts = splitText(content, { chunkSize: 1000, chunkOverlap: 200 });
    const embeddings = await embedBatch(texts);

    return embeddings.map((result, index) => ({
        id: `${documentId}-chunk-${index}`,
        documentId,
        content: result.text,
        embedding: result.embedding,
        metadata: {
            ...metadata,
            chunkIndex: index,
            totalChunks: texts.length
        },
        createdAt: new Date().toISOString()
    }));
}
```

<hr class="section-divider">

## 📖 Vector Arama Tipi

```typescript
// Vector store interface — ChromaDB, pgvector, Pinecone vb. için soyut katman
interface VectorStore {
    addChunks(chunks: DocumentChunk[]): Promise<void>;
    search(embedding: number[], topK: number): Promise<RetrievalResult[]>;
    deleteDocument(documentId: string): Promise<void>;
}

// Cosine similarity — in-memory implementasyon (test için)
function cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dot / (normA * normB);
}

// In-memory vector store — geliştirme/test için
class InMemoryVectorStore implements VectorStore {
    private chunks: DocumentChunk[] = [];

    async addChunks(chunks: DocumentChunk[]): Promise<void> {
        this.chunks.push(...chunks);
    }

    async search(queryEmbedding: number[], topK: number): Promise<RetrievalResult[]> {
        return this.chunks
            .map((chunk, i) => ({
                chunk,
                similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
                rank: 0  // sonra hesaplanacak
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK)
            .map((result, rank) => ({ ...result, rank: rank + 1 }));
    }

    async deleteDocument(documentId: string): Promise<void> {
        this.chunks = this.chunks.filter(c => c.documentId !== documentId);
    }
}
```

<hr class="section-divider">

## 🏭 Real-World: Tam RAG Pipeline

<div class="callout callout-real-world">

**🏭 Üretim Kalitesinde RAG Servisi**

```typescript
interface RAGOptions {
    topK?: number;
    similarityThreshold?: number;
    systemPrompt?: string;
}

interface RAGResult {
    answer: string;
    sources: Array<{
        content: string;
        source: string;
        similarity: number;
    }>;
    tokensUsed: number;
}

class RAGService {
    constructor(private readonly vectorStore: VectorStore) {}

    async query(
        question: string,
        options: RAGOptions = {}
    ): Promise<RAGResult> {
        const { topK = 5, similarityThreshold = 0.7 } = options;

        // 1. Soruyu embed et
        const queryResult = await embedText(question);

        // 2. Semantik arama
        const retrieved = await this.vectorStore.search(
            queryResult.embedding,
            topK
        );

        // 3. Threshold filtresi
        const relevant = retrieved.filter(r => r.similarity >= similarityThreshold);

        if (relevant.length === 0) {
            return {
                answer: "Bu soruya yanıt verecek ilgili bilgi bulunamadı.",
                sources: [],
                tokensUsed: queryResult.tokenCount
            };
        }

        // 4. Context oluştur — en ilgili chunk'lar
        const context = relevant
            .map((r, i) =>
                `[Kaynak ${i + 1}: ${r.chunk.metadata.source}]\n${r.chunk.content}`
            )
            .join("\n\n---\n\n");

        // 5. LLM'e gönder
        const prompt = `Aşağıdaki belgelerden elde edilen bağlamı kullanarak soruyu yanıtla.
Bağlamda bulunmayan bilgiler için "Bu bilgi mevcut belgelerde yer almıyor" de.
Yanıtını Türkçe ver.

BAĞLAM:
${context}

SORU: ${question}`;

        const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 1024,
                system: options.systemPrompt ?? "Sen belge tabanlı bir soru-cevap asistanısın.",
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await res.json() as ClaudeMessage;
        const answer = data.content
            .filter((b): b is TextBlock => b.type === "text")
            .map(b => b.text)
            .join("");

        return {
            answer,
            sources: relevant.map(r => ({
                content: r.chunk.content.slice(0, 200) + "...",
                source: r.chunk.metadata.source,
                similarity: Math.round(r.similarity * 100) / 100
            })),
            tokensUsed: data.usage.input_tokens + data.usage.output_tokens
        };
    }

    async addDocument(
        content: string,
        documentId: string,
        source: string
    ): Promise<{ chunkCount: number }> {
        const chunks = await processDocument(content, documentId, { source });
        await this.vectorStore.addChunks(chunks);
        return { chunkCount: chunks.length };
    }
}

// Kullanım
const vectorStore = new InMemoryVectorStore();
const rag = new RAGService(vectorStore);

// Doküman ekle
await rag.addDocument(
    "TypeScript, JavaScript'in üst kümesidir. Statik tip sistemi ekler...",
    "doc-ts-handbook",
    "typescript-handbook.md"
);

// Soru sor
const result = await rag.query("TypeScript nedir?");
console.log(result.answer);
console.log("Kaynaklar:", result.sources);
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ RAG Pipeline Best Practices:**
- Batch embedding kullan — tek tek istek yerine dizi gönder (hız + maliyet)
- `similarityThreshold` uygula — düşük benzerlikli chunk'lar yanıtı bozar
- Kaynak göster — kullanıcı hangi belgeden yanıt geldiğini görmeli
- Chunk overlap ekle — cümle ortasında kesilen içerik kaybolmasın
- `VectorStore` interface'i soyutla — ChromaDB'den pgvector'e geçiş kolaylaşır
- Context uzunluğunu kontrol et — token limitine dikkat

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Çok büyük chunk boyutu — context'i şişirir, odak kaybolur
splitText(content, { chunkSize: 10000 }); // ❌

// ❌ Similarity threshold olmadan tüm sonuçları LLM'e göndermek
const results = await vectorStore.search(embedding, 20);
// ❌ Düşük benzerlikli chunk'lar gürültü ekler

// ❌ Her chunk için ayrı embed çağrısı
for (const text of texts) {
    await embedText(text); // ❌ N API çağrısı — yavaş ve pahalı
}
// ✅ embedBatch(texts) — tek çağrı

// ❌ Embedding'i her sorguda dokümanlardan yeniden hesaplamak
// ✅ Embedding'i bir kez hesapla, vector store'a kaydet

// ❌ Context'i LLM'e ham göndermek
const context = chunks.map(c => c.content).join("\n");
// ✅ Kaynak bilgisi ve separator ekle, max context boyutunu koru
```

</div>

<hr class="section-divider">

## 📋 Özet

```
RAG Pipeline Adımları:

[Veri Yükleme]
Doküman → splitText() → string[]
    ↓ embedBatch()
DocumentChunk[] → vectorStore.addChunks()

[Sorgulama]
Soru → embedText() → number[]
    ↓ vectorStore.search(embedding, topK)
RetrievalResult[] → threshold filtresi
    ↓ context oluştur
LLM → yanıt + kaynaklar
```

| Tip | Açıklama |
|-----|----------|
| `EmbeddingResult` | Tek metin → embedding vektörü |
| `DocumentChunk` | Chunk + embedding + metadata |
| `DocumentMetadata` | Kaynak, sayfa, chunk indexi |
| `RetrievalResult` | Chunk + similarity skoru + rank |
| `VectorStore` | Soyut interface — chromaDB veya pgvector |
| `RAGResult` | Yanıt + kaynaklar + token kullanımı |
