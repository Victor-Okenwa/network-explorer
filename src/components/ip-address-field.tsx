import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function IpAddressField() {
    const [ipAddress, setIpAddress] = useState("");

    const handleChange = (value: string) => {
        const cleaned = value.replace(/[^0-9.]/g, '');
        setIpAddress(cleaned);
    };

    const convertToBinary = () => {
        const parts = ipAddress.split(".");
        if (parts.length !== 4) {
            return null;
        }

        const octets = parts.map((part) => {
            const num = parseInt(part, 10);
            if (isNaN(num) || num < 0 || num > 255) {
                return null
            }

            console.log(num.toString(2).padStart(8, '0'));
            return num.toString(2).padStart(8, "0");
        });
        if (octets.some(octet => octet === null)) {
            return null;
        }

        return octets;
    }

    const binary = convertToBinary();

    return (
        <div className="flex flex-col gap-2 flex-1 border rounded-md p-4 border-secondary focus-within:border-primary transition-all duration-300 focus-within:[&>label]:text-primary">
            <Label htmlFor="ip-address" className="text-sm sm:text-base">IP Address to Binary</Label>
            <Input type="text" placeholder="e.g. 192.168.1.1" id="ip-address" className="text-base! py-6" value={ipAddress} onChange={(e) => handleChange(e.target.value)} />

            <div>

                {binary ? (
                    <div className="flex flex-wrap gap-2">
                        {binary.map((octet, index) => (
                            <div key={index} className="flex flex-col gap-2">
                                <div className="flex gap-1">
                                    <span className="text-sm text-muted-foreground py-1 px-2 bg-secondary rounded-md">{octet?.slice(0, 4)}</span>
                                    <span className="text-sm text-muted-foreground py-1 px-2 bg-secondary rounded-md">{octet?.slice(4, 8)}</span>
                                    {index < 3 && <span className="text-sm text-primary">.</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : ipAddress.length > 0 ? (
                    <p className="text-xs text-muted-foreground">Enter a valid IP (0-255 per octet)</p>
                ) : <p className="text-xs text-muted-foreground">IP addresses are 32-bit addresses that are used to identify devices on a network. They are divided into 4 octets (separated by dots), each octet is 8 bits.</p>}

            </div>
        </div >
    );
}
