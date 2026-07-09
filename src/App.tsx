import Navbar from "./components/Navbar";
import TorchEffect from "./components/TorchEffect";
import About from "./components/about/page";
import LumenSection from "./components/exhibits/LumenSection";
import PalimpsestSection from "./components/exhibits/PalimpsestSection";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="bg-paper min-h-[100dvh] flex flex-col text-ink">
      <Navbar />
      <main className="flex-1">
        <TorchEffect />
        <About />
        <LumenSection />
        <PalimpsestSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
