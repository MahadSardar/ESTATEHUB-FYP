import cloudinary from "../config/cloudinary.js";

// uploads one multer file from memory and returns { url, publicId, type }
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "estatehub", resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          type: result.resource_type === "video" ? "video" : "image",
        });
      }
    );
    stream.end(file.buffer);
  });
};

export default uploadToCloudinary;