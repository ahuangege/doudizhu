let lastUsage = process.cpuUsage();
let percent: string = "0.0";

setInterval(() => {
    let diff = process.cpuUsage(lastUsage);
    lastUsage = process.cpuUsage();
    percent = ((diff.user + diff.system) / (5000 * 1000) * 100).toFixed(1);
}, 5000);

export function getCpuUsage() {
    return percent;
}