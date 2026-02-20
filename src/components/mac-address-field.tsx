import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function MacAddressField() {
    return (
        <div className="flex flex-col gap-2 flex-1 border rounded-md p-4 border-secondary focus-within:border-primary transition-all duration-300 focus-within:[&>label]:text-primary">
            <Label htmlFor="mac-address" className="text-sm sm:text-base">MAC Address to Binary</Label>
            <Input type="text" placeholder="e.g 172.56.78.10" id="mac-address" className="text-base! py-6" />
        </div>
    );
}
