
export function objectIsEmpty(obj: Object): boolean {
    for (const _ in obj) {
        return false
    }
    return true
}

// optimized than Object.keys
export function objectLength(obj: Object): number {
    let i = 0
    for (const _ in obj) {
        i++
    }
    return i
}