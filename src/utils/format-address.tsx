export default function formatAddress(address: string): string {
    if (!address) return "";
    const prefix = address.slice(0, 6);
    const suffix = address.slice(-4);
    return `${prefix}...${suffix}`;
}