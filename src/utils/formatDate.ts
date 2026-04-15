function formatDate(input: string): string {
    const monthNames: string[] = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const now: Date = new Date();
    const currentYear: number = now.getFullYear();

    // parse M/D/YYYY
    const [mStr, dStr, yStr] = input.split("/");
    const m: number = Number(mStr);
    const d: number = Number(dStr);
    const y: number = Number(yStr);

    const date: Date = new Date(y, m - 1, d);

    const today: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffTime: number = today.getTime() - target.getTime();
    const diffDays: number = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays >= 2 && diffDays <= 15) return `${diffDays} days ago`;

    const month: string = monthNames[date.getMonth()];
    const day: number = date.getDate();

    if (date.getFullYear() === currentYear) {
        return `${month} ${day}`;
    }

    return `${month} ${day} ${date.getFullYear()}`;
}

export { formatDate };