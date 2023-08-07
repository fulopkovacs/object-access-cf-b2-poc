import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <NextUIProvider>
      <main className="bg-background text-foreground dark">
        <Component {...pageProps} />
      </main>
    </NextUIProvider>
  );
};

export default api.withTRPC(MyApp);
