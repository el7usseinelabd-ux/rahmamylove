// Style reminder: Velvet Night — Arabic RTL, ink-black canvas, berry rose and antique gold accents, asymmetric editorial composition, restrained motion.
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { ArrowDownLeft, ChevronDown, Heart, LockKeyhole, Sparkles } from "lucide-react";

const letters = [
  {
    number: "01",
    teaser: "في كل مرة أراكِ فيها…",
    body: "أفهم أن بعض النِعم لا تُقاس بما تمنحنا إياه، بل بما تجعلنا عليه. معكِ صرت أهدأ، أصدق، وأقرب إلى نفسي.",
  },
  {
    number: "02",
    teaser: "أحب فيكِ الأشياء التي لا يلاحظها أحد…",
    body: "طريقتكِ في الإصغاء، ضحكتكِ حين تحاولين إخفاءها، وذاك الأمان الصغير الذي تتركينه في أي مكان تكونين فيه.",
  },
  {
    number: "03",
    teaser: "لو كان للوقت قلب…",
    body: "لاخترت أن يتوقف عند كل لحظة جمعتني بكِ. لكن بما أنه لا يتوقف، سأجمعها لكِ هنا، لحظة بعد لحظة.",
  },
];

const memories = [
  { src: "/manus-storage/rahma-memory-1.webp", label: "تفاصيل صغيرة، أثر كبير" },
  { src: "/manus-storage/rahma-memory-2.webp", label: "حين يصبح المساء ذكرى" },
  { src: "/manus-storage/WhatsApp_Image_2026-07-14_at_12.46.05_PM_(2)[1]_dcaf0c89.jpeg", label: "من ألبومنا الخاص" },
];

function AccessShell({ children }: { children: React.ReactNode }) {
  return <main dir="rtl" className="access-screen"><div className="grain" aria-hidden="true" /><div className="access-glow" /><header className="access-header"><span className="mark-wrap"><img src="/manus-storage/rahma-mark.webp" alt="" className="brand-mark" /></span><span className="font-serif">رحمة</span></header>{children}<span className="access-footer">لا يفتح هذا الباب إلا لمن تعرف الطريق</span></main>;
}

