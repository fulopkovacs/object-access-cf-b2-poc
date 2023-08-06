import { type Config } from "tailwindcss";
import { grayDark, yellowDark } from "@radix-ui/colors";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
  colors: { ...grayDark, ...yellowDark },
    extend: {},
  },
  plugins: [],
} satisfies Config;
