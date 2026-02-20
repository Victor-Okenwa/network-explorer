import { Button } from "@/components/ui/button";
import { ThemeProvider } from "./components/theme-provider";
import { ArrowDown } from "lucide-react";
import { IpAddressField } from "./components/ip-address-field";
import { MacAddressField } from "./components/mac-address-field";
import { NetworkTopology } from "./components/network-topology";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="network-explorer-theme">
      <main>

        <header className=" sm:px-6 px-4 flex flex-col justify-center items-center min-h-screen moving-grid max-w-screen border-b">
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
        </header>


        <section id="addressing" className="py-16 sm:px-6 px-4 space-y-6">
          <hgroup>
            <h2 className="text-2xl sm:text-3xl font-bold uppercase">Address Converter</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">Convert IP and MAC addresses to binary and see how they are represented in the network.</p>
          </hgroup>


          <fieldset className="flex gap-4 flex-wrap max-md:flex-col">

            <IpAddressField />
            <MacAddressField />
          </fieldset>
        </section>


        <section id="topology" className="py-16 sm:px-6 px-4 space-y-6">
          <hgroup>
            <h2 className="text-2xl sm:text-3xl font-bold uppercase">Network Topology</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">Click a host to select sender, then click another to select receiver. Server can only be selected after picking a first host.</p>
          </hgroup>

          <NetworkTopology />

          {/* Packet Legend */}
          <div className="py-2 flex flex-wrap gap-4 justify-center text-[10px] font-bold tracking-wider">
            <div className="flex items-center gap-1.5"><span className="w-4 h-3 rounded-sm bg-blue-600 inline-block" /> L2 (Data Link)</div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-3 rounded-sm bg-green-600 inline-block" /> L3 (Network)</div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-3 rounded-sm bg-red-600 inline-block" /> L4 (Transport)</div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-3 rounded-sm bg-yellow-600 inline-block" /> Data</div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-3 rounded-sm bg-pink-400 -color inline-block" /> ARP</div>
          </div>

        </section>


      </main>
    </ThemeProvider>
  )
}

export default App
