import { v2 as cloudinary } from "cloudinary";
import { ENV } from "./env";

if (!ENV.CLOUDINARY_CLOUD_NAME || !ENV.CLOUDINARY_API_KEY || !ENV.CLOUDINARY_API_SECRET) {
  throw new Error('Missing required Cloudinary environment variables');
}

cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
});
export default cloudinary;