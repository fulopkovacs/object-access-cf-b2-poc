import { type Config } from "tailwindcss";
import { grayDark } from "@radix-ui/colors";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
  colors: { ...grayDark },
    extend: {},
  },
  plugins: [],
} satisfies Config;
