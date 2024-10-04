import TorchEffect from "./components/TorchEffect";
import Navbar from "./components/Navbar";
import About from "./components/about/page";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-2">
        <Navbar />
      </div>
      <div className="flex-grow">
        <TorchEffect />
      </div>
      <div className="py-20 px-4 md:px-8 lg:px-0 max-w-7xl mx-auto">
        <About />
      </div>
      <Footer />
    </div>
  );
}

export default App;
