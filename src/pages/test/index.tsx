import { ClicksCounter } from "~/components/ClicksCounter";
import Link from "next/link";
import UserPageLayout from "~/components/UserPageLayout";

export default function TestPage() {
  return (
  <UserPageLayout>
  <Link href="/" className="underline">
  home page
  </Link>
  <ClicksCounter />
  </UserPageLayout>
  );
}
