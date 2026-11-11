import { useLayoutEffect, useRef, useState } from "react";
import About from "./components/About";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import PlayerRoster from "./components/PlayerRoster";
import Players from "./components/Players";
import Podium from "./components/Podium";
import Schedule from "./components/Schedule";
import Winners from "./components/Winners";

export default function App() {
  const [rosterGroup, setRosterGroup] = useState<"chk" | "kchk" | null>(null);
  // Page scroll position before the roster opened, restored when it closes.
  const savedScroll = useRef(0);
  const prevGroup = useRef(rosterGroup);

  const openRoster = (groupId: "chk" | "kchk") => {
    savedScroll.current = window.scrollY;
    setRosterGroup(groupId);
  };

  // The roster replaces the whole page: start it at the top, and return to where the user was on close.
  useLayoutEffect(() => {
    // Only on an actual open/close, so deep links (#schedule) and reload scroll restoration still work.
    if (prevGroup.current === rosterGroup) return;
    prevGroup.current = rosterGroup;
    window.scrollTo({ top: rosterGroup ? 0 : savedScroll.current, behavior: "instant" });
  }, [rosterGroup]);

  if (rosterGroup) {
    return <PlayerRoster groupId={rosterGroup} onClose={() => setRosterGroup(null)} />;
  }

  return (
    <>
      <Header />
      {/* Skip-link target (Header); tabIndex lets it take focus. */}
      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <Schedule />
        <Players onOpenRoster={openRoster} />
        <Winners />
        <Podium />
      </main>
      <Footer />
    </>
  );
}
