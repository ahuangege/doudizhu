let now = Date.now();

setInterval(() => {
    now = Date.now();
}, 100)

export function nowMs() {
    return now;
}