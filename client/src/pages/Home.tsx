import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { ArrowDownLeft, ChevronDown, Heart, LockKeyhole, Music2, Sparkles, RotateCcw } from "lucide-react";

const PUBLIC_PASSWORD = "rahma";
const MUSIC_SRC = "/manus-storage/rahma-ambient.mp3";

const letters = [
  { number: "01", label: "إلى رحمة…", teaser: "أنتِ الهدوء الذي يأتي بعد يوم طويل.", body: "في وجودكِ لا أحتاج أن أشرح نفسي كثيرًا. يكفيني أن تبتسمي فأعرف أن العالم، ولو للحظة، صار في مكانه الصحيح." },
  { number: "02", label: "تفاصيلكِ الصغيرة", teaser: "أحب الأشياء التي لا يلاحظها أحد.", body: "طريقة إصغائكِ، ضحكتكِ حين تحاولين إخفاءها، ودفء حضوركِ الذي يظل في المكان حتى بعد أن ترحلي." },
  { number: "03", label: "وقتٌ لنا", teaser: "لو امتلكتُ دقيقةً إضافية… لاخترتكِ فيها.", body: "ليس لأن كل شيء سهل، بل لأنكِ تجعلين حتى الأيام الثقيلة قابلة للحب، وقابلة لأن تُحكى مرة أخرى." },
  { number: "04", label: "وعدٌ هادئ", teaser: "سأختاركِ بلا ضجيج، كل مرة.", body: "سأكون حاضرًا في التفاصيل التي لا يراها أحد، في السؤال الصغير، وفي المسافة التي تحتاجينها كي تطمئني." },
  { number: "05", label: "آخر الرسالة", teaser: "لو قرأتِ هذا حتى هنا… فأنتِ تعرفين.", body: "كل هذه الكلمات ليست إلا طريقة طويلة لأقول جملة قصيرة: أحبكِ يا رحمة، وأحب الحياة أكثر حين تكونين فيها." },
];

const memories = [
  { src: "/manus-storage/rahma-hero.webp", label: "رسالة لم تُرسل" },
  { src: "/manus-storage/rahma-memory-1.webp", label: "تفصيل صغير" },
  { src: "/manus-storage/rahma-memory-2.webp", label: "مساء محفوظ" },
  { src: "/manus-storage/rahma-memory-3.webp", label: "من ألبومنا" },
  { src: "/manus-storage/rahma-memory-4.webp", label: "أثر لا يزول" },
  { src: "/manus-storage/rahma-memory-5.webp", label: "قربكِ" },
];

function MarkSeal({ className = "" }: { className?: string }) {
  return <span className={`mark-glyph ${className}`} aria-hidden="true">♡</span>;
}

function PetalRain() {
  return <div className="petal-rain" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <span key={index} className={`falling-petal petal-${(index % 6) + 1}`} style={{ "--petal-index": index } as React.CSSProperties}>❧</span>)}</div>;
}

function AccessShell({ children }: { children: React.ReactNode }) {
  return (
    <main dir="rtl" className="access-screen access-v2">
      <div className="grain" aria-hidden="true" />
      <PetalRain />
      <div className="access-orbit orbit-a" aria-hidden="true" />
      <div className="access-orbit orbit-b" aria-hidden="true" />
      <span className="floating-heart heart-one" aria-hidden="true">♡</span>
      <span className="floating-heart heart-two" aria-hidden="true">✦</span>
      <span className="floating-heart heart-three" aria-hidden="true">♡</span>
      <header className="access-header"><span className="mark-wrap"><MarkSeal /></span><span className="font-serif">رحمة</span></header>
      {children}
      <span className="access-footer">رسالة خاصة · لا تُفتح إلا بكلمة تعرفينها</span>
    </main>
  );
}

