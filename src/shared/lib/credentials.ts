import { n } from "@/config/navigation";

/* ───────────── Credentials ───────────── */
const PW_WORDS = [
  "Maple",
  "River",
  "Cedar",
  "Lotus",
  "Tiger",
  "Orchid",
  "Falcon",
  "Cobalt",
  "Amber",
  "Willow",
];

export const genPassword = (n: number) =>
  `${PW_WORDS[Math.abs(n) % PW_WORDS.length]}@${1000 + ((Math.abs(n) * 7919 + 13) % 9000)}`;

export const randomPassword = () => genPassword(Math.floor(Math.random() * 1_000_000));

export const slugOf = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "") || "student";
