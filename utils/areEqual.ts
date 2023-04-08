export default function areEqual(array1: any[], array2: any[]): boolean {
  if (array1.length === array2.length) {
    return array1.every(element => {
      if (array2.includes(element)) {
        return true;
      }

      return false;
    });
  }

  return false;
}
