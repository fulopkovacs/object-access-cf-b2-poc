import { type ReactNode } from "react";
import { Navbar } from "./Navbar";

export default function UserPageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
