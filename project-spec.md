# Job-Targeted Resume Builder — Project Specification

> Bu dosya Claude Code tarafından okunmak üzere hazırlanmıştır.
> Projeyi bu dokümandaki kararlara göre inşa et. Belirsiz bir durum olduğunda bu dosyaya dön.

---

## ⚡ Önce Bunu Oku: 21st.dev Magic MCP

Bu projede **21st.dev Magic MCP** kullanılacak. Henüz kurulu değilse projeye başlamadan önce aşağıdaki komutu terminalde çalıştır ve kurulumu doğrula:

```bash
claude mcp add magic --scope user --env API_KEY="BURAYA_KEY_GİR" -- npx -y @21st-dev/magic@latest
```

Kurulum tamamlandıktan sonra tüm UI componentleri yazılmadan önce Magic'in ücretsiz araçlarını kullan.

### Aktif araçlar (ikisi de ücretsiz)

**1. Inspiration Search**
Her component yazmadan önce bunu çalıştır. 21st.dev'deki binlerce gerçek, production'da kullanılan component'i semantic olarak tarar ve en alakalı örnekleri referans olarak getirir. Claude Code bu referansları alır, projenin renk paleti ve yapısına uyarlayarak kodu yazar.

**2. SVG Icon Search**
İkon gerektiğinde bu tool'u kullan. Binlerce marka ve UI ikonu arasından arama yapar, doğrudan JSX/TSX formatında koda ekler. Harici icon library kurmana gerek kalmaz.

### Ne zaman Inspiration Search çalıştırmalısın?
Her yeni UI component'i yazmadan önce — istisnasız:

- Landing page hero section, feature bölümleri, pricing tablosu, footer
- Drag & drop dosya yükleme alanı
- ATS skoru için dairesel ring göstergesi
- Loading/processing animasyonu
- Upgrade modal'ı
- Dashboard liste tablosu
- CV profil kartları
- Butonlar, input alanları, badge'ler, card'lar

### Kullanmayacağın şey
**Magic Generate** (Pro, $20/m) — bu tool'u kullanma, ücretli. Inspiration Search ve SVG Icon Search yeterli.

### Workflow
```
1. Yeni component gerekiyor
      ↓
2. Inspiration Search → referans componentleri getir
      ↓
3. Referansları baz alarak component'i yaz
      (projenin renk paletine uyarla)
      ↓
4. İkon gerekiyorsa → SVG Icon Search
      ↓
5. shadcn/ui → temel yapı elemanları için (button, input, dialog vb.)
```

### Önemli kural
Inspiration Search'ten gelen referansları **stil rehberi olarak** kullan. Kodu birebir kopyalama — projenin renk paletine (#1E3A5F lacivert, beyaz, #F8FAFC gri), font'una (Inter) ve genel yapısına uyarla.

---

## 1. Proje Özeti

**Ürün adı:** Job-Targeted Resume Builder (isim daha sonra belirlenecek)

**Temel hedef:** Kullanıcının mevcut CV'sini yükleyip bir iş ilanı metni girmesine izin ver. AI bu iki girdiyi analiz ederek CV'yi o ilana özel optimize etsin, ATS uyum skoru göstersin ve optimize edilmiş CV'yi PDF olarak indirmeye sunsun.

**Hedef kitle:** Yeni mezunlar ve kariyer değiştirenler — ATS sistemini bilmeyen, CV yazmayı bilmeyen, yoğun iş arayışında olan kullanıcılar.

**Platform:** Web uygulaması (masaüstü öncelikli, mobil uyumlu)

**Dil:** İngilizce (UI ve tüm içerik — AI çıktıları dahil)

---

## 2. Tech Stack

