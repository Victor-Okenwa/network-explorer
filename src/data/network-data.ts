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
        steps.push({ description: `${prefix}${src.label} checks: Is ${dst.ip} on same subnet? Yes! (same /24)`, from: sourceId, to: sourceId, packetType: 'data', layers: [], duration: 2000, zone });

        if (isArpKnown(arpCache, src.label, dst.ip)) {
            steps.push({ description: `${prefix}ARP cache hit — ${dst.ip} → ${dst.mac} already known`, from: sourceId, to: sourceId, packetType: 'data', layers: [], duration: 2000, zone });
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

    const gateway = findNode(path[1]);

    // ARP for gateway
    if (gateway.type === 'router') {
        const zone = stepZone(sourceId, gateway.id);
        steps.push({ description: `${prefix}${src.label} checks: Is ${dst.ip} on same subnet? No → use default gateway ${gateway.ip}`, from: sourceId, to: sourceId, packetType: 'data', layers: [], duration: 2000, zone });

        if (isArpKnown(arpCache, src.label, gateway.ip)) {
            steps.push({ description: `${prefix}ARP cache hit — ${gateway.ip} → ${gateway.mac} already known`, from: sourceId, to: sourceId, packetType: 'data', layers: [], duration: 2000, zone });
        } else {
            steps.push({ description: `${prefix}${src.label} broadcasts ARP: "Who has ${gateway.ip}?"`, from: sourceId, to: gateway.id, packetType: 'arp', layers: ['ARP'], duration: 2000, zone });
            steps.push({ description: `${prefix}${gateway.label} replies: "${gateway.ip} is at ${gateway.mac}"`, from: gateway.id, to: sourceId, packetType: 'arp', layers: ['ARP'], duration: 2000, zone, tableUpdate: { nodeId: sourceId, tableType: 'arp', entry: { ip: gateway.ip, mac: gateway.mac } } });
        }
    }


    // Encapsulation
    const encapZone = stepZone(sourceId, gateway.id);
    steps.push({ description: `${prefix}${src.label} encapsulates: L4 + L3 (${src.ip}→${dst.ip}) + L2 (→${gateway.mac})`, from: sourceId, to: sourceId, packetType: 'data', layers: ['L2', 'L3', 'L4'], duration: 2500, zone: encapZone });

    // Source to gateway
    steps.push({ description: `${prefix}Frame sent: ${src.label} → ${gateway.label}`, from: sourceId, to: gateway.id, packetType: 'data', layers: ['L2', 'L3', 'L4'], duration: 2500, zone: encapZone });

    // Gateway processing
    steps.push({ description: `${prefix}${gateway.label}: Strip L2 header, check routing table for ${dst.ip}`, from: gateway.id, to: gateway.id, packetType: 'data', layers: ['L3', 'L4'], duration: 2000, zone: encapZone, tableUpdate: { nodeId: gateway.id, tableType: 'routing', entry: { destination: dst.ip, nextHop: 'Internet', iface: 'WAN' } } });

    // Gateway to internet
    steps.push({ description: `${prefix}${gateway.label} adds new L2 header, forwards to Internet`, from: gateway.id, to: 'INET', packetType: 'data', layers: ['L2', 'L3', 'L4'], duration: 2500, zone: 'internet' });


    // Find destination router
    const lastHopIndex = path.length - 2;
    const lastHop = findNode(path[lastHopIndex]);

    if (lastHop.type === 'router') {
        const dstZone = stepZone(lastHop.id, destId);
        // Internet to dest router
        steps.push({ description: `${prefix}Internet routes packet → ${lastHop.label}`, from: 'INET', to: lastHop.id, packetType: 'data', layers: ['L2', 'L3', 'L4'], duration: 2500, zone: 'internet' });

        // Dest router processing
        steps.push({ description: `${prefix}${lastHop.label}: Strip L2, check routing table → ${dst.label} is local`, from: lastHop.id, to: lastHop.id, packetType: 'data', layers: ['L3', 'L4'], duration: 2000, zone: dstZone, tableUpdate: { nodeId: lastHop.id, tableType: 'routing', entry: { destination: dst.ip, nextHop: dst.ip, iface: 'LAN' } } });

        // ARP for destination
        if (isArpKnown(arpCache, lastHop.label, dst.ip)) {
            steps.push({ description: `${prefix}ARP cache hit — ${dst.ip} → ${dst.mac} already known`, from: lastHop.id, to: lastHop.id, packetType: 'data', layers: [], duration: 2000, zone: dstZone });
        } else {
            steps.push({ description: `${prefix}${lastHop.label} sends ARP: "Who has ${dst.ip}?"`, from: lastHop.id, to: destId, packetType: 'arp', layers: ['ARP'], duration: 2500, zone: dstZone });
            steps.push({ description: `${prefix}${dst.label} replies: MAC = ${dst.mac}`, from: destId, to: lastHop.id, packetType: 'arp', layers: ['ARP'], duration: 2500, zone: dstZone, tableUpdate: { nodeId: lastHop.id, tableType: 'arp', entry: { ip: dst.ip, mac: dst.mac } } });
        }

        // Forward to destination
        steps.push({ description: `${prefix}${lastHop.label} adds L2 (→${dst.mac}), forwards to ${dst.label}`, from: lastHop.id, to: destId, packetType: 'data', layers: ['L2', 'L3', 'L4'], duration: 2500, zone: dstZone });
    } else {
        // Direct to server (no router for network C)
        steps.push({ description: `${prefix}Internet delivers packet to ${dst.label}`, from: 'INET', to: destId, packetType: 'data', layers: ['L2', 'L3', 'L4'], duration: 2500, zone: 'server' });
    }

    // Delivered
    const finalZone = getZone(destId);
    steps.push({ description: `${prefix}✓ ${dst.label} strips all headers (L2→L3→L4). Data received successfully!`, from: destId, to: destId, packetType: 'data', layers: [], duration: 500, zone: finalZone });

    return steps;
}


export function generateSteps(sourceId: string, destId: string, arpCache: Record<string, ArpEntry[]> = {}): AnimationStep[] {
    // Forward trip
    const forwardSteps = generateOneWay(sourceId, destId, arpCache, false);

    // Build cache including entries from forward trip
    const updatedCache: Record<string, ArpEntry[]> = {};

    for (const [k, v] of Object.entries(arpCache)) {
        updatedCache[k] = [...v];
    }

    for (const step of forwardSteps) {
        if (step.tableUpdate && step.tableUpdate.tableType === 'arp') {
            const label = NODES.find(node => node.id === step.tableUpdate!.nodeId)?.label ?? step.tableUpdate.nodeId;
            if (!updatedCache[label]) updatedCache[label] = [];
            if (!updatedCache[label].some(entry => entry.ip === step.tableUpdate!.entry.ip)) {
                updatedCache[label].push({ ip: step.tableUpdate!.entry.ip, mac: step.tableUpdate!.entry.mac });
            }
        }
    }


    // Response trip (reverse)
    const responseSteps = generateOneWay(destId, sourceId, updatedCache, true);

    return [...forwardSteps, ...responseSteps];
}
