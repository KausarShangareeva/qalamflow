import TAGS from "../data/ru/tags.json";

export type DemoTag = {
  label: string;
  color: string;
  bg: string;
  icon: string;
};

/** Ищет курс по имени в tags.json. Возвращает null если не найден. */
export function t(name: string): DemoTag | null {
  const tag = TAGS.find((tag) => tag.name === name);
  if (!tag) return null;
  return { label: tag.name, color: tag.color, bg: tag.bg, icon: tag.icon };
}

/** Все теги из tags.json. */
export const DEMO_TAGS: DemoTag[] = TAGS.map((tag) => ({
  label: tag.name,
  color: tag.color,
  bg: tag.bg,
  icon: tag.icon,
}));
