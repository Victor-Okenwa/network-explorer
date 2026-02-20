import { findNode, generateSteps, NODES } from "@/data/network-data";
import { CONNECTIONS } from "@/data/network-data";
import { cn } from "@/lib/utils";
import type { AnimationStep, ArpEntry } from "@/types/network";
import { Cloud, Laptop, Smartphone, Wifi, Server, RotateCcw, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";

const ICON_MAP: Record<string, React.ElementType> = {
    laptop: Laptop,
    phone: Smartphone,
    server: Server,
    router: Wifi,
    internet: Cloud,
};

interface Props {
    onTableUpdate: (update: NonNullable<AnimationStep['tableUpdate']>) => void;
    onResetAll: () => void;
    onResetSelection: () => void;
    arpCaches: Record<string, ArpEntry[]>;
}

export function NetworkTopology({ onTableUpdate, onResetAll, onResetSelection, arpCaches }: Props) {
    const [source, setSource] = useState<string | null>(null); // Id of the source will stored here
    const [dest, setDest] = useState<string | null>(null); // Id of the destination will stored here
    const [animating, setAnimating] = useState(false); // when the packet is being transferred
    const [done, setDone] = useState(false); // when the packet has been transferred
    const [stepIndex, setStepIndex] = useState(-1);
    const [steps, setSteps] = useState<AnimationStep[]>([]);
    const [packetPos, setPacketPos] = useState<{ x: number; y: number } | null>(null);
    const [packetInfo, setPacketInfo] = useState<{ type: 'data' | 'arp'; layers: string[] } | null>(null);
    const [zoneDescriptions, setZoneDescriptions] = useState<Record<string, string>>({});

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
    }, [source, dest, animating, done]);

    const handleSend = useCallback(() => {
        if (!source || !dest) return;
        const s = generateSteps(source, dest, arpCaches);
        setSteps(s);
        setStepIndex(0);
        setAnimating(true);
        setZoneDescriptions({});
    }, [source, dest, arpCaches]);

    const resetAnimationState = () => {
        setSource(null);
        setDest(null);
        setAnimating(false);
        setStepIndex(-1);
        setSteps([]);
        setPacketPos(null);
        setPacketInfo(null);
        setDone(false);
        setZoneDescriptions({});
    };

    const handleResetAll = () => {
        resetAnimationState();
        onResetAll();
    };

    const handleNewTransfer = () => {
        resetAnimationState();
        onResetSelection();
    };

    useEffect(() => {
        if (!animating || stepIndex < 0) return;

        if (stepIndex >= steps.length) {
            queueMicrotask(() => {
                setAnimating(false);
                setPacketPos(null);
                setPacketInfo(null);
                setDone(true);
            })
            return;
        }

        const step = steps[stepIndex];
        const fromNode = findNode(step.from);
        const toNode = findNode(step.to);


        // Update zone description
        queueMicrotask(() => {
            setZoneDescriptions(prev => ({ ...prev, [step.zone]: step.description }));
            setPacketPos({ x: fromNode.x, y: fromNode.y });
            setPacketInfo({ type: step.packetType, layers: step.layers });
        })

        const moveTimer = setTimeout(() => {
            if (step.from !== step.to) {
                setPacketPos({ x: toNode.x, y: toNode.y });
            }
        }, 250);

        const nextTimer = setTimeout(() => {
            if (step.tableUpdate) {
                onTableUpdate(step.tableUpdate);
            }
            setStepIndex(prev => prev + 1);
        }, step.duration);

        return () => {
            clearTimeout(moveTimer);
            clearTimeout(nextTimer);
        };
    }, [stepIndex, animating, steps, onTableUpdate]);


    const canSend = source && dest && !animating && !done;
    const currentZone = animating && stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex].zone : null;

    const zonePositions: Record<string, { left: string; top: string; width: string }> = {
        A: { left: '2%', top: '66%', width: '34%' },
        B: { left: '64%', top: '66%', width: '34%' },
        internet: { left: '33%', top: '35%', width: '34%' },
        server: { left: '30%', top: '92%', width: '40%' },
    };

    return (
        <div className="relative min-w-full min-h-[540px] flex justify-center overflow-x-auto border border-primary/30 bg-primary/5 p-2 rounded-lg">
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
                            className="bg-red-500! w-5! h-5! p-6!"
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
                        "animate-pulse": shouldPulse,
                    })}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    onClick={() => handleNodeClick(node.id)}
                >
                    <div className={cn("p-2.5 rounded-xl border-2 transition-all duration-300", {
                        "bg-primary/50 border-primary shadow shadow-primary": isSource,
                        "bg-primary/40 border-primary/30 shadow shadow-primary/80": isDest,
                        "border-border bg-muted-foreground/50": node.type === "internet",
                        "border-border hover:border-muted-foreground": node.type !== "internet" && node.type !== "router",
                    })}>
                        <Icon className={cn("size-7",)} />
                    </div>
                    <span className={cn(
                        "text-[10px] font-bold tracking-wider whitespace-nowrap text-muted'", {
                        "text-primary": isSource || isDest,
                    }
                    )}>
                        {node.label}
                    </span>
                    {selectable && (
                        <span className="text-[8px] text-muted-foreground">{node.ip}</span>
                    )}
                </div>
                )
            })}

            {/* Animated Packet */}
            {packetPos && packetInfo && (packetInfo.layers.length > 0 || packetInfo.type === 'arp') && (
                <div className="absolute -translate-x-1/2 z-20 pointer-events-none"
                    style={{
                        left: `${packetPos.x}%`,
                        top: `${packetPos.y - 8}%`,
                        transition: 'left 1.8s ease-in-out, top 1.8s ease-in-out',
                    }}
                >
                    {packetInfo.type === 'arp' ? (
                        <div className="bg-pink-400 text-white px-2.5 py-1 rounded-md text-[10px] font-black shadow-lg shadow-arp-color/30 border border-white/20">
                            ARP
                        </div>
                    ) : (
                        <div className="flex rounded-md overflow-hidden text-[10px] font-black shadow-lg border border-white/10">
                            {packetInfo.layers.includes('L2') && <span className="bg-blue-600 text-white px-1.5 py-1">L2</span>}
                            {packetInfo.layers.includes('L3') && <span className="bg-green-600 text-white px-1.5 py-1">L3</span>}
                            {packetInfo.layers.includes('L4') && <span className="bg-red-600 text-white px-1.5 py-1">L4</span>}
                            <span className="bg-yellow-600 text-black px-2 py-1">Data</span>
                        </div>
                    )}
                </div>
            )}

            {/* Per-zone step descriptions */}
            {(animating || done) && Object.entries(zonePositions).map(([zone, pos]) => {
                const desc = zoneDescriptions[zone];
                if (!desc) return null;
                const isActive = currentZone === zone;
                return (
                    <div
                        key={zone}
                        className={cn(
                            "absolute backdrop-blur border rounded-lg px-3 py-2 text-[11px] z-10 transition-opacity duration-300", {
                            " border-primary": isActive,
                            " border-muted-foreground opacity-80": !isActive,
                        }
                        )}
                        style={{ left: pos.left, top: pos.top, width: pos.width }}
                    >
                        <span className="text-foreground/90 font-semibold leading-tight block">{desc}</span>
                    </div>
                );
            })}

            {/* Controls */}
            <div className="absolute bottom-3 right-3 flex gap-2 z-10">
                {(source || done) && (
                    <Button variant="outline" size="sm" onClick={handleResetAll} className="text-xs h-8 gap-1.5">
                        <RotateCcw className="w-3 h-3" />
                        Reset All
                    </Button>
                )}
                {done && (
                    <Button variant="secondary" size="sm" onClick={handleNewTransfer} className="text-xs h-8 gap-1.5">
                        <RefreshCw className="w-3 h-3" />
                        New Transfer
                    </Button>
                )}
                {!done && (
                    <Button
                        size="sm"
                        disabled={!canSend}
                        onClick={handleSend}
                        className={cn('text-xs h-8', canSend && 'glow-primary')}
                    >
                        Send Request
                    </Button>
                )}
            </div>
        </div >
    );
}
