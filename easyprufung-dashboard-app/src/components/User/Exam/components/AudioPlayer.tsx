import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function time(value: number): string {
  if (!Number.isFinite(value)) return "00:00";
  const minutes = Math.floor(value / 60).toString().padStart(2, "0");
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function AudioPlayer({ src, playLimit }: { src: string; playLimit: number | null }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [plays, setPlays] = useState(0);
  const [startedCurrentPlay, setStartedCurrentPlay] = useState(false);
  const exhausted = playLimit !== null && plays >= playLimit && !startedCurrentPlay;

  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    setPlays(0);
    setStartedCurrentPlay(false);
  }, [src]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || exhausted) return;
    if (audio.paused) {
      if (!startedCurrentPlay) {
        setPlays((value) => value + 1);
        setStartedCurrentPlay(true);
      }
      await audio.play();
    } else {
      audio.pause();
    }
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio || exhausted) return;
    audio.currentTime = 0;
    setCurrent(0);
  };

  return (
      <div className="mt-6 rounded-2xl border border-black bg-white p-4 text-black">
        <audio
            ref={audioRef}
            src={src}
            preload="metadata"
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
            onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => {
              setPlaying(false);
              setStartedCurrentPlay(false);
              setCurrent(0);
              if (audioRef.current) audioRef.current.currentTime = 0;
            }}
        />
        <div className="flex items-center gap-3">
          <button
              type="button"
              onClick={toggle}
              disabled={exhausted}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-black text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
              aria-label={playing ? "Audio pausieren" : "Audio abspielen"}
          >
            {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-xs font-bold text-black/60">
              <span className="flex items-center gap-1.5"><Volume2 size={14} /> {time(current)}</span>
              <span>{time(duration)}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/15">
              <div className="h-full bg-black" style={{ width: duration ? `${(current / duration) * 100}%` : "0%" }} />
            </div>
          </div>
          <button
              type="button"
              onClick={restart}
              disabled={exhausted}
              className="grid h-10 w-10 place-items-center rounded-full bg-black text-white disabled:bg-gray-300 disabled:text-gray-600"
              aria-label="Audio von vorn abspielen"
          >
            <RotateCcw size={16} />
          </button>
        </div>
        <p className="mt-3 text-xs font-semibold text-black/45">
          {exhausted
              ? "Wiedergabelimit erreicht"
              : `Wiedergaben: ${plays}${playLimit === null ? "" : ` / ${playLimit}`}`}
        </p>
      </div>
  );
}