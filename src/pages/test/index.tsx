import { ClicksCounter } from "~/components/ClicksCounter";
import Link from "next/link";

export default function TestPage() {
  return (
    <main>
      <Link href="/" className="underline">
        home page
      </Link>
      <ClicksCounter />
    </main>
  );
}