export default function Home() {
  const isStatic = typeof window !== "undefined" && (window.location.hostname.endsWith("github.io") || window.location.hostname.endsWith("vercel.app"));
  const access = trpc.access.status.useQuery(undefined, { enabled: !isStatic });
  const unlock = trpc.access.unlock.useMutation();
  const lock = trpc.access.lock.useMutation();
  const [staticUnlocked, setStaticUnlocked] = useState(false);
  const [sessionReady, setSessionReady] = useState(isStatic);
  const [showWelcome, setShowWelcome] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [openLetter, setOpenLetter] = useState<number | null>(null);
  const [reply, setReply] = useState(() => typeof window !== "undefined" ? window.localStorage.getItem("rahma_reply") ?? "" : "");
  const [replySaved, setReplySaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isUnlocked = isStatic ? staticUnlocked : sessionReady && access.data?.unlocked;

  useEffect(() => {
    if (isStatic) return;
    lock.mutate(undefined, { onSettled: () => { setSessionReady(true); access.refetch(); } });
  }, []);

  useEffect(() => {
    if (!isUnlocked) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [isUnlocked]);

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const submitPassword = (event: React.FormEvent) => {
    event.preventDefault();
    setError(false);
    if (isStatic) {
      if (password === PUBLIC_PASSWORD) { setStaticUnlocked(true); setShowWelcome(true); setPassword(""); }
      else setError(true);
      return;
    }
    unlock.mutate({ password }, { onSuccess: () => { setShowWelcome(true); setPassword(""); access.refetch(); }, onError: () => setError(true) });
  };

  const relock = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
    setShowWelcome(false);
    setOpenLetter(null);
    setPassword("");
    if (isStatic) setStaticUnlocked(false);
    else lock.mutate(undefined, { onSettled: () => access.refetch() });
  };

  const saveReply = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanReply = reply.trim();
    if (!cleanReply) return;
    window.localStorage.setItem("rahma_reply", cleanReply);
    setReply(cleanReply);
    setReplySaved(true);
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); return; }
    try { await audio.play(); setIsPlaying(true); } catch { setIsPlaying(false); }
  };

  if (!isStatic && (!sessionReady || access.isLoading)) {
    return <><audio ref={audioRef} src={MUSIC_SRC} loop preload="metadata" /><AccessShell><div className="access-loader"><span className="loader-heart">♡</span><p>تُفتح الرسالة بهدوء…</p></div></AccessShell></>;
  }

  if (!isUnlocked) {
    return (
      <>
        <audio ref={audioRef} src={MUSIC_SRC} loop preload="metadata" />
        <AccessShell>
          <section className="entry-stage">
            <aside className="entry-aside">
              <p className="eyebrow">صندوق الذكريات · 01</p>
              <div className="aside-line" />
              <p className="aside-quote">"بعض الأشخاص لا يدخلون حياتنا… بل يضيئونها."</p>
              <div className="aside-note"><MarkSeal /><span>إلى رحمة<br /><small>من حسين، بحب</small></span></div>
              <div className="entry-memory-strip"><img src="/manus-storage/rahma-memory-2.webp" alt="ذكرى محفوظة" /><span>من ألبومنا · 02</span></div>
            </aside>
            <div className="entry-card">
              <div className="entry-card-top"><span>PRIVATE LETTER</span><span>2026 / R</span></div>
              <div className="entry-seal"><MarkSeal /></div>
              <p className="eyebrow">هذه المساحة لكِ وحدكِ</p>
              <h1>يا رحمة،<br /><em>هناك شيء يشبهكِ هنا.</em></h1>
              <p className="entry-copy">اكتبي الكلمة التي لا يعرفها سوانا، وسأفتح لكِ الرسالة التي خبّأتها في هذا المساء.</p>
              <form onSubmit={submitPassword} className="access-form">
                <label htmlFor="rahma-password">الكلمة السرية</label>
                <div className="password-field"><LockKeyhole size={16} /><input id="rahma-password" type="password" value={password} onChange={event => { setPassword(event.target.value); setError(false); }} placeholder="اكتبيها هنا…" autoFocus /><button type="submit" disabled={unlock.isPending} aria-label="فتح الرسالة"><ArrowDownLeft size={18} /></button></div>
                {error && <p className="access-error">هذه ليست الكلمة… اقتربي من الذاكرة وحاولي مرة أخرى.</p>}
              </form>
              <div className="entry-card-bottom"><span>لا نحفظ شيئًا هنا</span><span>♡</span></div>
            </div>
          </section>
        </AccessShell>
      </>
    );
  }

  if (showWelcome) {
    return <><audio ref={audioRef} src={MUSIC_SRC} loop preload="metadata" autoPlay /><AccessShell><div className="welcome-card welcome-v2"><span className="welcome-petal petal-one">✦</span><span className="welcome-petal petal-two">♡</span><span className="welcome-petal petal-three">✦</span><div className="welcome-seal"><MarkSeal /></div><p className="eyebrow">تم العثور على الرسالة</p><h1>أهلًا بكِ<br /><em>يا رحمة.</em></h1><p>كل ما في الداخل كُتب لكِ ببطء، ليشبه صوتكِ حين يهدأ.</p><button className="welcome-enter" onClick={() => setShowWelcome(false)}>أدخل إلى رسالتي <ArrowDownLeft size={17} /></button></div></AccessShell></>;
  }

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <main dir="rtl" className="min-h-screen overflow-hidden bg-ink text-ivory selection:bg-berry/30 redesigned-home">
      <audio ref={audioRef} src={MUSIC_SRC} loop preload="metadata" />
      <div className="grain" aria-hidden="true" />
      <PetalRain />
      <header className="site-header">
        <a href="#top" className="site-brand" aria-label="رحمة، الصفحة الرئيسية"><span className="mark-wrap"><MarkSeal /></span><span className="font-serif">رحمة</span></a>
        <nav className="site-nav" aria-label="التنقل الرئيسي"><button onClick={() => scrollTo("letters")}>رسائل</button><button onClick={() => scrollTo("memories")}>صور</button><button onClick={() => scrollTo("promise")}>وعد</button><button onClick={() => scrollTo("reply")}>ردكِ</button></nav>
        <div className="site-actions"><button className="music-toggle" onClick={toggleMusic} aria-label={isPlaying ? "إيقاف الموسيقى" : "تشغيل الموسيقى"}><Music2 size={14} /><span>{isPlaying ? "إيقاف الموسيقى" : "شغّلي الهدوء"}</span></button><button className="lock-toggle" onClick={relock} aria-label="إعادة قفل الرسالة"><RotateCcw size={14} /><span>إعادة القفل</span></button></div>
      </header>
      <section id="top" className="hero hero-v2"><img src="/manus-storage/rahma-hero.webp" alt="مغلف ورسالة بين بتلات الورد" className="hero-image" /><div className="hero-wash" /><div className="hero-content hero-content-v2"><div className="hero-kicker"><span>01</span><span className="side-line" /><span>رسالة من القلب</span></div><h1 className="hero-title">إلى رحمة،<br /><em>التي جعلت<br />للحياة معنى آخر.</em></h1><p className="hero-intro">هذه ليست صفحة عادية. إنها المسافة الصغيرة بين ما أشعر به وما لا أعرف كيف أقوله حين تكونين أمامي.</p><button onClick={() => scrollTo("letters")} className="discover"><span className="discover-icon"><ArrowDownLeft size={16} /></span><span>ابدئي من هنا</span></button></div><div className="hero-bottom-mark"><MarkSeal /><span>حسين · 2026</span></div></section>
      <section id="letters" className="letters-section letters-v2 relative mx-auto max-w-[1440px] px-6 py-28 md:px-12 md:py-40 lg:px-20"><div className="memory-thread" aria-hidden="true" /><div className="letters-intro max-w-xl"><p className="eyebrow">02 · رسائل مخبأة</p><h2 className="section-title">بعض الحب،<br /><em>يُقرأ بين السطور.</em></h2><p className="section-copy">كل بطاقة هنا ظرف صغير. افتحيها واحدة واحدة، ولا تستعجلي ما كُتب لكِ.</p></div><div className="letters-list">{letters.map((letter, index) => <button key={letter.number} onClick={() => setOpenLetter(openLetter === index ? null : index)} className={`letter-card ${openLetter === index ? "is-open" : ""}`} aria-expanded={openLetter === index}><span className="letter-number">{letter.number}</span><span className="letter-content"><small>{letter.label}</small><strong>{letter.teaser}</strong><span className="letter-body">{letter.body}</span></span><span className="letter-action"><ChevronDown size={18} /></span></button>)}</div><div className="letters-stamp"><MarkSeal /><Heart size={14} fill="currentColor" /><span>مكتوبة لكِ وحدكِ</span></div></section>
      <section id="memories" className="memories-section memories-v2 relative bg-plum px-6 py-28 md:px-12 md:py-36 lg:px-20"><div className="mx-auto max-w-[1440px]"><div className="archive-mark"><MarkSeal /><span>03 · ألبوم محفوظ</span></div><div className="memories-header"><div><p className="eyebrow">صور لا تحتاج إلى شرح</p><h2 className="section-title">اللحظات التي<br /><em>تسكنني.</em></h2></div><p className="section-copy max-w-xs">ست صور، وستة أسباب لأبتسم كلما تذكرت أن هذه التفاصيل كانت لنا.</p></div><div className="memory-grid memory-grid-v2">{memories.map((memory, index) => <figure key={memory.src} className={`memory-card memory-${index + 1}`}><img src={memory.src} alt={memory.label} /><figcaption><span>{memory.label}</span><span>0{index + 1}</span></figcaption></figure>)}</div></div></section>
      <section id="reply" className="reply-section mx-auto max-w-[1440px] px-6 py-24 md:px-12 md:py-32 lg:px-20"><div className="reply-card"><div className="reply-heading"><p className="eyebrow">05 · صوتكِ هنا</p><h2>والآن…<br /><em>اكتبي لي أنتِ.</em></h2></div><div className="reply-form-wrap"><p>لو تركتِ لي سطرًا واحدًا بعد القراءة، ماذا سيقول؟ اكتبيه هنا كما هو، بلا ترتيب ولا تردد.</p><form onSubmit={saveReply}><textarea value={reply} onChange={event => { setReply(event.target.value); setReplySaved(false); }} placeholder="اكتبي ردكِ لِحسين…" maxLength={500} aria-label="رسالتك إلى حسين" /><div className="reply-form-footer"><span>{reply.length}/500 · يبقى محفوظًا في هذا المتصفح</span><button type="submit" disabled={!reply.trim()}>احفظي ردكِ <ArrowDownLeft size={16} /></button></div>{replySaved && <div className="reply-success"><MarkSeal /> وصلتني كلماتكِ، يا رحمة.</div>}</form></div></div></section>
      <section id="promise" className="promise-section promise-v2 mx-auto max-w-[1440px] px-6 py-32 md:px-12 md:py-44 lg:px-20"><div className="promise-orbit"><span /><span /><span /></div><div className="promise-inner"><MarkSeal className="promise-mark" /><Sparkles size={19} className="text-gold" /><p className="eyebrow">04 · وعدي لكِ</p><h2>سأختاركِ،<br /><em>في كل مرة.</em></h2><p>ليس لأن الحياة ستكون دائمًا سهلة، بل لأن وجودكِ يجعلها تستحق أن تُعاش بكل تفاصيلها.</p><span className="signature">بحب لا ينتهي،<br /><strong>حسين</strong></span></div></section>
      <footer className="footer footer-v2 mx-auto flex max-w-[1440px] items-end justify-between border-t border-ivory/10 px-6 py-10 md:px-12 lg:px-20"><div><span className="font-serif text-xl text-ivory">رحمة</span><p className="mt-2 text-xs text-ivory/40">رسالة تُفتح كل مرة من جديد.</p></div><div className="text-left text-xs text-ivory/35"><p>صُنعت بقلب كامل</p><p className="mt-1">© 2026</p></div></footer>
    </main>
  );
}
