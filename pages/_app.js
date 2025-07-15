import '../styles/globals.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Mummyfoodie - What Should I Cook Today?</title>
        <meta name="description" content="Get personalized meal suggestions for breakfast, lunch, and dinner based on your dietary preferences" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#ea580c" />
        <meta property="og:title" content="Mummyfoodie - Meal Suggestion App" />
        <meta property="og:description" content="Never wonder what to cook again! Get personalized meal suggestions." />
        <meta property="og:type" content="website" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