| Katman | Teknoloji | Notlar |
|---|---|---|
| Framework | Next.js 14 (App Router) | Hem frontend hem backend aynı projede |
| Styling | Tailwind CSS | Utility-first, hızlı geliştirme |
| UI Components | 21st.dev Magic MCP — Inspiration Search (referans) + shadcn/ui (yapı) | Magic Generate (ücretli) kullanma |
| Database + Auth + Storage | Supabase | Tek platform, ücretsiz tier ile başla |
| AI API | OpenAI GPT-4o-mini | CV optimizasyonu, cover letter, LinkedIn optimizer için |
| PDF Export | @react-pdf/renderer | CV'yi PDF olarak render et |
| PDF Parse | pdf-parse | Kullanıcının yüklediği PDF'ten metin çıkar |
| Ödeme | Paddle | Türkiye'den global ödeme almak için Merchant of Record |
| Deploy | Vercel | Next.js ile native uyum, ücretsiz tier |

### Önemli kısıtlamalar
- Stripe kullanma. Türkiye'de çalışmıyor.
- URL scraping yok. Kaldırıldı. İş ilanı sadece metin olarak girilir.
- Ayrı bir backend server kurma. Next.js API Routes yeterli.
- Karmaşık state management library'si ekleme. React state yeterli.

---

## 3. Fiyatlandırma ve Plan Yapısı

### Planlar

| Plan | Fiyat | Tür |
|---|---|---|
| **Free** | $0 | Kayıt olunca 1 optimizasyon kredisi |
| **Starter** | $5 (tek seferlik) | 5 optimizasyon kredisi |
| **Pro** | $12/ay | Sınırsız — tüm premium özellikler |
| **Lifetime** | $79 (tek seferlik) | Sonsuza kadar Pro özellikleri |

### Hangi özellik hangi planda?

| Özellik | Free | Starter | Pro | Lifetime |
|---|---|---|---|---|
| CV Optimizasyonu | 1 hak | 5 hak | Sınırsız | Sınırsız |
| ATS Score + Keywords | ✅ | ✅ | ✅ | ✅ |
| PDF İndirme | ✅ | ✅ | ✅ | ✅ |
| Cover Letter Generator | ❌ | ❌ | ✅ | ✅ |
| LinkedIn Profile Optimizer | ❌ | ❌ | ✅ | ✅ |
| Kayıtlı CV Profilleri | 1 adet | 1 adet | Sınırsız | Sınırsız |
| Optimizasyon Geçmişi | Son 3 | Son 3 | Tümü | Tümü |

### Kredi mantığı
- Her CV optimizasyonu 1 kredi harcar.
- Pro ve Lifetime kullanıcıların kredisi sonsuz sayılır (999999).
- Kredi bitince upgrade modal göster.
- Cover Letter ve LinkedIn Optimizer kredi harcamaz — sadece Pro/Lifetime erişir.
- Ödeme Paddle üzerinden yapılır.

---

## 4. Veritabanı Şeması (Supabase)

### `users` tablosu
Supabase Auth tarafından otomatik yönetilir. `auth.users` tablosunu kullan.

### `resumes` tablosu
Kullanıcının kayıtlı CV profilleri. Birden fazla CV kaydedilebilir.

```sql
create table resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  original_filename text,
  original_text text not null,
  is_default boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

### `optimizations` tablosu

```sql
create table optimizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  resume_id uuid references resumes(id) on delete set null,
  job_title text,
  job_company text,
  job_description_raw text,
  optimized_cv_json jsonb,
  ats_score integer,
  ats_keywords jsonb,
  cover_letter text,
  linkedin_suggestions jsonb,
  created_at timestamp with time zone default now()
);
```

### `user_plans` tablosu

```sql
create table user_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  plan text default 'free',
  credits integer default 1,
  pro_expires_at timestamp with time zone,
  paddle_subscription_id text,
  updated_at timestamp with time zone default now()
);
```

### Row Level Security
Tüm tablolarda RLS aktif et.

```sql
alter table resumes enable row level security;
create policy "Users own their resumes"
  on resumes for all using (auth.uid() = user_id);

alter table optimizations enable row level security;
create policy "Users own their optimizations"
  on optimizations for all using (auth.uid() = user_id);

alter table user_plans enable row level security;
create policy "Users own their plan"
  on user_plans for all using (auth.uid() = user_id);
