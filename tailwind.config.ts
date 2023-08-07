import { type Config } from "tailwindcss";
// import { grayDark, yellowDark } from "@radix-ui/colors";
import { nextui } from "@nextui-org/react";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // colors: { ...grayDark, ...yellowDark },
    extend: {},
  },
  darkMode: "class",
  plugins: [
    nextui({
      defaultTheme: "dark",
    }),
  ],
} satisfies Config;
