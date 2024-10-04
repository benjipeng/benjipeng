import TorchEffect from "./components/TorchEffect";
import Navbar from "./components/Navbar";
import About from "./components/about/page";
import Footer from "./components/Footer";
import { Form } from "./components/Form";

function App() {
  return (
    <div className="bg-black flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-2">
        <Navbar />
      </div>
      <div id="home" className="min-h-screen flex-grow">
        <TorchEffect />
      </div>
      <div id="about" className="py-32 px-4 md:px-8 lg:px-0 max-w-7xl mx-auto">
        <About />
      </div>
      <div
        id="contact"
        className="py-32 px-4 md:px-8 lg:px-0 max-w-7xl mx-auto"
      >
        <Form />
      </div>
      <Footer />
    </div>
  );
}

export default App;
