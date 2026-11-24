import type { Transition, Variants } from 'motion/react';

// Slow-in, slow-out natural deceleration curve
export const EASE_SLOW_IN_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Snappy spring for tactile follow-through without sluggish drift
export const SPRING_SNAPPY: Transition = {
  type: 'spring',
  stiffness: 460,
  damping: 26,
  mass: 0.75,
};

// Expressive spring for exaggerated confirmation and selection feedback
export const SPRING_EXAGGERATED: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 18,
  mass: 0.8,
};

// Pose-to-pose container stagger for overlapping follow-through
export const STAGGER_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

// Moving in an arc + slow-out settle for cards and list rows
export const ARC_ITEM: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    x: -6,
    rotate: -0.6,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.38,
      ease: EASE_SLOW_IN_OUT,
    },
  },
};

// Squash & stretch tactile button motion (volume-preserving micro-deformation)
export const SQUASH_TAP = {
  scaleX: 1.04,
  scaleY: 0.94,
  y: 1,
  transition: { duration: 0.08, ease: 'easeOut' as const },
};

// Anticipation wind-up hover before pressing
export const ANTICIPATION_HOVER = {
  y: -2,
  scale: 1.015,
  transition: SPRING_SNAPPY,
};
