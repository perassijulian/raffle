import Head from "next/head";
import Description from "../components/Description";
import Header from "../components/Header";
import RaffleEntrance from "../components/RaffleEntrance";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="h-screen flex flex-col items-center">
      <Header />
        <div
          className="grid grid-cols-2 h-full m-auto md:w-full lg:w-3/4"
        >
          <Description />
          <RaffleEntrance />
        </div>
      </div>
    </div>
  );
}
