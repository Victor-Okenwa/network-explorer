import type { NetworkNode, Connection, AnimationStep, ArpEntry } from '@/types/network';

export const NODES: NetworkNode[] = [
    { id: 'A1', label: 'Host A1', type: 'laptop', ip: '11.9.18.10', mac: 'AA:BB:CC:01:01:10', network: 'A', x: 10, y: 22 },
    { id: 'A2', label: 'Host A2', type: 'laptop', ip: '11.9.18.11', mac: 'AA:BB:CC:01:01:11', network: 'A', x: 24, y: 22 },
    { id: 'RA', label: 'Router A', type: 'router', ip: '11.9.18.1', mac: 'AA:BB:CC:01:01:01', network: 'A', x: 17, y: 48 },
    { id: 'INET', label: 'Internet', type: 'internet', ip: '-', mac: '-', network: '-', x: 50, y: 50 },
    { id: 'RB', label: 'Router B', type: 'router', ip: '15.17.19.1', mac: 'DD:EE:FF:02:02:01', network: 'B', x: 83, y: 48 },
    { id: 'B1', label: 'Host B1', type: 'laptop', ip: '15.17.19.10', mac: 'DD:EE:FF:02:02:10', network: 'B', x: 76, y: 22 },
    { id: 'B2', label: 'Host B2', type: 'phone', ip: '15.17.19.11', mac: 'DD:EE:FF:02:02:11', network: 'B', x: 90, y: 22 },
    { id: 'C1', label: 'Server C1', type: 'server', ip: '20.0.0.10', mac: 'CC:CC:CC:03:03:10', network: 'C', x: 50, y: 82 },
];

export const CONNECTIONS: Connection[] = [
    { from: 'A1', to: 'RA' },
    { from: 'A2', to: 'RA' },
    { from: 'RA', to: 'INET' },
    { from: 'B1', to: 'RB' },
    { from: 'B2', to: 'RB' },
    { from: 'RB', to: 'INET' },
    { from: 'C1', to: 'INET' },
];

export function findNode(id: string): NetworkNode {
    return NODES.find(n => n.id === id)!;
}

function getZone(nodeId: string): 'A' | 'B' | 'internet' | 'server' {
    const node = findNode(nodeId);
    if (node.network === 'A') return 'A';
    if (node.network === 'B') return 'B';
    if (node.network === 'C') return 'server';
    return 'internet';
}

function stepZone(fromId: string, toId: string): 'A' | 'B' | 'internet' | 'server' {
    const zFrom = getZone(fromId);
    const zTo = getZone(toId);

    if (zFrom === zTo) return zFrom;
    if (zFrom === 'internet' || zTo === 'internet') {
        // prefer the non-internet zone
        return zFrom === 'internet' ? zTo : zFrom;
    }
    return zFrom;
}


export function getPath(fromId: string, toId: string): string[] {
    const src = findNode(fromId);
    const dst = findNode(toId);

    // Same network
    if (src.network === dst.network) {
        return [fromId, `R${src.network}`, toId];
    }

    const path: string[] = [fromId];
    path.push(`R${src.network}`);
    path.push("INET");
    if (dst.network !== "C") {
        path.push(`R${dst.network}`);
    }
    path.push(toId);
    return path;
}

function isArpKnown(arpCache: Record<string, ArpEntry[]>, nodeLabel: string, targetIp: string): boolean {
    const entries = arpCache[nodeLabel] ?? [];
    return entries.some(e => e.ip === targetIp);
}

function generateOneWay(
    sourceId: string,
    destId: string,
    arpCache: Record<string, ArpEntry[]>,
    isResponse: boolean,
): AnimationStep[] {
    const path = getPath(sourceId, destId);
    const src = findNode(sourceId);
    const dst = findNode(destId);

    const steps: AnimationStep[] = [];
    const sameNetwork = src.network === dst.network && src.network !== 'C';
    const prefix = isResponse ? '↩ Response: ' : '';

    if (sameNetwork) {
        const zone = stepZone(sourceId, destId);
        steps.push({ description: `${prefix}${src.label} checks: Is ${dst.ip} on same subnet? Yes! (same /24)`, from: sourceId, to: sourceId, packetType: 'data', layers: [], duration: 3000, zone });

        if (isArpKnown(arpCache, src.label, dst.ip)) {
            steps.push({ description: `${prefix}ARP cache hit — ${dst.ip} → ${dst.mac} already known`, from: sourceId, to: sourceId, packetType: 'data', layers: [], duration: 3000, zone });
        } else {
            steps.push({ description: `${prefix}${src.label} broadcasts ARP Request: "Who has ${dst.ip}?"`, from: sourceId, to: destId, packetType: 'arp', layers: ['ARP'], duration: 2000, zone });
            steps.push({ description: `${prefix}${dst.label} replies: "${dst.ip} is at ${dst.mac}"`, from: destId, to: sourceId, packetType: 'arp', layers: ['ARP'], duration: 2000, zone, tableUpdate: { nodeId: sourceId, tableType: 'arp', entry: { ip: dst.ip, mac: dst.mac } } });
        }

        steps.push({ description: `${prefix}${src.label} encapsulates: L4 (Transport) + L3 (${src.ip}→${dst.ip}) + L2 (→${dst.mac})`, from: sourceId, to: sourceId, packetType: 'data', layers: ['L2', 'L3', 'L4'], duration: 4000, zone });
        steps.push({ description: `${prefix}Frame sent: ${src.label} → Switch (${findNode(path[1]).label})`, from: path[0], to: path[1], packetType: 'data', layers: ['L2', 'L3', 'L4'], duration: 2500, zone });
        steps.push({ description: `${prefix}Switch forwards frame to ${dst.label}`, from: path[1], to: path[2], packetType: 'data', layers: ['L2', 'L3', 'L4'], duration: 2500, zone });
        steps.push({ description: `${prefix}✓ ${dst.label} strips L2→L3→L4 headers. Data received!`, from: destId, to: destId, packetType: 'data', layers: [], duration: 3500, zone });
        return steps;
    }
}


export function generateSteps(sourceId: string, destId: string, arpCache: Record<string, ArpEntry[]> = {}): AnimationStep[] {
    // Forward trip
    const forwardSteps = generateOneWay(sourceId, destId, arpCache, false);
}
