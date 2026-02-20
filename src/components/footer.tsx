import { Dot } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-black border-t border py-4 sm:px-4 px-2 text-center text-xs text-muted-foreground">


            <p>Made with ❤️ by <a href="https://okenwaportfolio.web.app" target="_blank" rel="noopener noreferrer" className="text-primary underline!">Victor Okenwa</a>
                <br />© 2026 Network Explorer. All rights reserved.
            </p>

            <div className="flex items-center justify-center gap-1 flex-wrap">
                <a href="mailto:okenwavictor003@gmail.com" className="text-primary underline!">okenwavictor003@gmail.com</a>
                <Dot />
                <a href="https://github.com/Victor-Okenwa" target="_blank" rel="noopener noreferrer" className="text-muted-foreground underline! hover:text-foreground">
                    GitHub
                </a>
                <a href="https://twitter.com/morse_code_001" target="_blank" rel="noopener noreferrer" className="text-muted-foreground underline! hover:text-foreground">
                    Twitter
                </a>
            </div>
        </footer>
    );
}
