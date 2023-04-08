import S3StaticAssetUploader from "./S3StaticAssetUploader";

xdescribe("S3StaticAssetUploader", () => {

  it("uploads a file", async () => {
    const uploader = new S3StaticAssetUploader();
    const newUrl = await uploader.uploadFromUrl("https://www.freecodecamp.org/news/content/images/size/w2000/2022/09/chain-3481377_1280.jpg", "article/123.jpg")

    expect(newUrl).toBe("https://fullstack-news-article-assets-ef8b034.s3.eu-central-1.amazonaws.com/article/123.jpg")
  })
})
