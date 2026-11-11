import { useState } from "react";
import About from "./components/About";
import Header from "./components/Header";
import Hero from "./components/Hero";
import PlayerRoster from "./components/PlayerRoster";
import Players from "./components/Players";
import Podium from "./components/Podium";
import Schedule from "./components/Schedule";
import Winners from "./components/Winners";

export default function App() {
  const [rosterGroup, setRosterGroup] = useState<"chk" | "kchk" | null>(null);

  if (rosterGroup) {
    return <PlayerRoster groupId={rosterGroup} onClose={() => setRosterGroup(null)} />;
  }

  return (
    <>
      <Header />
      <Hero />
      <About />
      <Players onOpenRoster={setRosterGroup} />
      <Winners />
      <Podium />
      <Schedule />
    </>
  );
}
