import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { ArrowDownLeft, ChevronDown, Heart, LockKeyhole, Music2, Sparkles, RotateCcw } from "lucide-react";

const PUBLIC_PASSWORD = "Roo";
const MUSIC_SRC = "/manus-storage/rahma-ambient.mp3";
const VOICE_NOTE_SRC = "/manus-storage/roo-voice-note.mp3";

const letters = [
  { number: "01", label: "لِرو…", teaser: "إنتِ الهدوء اللي بييجي بعد يوم طويل.", body: "لما بتكوني حواليا مش ببقى محتاج أشرح حاجة. ضحكتك لوحدها بتظبط الدنيا وبتخلّي كل حاجة تهدى." },
  { number: "02", label: "تفاصيلك يا رو", teaser: "بحب الحاجات الصغيرة اللي فيكي.", body: "بحب طريقتك وإنتِ بتسمعي، وضحكتك وإنتِ بتحاولي تخبيها، والأثر الحلو اللي بيفضل في المكان بعد ما تمشي." },
  { number: "03", label: "وقت لينا", teaser: "لو معايا دقيقة زيادة، هختارك فيها برضه.", body: "مش عشان الدنيا سهلة، بس عشان وجودك بيخلّي حتى اليوم التقيل يتعاش ويتحكي من تاني." },
  { number: "04", label: "وعد ليكي", teaser: "هختارك من غير دوشة، كل مرة.", body: "هفضل موجود في السؤال الصغير، وفي التفاصيل اللي محدش بياخد باله منها، وفي كل وقت تحتاجي فيه تحسي إنك مش لوحدك." },
  { number: "05", label: "آخر الكلام", teaser: "لو وصلتي لهنا، يبقى إنتِ عارفة.", body: "كل الكلام ده طريقة طويلة أقولك بيها جملة واحدة: بحبك يا رو، وبحب الدنيا أكتر عشان إنتِ فيها." },
];

const originalMemories = [
  { src: "/roo-assets/original-memory-1.webp", label: "صورتنا الأولى" },
  { src: "/roo-assets/original-memory-2.webp", label: "تفصيلة بتضحكنا" },
  { src: "/roo-assets/original-memory-3.webp", label: "لحظة من يومنا" },
  { src: "/roo-assets/original-memory-4.webp", label: "أنا وإنتِ" },
];

const memories = [
  { src: "/roo-assets/original-memory-1.webp", label: "أول تفصيلة في الحكاية" },
  { src: "/roo-assets/roo-memory-1.webp", label: "قعدة شاي على السطح" },
  { src: "/roo-assets/original-memory-2.webp", label: "ضحكتك اللي بتفلت" },
  { src: "/roo-assets/roo-memory-2.webp", label: "جواب متساب ليكي" },
  { src: "/roo-assets/original-memory-3.webp", label: "لحظة محدش شافها" },
  { src: "/roo-assets/roo-memory-3.webp", label: "ليل النيل" },
  { src: "/roo-assets/original-memory-4.webp", label: "تفصيلة من يومنا" },
  { src: "/roo-assets/roo-memory-1.webp", label: "آخر الليل… وإنتِ في بالي" },
];

function MarkSeal({ className = "" }: { className?: string }) {
  return <span className={`mark-glyph ${className}`} aria-hidden="true">♡</span>;
}

function PetalRain() {
  return <div className="petal-rain" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <span key={index} className={`falling-petal petal-${(index % 6) + 1}`} style={{ "--petal-index": index } as React.CSSProperties}>❧</span>)}</div>;
}

function LoadedImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return <span className={`image-loader ${loaded ? "is-loaded" : ""}`}><span className="image-loader-shimmer" aria-hidden="true"><i /><i /><i /></span><img src={src} alt={alt} className={className} onLoad={() => setLoaded(true)} /></span>;
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
      <header className="access-header"><span className="mark-wrap"><MarkSeal /></span><span className="font-serif">رو</span></header>
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
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceRef = useRef<HTMLAudioElement | null>(null);

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

  useEffect(() => () => { audioRef.current?.pause(); voiceRef.current?.pause(); }, []);

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

  const toggleVoiceNote = async () => {
    const voice = voiceRef.current;
    if (!voice) return;
    if (isVoicePlaying) { voice.pause(); setIsVoicePlaying(false); return; }
    try { voice.currentTime = 0; await voice.play(); setIsVoicePlaying(true); } catch { setIsVoicePlaying(false); }
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
              <p className="aside-quote">"إنتِ مش بس حد بحبه… إنتِ الحتة الحلوة في يومي كله."</p>
              <div className="aside-note"><MarkSeal /><span>لِرُو<br /><small>من حسين، بكل قلبي</small></span></div>
              <div className="entry-memory-strip"><img src="/roo-assets/roo-memory-2.webp" alt="ذكرى من ألبوم رو" /><span>من ألبومنا · 02</span></div>
            </aside>
            <div className="entry-card">
              <div className="entry-card-top"><span>ROO / PRIVATE SPACE</span><span>2026 / R</span></div>
              <div className="entry-seal"><MarkSeal /></div>
              <p className="eyebrow">دخول خاص · لرو وحدها</p>
              <h1>يا رو،<br /><em>افتحي حتة من قلبي.</em></h1>
              <p className="entry-copy">المكان ده معمول عشانك… كلمة واحدة بس، وكل الحكاية تفتح بهدوء.</p>
              <form onSubmit={submitPassword} className="access-form">
                <label htmlFor="rahma-password">كلمة السر بينا</label>
                <div className="password-field"><LockKeyhole size={16} /><input id="rahma-password" type="password" value={password} onChange={event => { setPassword(event.target.value); setError(false); }} placeholder="اكتبي Roo هنا…" autoFocus /><button type="submit" disabled={unlock.isPending} aria-label="فتح الرسالة"><ArrowDownLeft size={18} /></button></div>
                {error && <p className="access-error">مش هي دي يا رو… جربي الكلمة اللي بينا.</p>}
              </form>
              <div className="entry-card-bottom"><span>الكلام ده ليكي إنتِ وبس</span><span>♡</span></div>
            </div>
          </section>
        </AccessShell>
      </>
    );
  }

  if (showWelcome) {
    return <><audio ref={audioRef} src={MUSIC_SRC} loop preload="metadata" autoPlay /><AccessShell><div className="welcome-card welcome-v2"><span className="welcome-petal petal-one">✦</span><span className="welcome-petal petal-two">♡</span><span className="welcome-petal petal-three">✦</span><div className="welcome-seal"><MarkSeal /></div><p className="eyebrow">تم العثور على الرسالة</p><h1>أهلًا بيكي<br /><em>يا رو.</em></h1><p>كل ما في الداخل كُتب لكِ ببطء، ليشبه صوتكِ حين يهدأ.</p><button className="welcome-enter" onClick={() => setShowWelcome(false)}>أدخل إلى رسالتي <ArrowDownLeft size={17} /></button></div></AccessShell></>;
  }

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <main dir="rtl" className="min-h-screen overflow-hidden bg-ink text-ivory selection:bg-berry/30 redesigned-home">
      <audio ref={audioRef} src={MUSIC_SRC} loop preload="metadata" />
      <audio ref={voiceRef} src={VOICE_NOTE_SRC} preload="metadata" onEnded={() => setIsVoicePlaying(false)} />
      <div className="grain" aria-hidden="true" />
      <PetalRain />
      <header className="site-header">
        <a href="#top" className="site-brand" aria-label="رو، الصفحة الرئيسية"><span className="mark-wrap"><MarkSeal /></span><span className="font-serif">رو</span></a>
        <nav className="site-nav" aria-label="التنقل الرئيسي"><button onClick={() => scrollTo("letters")}>رسائل</button><button onClick={() => scrollTo("memories")}>صور</button><button onClick={() => scrollTo("promise")}>وعد</button><button onClick={() => scrollTo("reply")}>ردكِ</button></nav>
        <div className="site-actions"><button className="music-toggle" onClick={toggleMusic} aria-label={isPlaying ? "إيقاف الموسيقى" : "تشغيل الموسيقى"}><Music2 size={14} /><span>{isPlaying ? "إيقاف الموسيقى" : "شغّلي الهدوء"}</span></button><button className="lock-toggle" onClick={relock} aria-label="إعادة قفل الرسالة"><RotateCcw size={14} /><span>إعادة القفل</span></button></div>
      </header>
      <section id="top" className="hero hero-v2"><LoadedImage src="/roo-assets/roo-hero.webp" alt="ليلة رومانسية ورسالة لرو" className="hero-image" /><div className="hero-wash" /><div className="hero-content hero-content-v2"><div className="hero-kicker"><span>01</span><span className="side-line" /><span>رسالة من القلب</span></div><h1 className="hero-title">يا رو،<br /><em>إنتِ اللي<br />مخلّية الدنيا أحلى.</em></h1><p className="hero-intro">دي مش صفحة وخلاص… دي كل كلمة اتكسفت أقولها، وكل مرة قلبي سبق لساني عشانك.</p><button onClick={() => scrollTo("letters")} className="discover"><span className="discover-icon"><ArrowDownLeft size={16} /></span><span>ابدئي من هنا</span></button></div><div className="hero-bottom-mark"><MarkSeal /><span>حسين · ليكي إنتِ</span></div></section>
      <section className="journey-map" aria-label="خريطة الرحلة"><div><span>01</span><b>نبدأ من الكلام</b><small>رسائل مخبّية</small></div><i /><div><span>02</span><b>نرجع للصور</b><small>حكايتنا الحقيقية</small></div><i /><div><span>03</span><b>نسمع الهدوء</b><small>كلمة قصيرة ليكي</small></div></section>
      <section id="letters" className="letters-section letters-v2 relative mx-auto max-w-[1440px] px-6 py-28 md:px-12 md:py-40 lg:px-20"><div className="memory-thread" aria-hidden="true" /><div className="letters-intro max-w-xl"><p className="eyebrow">02 · كلام متخبي</p><h2 className="section-title">في حاجات،<br /><em>بتتقال بالإحساس.</em></h2><p className="section-copy">كل رسالة هنا حتة مني. افتحيهم واحدة واحدة، وسيبي كل كلمة تاخد وقتها عندك.</p></div><div className="letters-list">{letters.map((letter, index) => <button key={letter.number} onClick={() => setOpenLetter(openLetter === index ? null : index)} className={`letter-card ${openLetter === index ? "is-open" : ""}`} aria-expanded={openLetter === index}><span className="letter-number">{letter.number}</span><span className="letter-content"><small>{letter.label}</small><strong>{letter.teaser}</strong><span className="letter-body">{letter.body}</span></span><span className="letter-action"><ChevronDown size={18} /></span></button>)}</div><div className="letters-stamp"><MarkSeal /><Heart size={14} fill="currentColor" /><span>مكتوبة لكِ وحدكِ</span></div></section>
      <section id="memories" className="memories-section memories-v2 relative bg-plum px-6 py-28 md:px-12 md:py-36 lg:px-20"><div className="mx-auto max-w-[1440px]"><div className="archive-mark"><MarkSeal /><span>03 · ألبومنا السري</span></div><div className="memories-header"><div><p className="eyebrow">03 · صور حقيقية · فصول من القلب</p><h2 className="section-title">تفاصيل صغيرة،<br /><em>بس بتفرق كتير.</em></h2></div><p className="section-copy max-w-xs">تمن لحظات بين صورنا وصور الليالي اللي شبهنا؛ كل ما بفتكرهم بحس إن الدنيا لسه فيها حاجات حلوة.</p></div><div className="original-memory-feature"><div className="original-memory-heading"><span className="chapter-number">00</span><div><p className="eyebrow">من ألبومنا الحقيقي</p><h3>صورنا الأصلية،<br /><em>زي ما هي.</em></h3><p>الصور اللي كانت عندي من الأول رجعت مكانها؛ من غير فلتر يخبي ضحكتنا ولا حكايتنا.</p></div></div><div className="original-memory-grid">{originalMemories.map((memory, index) => <figure key={memory.src}><LoadedImage src={memory.src} alt={memory.label} /><figcaption><span>{memory.label}</span><span>0{index + 1}</span></figcaption></figure>)}</div></div><div className="memory-chapters"><div className="memory-chapter"><div className="chapter-copy"><span className="chapter-number">01</span><p className="eyebrow">أول مرة</p><h3>الحكاية بدأت<br /><em>من تفصيلة.</em></h3><p>مش لازم اللحظة تكون كبيرة عشان تفضل في القلب. ساعات نظرة، صورة، أو ضحكة صغيرة بتفتح باب عمر كامل.</p></div><div className="memory-grid memory-grid-v2">{memories.slice(0, 3).map((memory, index) => <figure key={memory.src} className={`memory-card memory-${index + 1}`}><LoadedImage src={memory.src} alt={memory.label} /><figcaption><span>{memory.label}</span><span>0{index + 1}</span></figcaption></figure>)}</div></div><div className="memory-chapter chapter-reverse"><div className="chapter-copy"><span className="chapter-number">02</span><p className="eyebrow">تفاصيلك</p><h3>الحاجات الصغيرة<br /><em>بتخلّيكي إنتِ.</em></h3><p>ريحة القهوة، طريقة كلامك، واللحظة اللي بتضحكي فيها من غير ما تقصدي… كل ده عندي ذاكرة كاملة.</p><button type="button" className={`voice-note-button ${isVoicePlaying ? "is-playing" : ""}`} onClick={toggleVoiceNote} aria-pressed={isVoicePlaying}><span className="voice-note-icon">{isVoicePlaying ? "Ⅱ" : "▶"}</span><span>{isVoicePlaying ? "الرسالة بتتكلم…" : "اسمعي كلمة مني"}</span><small>رسالة قصيرة لرو</small></button></div><div className="memory-grid memory-grid-v2">{memories.slice(3, 6).map((memory, index) => <figure key={memory.src} className={`memory-card memory-${index + 4}`}><LoadedImage src={memory.src} alt={memory.label} /><figcaption><span>{memory.label}</span><span>0{index + 4}</span></figcaption></figure>)}</div></div><div className="memory-chapter"><div className="chapter-copy"><span className="chapter-number">03</span><p className="eyebrow">آخر الليل</p><h3>لما الدنيا تهدى،<br /><em>بفتكرك أكتر.</em></h3><p>وفي آخر كل يوم، بيبقى ليكي مكان هادي جوايا… مكان ملوش مفتاح غير اسمك يا رو.</p></div><div className="memory-grid memory-grid-v2">{memories.slice(6).map((memory, index) => <figure key={memory.src} className={`memory-card memory-${index + 7}`}><LoadedImage src={memory.src} alt={memory.label} /><figcaption><span>{memory.label}</span><span>0{index + 7}</span></figcaption></figure>)}</div></div></div></div></section>
      <section id="reply" className="reply-section mx-auto max-w-[1440px] px-6 py-24 md:px-12 md:py-32 lg:px-20"><div className="reply-card"><div className="reply-heading"><p className="eyebrow">05 · مستني ردك</p><h2>دلوقتي…<br /><em>قوليلي إنتِ.</em></h2></div><div className="reply-form-wrap"><p>لو عندك كلمة واحدة بعد كل ده، اكتبيها زي ما هي… من غير تفكير كتير، أنا مستنيها.</p><form onSubmit={saveReply}><textarea value={reply} onChange={event => { setReply(event.target.value); setReplySaved(false); }} placeholder="اكتبيلي ردك يا رو…" maxLength={500} aria-label="رسالتك إلى حسين" /><div className="reply-form-footer"><span>{reply.length}/500 · يبقى محفوظًا في هذا المتصفح</span><button type="submit" disabled={!reply.trim()}>خليها عندي <ArrowDownLeft size={16} /></button></div>{replySaved && <div className="reply-success"><MarkSeal /> وصلتني كلماتك يا رو.</div>}</form></div></div></section>
      <section id="promise" className="promise-section promise-v2 mx-auto max-w-[1440px] px-6 py-32 md:px-12 md:py-44 lg:px-20"><div className="promise-orbit"><span /><span /><span /></div><div className="promise-inner"><MarkSeal className="promise-mark" /><Sparkles size={19} className="text-gold" /><p className="eyebrow">04 · وعد صغير</p><h2>هفضل جنبك،<br /><em>مهما الدنيا لفت.</em></h2><p>مش بوعدك إن كل يوم هيبقى سهل، بس بوعدك إنك عمرك ما هتواجهيه لوحدك وأنا موجود.</p><span className="signature">من قلبي ليكي،<br /><strong>حسين</strong></span></div></section>
      <footer className="footer footer-v2 mx-auto flex max-w-[1440px] items-end justify-between border-t border-ivory/10 px-6 py-10 md:px-12 lg:px-20"><div><span className="font-serif text-xl text-ivory">رو</span><p className="mt-2 text-xs text-ivory/40">رسالة تُفتح كل مرة من جديد.</p></div><div className="text-left text-xs text-ivory/35"><p>صُنعت بقلب كامل</p><p className="mt-1">© 2026</p></div></footer>
    </main>
  );
}
