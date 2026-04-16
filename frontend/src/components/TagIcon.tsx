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

/** Detect if the string is a country flag (two regional indicator symbols) */
function isFlagEmoji(icon: string): boolean {
  const chars = [...icon];
  if (chars.length < 2) return false;
  const cp1 = chars[0].codePointAt(0) ?? 0;
  const cp2 = chars[1].codePointAt(0) ?? 0;
  return cp1 >= 0x1f1e6 && cp1 <= 0x1f1ff && cp2 >= 0x1f1e6 && cp2 <= 0x1f1ff;
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
 * - "/xxx.svg" / "/xxx.png" → local image from /public
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

  // Local public asset (e.g. "/Diroya.svg")
  if (icon.startsWith("/")) {
    return (
      <img
        src={icon}
        alt=""
        width={size}
        height={size}
        style={{ display: "inline-block", verticalAlign: "middle", objectFit: "contain" }}
      />
    );
  }

  if (icon.includes(":")) {
    const Icon = resolveReactIcon(icon);
    if (Icon) return <Icon size={size} />;
  }

  if (isFlagEmoji(icon)) {
    const src = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${toUnified(icon)}.png`;
    return (
      <img
        src={src}
        alt={icon}
        width={size}
        height={size}
        style={{ display: "inline-block", verticalAlign: "middle" }}
      />
    );
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
