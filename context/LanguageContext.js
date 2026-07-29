import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "../lib/translations";

const LanguageContext = createContext(undefined);

function getByPath(obj, path) {
  return path
    .split(".")
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("fr");

  useEffect(() => {
    const stored = window.localStorage.getItem("nova-finance-lang");
    if (stored && translations[stored]) setLang(stored);
  }, []);

  function changeLang(next) {
    setLang(next);
    window.localStorage.setItem("nova-finance-lang", next);
  }

  function t(key) {
    return getByPath(translations[lang], key) ?? key;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (ctx === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
