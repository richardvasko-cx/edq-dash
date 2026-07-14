export const md3Ease = [0.2, 0, 0, 1] as const;

export const md3Enter = {
  initial: { opacity: 0, y: 18, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

export const md3QuickEnter = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export const md3TextEnter = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};
