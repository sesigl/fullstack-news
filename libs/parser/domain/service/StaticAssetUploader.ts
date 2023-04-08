export default interface StaticAssetUploader {
  uploadFromUrl(url: string, targetPath: string): Promise<string>;
}