export default function Home() {
  const isPages = typeof window !== "undefined" && (window.location.hostname.endsWith("github.io") || window.location.hostname.endsWith("vercel.app"));
  const access = trpc.access.status.useQuery(undefined, { enabled: !isPages });
  const [pagesUnlocked, setPagesUnlocked] = useState(() => isPages && localStorage.getItem("rahma_pages_unlocked") === "1");
  const [showWelcome, setShowWelcome] = useState(false);
  const unlock = trpc.access.unlock.useMutation({ onSuccess: () => { setShowWelcome(true); access.refetch(); } });
  const [password, setPassword] = useState("");
  const [openLetter, setOpenLetter] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const isUnlocked = isPages ? pagesUnlocked : access.data?.unlocked;

  if (!isPages && access.isLoading) {
    return <AccessShell><div className="access-loader"><span className="loader-heart">♥</span><p>نفتح لكِ صندوق الذكريات…</p></div></AccessShell>;
  }

  if (!isUnlocked) {
    return (
      <AccessShell>
        <div className="access-card">
          <div className="access-seal"><img src="/manus-storage/rahma-mark.webp" alt="" /></div>
          <p className="eyebrow">هذه المساحة لكِ وحدكِ</p>
          <h1>إلى رحمة،<br /><em>بكلمة لا يعرفها سوانا.</em></h1>
          <p className="access-copy">أدخلِي كلمة المرور لفتح الرسالة التي خبّأتها لكِ.</p>
          <form onSubmit={(event) => { event.preventDefault(); if (isPages) { localStorage.setItem("rahma_pages_unlocked", "1"); setPagesUnlocked(true); setShowWelcome(true); } else { unlock.mutate({ password }); } }} className="access-form">
            <label htmlFor="rahma-password">كلمة المرور</label>
            <div className="password-field"><LockKeyhole size={16} /><input id="rahma-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="اكتبيها هنا…" autoFocus /><button type="submit" disabled={unlock.isPending} aria-label="فتح الرسالة"><ArrowDownLeft size={18} /></button></div>
            {!isPages && unlock.error && <p className="access-error">الكلمة ليست هذه المرة… جرّبي مرة أخرى.</p>}
          </form>
          <span className="access-note">رسالة خاصة • 2026</span>
        </div>
      </AccessShell>
    );
  }

  if (showWelcome) {
    return <AccessShell><div className="welcome-card"><span className="welcome-petal petal-one">✦</span><span className="welcome-petal petal-two">♥</span><span className="welcome-petal petal-three">✦</span><div className="welcome-seal"><img src="/manus-storage/rahma-mark.webp" alt="" /></div><p className="eyebrow">تم فتح الرسالة</p><h1>أهلًا بكِ<br /><em>يا رحمة.</em></h1><p>كل ما في الداخل كُتب لكِ، وبهدوء يشبه حضوركِ.</p><button className="welcome-enter" onClick={() => setShowWelcome(false)}>أدخل إلى رسالتي <ArrowDownLeft size={17} /></button></div></AccessShell>;
  }

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <main dir="rtl" className="min-h-screen overflow-hidden bg-ink text-ivory selection:bg-berry/30">
      <div className="grain" aria-hidden="true" />
      <header className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-[1440px] items-center justify-between px-6 py-6 md:px-12 lg:px-20">
        <a href="#top" className="group flex items-center gap-3" aria-label="رحمة، الصفحة الرئيسية">
          <span className="mark-wrap"><img src="/manus-storage/rahma-mark.webp" alt="" className="brand-mark" /></span>
          <span className="font-serif text-xl tracking-wide text-ivory">رحمة</span>
        </a>
        <nav className="hidden items-center gap-8 text-xs text-ivory/65 md:flex" aria-label="التنقل الرئيسي">
          <button onClick={() => scrollTo("letters")} className="nav-link">رسائل مخبأة</button>
          <button onClick={() => scrollTo("memories")} className="nav-link">ألبومنا</button>
          <button onClick={() => scrollTo("promise")} className="nav-link">وعدي لكِ</button>
        </nav>
        <button className="music-toggle" onClick={() => setIsPlaying(!isPlaying)} aria-label={isPlaying ? "إيقاف الموسيقى" : "تشغيل الموسيقى"}>
          <span className={isPlaying ? "music-bars playing" : "music-bars"}><i /><i /><i /></span>
          <span className="hidden sm:inline">{isPlaying ? "إيقاف الهدوء" : "موسيقى هادئة"}</span>
        </button>
      </header>

      <section id="top" className="hero relative isolate min-h-[760px] md:min-h-[860px]">
        <img src="/manus-storage/rahma-hero.webp" alt="مغلف ورسالة بين بتلات الورد" className="hero-image" />
        <div className="hero-wash" />
        <div className="hero-content mx-auto flex min-h-[760px] max-w-[1440px] items-end px-6 pb-20 md:min-h-[860px] md:px-12 md:pb-28 lg:px-20">
          <div className="max-w-2xl">
            <p className="eyebrow reveal">رسالة لم تُرسل… حتى الآن</p>
            <h1 className="hero-title reveal delay-1">إلى رحمة،<br /><em>التي جعلت للحياة معنى آخر.</em></h1>
            <p className="hero-intro reveal delay-2">هذه ليست صفحة عادية. هذه مساحة صغيرة خبّأت فيها كل ما لا تقوله الكلمات حين تكونين أمامي.</p>
            <button onClick={() => scrollTo("letters")} className="discover reveal delay-3">
              <span className="discover-icon"><ArrowDownLeft size={16} /></span>
              <span>افتحي الرسالة</span>
            </button>
          </div>
          <div className="hero-side-note hidden lg:block reveal delay-3">
            <span>01 / 04</span><span className="side-line" /><span>رحمة، إلى الأبد</span>
          </div>
        </div>
        <div className="scroll-cue"><span>اسحبي للأسفل</span><ChevronDown size={15} /></div>
      </section>

      <section id="letters" className="letters-section relative mx-auto max-w-[1440px] px-6 py-28 md:px-12 md:py-40 lg:px-20"><div className="memory-thread" aria-hidden="true" />
        <div className="section-rail"><span>02</span><span className="rail-line" /><span>كلمات من القلب</span></div>
        <div className="letters-intro max-w-xl">
          <p className="eyebrow">أشياء لم أقلها بما يكفي</p>
          <h2 className="section-title">بعض الحب،<br /><em>يُقرأ بين السطور.</em></h2>
          <p className="section-copy">اضغطي على كل رسالة. هناك أشياء لا تُقال دفعة واحدة، بل تُفتح مثل ظرف قديم يحمل رائحة من نحب.</p>
        </div>
        <div className="letters-list">
          {letters.map((letter, index) => (
            <button key={letter.number} onClick={() => setOpenLetter(openLetter === index ? null : index)} className={`letter-card ${openLetter === index ? "is-open" : ""}`} aria-expanded={openLetter === index}>
              <span className="letter-number">{letter.number}</span>
              <span className="letter-content"><strong>{letter.teaser}</strong><span className="letter-body">{letter.body}</span></span>
              <span className="letter-action"><ChevronDown size={18} /></span>
            </button>
          ))}
        </div>
        <div className="letters-stamp"><img src="/manus-storage/rahma-mark.webp" alt="" /><Heart size={14} fill="currentColor" /><span>مكتوبة لكِ وحدكِ</span></div>
      </section>

      <section id="memories" className="memories-section relative bg-plum px-6 py-28 md:px-12 md:py-36 lg:px-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="archive-mark"><img src="/manus-storage/rahma-mark.webp" alt="" /><span>أثر محفوظ</span></div>
          <div className="memories-header">
            <div><p className="eyebrow">03 — من ألبومنا</p><h2 className="section-title">اللحظات التي<br /><em>تسكنني.</em></h2></div>
            <p className="section-copy max-w-xs">لا أحتاج إلى صور كثيرة لأتذكركِ. لكنني أحب أن أترك للحنين بعض الأدلة.</p>
          </div>
          <div className="memory-grid">
            {memories.map((memory, index) => <figure key={memory.src} className={`memory-card memory-${index + 1}`}><img src={memory.src} alt={memory.label} /><figcaption><span>{memory.label}</span><span>0{index + 1}</span></figcaption></figure>)}
          </div>
        </div>
      </section>

      <section id="promise" className="promise-section mx-auto max-w-[1440px] px-6 py-32 md:px-12 md:py-44 lg:px-20">
        <div className="promise-orbit"><span /><span /><span /></div>
        <div className="promise-inner"><img src="/manus-storage/rahma-mark.webp" alt="" className="promise-mark" /><Sparkles size={19} className="text-gold" /><p className="eyebrow">04 — وعدي لكِ</p><h2>سأختاركِ،<br /><em>في كل مرة.</em></h2><p>ليس لأن الحياة ستكون دائمًا سهلة، بل لأن وجودكِ يجعلها تستحق أن تُعاش بكل تفاصيلها.</p><span className="signature">بحب لا ينتهي،<br /><strong>حسين</strong></span></div>
      </section>

      <footer className="footer mx-auto flex max-w-[1440px] items-end justify-between border-t border-ivory/10 px-6 py-10 md:px-12 lg:px-20"><div><span className="font-serif text-xl text-ivory">رحمة</span><p className="mt-2 text-xs text-ivory/40">رسالة حب، محفوظة هنا.</p></div><div className="text-left text-xs text-ivory/35"><p>صُنعت بقلب كامل</p><p className="mt-1">© 2026</p></div></footer>
    </main>
  );
}
