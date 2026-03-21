import type React from "react";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import * as Si from "react-icons/si";
import * as Fa from "react-icons/fa";

/** Convert an emoji string to the unified hex code format emoji-picker-react uses */
function toUnified(icon: string): string {
  return [...icon]
    .map((c) => c.codePointAt(0)!)
    .map((cp) => cp.toString(16))
    .join("-");
}

/** Detect if the string starts with a proper emoji (not plain text symbols like ∫ or △) */
function isEmoji(icon: string): boolean {
  if (!icon) return false;
  const cp = icon.codePointAt(0) ?? 0;
  return (
    cp >= 0x1f000 ||
    (cp >= 0x2600 && cp <= 0x27bf) ||
    (cp >= 0x2300 && cp <= 0x23ff) ||
    (cp >= 0x2b00 && cp <= 0x2bff)
  );
}

/**
 * Resolves "si:youtube" → SiYoutube, "fa:heart" → FaHeart from react-icons.
 */
function resolveReactIcon(icon: string): React.ElementType | null {
  const [prefix, name] = icon.split(":");
  if (!name) return null;
  const key = prefix.toUpperCase() + name.charAt(0).toUpperCase() + name.slice(1);
  if (prefix === "si") return (Si as Record<string, React.ElementType>)[key] ?? null;
  if (prefix === "fa") return (Fa as Record<string, React.ElementType>)[key] ?? null;
  return null;
}

/**
 * Renders a tag icon:
 * - "si:youtube" / "fa:heart" → react-icons SVG
 * - emoji → Apple-style image via emoji-picker-react
 * - anything else → plain <span>
 */
export default function TagIcon({
  icon,
  size = 18,
}: {
  icon: string;
  size?: number;
}) {
  if (!icon) return null;

  if (icon.includes(":")) {
    const Icon = resolveReactIcon(icon);
    if (Icon) return <Icon size={size} />;
  }

  if (isEmoji(icon)) {
    return (
      <Emoji
        unified={toUnified(icon)}
        size={size}
        emojiStyle={EmojiStyle.APPLE}
      />
    );
  }

  return <span style={{ fontSize: size }}>{icon}</span>;
}
