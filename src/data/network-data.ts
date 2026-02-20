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
