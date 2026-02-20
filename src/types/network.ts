export interface NetworkNode {
    id: string;
    label: string;
    type: 'laptop' | 'phone' | 'server' | 'router' | 'internet';
    ip: string;
    mac: string;
    network: string;
    x: number;
    y: number;
}

export interface Connection {
    from: string;
    to: string;
}

export interface AnimationStep {
    description: string;
    from: string;
    to: string;
    packetType: 'data' | 'arp';
    layers: string[];
    duration: number;
    zone: 'A' | 'B' | 'internet' | 'server';
    tableUpdate?: {
        nodeId: string;
        tableType: 'arp' | 'routing';
        entry: Record<string, string>;
    };
}

export interface ArpEntry {
    ip: string;
    mac: string;
}

export interface RoutingEntry {
    destination: string;
    nextHop: string;
    iface: string;
}
