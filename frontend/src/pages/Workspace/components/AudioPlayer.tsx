import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat } from "lucide-react";
import styles from "./AudioPlayer.module.css";

interface Track {
  title: string;
  artist: string;
  src: string;
  cover?: string; // path to cover image in public/audio/
}

const TRACKS: Track[] = [
  {
    title: "О Аллах, я Твой раб",
    artist: "اللهم إني عبدك — слова мольбы раба перед своим Господом",
    src: "/audio/o-allah-i-am-your-servant.mp3", cover: "/audio/cover1.jpg",
  },
  {
    title: "Не ценили Аллаха",
    artist: "Они не воздали Аллаху должного величия — напоминание о величии Творца",
    src: "/audio/they-did-not-revere-allah.mp3", cover: "/audio/cover2.jpg",
  },
  {
    title: "Поэма о Пророке",
    artist: "Красивая поэма о жизни и пути Пророка Мухаммада ﷺ",
    src: "/audio/a-beautiful-poem-about-the-prophet.mp3", cover: "/audio/cover3.jpg",
  },
  {
    title: "Азан",
    artist: "Призыв к молитве — голос, зовущий сердца к Аллаху",
    src: "/audio/adhan.mp3", cover: "/audio/cover4.jpg",
  },
  {
    title: "Сладость знаний",
    artist: "Если вкусил ты сладость знаний — ты никогда не захочешь остановиться",
    src: "/audio/sweetness-of-knowledge.mp3", cover: "/audio/cover5.jpg",
  },
  {
    title: "Ты оставил меня",
    artist: "И вот ты оставил меня на долгое время — обращение к покинувшему путь",
    src: "/audio/you-left-me-for-so-long.mp3", cover: "/audio/cover6.jpg",
  },
  {
    title: "Каково моё положение",
    artist: "Каково моё положение, о Господь — размышление о состоянии души перед Богом",
    src: "/audio/what-is-my-state-o-lord.mp3", cover: "/audio/cover7.jpg",
  },
  {
    title: "Спасти свою душу",
    artist: "Мне бы суметь спасти свою душу — стремление к спасению в День суда",
    src: "/audio/if-only-i-could-save-my-soul.mp3", cover: "/audio/cover8.jpg",
  },
  {
    title: "Не печалься",
    artist: "Ни в коем случае не печалься — Аллах с теми, кто терпит и уповает",
    src: "/audio/never-be-sad.mp3", cover: "/audio/cover9.jpg",
  },
  {
    title: "Мирская жизнь",
    artist: "О вы, стремящиеся к мирскому — напоминание о краткости этой жизни",
    src: "/audio/o-you-who-seek-worldly-life.mp3", cover: "/audio/cover10.jpg",
  },
  {
    title: "О дочь моя",
    artist: "О дочь моя, не отчаивайся — слова поддержки и веры для женского сердца",
    src: "/audio/o-my-daughter-do-not-despair.mp3", cover: "/audio/cover11.jpg",
  },
  {
    title: "Дыхание моей души",
    artist: "О дыхание моей души — нежное обращение к близкому человеку через веру",
    src: "/audio/o-breath-of-my-soul.mp3", cover: "/audio/cover12.jpg",
  },
  {
    title: "Душа Сардарова",
    artist: "Авторский трек — искренние слова о пути, вере и любви к Создателю",
    src: "/audio/dusha-sardarova.mp3", cover: "/audio/cover13.jpg",
  },
];

function formatTime(s: number): string {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function AudioPlayer() {
  const [idx, setIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playingRef = useRef(false);

  const track = TRACKS[idx];

  // Sync play/pause state to the audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {
        playingRef.current = false;
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // When track changes: reset time and auto-play if was playing
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    if (playingRef.current) {
      // audio remounts via key, need to play after metadata loads
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 50);
    }
  }, [idx]);

  function togglePlay() {
    playingRef.current = !isPlaying;
    setIsPlaying((v) => !v);
  }

  function handlePrev() {
    setIdx((i) => (i === 0 ? TRACKS.length - 1 : i - 1));
  }

  function handleNext() {
    if (isShuffle) {
      setIdx(Math.floor(Math.random() * TRACKS.length));
    } else {
      setIdx((i) => (i === TRACKS.length - 1 ? 0 : i + 1));
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    setCurrentTime(t);
  }

  function handleEnded() {
    if (isRepeat) {
      const audio = audioRef.current;
      if (audio) { audio.currentTime = 0; audio.play(); }
    } else {
      handleNext();
    }
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={styles.card}>
      {/* key remounts the audio element when track changes, ensuring clean src load */}
      <audio
        key={track.src}
        ref={audioRef}
        src={track.src}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={handleEnded}
      />

      <div className={styles.trackInfo}>
        <div className={styles.cover}>
          {track.cover ? (
            <img src={track.cover} alt={track.title} className={styles.coverImg} />
          ) : (
            <div className={styles.coverFallback}>♪</div>
          )}
        </div>
        <div className={styles.trackText}>
          <p className={styles.title}>{track.title}</p>
          <p className={styles.artist}>{track.artist}</p>
        </div>
      </div>

      <div className={styles.progressWrap}>
        <input
          className={styles.range}
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          style={{ "--progress": `${progress}%` } as React.CSSProperties}
        />
        <div className={styles.times}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          className={`${styles.ctrl} ${isShuffle ? styles.ctrlActive : ""}`}
          onClick={() => setIsShuffle((v) => !v)}
          aria-label="Shuffle"
        >
          <Shuffle size={15} />
        </button>
        <button className={styles.ctrl} onClick={handlePrev} aria-label="Previous">
          <SkipBack size={18} />
        </button>
        <button className={styles.playBtn} onClick={togglePlay} aria-label="Play">
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button className={styles.ctrl} onClick={handleNext} aria-label="Next">
          <SkipForward size={18} />
        </button>
        <button
          className={`${styles.ctrl} ${isRepeat ? styles.ctrlActive : ""}`}
          onClick={() => setIsRepeat((v) => !v)}
          aria-label="Repeat"
        >
          <Repeat size={15} />
        </button>
      </div>
    </div>
  );
}
