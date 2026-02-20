/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ArpEntry, RoutingEntry } from "@/types/network";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";

interface Props {
    arpCaches: Record<string, ArpEntry[]>;
    routingTables: Record<string, RoutingEntry[]>;
}

export function NetworkTable({ arpCaches, routingTables }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            {/* ARP Caches */}
            {Object.entries(arpCaches).filter(([_, entries]) => entries.length > 0).map(([nodeId, entries]) => (
                <div key={`arp-${nodeId}`} className="bg-primary-foreground/30 border-primary/30 border p-4 rounded-lg">
                    <hgroup>
                        <h2>{nodeId} — ARP Cache</h2>
                    </hgroup>

                    <div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-[10px] h-8">IP Address</TableHead>
                                    <TableHead className="text-[10px] h-8">MAC Address</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {entries.map((entry, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="text-xs py-1.5 font-mono">{entry.ip}</TableCell>
                                        <TableCell className="text-xs py-1.5 font-mono">{entry.mac}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            ))}

            {/* Routing Tables */}
            {Object.entries(routingTables).filter(([_nodeId, entries]) => entries.length > 0).map(([nodeId, entries]) => (
                <div key={`rt-${nodeId}`} className="bg-muted-foreground/50 p-4 rounded-lg">
                    <hgroup>
                        <h2>{nodeId} — Routing Table</h2>
                    </hgroup>

                    <div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-[10px] h-8">Destination</TableHead>
                                    <TableHead className="text-[10px] h-8">Next Hop</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {entries.map((entry, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="text-xs py-1.5 font-mono">{entry.destination}</TableCell>
                                        <TableCell className="text-xs py-1.5 font-mono">{entry.nextHop}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            ))}
        </div>
    );
}
