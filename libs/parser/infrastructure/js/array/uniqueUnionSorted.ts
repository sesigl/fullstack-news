export default function uniqueUnionSorted(arr: string[]) {
    var counter = new Map();
    for(var i=0; i<arr.length; i++) {
        counter.set(arr[i], (counter.get(arr[i]) || 0) + 1);
    }
    // Spreading the Map will produce an array of pairs
    // only keep the values, not the counts
    return Array.from(counter.entries()).sort(function (a, b) {
        return b[1] - a[1]; // sort by count
    }).map(a => a[0]); // Map keys retain original type, so they remain numeric
}