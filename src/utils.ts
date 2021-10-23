
export function objectIsEmpty(obj: Object): boolean {
    for (const _ in obj) {
        return false
    }
    return true
}

export function objectLength(obj: Object): number {
    let i = 0
    for (const _ in obj) {
        i++
    }
    return i
}