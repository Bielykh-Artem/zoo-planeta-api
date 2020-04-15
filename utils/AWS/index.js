const { S3 } = require("aws-sdk");
const { getContentType } = require("content-type-to-ext");
const uuid = require("uuid");

const config = {
  region: "us-east-2",
  accessKeyId: 'ec37da3ee3af0572bb',
  secretAccessKey: '20c202ed66d6b5313d60b4edadb2d0d0281b33b9435c41',
  Bucket: "zoo-planeta",
  dirName: 'content/images'
}

const s3 = new S3({
  region: config.region,
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
});

const parseImage = data => {
  const reg = /^data:image\/([\w+]+);base64,([\s\S]+)/;
  const match = data.match(reg);
  const baseType = {
    jpg: "jpg",
    png: "png",
    gif: "gif",
    svg: "svg",
    "svg+xml": "svg",
  };
  if (!match) {
    throw new Error("image base64 data error");
  }
  const found = Object.entries(baseType).find(([key, value]) => key === match[1]);
  const extName = found ? found[1] : match[1];
  return {
    mimeType: getContentType(extName),
    buffer: match[2],
    extName: `.${extName}`,
  };
};

const uploadImage = async imageBuffer => {
  try {
    const fileName = uuid.v1();
    const { mimeType, buffer, extName } = parseImage(imageBuffer);
    return new Promise((resolve, reject) => {
      s3.upload(
        {
          Key: `${fileName}${extName}`,
          Body: Buffer.from(buffer, "base64"),
          Bucket: config.Bucket,
          ACL: "public-read",
          ContentType: mimeType,
        },
        (err, data) => {
          if (err) {
            reject(err);
          }
          resolve(data.Location);
        },
      );
    });
  } catch (e) {
    return Promise.resolve(imageBuffer);
  }
};

const deleteImage = async fileName =>
  new Promise((resolve, reject) => {
    s3.deleteObject(
      {
        Bucket: config.Bucket,
        Key: fileName,
      },
      (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      },
    );
  });

module.exports = {
  parseImage,
  uploadImage,
  deleteImage
}
