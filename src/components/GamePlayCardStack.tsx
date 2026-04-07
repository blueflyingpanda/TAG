import type { PanInfo } from "framer-motion";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect } from "react";
import { cn } from "../lib/cn";

/** alias-main card-deck swipe */
const SWIPE_PX = 100;
const SWIPE_VELOCITY = 500;

/** alias-main card.tsx */
const cardSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 20,
};

const exitTween = { duration: 0.2, ease: "easeInOut" as const };

type StackCardProps = {
  word: string;
  isFront: boolean;
  exitX: number;
  interactionLocked: boolean;
  onSwipeCommit: (guessed: boolean) => void;
};

/**
 * Mirrors alias-main `Card.tsx` motion. When `isFront` flips false→true on the
 * same React key (next word becomes current), Framer animates scale/y/opacity
 * — the “ascending” deck effect.
 *
 * Drag is only active when `isFront`; transform `x` lives on an inner node so
 * outer `animate={{ x: 0 }}` stays valid (alias parity).
 */
function StackCard({
  word,
  isFront,
  exitX,
  interactionLocked,
  onSwipeCommit,
}: StackCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);

  useEffect(() => {
    if (isFront) x.set(0);
  }, [word, isFront, x]);

  return (
    <motion.div
      layout={false}
      className={cn(
        "absolute inset-0 grid place-items-center",
        isFront ? "z-[1]" : "z-0",
      )}
      initial={!isFront ? { scale: 0, y: 105, opacity: 0 } : false}
      animate={{
        scale: isFront ? 1 : 0.75,
        y: isFront ? 0 : 60,
        opacity: isFront ? 1 : 0.5,
        x: 0,
      }}
      exit={
        isFront
          ? {
              x: exitX,
              opacity: 0,
              scale: 0.5,
              rotate: exitX > 0 ? 15 : exitX < 0 ? -15 : 0,
              transition: exitTween,
            }
          : undefined
      }
      transition={cardSpring}
      style={isFront ? { x, rotate } : undefined}
      drag={isFront && !interactionLocked ? "x" : false}
      dragConstraints={{ left: -280, right: 280 }}
      dragElastic={0.1}
      dragMomentum={false}
      onDragEnd={(_e, info: PanInfo) => {
        if (!isFront || interactionLocked) return;
        const { offset, velocity } = info;
        if (offset.x > SWIPE_PX || velocity.x > SWIPE_VELOCITY) {
          onSwipeCommit(true);
          return;
        }
        if (offset.x < -SWIPE_PX || velocity.x < -SWIPE_VELOCITY) {
          onSwipeCommit(false);
          return;
        }
        animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
      }}
      whileDrag={isFront ? { scale: 1.02 } : undefined}
    >
      <div
        className={cn(
          "grid h-full w-full place-items-center rounded-[15px] bg-card p-[10px] text-text",
          isFront &&
            "cursor-grab touch-none select-none active:cursor-grabbing",
        )}
      >
        <p className="text-center text-base font-semibold capitalize leading-tight md:text-lg">
          {word}
        </p>
      </div>
    </motion.div>
  );
}

export type GamePlayCardStackProps = {
  currentIndex: number;
  currentWord: string;
  backWord: string | null;
  cardExitX: number;
  interactionLocked: boolean;
  cheatingDetected: boolean;
  isPaused: boolean;
  onSwipeCommit: (guessed: boolean) => void;
};

/**
 * Same reconciliation pattern as alias-main `card-deck.tsx`:
 * `{next && <Card key={next} isFront={false} />}{current && <Card key={current} isFront={true} />}`
 *
 * Keys use list index + word so the promoted card keeps one key:
 * back `{(i+1)-w}` → front `{i-w}` after advance becomes `{(i+1)-w}` with isFront true.
 */
export function GamePlayCardStack({
  currentIndex,
  currentWord,
  backWord,
  cardExitX,
  interactionLocked,
  cheatingDetected,
  isPaused,
  onSwipeCommit,
}: GamePlayCardStackProps) {
  const showStack = currentWord && !cheatingDetected && !isPaused;

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative h-[320px] w-full overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[min(290px,calc(100vw-2rem))] w-[min(290px,calc(100vw-2rem))] -translate-x-1/2">
          <AnimatePresence initial={false}>
            {showStack && backWord && (
              <StackCard
                key={`${currentIndex + 1}-${backWord}`}
                word={backWord}
                isFront={false}
                exitX={0}
                interactionLocked
                onSwipeCommit={onSwipeCommit}
              />
            )}

            {showStack && currentWord && (
              <StackCard
                key={`${currentIndex}-${currentWord}`}
                word={currentWord}
                isFront={true}
                exitX={cardExitX}
                interactionLocked={interactionLocked}
                onSwipeCommit={onSwipeCommit}
              />
            )}

            {cheatingDetected && (
              <motion.div
                key="cheating-placeholder"
                className="absolute inset-0 z-[2] grid place-items-center rounded-[15px] border border-error/30 bg-error/10 p-[10px] text-text"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={cardSpring}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="text-5xl" aria-hidden>
                    ⚠️
                  </span>
                  <p className="text-xl font-bold">Cheating Detected</p>
                  <p className="text-sm text-text/70">
                    Too many words guessed too quickly
                  </p>
                </div>
              </motion.div>
            )}

            {isPaused && (
              <motion.div
                key="paused-placeholder"
                className="absolute inset-0 z-[2] grid place-items-center rounded-[15px] border border-text/15 bg-card p-[10px] text-text"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={cardSpring}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="text-5xl" aria-hidden>
                    ⏸️
                  </span>
                  <p className="text-xl font-bold">Round Paused</p>
                  <p className="text-sm text-text/70">
                    Word is hidden until resumed
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
