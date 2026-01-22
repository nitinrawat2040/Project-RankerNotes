import s3 from '../config/s3.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script to configure CORS on S3 bucket
 * Run with: node backend/scripts/setupS3CORS.js
 */

const corsConfiguration = {
    CORSRules: [
        {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'HEAD'],
            AllowedOrigins: [
                'http://localhost:5173',
                'http://localhost:3000',
                'http://localhost:5174',
                'http://127.0.0.1:5173',
                'http://127.0.0.1:3000'
            ],
            ExposeHeaders: [
                'Content-Length',
                'Content-Type',
                'ETag',
                'x-amz-request-id'
            ],
            MaxAgeSeconds: 3000
        }
    ]
};

const bucketName = process.env.AWS_BUCKET_NAME;

if (!bucketName) {
    console.error('❌ Error: AWS_BUCKET_NAME not found in environment variables');
    console.error('💡 Make sure your .env file has AWS_BUCKET_NAME set');
    process.exit(1);
}

console.log(`📦 Configuring CORS for bucket: ${bucketName}`);
console.log('📋 CORS Configuration:');
console.log(JSON.stringify(corsConfiguration, null, 2));

s3.putBucketCors({
    Bucket: bucketName,
    CORSConfiguration: corsConfiguration
}, (err, data) => {
    if (err) {
        console.error('❌ Error configuring CORS:', err.message);
        console.error('\n💡 Troubleshooting:');
        console.error('1. Check that AWS credentials are correct in .env');
        console.error('2. Verify the bucket name is correct');
        console.error('3. Ensure your IAM user has s3:PutBucketCors permission');
        process.exit(1);
    } else {
        console.log('✅ CORS configured successfully!');
        console.log('\n📝 Next steps:');
        console.log('1. Try loading a PDF in your browser');
        console.log('2. Check browser console for any remaining errors');
        console.log('3. If issues persist, verify the frontend origin matches the AllowedOrigins');
    }
});
