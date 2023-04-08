export default function getBaseUrlFromUrl(fullUrl: string) {
    let url = new URL(fullUrl);
    return url.origin;
}