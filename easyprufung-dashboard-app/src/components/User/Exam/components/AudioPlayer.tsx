import { Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function time(value: number): string {
  if (!Number.isFinite(value)) return "00:00";

  const minutes = Math.floor(value / 60)
      .toString()
      .padStart(2, "0");

  const seconds = Math.floor(value % 60)
      .toString()
      .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

type AudioPlayerProps = {
  src: string;

  /**
   * Must be unique for this audio inside the current exam session.
   * Example: `${session.sessionId}:${exercise.partKey}`
   */
  playbackId?: string;

  // Kept temporarily so existing usages do not cause a TypeScript error.
  playLimit?: number | null;
};

export function AudioPlayer({
                              src,
                              playbackId
                            }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const startingRef = useRef(false);
  const hasStartedRef = useRef(false);
  const endedRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const storageKey = `exam-audio-played:${playbackId ?? src}`;

  useEffect(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    const previouslyPlayed =
        typeof window !== "undefined" &&
        window.sessionStorage.getItem(storageKey) === "true";

    startingRef.current = false;
    hasStartedRef.current = previouslyPlayed;
    endedRef.current = previouslyPlayed;

    setPlaying(false);
    setHasStarted(previouslyPlayed);
    setHasEnded(previouslyPlayed);
    setCurrent(0);
    setDuration(0);
    setPlaybackError(null);
  }, [src, storageKey]);

  const startAudio = async () => {
    const audio = audioRef.current;

    if (
        !audio ||
        startingRef.current ||
        hasStartedRef.current
    ) {
      return;
    }

    startingRef.current = true;
    setPlaybackError(null);

    try {
      audio.currentTime = 0;
      await audio.play();

      hasStartedRef.current = true;
      endedRef.current = false;

      setHasStarted(true);
      setHasEnded(false);

      window.sessionStorage.setItem(storageKey, "true");
    } catch {
      startingRef.current = false;
      setPlaybackError(
          "Die Audiodatei konnte nicht gestartet werden. Bitte versuchen Sie es erneut."
      );
    }
  };

  const preventPause = () => {
    const audio = audioRef.current;

    if (
        !audio ||
        !hasStartedRef.current ||
        endedRef.current ||
        audio.ended
    ) {
      setPlaying(false);
      return;
    }

    // Resume immediately if the candidate tries to pause with a media key.
    void audio.play().catch(() => {
      setPlaying(false);
    });
  };

  const handleEnded = () => {
    endedRef.current = true;

    setPlaying(false);
    setHasEnded(true);
    setCurrent(duration);

    if (audioRef.current) {
      audioRef.current.currentTime = duration;
    }
  };

  const buttonDisabled = hasStarted || hasEnded;

  return (
      <div className="mt-6 rounded-2xl border border-black bg-white p-4 text-black">
        <audio
            ref={audioRef}
            src={src}
            preload="metadata"
            controls={false}
            onContextMenu={(event) => event.preventDefault()}
            onLoadedMetadata={(event) => {
              setDuration(event.currentTarget.duration);
            }}
            onTimeUpdate={(event) => {
              setCurrent(event.currentTarget.currentTime);
            }}
            onPlay={() => {
              setPlaying(true);
            }}
            onPause={preventPause}
            onEnded={handleEnded}
        />

        <div className="flex items-center gap-3">
          <button
              type="button"
              onClick={startAudio}
              disabled={buttonDisabled}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-black text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 disabled:hover:scale-100"
              aria-label={
                hasEnded
                    ? "Audio wurde bereits abgespielt"
                    : hasStarted
                        ? "Audio wird abgespielt"
                        : "Audio einmalig abspielen"
              }
          >
            {playing ? (
                <Volume2 size={20} />
            ) : (
                <Play size={20} fill="currentColor" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-xs font-bold text-black/60">
            <span className="flex items-center gap-1.5">
              <Volume2 size={14} />
              {time(current)}
            </span>

              <span>{time(duration)}</span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/15">
              <div
                  className="h-full bg-black transition-[width] duration-200"
                  style={{
                    width: duration
                        ? `${Math.min((current / duration) * 100, 100)}%`
                        : "0%"
                  }}
              />
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs font-semibold text-black/45">
          {!hasStarted && "Das Audio kann nur einmal gestartet werden."}
          {playing && "Das Audio läuft und kann nicht pausiert werden."}
          {hasEnded && "Die einmalige Wiedergabe ist beendet."}
        </p>

        {playbackError && (
            <p className="mt-2 text-xs font-bold text-red-600">
              {playbackError}
            </p>
        )}
      </div>
  );
}