export function getCurrentYear(): string {
  const currentYear = new Date().getFullYear();
  return currentYear.toString();
}
