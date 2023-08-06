import Head from "next/head";
import Link from "next/link";
import { ClicksCounter } from "~/components/ClicksCounter";

export default function Home() {

  return (
    <>
      <Head>
        <title>Virtual skethcbook</title>
        <meta name="description" content="Virtual sketchbook" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="">
        <Link href="/test">test page</Link>
        <ClicksCounter/>
      </main>
    </>
  );
}
