// Simple className utility without external dependencies
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function formatPercentage(num: number): string {
  return `${num.toFixed(1)}%`;
}

export function getEmotionColor(emotion: string): string {
  const emotionLower = emotion.toLowerCase();
  if (emotionLower.includes("joy") || emotionLower.includes("happy"))
    return "#10b981";
  if (
    emotionLower.includes("satisfaction") ||
    emotionLower.includes("satisfied")
  )
    return "#3b82f6";
  if (emotionLower.includes("neutral")) return "#6b7280";
  if (
    emotionLower.includes("frustration") ||
    emotionLower.includes("frustrated")
  )
    return "#f59e0b";
  if (emotionLower.includes("anger") || emotionLower.includes("angry"))
    return "#ef4444";
  return "#8b5cf6"; // default purple
}
