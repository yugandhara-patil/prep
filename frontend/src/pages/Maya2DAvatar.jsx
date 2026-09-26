import { useEffect, useRef, useState } from "react";

import mayaNormal from "../assets/avatars/maya.png";
import mayaBlink from "../assets/avatars/maya-blink.png";
import mayaMouth from "../assets/avatars/maya-speaking-overlay.png";

function Maya2DAvatar({ speaking = false }) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);

  const blinkTimerRef = useRef(null);
  const blinkCloseTimerRef = useRef(null);

  // =========================
  // NATURAL BLINKING
  // =========================
  useEffect(() => {
    function scheduleBlink() {
      const delay = 2500 + Math.random() * 2500;

      blinkTimerRef.current = setTimeout(() => {
        setIsBlinking(true);

        blinkCloseTimerRef.current = setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 140);
      }, delay);
    }

    scheduleBlink();

    return () => {
      clearTimeout(blinkTimerRef.current);
      clearTimeout(blinkCloseTimerRef.current);
    };
  }, []);

  // =========================
  // NATURAL MOUTH MOVEMENT
  // =========================
  useEffect(() => {
    let mouthTimer;

    function animateMouth() {
      if (!speaking) {
        setMouthOpen(false);
        return;
      }

      // Randomly open and close the mouth
      setMouthOpen(Math.random() > 0.35);

      // Natural variation in timing
      const nextDelay = 100 + Math.random() * 180;

      mouthTimer = setTimeout(animateMouth, nextDelay);
    }

    if (speaking) {
      animateMouth();
    } else {
      setMouthOpen(false);
    }

    return () => {
      clearTimeout(mouthTimer);
      setMouthOpen(false);
    };
  }, [speaking]);

  return (
    <div
      className="
        relative
        flex
        h-full
        w-full
        items-end
        justify-center
        overflow-hidden
      "
    >
      {/* ================================= */}
      {/* BASE MAYA */}
      {/* ================================= */}

      <img
        src={isBlinking ? mayaBlink : mayaNormal}
        alt="Maya AI Interviewer"
        draggable="false"
        className="
          h-[95%]
          w-auto
          object-contain
          object-bottom
          select-none
          pointer-events-none
        "
      />

      {/* ================================= */}
      {/* SPEAKING MOUTH OVERLAY */}
      {/* ================================= */}

      {speaking && mouthOpen && (
        <img
          src={mayaMouth}
          alt=""
          draggable="false"
          className="
            absolute
            bottom-0
            left-1/2
            h-[95%]
            w-auto
            -translate-x-1/2
            object-contain
            object-bottom
            z-20
            select-none
            pointer-events-none
          "
        />
      )}
    </div>
  );
}

export default Maya2DAvatar;