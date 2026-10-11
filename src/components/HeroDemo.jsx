import { useEffect, useMemo, useState } from 'react';
import BarChart from './BarChart.jsx';
import { bubbleSortSteps } from '../algorithms/sorting/bubbleSort.js';
import { usePrefersReducedMotion } from '../hooks/useMediaQuery.js';

const DEMO = [34, 12, 78, 45, 23, 67, 9, 56, 41, 88, 15, 60];
const STATIC_STEP = 14;

/** The real bubble sort, looping on the hero. Static when the visitor prefers reduced motion. */
export default function HeroDemo() {
  const steps = useMemo(() => bubbleSortSteps(DEMO), []);
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const last = steps.length - 1;

  useEffect(() => {
    if (reduced) return undefined;
    const id = setTimeout(() => setIndex((i) => (i >= last ? 0 : i + 1)), index >= last ? 2200 : 230);
    return () => clearTimeout(id);
  }, [index, last, reduced]);

  const step = steps[reduced ? STATIC_STEP : index];
  return (
    <figure className="hero-demo card">
      <BarChart values={step.array} step={step} compact label="Bubble Sort running on twelve numbers" />
      <figcaption>
        <span className="hero-demo__text" aria-hidden="true">{step.text}</span>
        <span className="hero-demo__tagline">Don't just learn algorithms. See them think.</span>
      </figcaption>
    </figure>
  );
}
