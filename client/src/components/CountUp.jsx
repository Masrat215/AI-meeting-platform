import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

// A number that counts up from 0 when it appears.
// `format` turns the number into text, for example a time like "1h 15m".
function CountUp({ value, format = (number) => Math.round(number) }) {
  const [shown, setShown] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      setShown(value);
      return undefined;
    }
    const controls = animate(0, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: setShown,
    });
    return () => controls.stop();
  }, [value, reduceMotion]);

  return <span>{format(shown)}</span>;
}

export default CountUp;
