# TypeScript Nedir?

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
TypeScript'in ne olduğunu, JavaScript ile ilişkisini ve nasıl çalıştığını öğreneceksin. Bölüm sonunda TypeScript'i neden öğrenmen gerektiğini anlayacaksın.

</div>

---

## 📖 TypeScript'e Giriş

TypeScript, Microsoft tarafından geliştirilen ve JavaScript'in üzerine inşa edilmiş bir programlama dilidir. Teknik terimle söylersek: TypeScript, JavaScript'in **superset**'idir (üst kümesi).

**Superset ne demek?** Çok basit bir şekilde açıklayalım:

> Elinde geçerli bir JavaScript kodu varsa, o kod aynı zamanda geçerli bir TypeScript kodudur. Ama geçerli bir TypeScript kodu, her zaman geçerli JavaScript değildir.

Yani TypeScript, JavaScript'in **tüm özelliklerini içerir** ve üzerine yeni şeyler ekler. En önemli eklenti: **tip sistemi (type system)**.

<hr class="section-divider">

## 📖 TypeScript Nasıl Çalışır?

TypeScript kodu, tarayıcı veya Node.js tarafından **direkt çalıştırılamaz**. Çünkü onlar sadece JavaScript anlar. Bu yüzden TypeScript bir **compiler (derleyici)** aracılığıyla önce JavaScript'e dönüştürülür.

```
TypeScript kodu (.ts)
        ↓
   tsc (compiler)
        ↓
JavaScript kodu (.js)
        ↓
  Tarayıcı / Node.js
```

Bu sürece **compilation** veya **transpilation** denir.

💻 **Basit bir örnek:**

```typescript
// app.ts — TypeScript dosyası
let message: string = "Merhaba, TypeScript!";
console.log(message);
```

Compiler çalıştırıldıktan sonra şu JavaScript dosyası üretilir:

```javascript
// app.js — Compiler'ın ürettiği JavaScript
let message = "Merhaba, TypeScript!";
console.log(message);
```

Gördüğün gibi `: string` ifadesi derleme sonrasında kayboldu — çünkü JavaScript tip bilgisini tanımaz. TypeScript, tip bilgisini sadece **geliştirme sürecinde** kullanır.

<hr class="section-divider">

## 📖 TypeScript Dosyaları

| Uzantı | Açıklama |
|--------|----------|
| `.ts` | Normal TypeScript dosyası |
| `.tsx` | JSX (React) içeren TypeScript dosyası |
| `.d.ts` | Tip tanım dosyası (declaration file) |
| `.js` | Compiler'ın ürettiği JavaScript dosyası |

<div class="callout callout-warning">

**⚠️ Dikkat:** `.js` dosyalarını elle düzenleme — bunlar compiler tarafından üretilir ve bir sonraki derlemede üzerlerine yazılır. Değişikliklerini her zaman `.ts` dosyasında yap.

</div>

<hr class="section-divider">

## 📖 TypeScript'in Temel Özellikleri

### 1. Static Type System (Statik Tip Sistemi)

JavaScript **dynamically typed** (dinamik tipli) bir dildir — değişkenlerin tipi runtime'da belirlenir. TypeScript ise **statically typed** (statik tipli) — tipler derleme anında kontrol edilir.

```typescript
// JavaScript'te bu hata runtime'da (programı çalıştırınca) ortaya çıkar
function greet(name) {
    return name.toUpperCase();
}
greet(42); // TypeError: name.toUpperCase is not a function

// TypeScript'te bu hata derleme anında yakalanır — program çalışmadan önce
function greet(name: string): string {
    return name.toUpperCase();
}
greet(42); // ❌ Compile-time hata: Argument of type 'number' is not assignable to parameter of type 'string'
```

### 2. IDE Desteği

TypeScript, VS Code gibi editörlerde mükemmel **autocomplete** (otomatik tamamlama) ve **IntelliSense** desteği sağlar. Bir objenin hangi alanlara sahip olduğunu, bir fonksiyonun ne aldığını ve ne döndürdüğünü editor otomatik gösterir.

### 3. Güncel JavaScript Özellikleri

TypeScript, henüz tarayıcılar tarafından tam desteklenmeyen yeni JavaScript özelliklerini bugünden kullanmanı sağlar. Compiler eski versiyona dönüştürür.

<hr class="section-divider">

## 🏭 Büyük Projelerde TypeScript

<div class="callout callout-real-world">

**🏭 Gerçek Dünya Bağlamı**

Küçük projelerde JavaScript yeterlidir. Ama şu durumlarda TypeScript şart haline gelir:

- **Büyük ekipler**: 5+ geliştirici aynı kod tabanında çalışıyorsa
- **Karmaşık veri modelleri**: E-ticaret siparişleri, finans işlemleri, sağlık verileri
- **Uzun ömürlü projeler**: 1+ yıl sürecek ve sürekli büyüyecek yazılımlar
- **API entegrasyonları**: Çok sayıda harici servis

Angular, NestJS, Prisma, Next.js gibi popüler framework'ler TypeScript'i varsayılan dil olarak kullanır.

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Başlarken:**
- TypeScript'i JavaScript'ten ayrı bir dil olarak değil, "daha güvenli JavaScript" olarak düşün
- Önce `strict: false` ile başla, sonra `strict: true`'ya geç
- Her `.ts` dosyasının ürettiği `.js` dosyayı `.gitignore`'a ekle
- Compiler hata mesajlarını dikkatle oku — çok bilgilendirici

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Yaygın Başlangıç Hataları:**
- Üretilen `.js` dosyalarını elle düzenleme
- `any` tipini her yerde kullanarak TypeScript'i etkisiz hale getirme
- Derleme hatalarını `// @ts-ignore` ile kapatma (geçici çözüm olarak kabul edilebilir ama alışkanlık yapma)
- TypeScript öğrenmeden direkt büyük projeye atlama

</div>

<hr class="section-divider">

## 📋 Özet

| Kavram | Açıklama |
|--------|----------|
| TypeScript | JavaScript'in superset'i — tip sistemi ekler |
| Compilation | `.ts` → `.js` dönüşümü (tsc ile) |
| Static Typing | Tipler derleme anında kontrol edilir |
| `.ts` / `.tsx` | TypeScript dosya uzantıları |
| Type System | Değişken ve fonksiyon tiplerini tanımlama sistemi |
| IDE Support | Autocomplete, hata gösterimi, refactoring yardımı |
