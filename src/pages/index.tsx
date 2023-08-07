import Head from "next/head";
import Link from "next/link";
import { ClicksCounter } from "~/components/ClicksCounter";
import UserPageLayout from "~/components/UserPageLayout";

export default function Home() {

  return (
    <>
      <Head>
        <title>Virtual skethcbook</title>
        <meta name="description" content="Virtual sketchbook" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <UserPageLayout>
        <ClicksCounter/>
      </UserPageLayout>
    </>
  );
}
