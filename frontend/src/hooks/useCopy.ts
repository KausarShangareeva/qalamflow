import copy from "../content/copy.json";

type ReplacementValues = Record<string, string | number>;

/**
 * Replace placeholders in a string with values
 * Example: "Hello {name}" with {name: "World"} => "Hello World"
 */
function interpolate(template: string, values?: ReplacementValues): string {
  if (!values) return template;

  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match;
  });
}

/**
 * Get a random item from an array
 */
function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Hook to access copy text with interpolation support
 */
export function useCopy() {
  /**
   * Get copy text by path with optional interpolation
   * @param path - Dot-notation path to the copy text (e.g., "dashboard.greeting")
   * @param values - Optional values to interpolate into the text
   */
  const get = (path: string, values?: ReplacementValues): string => {
    const keys = path.split(".");
    let result: any = copy;

    for (const key of keys) {
      if (result && typeof result === "object" && key in result) {
        result = result[key as keyof typeof result];
      } else {
        console.warn(`Copy path not found: ${path}`);
        return path;
      }
    }

    if (typeof result !== "string") {
      console.warn(`Copy path does not point to a string: ${path}`);
      return path;
    }

    return interpolate(result, values);
  };

  /**
   * Get a random motivation message
   */
  const getRandomMotivation = (): string => {
    return getRandomItem(copy.dashboard.motivations);
  };

  /**
   * Get all items from an array path
   */
  const getArray = (path: string): any[] => {
    const keys = path.split(".");
    let result: any = copy;

    for (const key of keys) {
      if (result && typeof result === "object" && key in result) {
        result = result[key as keyof typeof result];
      } else {
        console.warn(`Copy path not found: ${path}`);
        return [];
      }
    }

    if (!Array.isArray(result)) {
      console.warn(`Copy path does not point to an array: ${path}`);
      return [];
    }

    return result;
  };

  return {
    get,
    getRandomMotivation,
    getArray,
    copy, // Direct access to the copy object if needed
  };
}
