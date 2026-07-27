import { useEffect, useState } from "react";
import { useRouter } from "next/router";

// A slim top bar that fills in during page navigation — no extra dependency,
// just router events driving width/opacity. Purely cosmetic: it never blocks
// navigation and disappears the moment the route finishes changing.
export default function RouteProgressBar() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timeout;

    function start() {
      clearTimeout(timeout);
      setVisible(true);
      setProgress(15);
      timeout = setTimeout(() => setProgress(70), 100);
    }

    function done() {
      clearTimeout(timeout);
      setProgress(100);
      timeout = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 200);
    }

    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", done);
    router.events.on("routeChangeError", done);

    return () => {
      clearTimeout(timeout);
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", done);
      router.events.off("routeChangeError", done);
    };
  }, [router]);

  if (!visible) return null;

  return (
    <div className="fixed left-0 top-0 z-50 h-0.5 w-full bg-transparent">
      <div
        className="h-full bg-accent transition-all duration-200 ease-out dark:bg-white"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
