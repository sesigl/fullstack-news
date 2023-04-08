 export default function contains(arr: any[], toBeContainedArray: any[]): boolean {
    return toBeContainedArray.every(element => {
      if (arr.includes(element)) {
        return true;
      }

      return false;
    });

  return false;
}
