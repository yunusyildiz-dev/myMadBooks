# Kurulum & İlk Program

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
TypeScript geliştirme ortamını kuracak, ilk TypeScript programını yazacak ve çalıştıracaksın. Bölüm sonunda `tsconfig.json`'un temel ayarlarını da anlayacaksın.

</div>

---

## 📖 Neye İhtiyacın Var?

| Araç | Ne İşe Yarar | Zorunlu mu? |
|------|--------------|-------------|
| **Node.js** | TypeScript compiler'ı çalıştırır | ✅ Evet |
| **TypeScript (tsc)** | `.ts` → `.js` derleme | ✅ Evet |
| **ts-node** | Derleme olmadan direkt çalıştırma | Tavsiye edilir |
| **VS Code** | Mükemmel TS desteği olan editör | Tavsiye edilir |

<hr class="section-divider">

## 💻 Kurulum Adımları

### 1. Node.js Kurulumu

```bash
# Node.js'i https://nodejs.org adresinden indir ve kur.
# Kurulumu doğrula:
node -v    # örnek: v20.11.0
npm -v     # örnek: 10.2.4
```

### 2. TypeScript Compiler Kurulumu

```bash
# Global olarak kur — her projede kullanabilirsin
npm install -g typescript

# Kurulumu doğrula
tsc --version    # örnek: Version 5.4.0
```

### 3. ts-node Kurulumu (Tavsiye Edilir)

```bash
# ts-node: TypeScript'i derlemeden direkt çalıştırır
npm install -g ts-node

# Doğrula
ts-node --version
```

<div class="callout callout-tip">

**✅ Büyük projelerde:** TypeScript'i global yerine proje bazında kur:
```bash
npm install --save-dev typescript ts-node @types/node
```
Bu sayede projedeki TypeScript versiyonu her ekip üyesinde aynı olur.

</div>

<hr class="section-divider">

## 💻 İlk TypeScript Programı

### Adım 1: Proje Klasörü Oluştur

```bash
mkdir ts-hello-world
cd ts-hello-world
```

### Adım 2: TypeScript Dosyası Yaz

`app.ts` adında bir dosya oluştur:

```typescript
// app.ts
let message: string = "Merhaba, TypeScript!";
let year: number = 2025;
let isAwesome: boolean = true;

console.log(message);
console.log(`Yıl: ${year}, Harika mı: ${isAwesome}`);

// Fonksiyon ile
function greet(name: string): string {
    return `Merhaba, ${name}!`;
}

console.log(greet("Yunus"));
// greet(42);  // ❌ Bu satırı açsan hata verir — number değil string bekleniyor
```

### Adım 3: Derle ve Çalıştır

```bash
# Derleme — app.js oluşturur
tsc app.ts

# Çalıştır
node app.js

# VEYA ts-node ile tek komutla:
ts-node app.ts
```

**Çıktı:**
```
Merhaba, TypeScript!
Yıl: 2025, Harika mı: true
Merhaba, Yunus!
```

<hr class="section-divider">

## 📖 tsconfig.json — Proje Konfigürasyonu

Gerçek projelerde her dosyayı tek tek derlemek yerine `tsconfig.json` kullanılır. Bu dosya TypeScript'e tüm derleme ayarlarını söyler.

### tsconfig.json Oluşturma

```bash
tsc --init
```

Bu komut `tsconfig.json` dosyasını otomatik oluşturur. Ama yüzlerce yorum satırı gelir. Aşağıda **başlangıç için iyi bir temel yapılandırma** var:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Önemli Ayarlar Açıklaması

| Ayar | Değer | Ne Yapar? |
|------|-------|-----------|
| `target` | `ES2020` | Hangi JS versiyonuna derlenecek |
| `outDir` | `./dist` | Derlenen JS dosyaları nereye gidecek |
| `rootDir` | `./src` | TypeScript dosyaları nerede |
| `strict` | `true` | En sıkı tip kontrolü — **tavsiye edilir** |
| `esModuleInterop` | `true` | `import x from 'module'` syntax'ını aktif eder |

<div class="callout callout-tip">

**✅ `strict: true` Neden Önemli?**

`strict: true` şu kontrolleri otomatik aktif eder:
- `strictNullChecks` — null/undefined hatalarını yakalar
- `noImplicitAny` — tip belirtmeden `any` kullanımını engeller
- `strictFunctionTypes` — fonksiyon tip kontrolünü sıkılaştırır

Yeni projede hep `strict: true` ile başla.

</div>

### Proje Yapısı ile Derleme

```
ts-hello-world/
├── src/
│   └── app.ts        ← TypeScript kodunu buraya yaz
├── dist/             ← Derlenen JS dosyaları (gitignore'a ekle)
│   └── app.js
├── package.json
└── tsconfig.json
```

```bash
# tsconfig.json varken sadece "tsc" yeterli
tsc

# Watch modunda — dosya değişince otomatik derle
tsc --watch
```

<hr class="section-divider">

## 💻 package.json Scripts

Gerçek projelerde bu script'ler çok işe yarar:

```json
{
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "start": "node dist/app.js",
    "dev": "ts-node src/app.ts",
    "clean": "rm -rf dist"
  }
}
```

```bash
npm run dev      # Geliştirme — ts-node ile direkt çalıştır
npm run build    # Production build — JavaScript üret
npm start        # Build'i çalıştır
```

<hr class="section-divider">

## 💻 .gitignore

```gitignore
# TypeScript derlenmiş çıktısı — commit etme
dist/
node_modules/

# TypeScript cache
*.tsbuildinfo
```

<hr class="section-divider">

## 🏭 Gerçek Proje Kurulumu (Node.js + TypeScript)

<div class="callout callout-real-world">

**🏭 Orta Ölçekli Proje için Tam Kurulum**

```bash
mkdir my-project && cd my-project

# package.json oluştur
npm init -y

# TypeScript ve gerekli tipler
npm install --save-dev typescript ts-node @types/node

# Express için (web API projesi ise)
npm install express
npm install --save-dev @types/express

# tsconfig.json oluştur
npx tsc --init

# Klasör yapısını oluştur
mkdir -p src/routes src/services src/types
```

`tsconfig.json`'u düzenle:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Kurulum Best Practices:**
- TypeScript'i global değil, proje bağımlılığı olarak kur — `npm install --save-dev typescript`
- Her zaman `strict: true` kullan
- `dist/` klasörünü `.gitignore`'a ekle
- `ts-node` + `nodemon` kombinasyonu geliştirmede otomatik yeniden başlatma sağlar

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
- `dist/` klasörünü Git'e commit etme — sadece kaynak kod (`src/`) commit edilmeli
- `tsconfig.json` olmadan büyük proje yazmak — her dosyayı tek tek derlemek zorunda kalırsın
- TypeScript hata varken derlemeyi geçiştirme (`tsc --noEmitOnError false` kullanma)

</div>

<hr class="section-divider">

## 📋 Özet

| Adım | Komut | Açıklama |
|------|-------|----------|
| Node.js kur | — | nodejs.org'dan indir |
| TS kur | `npm install -g typescript` | Global compiler |
| ts-node kur | `npm install -g ts-node` | Direkt çalıştırıcı |
| tsconfig oluştur | `tsc --init` | Proje ayarları |
| Derle | `tsc` | `.ts` → `.js` |
| Çalıştır | `ts-node src/app.ts` | Derlemeden çalıştır |
| Watch modu | `tsc --watch` | Otomatik derleme |
