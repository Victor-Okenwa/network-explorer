import { Button } from "@/components/ui/button";
import { ThemeProvider } from "./components/theme-provider";
import { ArrowDown } from "lucide-react";

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="network-explorer-theme">
      <main>

        <section className=" sm:px-6 px-4 flex flex-col justify-center items-center min-h-screen moving-grid max-w-screen">
          <h1 className="text-3xl sm:text-5xl text-center max-w-md">How the <span className="text-primary">Internet</span> Works</h1>

          <p className="text-center text-base sm:text-lg mt-3 text-muted-foreground max-w-xl">
            Explore IP/MAC addressing and see how data packets travel across networks with ARP, routing, and encapsulation.
          </p>

          <div className="flex justify-center relative">
            <Button onClick={() => window.location.href = "#addressing"}
              className="relative mt-6 text0-base sm:text-lg w-fit py-7 px-12! after:content-[''] after:-z-1 after:absolute after:top-2 after:left-2 after:w-full after:h-full after:bg-primary/50 after:rounded-md hover:after:bg-primary/70 hover:after:top-1 hover:left-1 after:transition-all! after:duration-600!">
              Explore Now <ArrowDown />
            </Button>
          </div>
        </section>


        <section id="addressing" className="py-12 sm:px-6 px-4">
          <div>
            <h2>Address Converter</h2>
          </div>


          <div></div>
        </section>

      </main>
    </ThemeProvider>
  )
}

export default App
