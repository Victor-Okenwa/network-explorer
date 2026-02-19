import { Button } from "@/components/ui/button";
import { ThemeProvider } from "./components/theme-provider";

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="network-explorer-theme">
      <main>
        <h1>Network Explorer</h1>
        <Button>Click me</Button>
      </main>
    </ThemeProvider>
  )
}

export default App