```

---

## 5. Kimlik Doğrulama (Auth)

- Supabase Auth kullan.
- **Google OAuth** ve **Email/Şifre** ile giriş — ikisi de aktif.
- Email ile kayıt olunca doğrulama maili göndersin.
- Giriş yapmayan kullanıcılar `/app/*` sayfalarına erişemez, `/login`'e yönlendirilir.
- Giriş yapmış kullanıcılar landing page'e gittiğinde `/app/upload`'a yönlendirilir.

---

## 6. Uygulama Akışı (User Flow)

```
Landing Page
    ↓ (Google veya email ile giriş)
CV Seç / Yükle  (/app/upload)
    ↓ (Kayıtlı CV seç VEYA yeni PDF yükle)
Job Input  (/app/job)
    ↓ (İş ilanı metnini yapıştır)
Processing  (/app/processing)
    ↓
Results  (/app/results/[id])
    ↓
Download PDF + Cover Letter (Pro) + LinkedIn (Pro)
    ↓
Dashboard  (/app/dashboard)
```

---

## 7. Sayfalar ve Componentler

### 7.1 Landing Page (`/`)

İçerik:
- Hero section: başlık, alt başlık, CTA ("Get Started Free")
- Nasıl çalışır: 3 adım (Upload CV → Paste Job → Get Optimized CV)
- Sosyal kanıt: "1 free optimization — no credit card required"
- Feature listesi: ATS Score, Cover Letter, LinkedIn Optimizer, Saved Profiles
- Fiyatlandırma tablosu (Free / Starter $5 / Pro $12/mo / Lifetime $79)
- Footer

### 7.2 CV Yükleme / Seçme Sayfası (`/app/upload`)

Auth korumalı.

**A) Kayıtlı CV varsa:**
- CV profillerini kart olarak listele (isim, tarih, "Use This CV" butonu)
- "Upload New CV +" butonu
- Free/Starter: 1 profil limiti — limitdeyse "Upgrade for unlimited profiles" göster

**B) Kayıtlı CV yoksa veya yeni yüklüyorsa:**
- Drag & drop PDF yükleme alanı
- "Name this CV profile" input (örn: "Software Developer CV")
- Sadece PDF
- PDF yüklenince `pdf-parse` ile metin çıkar, `resumes` tablosuna kaydet
- "Save & Continue →" butonu

### 7.3 Job Input Sayfası (`/app/job`)

Auth korumalı. URL scraping yok.

- Büyük textarea: "Paste the job description here"
- Alt yazı: "Copy it directly from LinkedIn, Indeed, or any job board"
- Min 100 karakter zorunlu, karakter sayacı
- "Analyze & Optimize →" butonu

### 7.4 Processing Sayfası (`/app/processing`)

- Animasyonlu loading
- Adım mesajları (2-3 saniyede bir değişir):
  1. "Reading your resume..."
  2. "Analyzing the job description..."
  3. "Identifying key skills and keywords..."
  4. "Rewriting your experience..."
  5. "Calculating ATS match score..."
- `beforeunload` uyarısı

### 7.5 Results Sayfası (`/app/results/[id]`)

**Sol panel:**
- Dairesel ATS skoru (kırmızı <50, sarı 50-75, yeşil >75)
- Matched Keywords (yeşil checkmark)
- Missing Keywords (kırmızı X)
- Improvement Tips (3 madde, İngilizce)

**Sağ panel:**
- Optimized CV preview (PDF render)
- "Download PDF" butonu

**Premium bölümü (sayfanın altında):**
- Pro/Lifetime → "Generate Cover Letter" ve "Optimize LinkedIn Profile" butonları aktif
- Free/Starter → Aynı butonlar görünür ama kilitli (lock ikonu + "Upgrade to Pro" tooltip)

**Alt navigasyon:**
- "Start Over" | "View History"

### 7.6 Cover Letter Sayfası (`/app/results/[id]/cover-letter`)

Pro/Lifetime korumalı.

- Üretilen cover letter metni — düzenlenebilir textarea
- "Regenerate" butonu
- "Copy to Clipboard" butonu
- "Download as PDF" butonu

### 7.7 LinkedIn Optimizer Sayfası (`/app/results/[id]/linkedin`)

Pro/Lifetime korumalı.

Üretilecekler:
- **Headline önerisi** — 3 alternatif, yanında "Copy" butonu
- **About/Summary önerisi** — iş ilanına özel, "Copy" butonu
- **Skills önerisi** — eklemesi gereken skill listesi, "Copy" butonu

### 7.8 Dashboard (`/app/dashboard`)

**Üst — Plan Durumu:**
- Plan badge + kredi bilgisi veya "Pro — Unlimited"
- Free/Starter için "Upgrade" butonu

**Orta — Kayıtlı CV Profilleri:**
- CV kartları: isim, tarih, "Use" butonu, "Delete" butonu
- Free/Starter: 1 CV limiti uyarısı

**Alt — Optimizasyon Geçmişi:**
- Tablo: Pozisyon + Şirket | ATS Skoru | Tarih | PDF İndir | Detay
- Free/Starter: Son 3, "Upgrade to see full history" linki
- Pro/Lifetime: Son 50

---

## 8. AI Entegrasyonu (OpenAI)

### 8.1 Konfigürasyon

```
Model: gpt-4o-mini
API Key: OPENAI_API_KEY
```

### 8.2 CV Optimizasyon Prompt'u

```
You are an expert career consultant and ATS (Applicant Tracking System) specialist.

Below is a user's original resume and a job description they want to apply for.

Your tasks:
1. Extract ALL critical keywords, skills, and requirements from the job description.
2. Compare with the resume — identify matched and missing keywords.
3. Rewrite the resume tailored to this job. Do NOT fabricate experience. Only rephrase existing experience and naturally integrate missing keywords where appropriate.
4. Calculate an ATS match score (0-100) based on keyword overlap and relevance.
5. Write 3 specific, actionable improvement tips.

IMPORTANT:
- Respond ONLY in English regardless of the resume or job description language.
- Return ONLY valid JSON, no extra text, no markdown code blocks.

{
  "job_title": "string",
  "job_company": "string or null",
  "ats_score": number,
  "matched_keywords": ["string"],
  "missing_keywords": ["string"],
  "tips": ["string", "string", "string"],
  "optimized_cv": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "linkedin": "string or null",
    "location": "string or null",
    "summary": "string",
    "experience": [
      {
        "title": "string",
        "company": "string",
        "duration": "string",
        "bullets": ["string"]
      }
    ],
    "education": [
      {
        "degree": "string",
        "school": "string",
        "year": "string"
      }
    ],
    "skills": ["string"]
  }
}

--- RESUME ---
{{CV_TEXT}}

--- JOB DESCRIPTION ---
{{JOB_DESCRIPTION}}
```

### 8.3 Cover Letter Prompt'u

```
You are an expert career consultant. Write a professional cover letter in English.

Guidelines:
- 3-4 paragraphs, professional tone
- First paragraph: strong opening, mention the role and company
- Middle: connect candidate's experience to job requirements
- Final: call to action
- Do NOT use generic phrases like "I am writing to express my interest"
- Respond with ONLY the cover letter text, no subject line, no JSON

--- OPTIMIZED RESUME ---
{{OPTIMIZED_CV}}

--- JOB DESCRIPTION ---
{{JOB_DESCRIPTION}}
```

### 8.4 LinkedIn Optimizer Prompt'u

```
You are a LinkedIn profile optimization expert. Respond only in English.

Return ONLY valid JSON:

{
  "headlines": ["string", "string", "string"],
  "about": "string (300-400 words LinkedIn summary)",
  "skills": ["string"]
}

--- OPTIMIZED RESUME ---
{{OPTIMIZED_CV}}

--- JOB DESCRIPTION ---
{{JOB_DESCRIPTION}}
```

### 8.5 Hata Yönetimi

- API hatası → "Something went wrong. Your credit has not been used. Please try again." Kredi düşme.
- JSON parse hatası → 2 retry, sonra hata göster.
- PDF parse hatası → "We couldn't read your PDF. Please make sure it's a text-based PDF, not a scanned image."

---

## 9. PDF Export

`@react-pdf/renderer` ile:

**CV Şablonu:**
- Font: Inter veya Roboto
- Renk: Siyah metin, #1E3A5F başlıklar, açık gri ayırıcılar
- Sıra: İletişim → Özet → Deneyim → Eğitim → Beceriler
- A4 sayfa boyutu, 1 inç margin

---

## 10. API Endpoints

| Endpoint | Method | Plan | Açıklama |
|---|---|---|---|
| `/api/parse-pdf` | POST | Tümü | PDF metni çıkar, resumes tablosuna kaydet |
| `/api/optimize` | POST | Tümü (kredili) | CV + iş ilanı → GPT-4o-mini |
| `/api/cover-letter` | POST | Pro/Lifetime | Cover letter üret |
| `/api/linkedin-optimize` | POST | Pro/Lifetime | LinkedIn önerileri üret |
| `/api/download-pdf` | GET | Tümü | Optimization ID → PDF oluştur |
| `/api/resumes` | GET/POST/DELETE | Tümü | CV profili CRUD |
| `/api/credits/check` | GET | Tümü | Plan ve kredi durumu |
| `/api/credits/use` | POST | Tümü | 1 kredi düş |
| `/api/paddle/webhook` | POST | — | Paddle ödeme webhook'u |

---

## 11. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
PADDLE_API_KEY=
PADDLE_WEBHOOK_SECRET=
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=
PADDLE_PRODUCT_STARTER=
PADDLE_PRODUCT_PRO=
PADDLE_PRODUCT_LIFETIME=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 12. Klasör Yapısı

```
/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── login/page.tsx
│   ├── app/
│   │   ├── upload/page.tsx
│   │   ├── job/page.tsx
│   │   ├── processing/page.tsx
│   │   └── results/
│   │       └── [id]/
│   │           ├── page.tsx
│   │           ├── cover-letter/page.tsx
│   │           └── linkedin/page.tsx
│   ├── dashboard/page.tsx
│   └── api/
│       ├── parse-pdf/route.ts
│       ├── optimize/route.ts
│       ├── cover-letter/route.ts
│       ├── linkedin-optimize/route.ts
│       ├── download-pdf/route.ts
│       ├── resumes/route.ts
│       ├── credits/
│       │   ├── check/route.ts
│       │   └── use/route.ts
│       └── paddle/
│           └── webhook/route.ts
├── components/
│   ├── ui/
│   ├── AtsScoreRing.tsx
│   ├── CvPreview.tsx
│   ├── CvProfileCard.tsx
│   ├── FileUploader.tsx
│   ├── PricingTable.tsx
│   ├── UpgradeModal.tsx
│   └── PlanBadge.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── openai.ts
│   ├── pdf-parser.ts
│   └── plan-guard.ts
├── constants/
│   └── plans.ts
├── types/
│   └── index.ts
└── middleware.ts
```

---

## 13. Plan Guard — Erişim Kontrolü

`lib/plan-guard.ts`:

```typescript
export const isPro = (plan: string): boolean =>
  plan === 'pro' || plan === 'lifetime'

export const hasCredits = (credits: number): boolean =>
  credits > 0

export const canSaveMultipleResumes = (plan: string): boolean =>
  isPro(plan)

export const canViewFullHistory = (plan: string): boolean =>
  isPro(plan)
```

API route'larında plan kontrolü:

```typescript
const { plan } = await getUserPlan(userId)
if (!isPro(plan)) {
  return NextResponse.json({ error: 'upgrade_required' }, { status: 403 })
}
```

Frontend'de lock UI:

```
isPro → özelliği göster
!isPro → özelliği göster ama lock overlay + "Upgrade to Pro" butonu
```

---

## 14. Middleware

```
/app/*        → giriş yapmamışsa /login'e yönlendir
/dashboard/*  → giriş yapmamışsa /login'e yönlendir
```

---

## 15. Kredi Sistemi Mantığı

```
"Analyze & Optimize" butonuna basıldı
    ↓
/api/credits/check
    ↓
isPro → devam et
credits > 0 → devam et
credits = 0 → Upgrade modal, dur
    ↓
/api/optimize
    ↓
Başarılı → kaydet → kredi düş → results sayfasına yönlendir
Hata → kredi düşme → hata mesajı
```

---

## 16. Paddle Entegrasyonu

### Ürün ID'leri
- Starter (5 kredi): `PADDLE_PRODUCT_STARTER`
- Pro Monthly ($12/ay): `PADDLE_PRODUCT_PRO`
- Lifetime ($79): `PADDLE_PRODUCT_LIFETIME`

### Webhook Mantığı

```
transaction.completed:
  Starter → credits += 5, plan = 'starter'
  Pro → plan = 'pro', credits = 999999, pro_expires_at = +30 gün
  Lifetime → plan = 'lifetime', credits = 999999

subscription.canceled:
  plan = 'free', credits = 0
```

Her checkout'ta `custom_data: { user_id }` geçir.

---

## 17. Geliştirme Öncelikleri

### 🔴 Acil — Bug Fix
1. **ATS keyword bug** — Matched/Missing keywords iş ilanından değil CV'den geliyor. Prompt güçlendirildi (bkz. Bölüm 8.2). AI response'unu console.log ile debug et.
2. **ATS skoru her zaman 0** — JSON parse sorununu bul ve düzelt.
3. **URL scraping kaldır** — Job Input'tan URL tab/input'u tamamen kaldır, sadece textarea kalsın.
4. **AI çıktıları İngilizce** — Tüm prompt'lara "Respond only in English" ekle.

### 🟡 Yeni Özellikler
5. **DB şemasını güncelle** — `user_plans` ekle, `resumes` tablosuna `name` ve `is_default` ekle.
6. **CV Profil Sistemi** — Birden fazla CV kaydı, upload sayfasında kayıtlı CV seçimi.
7. **Plan sistemi** — Free/Starter/Pro/Lifetime, `plan-guard.ts`.
8. **Pricing sayfasını güncelle** — Lifetime $79 ekle.
9. **Cover Letter Generator** — Pro/Lifetime özelliği.
10. **LinkedIn Profile Optimizer** — Pro/Lifetime özelliği.
11. **Results sayfası premium bölümü** — Kilitli/açık butonlar.
12. **Paddle Lifetime ürünü** — Webhook güncelle.

---

## 18. UI/UX Notları

- **Renk paleti:** #1E3A5F lacivert + Beyaz + #F8FAFC gri
- **Font:** Inter
- **Premium lock:** Buton görünür, lock ikonu var, hover'da "Upgrade to Pro" tooltip
- **Plan badge:** Dashboard ve navbar'da göster
- **Upgrade modal:** Fiyat, plan karşılaştırması, Paddle checkout butonu
- **Mobile:** Kırılmamalı, masaüstü öncelikli

---

## 19. Kod Kalitesi — "Vibe Coding" Yasak

**Genel**
- `any` kullanma. `types/index.ts`'de tüm interface'leri tanımla.
- `console.log` bırakma. Sadece `console.error` try/catch içinde.
- TODO/FIXME bırakma.
- Hardcode değer yazma. Fiyatlar ve limitler `constants/plans.ts`'den gelsin.

**Component'ler**
- Tek sorumluluk. 200 satırı geçerse böl.
- Props typed olsun.
- Loading ve error state'lerini her zaman handle et.

**API Routes**
- Input validation zorunlu.
- Her route'ta try/catch.
- Tutarlı response: `{ data, error }`.

**Güvenlik**
- OpenAI API key sadece server-side.
- Paddle webhook imza doğrulaması zorunlu.
- Plan kontrolü her zaman server'da yapılsın.

**UI/UX**
- Her buton tıklandığında loading/disabled state.
- Double-submit engelle.
- Hata mesajları kullanıcı dilinde.

---

## 20. Dikkat Edilecek Noktalar

- OpenAI API key sadece server-side API route'larında.
- CV metni `resumes.original_text` alanına kaydedilsin, PDF dosyası saklanmasın.
- Plan kontrolü her zaman Supabase'den çekilerek yapılsın, client'tan gelen veriye güvenme.
- `optimized_cv_json` için `types/index.ts`'de interface tanımla.
- Paddle webhook'larını `PADDLE_WEBHOOK_SECRET` ile doğrula.
- Rate limiting: `/api/optimize`'a dakikada 3'ten fazla istek → 429.
- Cover letter ve LinkedIn optimizer kredi harcamaz ama plan kontrolü yapar.
