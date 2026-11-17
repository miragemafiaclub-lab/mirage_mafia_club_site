import type { ReactNode } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "./pages.css";

/** Header, content and footer for every page except the home page. */
export default function PageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main id="main" className="page" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}
