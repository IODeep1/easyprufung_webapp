
import { Info, Pause, Play, Volume2 } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";

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

  // Kept for compatibility with existing usages.
  playbackLimit?: number | null;
};

export function AudioPlayer({
                              src,
                              playbackId
                            }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const infoRef = useRef<HTMLButtonElement>(null);

  const startingRef = useRef(false);
  const hasStartedRef = useRef(false);
  const endedRef = useRef(false);
  const practiceModeRef = useRef(false);
  const allowPauseRef = useRef(false);

  const [practiceMode, setPracticeMode] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({
    top: 0,
    left: 0,
    width: 288
  });

  const tooltipId = useId();
  const storageKey = `exam-audio-played:${playbackId ?? src}`;

  useEffect(() => {
    const audio = audioRef.current;

    if (audio) {
      allowPauseRef.current = true;
      audio.pause();
      audio.currentTime = 0;
    }

    const previouslyPlayed =
        typeof window !== "undefined" &&
        window.sessionStorage.getItem(storageKey) === "true";

    startingRef.current = false;
    hasStartedRef.current = previouslyPlayed;
    endedRef.current = previouslyPlayed;
    practiceModeRef.current = false;
    allowPauseRef.current = false;

    setPracticeMode(false);
    setPlaying(false);
    setHasStarted(previouslyPlayed);
    setHasEnded(previouslyPlayed);
    setCurrent(0);
    setDuration(0);
    setPlaybackError(null);
    setTooltipOpen(false);

    return () => {
      const currentAudio = audioRef.current;

      if (currentAudio) {
        allowPauseRef.current = true;
        currentAudio.pause();
      }
    };
  }, [src, storageKey]);

  // Position tooltip inside the viewport.
  const updateTooltipPosition = () => {
    const button = infoRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const margin = 12;
    const width = Math.min(288, window.innerWidth - margin * 2);

    const left = Math.max(
        margin,
        Math.min(
            rect.right - width,
            window.innerWidth - width - margin
        )
    );

    // Position below the info icon by default.
    // If there is insufficient space, show above.
    const estimatedHeight = 170;
    const placeAbove =
        rect.bottom + estimatedHeight + margin >
        window.innerHeight &&
        rect.top > estimatedHeight + margin;

    setTooltipPosition({
      top: placeAbove
          ? rect.top - margin
          : rect.bottom + margin,
      left,
      width
    });
  };

  useEffect(() => {
    if (!tooltipOpen) return;

    const update = () => updateTooltipPosition();

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [tooltipOpen]);

  const showTooltip = () => {
    updateTooltipPosition();
    setTooltipOpen(true);
  };

  const hideTooltip = () => {
    setTooltipOpen(false);
  };

  const handlePracticeModeChange = (enabled: boolean) => {
    const audio = audioRef.current;

    practiceModeRef.current = enabled;
    setPracticeMode(enabled);
    setPlaybackError(null);

    if (!enabled && audio && hasStartedRef.current) {
      // A used attempt cannot be restored by switching modes.
      endedRef.current = true;
      allowPauseRef.current = true;

      audio.pause();
      audio.currentTime = 0;

      setPlaying(false);
      setHasEnded(true);
      setCurrent(0);
    }
  };

  const startAudio = async () => {
    const audio = audioRef.current;

    if (!audio || startingRef.current) return;

    if (
        !practiceModeRef.current &&
        hasStartedRef.current
    ) {
      return;
    }

    startingRef.current = true;
    setPlaybackError(null);

    try {
      if (!practiceModeRef.current || audio.ended) {
        audio.currentTime = 0;
      }

      // Mark the attempt before play() to avoid replay
      // if playback events happen before the promise resolves.
      const examMode = !practiceModeRef.current;

      await audio.play();

      if (examMode) {
        // Record exam playback once it successfully starts.
        window.sessionStorage.setItem(storageKey, "true");
      }

      hasStartedRef.current = true;
      endedRef.current = false;

      setHasStarted(true);
      setHasEnded(false);
    } catch (error) {
      if (
          error instanceof DOMException &&
          error.name === "AbortError"
      ) {
        return;
      }

      setPlaybackError(
          "Die Audiodatei konnte nicht gestartet werden. Bitte versuchen Sie es erneut."
      );
    } finally {
      startingRef.current = false;
    }
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing && practiceModeRef.current) {
      allowPauseRef.current = true;
      audio.pause();
      return;
    }

    void startAudio();
  };

  const handlePause = () => {
    const audio = audioRef.current;

    setPlaying(false);

    if (
        !audio ||
        allowPauseRef.current ||
        practiceModeRef.current ||
        !hasStartedRef.current ||
        endedRef.current ||
        audio.ended
    ) {
      allowPauseRef.current = false;
      return;
    }

    // Resume if playback was paused in exam mode.
    void audio.play().catch(() => {
      setPlaying(false);
    });
  };

  const handleEnded = () => {
    endedRef.current = true;
    allowPauseRef.current = true;

    setPlaying(false);
    setHasEnded(true);

    const audio = audioRef.current;

    if (audio) {
      setCurrent(
          Number.isFinite(audio.duration)
              ? audio.duration
              : duration
      );
    }
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;

    if (!audio || !practiceModeRef.current) return;

    const maximum = Number.isFinite(audio.duration)
        ? audio.duration
        : 0;

    const nextTime = Math.min(
        Math.max(value, 0),
        maximum
    );

    audio.currentTime = nextTime;
    setCurrent(nextTime);
  };

  const buttonDisabled =
      !practiceMode && (hasStarted || hasEnded);

  return (
      <div className="relative mt-6 rounded-2xl border border-black bg-white p-4 text-black">
        {/* Top-right practice mode */}
        <div className="mb-4 flex justify-end">
          <div className="flex items-center gap-2">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                  type="checkbox"
                  checked={practiceMode}
                  onChange={(event) => {
                    handlePracticeModeChange(
                        event.target.checked
                    );
                  }}
                  className="h-4 w-4 cursor-pointer accent-black"
              />

              <span className="text-xs font-bold">
                            Übungsmodus
                        </span>
            </label>

            <button
                ref={infoRef}
                type="button"
                aria-label="Informationen zum Übungsmodus"
                aria-describedby={
                  tooltipOpen ? tooltipId : undefined
                }
                aria-expanded={tooltipOpen}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
                onClick={() => {
                  if (tooltipOpen) {
                    hideTooltip();
                  } else {
                    showTooltip();
                  }
                }}
                className="cursor-help text-black/40 transition hover:text-black focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              <Info size={15} />
            </button>
          </div>
        </div>

        {/* Portal tooltip: not clipped by overflow-hidden */}
        {tooltipOpen &&
            typeof document !== "undefined" &&
            createPortal(
                <div
                    id={tooltipId}
                    role="tooltip"
                    style={{
                      position: "fixed",
                      top: tooltipPosition.top,
                      left: tooltipPosition.left,
                      width: tooltipPosition.width,
                      transform:
                          infoRef.current &&
                          tooltipPosition.top <
                          infoRef.current.getBoundingClientRect().top
                              ? "translateY(-100%)"
                              : undefined,
                      zIndex: 9999
                    }}
                    className="pointer-events-none rounded-xl border border-white/10 bg-black p-4 text-left text-xs leading-relaxed text-white shadow-2xl"
                >
                  <p className="font-black">
                    Flexible Audiowiedergabe
                  </p>

                  <p className="mt-2 text-white/75">
                    Im Übungsmodus können Sie das Audio pausieren,
                    zurückspulen, vorspulen und beliebig oft
                    wiederholen.
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    Wichtig: In der echten Prüfung sind diese
                    Funktionen nicht verfügbar.
                  </p>
                </div>,
                document.body
            )}

        {/* Audio element */}
        <audio
            ref={audioRef}
            src={src}
            preload="metadata"
            controls={false}
            onContextMenu={(event) => {
              event.preventDefault();
            }}
            onLoadedMetadata={(event) => {
              setDuration(event.currentTarget.duration);
            }}
            onTimeUpdate={(event) => {
              setCurrent(event.currentTarget.currentTime);
            }}
            onPlay={() => {
              setPlaying(true);
            }}
            onPause={handlePause}
            onEnded={handleEnded}
        />

        {/* Audio controls */}
        <div className="flex items-center gap-3">
          <button
              type="button"
              onClick={togglePlayback}
              disabled={buttonDisabled}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-black text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 disabled:hover:scale-100"
              aria-label={
                playing && practiceMode
                    ? "Audio pausieren"
                    : practiceMode
                        ? "Audio abspielen"
                        : hasEnded
                            ? "Audio wurde bereits abgespielt"
                            : hasStarted
                                ? "Audio wird abgespielt"
                                : "Audio einmalig abspielen"
              }
          >
            {playing ? (
                practiceMode ? (
                    <Pause size={20} fill="currentColor" />
                ) : (
                    <Volume2 size={20} />
                )
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

            {practiceMode ? (
                <input
                    type="range"
                    min={0}
                    max={
                      Number.isFinite(duration)
                          ? duration
                          : 0
                    }
                    step={0.1}
                    value={Math.min(
                        current,
                        Number.isFinite(duration)
                            ? duration
                            : 0
                    )}
                    onChange={(event) => {
                      handleSeek(
                          Number(event.target.value)
                      );
                    }}
                    disabled={
                        !Number.isFinite(duration) ||
                        duration <= 0
                    }
                    aria-label="Audioposition ändern"
                    className="mt-2 h-2 w-full cursor-pointer accent-black"
                />
            ) : (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/15">
                  <div
                      className="h-full bg-black transition-[width] duration-200"
                      style={{
                        width:
                            duration > 0 &&
                            Number.isFinite(duration)
                                ? `${Math.min(
                                    (current / duration) * 100,
                                    100
                                )}%`
                                : "0%"
                      }}
                  />
                </div>
            )}
          </div>
        </div>

        {/* Playback status */}
        <p className="mt-3 text-xs font-semibold text-black/45">
          {practiceMode
              ? "Übungsmodus: Audio kann pausiert, wiederholt und vorgespult werden."
              : !hasStarted
                  ? "Das Audio kann nur einmal gestartet werden."
                  : playing
                      ? "Das Audio läuft und kann nicht pausiert werden."
                      : "Die einmalige Wiedergabe ist beendet."}
        </p>

        {playbackError && (
            <p className="mt-2 text-xs font-bold text-red-600">
              {playbackError}
            </p>
        )}
      </div>
  );
}
