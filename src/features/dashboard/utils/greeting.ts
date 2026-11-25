/** "Good morning", "Good afternoon" or "Good evening", from the current hour. */
export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Removes titles such as "Mr." or "Ms." and returns the first name, for "Good morning, Neha". */
export function firstNameOf(fullName: string) {
  return fullName.replace(/^(Admin|Mr|Ms|Mrs|Dr)\.?\s+/i, "").split(" ")[0] ?? "";
}
