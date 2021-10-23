
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


export function optimizedSplit(name: string, c: string): string[] {
    const arr: string[] = []

    let start = 0
    let i = 0
    while (name[i] == c) {
        i++
    }
    while (i < name.length) {
        if (name[i] == c) {
            arr.push(name.substring(start, i))
            while (name[i] == c) {
                i++
            }
            start = i
        } else {
            i++
        }
    }
    if (start != name.length) {
        arr.push(name.substring(start, name.length))
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