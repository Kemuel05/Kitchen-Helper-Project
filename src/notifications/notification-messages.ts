export const NOTIFICATION_TITLE = "Food Valley <3";

export const DAILY_NOTIFICATION_HOUR = 15;
export const DAILY_NOTIFICATION_MINUTE = 0;

export const NOTIFICATION_MESSAGES = [
  "Remember Kemu loves you! And he also loves cookies!",
  "Make cookies!",
  "Remember to eat good food! Love You!",
  "Hmm Pancakes? :)",
  "Hmm Pasta? :)",
  "Muah <3",
  "Did you eat today? -_-",
  "Psst...Love you",
] as const;

export function getRandomNotificationMessage(
  previousMessage?: string
): string {
  const availableMessages = previousMessage
    ? NOTIFICATION_MESSAGES.filter(
        (message) => message !== previousMessage
      )
    : [...NOTIFICATION_MESSAGES];

  const randomIndex = Math.floor(
    Math.random() * availableMessages.length
  );

  return availableMessages[randomIndex];
}