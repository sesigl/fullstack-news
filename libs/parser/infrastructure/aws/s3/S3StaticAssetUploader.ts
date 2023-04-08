import StaticAssetUploader from "../../../domain/service/StaticAssetUploader";
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";

export default class S3StaticAssetUploader implements StaticAssetUploader {

  async uploadFromUrl(url: string, targetPath: string): Promise<string> {

    const res = await fetch(url)

    if (res.body) {
      await this.sendToS3(res, targetPath);
      return `https://${process.env.AWS_ARTICLE_ASSET_BUCKET}.s3.eu-central-1.amazonaws.com/${targetPath}`
    } else {
      throw new Error("Could not fetch image from url: " + url)
    }

  }

  private async sendToS3(res: Response, targetPath: string) {
    const s3Client = this.createS3Client();

    const buffer = await this.fetchResultToBuffer(res);

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_ARTICLE_ASSET_BUCKET,
      Key: targetPath,
      Body: buffer,
      ACL: "public-read"
    })

    await s3Client.send(command);
  }

  private createS3Client() {
    if (!process.env.AWS_ACCESS_KEY_CUSTOM || !process.env.AWS_SECRET_KEY_CUSTOM || !process.env.AWS_ARTICLE_ASSET_BUCKET) {
      throw new Error('No AWS credentials available')
    }

    return new S3Client({
      region: process.env.REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_CUSTOM,
        secretAccessKey: process.env.AWS_SECRET_KEY_CUSTOM,
      },
    });
  }

  private async fetchResultToBuffer(res: Response) {
    let arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
