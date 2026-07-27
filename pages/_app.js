import Head from "next/head";
import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { LanguageProvider } from "../context/LanguageContext";
import { ProfileProvider } from "../context/ProfileContext";

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ProfileProvider>
            <Head>
              <title>Nova Finance</title>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <Component {...pageProps} />
          </ProfileProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
