import { findNode, NODES } from "@/data/network-data";
import { CONNECTIONS } from "@/data/network-data";
import { cn } from "@/lib/utils";
import { Cloud, Laptop, Smartphone, Wifi, Server } from "lucide-react";
import { useCallback, useState } from "react";

const ICON_MAP: Record<string, React.ElementType> = {
    laptop: Laptop,
    phone: Smartphone,
    server: Server,
    router: Wifi,
    internet: Cloud,
};


export function NetworkTopology() {
    const [source, setSource] = useState<string | null>(null); // Id of the source will stored here
    const [dest, setDest] = useState<string | null>(null); // Id of the destination will stored here
    const [animating, setAnimating] = useState(false); // when the packet is being transferred
    const [done, setDone] = useState(false); // when the packet has been transferred




    const isSelectable = (id: string) => {
        const node = findNode(id);
        return node.type !== 'internet' && node.type !== 'router';
    }

    const handleNodeClick = useCallback((nodeId: string) => {
        if (animating || done) {
            return;
        }
        if (!isSelectable(nodeId)) {
            return;
        }

        const node = findNode(nodeId);
        if (source === nodeId) {
            setSource(null);
            setDest(null);
            return;
        }

        if (dest === nodeId) {
            setDest(null);
            return;
        }

        if (!source) {
            if (node.type === "server") {
                return
            };
            setSource(nodeId);
            return;
        }

        if (!dest) {
            setDest(nodeId);
        }
    }, [source, dest, animating, done])

    return (
        <div className="relative w-full min-h-[540px] flex justify-center overflow-x-auto border border-primary/30 bg-primary/5 p-2 rounded-lg">
            {/* Network boundaries */}
            <div className="absolute border border-dashed border-primary/25 rounded-lg left-[2%] top-[6%] w-[34%] h-[58%]">
                <span className="absolute -top-2.5 left-3 bg-card px-2 text-[10px] text-primary font-bold tracking-wider">
                    NETWORK A — 11.9.18.0/24
                </span>
            </div>
            <div className="absolute border border-dashed border-primary/25 rounded-lg left-[64%] top-[6%] w-[34%] h-[58%]">
                <span className="absolute -top-2.5 left-3 bg-card px-2 text-[10px] text-primary font-bold tracking-wider">
                    NETWORK B — 15.17.19.0/24
                </span>
            </div>

            {/* SVG connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                {CONNECTIONS.map((conn, i) => {
                    const from = findNode(conn.from);
                    const to = findNode(conn.to);
                    return (
                        <line
                            key={i}
                            x1={`${from.x}%`} y1={`${from.y}%`}
                            x2={`${to.x}%`} y2={`${to.y}%`}
                            className="stroke-network-line"
                            strokeWidth="2"
                            strokeDasharray={to.type === 'internet' || from.type === 'internet' ? '6 4' : 'none'}
                        />
                    );
                })}
            </svg>

            {NODES.map((node) => {
                const Icon = ICON_MAP[node.type];
                const isSource = source === node.id;
                const isDest = dest === node.id;
                const selectable = isSelectable(node.id);
                const shouldPulse = source && !dest && !animating && !done && node.id !== source && selectable && !(findNode(node.id).type === 'server' && !source);

                return (<div
                    key={node.id}
                    className={cn("absolute flex flex-col items-center gap-1 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out z-5", {
                        "cursor-pointer": selectable && !animating && !done,
                        "animate-bounce": shouldPulse,
                    })}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    onClick={() => handleNodeClick(node.id)}
                >
                    <div className={cn("p-2.5 rounded-xl border-2 transition-all duration-300", {
                        "bg-primary/30 border-primary shadow shadow-primary": isSource,
                        "bg-primary/10 border-primary/30 shadow shadow-primary/30": isDest,
                        "border-border bg-muted-foreground/50": node.type === "internet",
                        "border-border hover:border-muted-foreground": node.type !== "internet" && node.type !== "router",
                    })}>
                        <Icon />

                    </div>

                </div>
                )
            })}
        </div >
    );
}
