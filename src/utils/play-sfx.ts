interface SFXOptions {
  loop?: boolean;
  volume?: number;
  format?: string;
}

export function playSFX(name: string, options?: SFXOptions) {
  const audio = new Audio(`/sfx/${name}.mp3`);
  audio.loop = options?.loop ?? false;
  audio.volume = options?.volume ?? 1;

  audio.play();
  return audio;
}
