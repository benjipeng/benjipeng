import Navbar from "./components/Navbar";
import TorchEffect from "./components/TorchEffect";
import About from "./components/about/page";
import OrbitalSection from "./components/arcade/OrbitalSection";
import CourierSection from "./components/arcade/CourierSection";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="bg-graphite min-h-[100dvh] flex flex-col">
      <Navbar />
      <main className="flex-1">
        <TorchEffect />
        <About />
        <OrbitalSection />
        <CourierSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
