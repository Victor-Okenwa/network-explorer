import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function MacAddressField() {
    const [macAddress, setMacAddress] = useState("");

    const handleChange = (value: string) => {
        // Allow colons (:) in the input for MAC address formatting
        const cleaned = value.replace(/[^0-9A-Fa-f:]/g, '').toUpperCase();
        setMacAddress(cleaned);
    }

    const convertToBinary = () => {
        const parts = macAddress.split(":");

        if (parts.length !== 6) {
            return null;
        }

        const bytes = parts.map((part) => {
            if (!/^[0-9A-F]{2}$/.test(part)) { return null; }
            return parseInt(part, 16).toString(2).padStart(8, '0');
        });

        if (bytes.some(byte => byte === null)) {
            return null;
        }
        return bytes;
    }

    const binary = convertToBinary();

    return (
        <div className="flex flex-col gap-2 flex-1 border rounded-md p-4 border-secondary focus-within:border-primary transition-all duration-300 focus-within:[&>label]:text-primary">
            <Label htmlFor="mac-address" className="text-sm sm:text-base">MAC Address to Binary</Label>
            <Input type="text" placeholder="e.g. AA:BB:CC:DD:EE:FF" id="mac-address" className="text-base! py-6" value={macAddress} onChange={(e) => handleChange(e.target.value)} />

            <div>
                {binary ? (
                    <div className="flex flex-wrap gap-2">
                        {binary.map((byte, index) => (
                            <div key={index} className="flex flex-col gap-2">
                                <div className="flex gap-1">
                                    <span className="text-sm text-muted-foreground py-1 px-2 bg-secondary rounded-md">{byte?.slice(0, 4)}</span>
                                    <span className="text-sm text-muted-foreground py-1 px-2 bg-secondary rounded-md">{byte?.slice(4, 8)}</span>
                                    {index < 5 && <span className="text-sm text-muted-foreground">:</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : macAddress.length > 0 ? (
                    <p className="text-xs text-muted-foreground">Enter a valid MAC address (0-9A-F per byte)</p>
                ) : <p className="text-xs text-muted-foreground">MAC addresses are 48-bit addresses that are used to identify devices on a network. They are divided into 6 bytes (separated by colons), each byte is 8 bits.</p>}
            </div>
        </div>
    );
}
