// 🎧 كل الأوديو
const audioModules = import.meta.glob(
  "./assets/**/*.mp3",
  { eager: true }
);
// const videoModules = import.meta.glob(
//   "./assets/**/*.mp4",
//   { eager: true }
// );

// 🖼 كل الصور
const imageModules = import.meta.glob(
  "./assets/**/*.{png,jpg,jpeg,webp}",
  { eager: true }
);

export const ALL_ASSETS = [
  ...Object.values(audioModules).map((m) => m.default),
  ...Object.values(imageModules).map((m) => m.default),
  // ...Object.values(videoModules).map((m) => m.default),
];
