/** Any utility functions, extensions etc */
import {} from './vbExtend';


function arrToObj<T>(arr: T[]) {
    const obj: Record<number, T> = {};
    for (let i of Array.range(arr.length)) {
        obj[i] = arr[i];
    }
    return obj;
}

function pnt2(n: number): Pnt2 {
    return { x:n, y:n };
}

function unpackPoint(source: NumPair): Pnt2 {
    return { x:source[0], y:source[1] };
}
function assignPoint(target: Pnt2, source: Pnt2) {
    target.x = source.x, target.y = source.y;
}
function assignPair(target: Pnt2, source: NumPair) {
    target.x = source[0], target.y = source[1];
}

function distance2(a: Pnt2, b: Pnt2) {
    let dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy;
}
function distance(a: Pnt2, b: Pnt2) {
    let dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/** @param type If an MIME type is provided, return complete data url, otherwise only return base64 part. */
async function bufferToBase64(buf: BlobPart, type?: string) {
    // https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string
    // Use a FileReader to generate a base64 data URI
    const dataURL = await new Promise(
        (resolve: (value: string) => void) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(new Blob([buf], { type:type }));
        });
    /**
    * The result looks like
    * "data:application/octet-stream;base64,<your base64 data>",
    * so we split off the beginning:
    */
    if (type === undefined)
        return dataURL.split(",", 2)[1];
    else
        return dataURL;
}

export {
    arrToObj,
    pnt2,
    unpackPoint,
    assignPoint,
    assignPair,
    distance,
    distance2,
    bufferToBase64
};