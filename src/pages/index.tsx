import Head from "next/head";
import { api } from "~/utils/api";

export default function Home() {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>Virtual skethcbook</title>
        <meta name="description" content="Virtual sketchbook" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="">hello</main>
    </>
  );
}
