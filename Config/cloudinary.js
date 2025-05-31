import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

cloudinary.config({
  cloud_name: 'dkqcqrrbp',
  api_key: '418838712271323',
  api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
});

export default cloudinary;
