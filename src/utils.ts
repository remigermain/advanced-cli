
export function objectIsEmpty(obj: object): boolean {
    for (const _ in obj) {
        return false
    }
    return true
}

// optimized than Object.keys
export function objectLength(obj: object): number {
    let i = 0
    /*eslint  @typescript-eslint/no-unused-vars: "off" */
    for (const _ in obj) {
        i++
    }
    return i
}


export function optimizedSplit(str: string, pattern: string): string[] {
    const arr: string[] = []

    let start = -pattern.length
    let i = 0
    if (!str) {
        return arr
    }
    while (i < str.length) {
        if (str[i] == pattern) {
            arr.push(str.substring(start + pattern.length, i))
            start = i
            i += pattern.length
        } else if (!pattern) {
            arr.push(str[i++])
        } else {
            i++
        }
    }
    if (pattern) {
        arr.push(str.substring(start + pattern.length, str.length))
    }
    return arr
}

export function contains(str: string, c: string): boolean {
    for (let i = 0; i < str.length; i++) {
        if (str[i] === c)
            return true
    }
    return false
}