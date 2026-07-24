import Head from "next/head";
import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { LanguageProvider } from "../context/LanguageContext";

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Head>
            <title>Nova Finance</title>
          </Head>
          <Component {...pageProps} />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
