const cloudinary = require('cloudinary');
// multer-storage-cloudinary exports the storage constructor directly
const CloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'tourism_DEV',
//     allowed_formats:["png","jpg","jpeg","avif"], // supports promises as well
//     public_id: (req, file) => 'computed-filename-using-request',
//   },
// });

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
      folder: "Hotels",
      allowed_formats:["png","jpg","jpeg","avif"],
  },
});

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "tourism_DEV",
//     allowed_formats: ["png", "jpg", "jpeg"],
//     public_id: Date.now() + "-" + file.originalname,
//   },
// });

module.exports={
    cloudinary: cloudinary.v2,
    storage,
};