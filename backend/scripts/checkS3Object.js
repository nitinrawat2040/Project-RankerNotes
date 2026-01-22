import s3 from '../config/s3.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Unit from '../models/Unit.js';

dotenv.config();

/**
 * Diagnostic script to check if S3 objects exist for units
 * Run with: node backend/scripts/checkS3Object.js [unitId]
 * Or without unitId to check all units
 */

const checkS3Object = async (unitId = null) => {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI || 'mongodb+srv://rawatdivya0129_db_user:4zZ94EkZ2Wdj3ehR@cluster0.gq8x17t.mongodb.net/?appName=Cluster0'
        );
        console.log('✅ Connected to MongoDB\n');

        const bucketName = process.env.AWS_BUCKET_NAME;
        if (!bucketName) {
            console.error('❌ Error: AWS_BUCKET_NAME not found in environment variables');
            process.exit(1);
        }

        console.log(`📦 Checking S3 bucket: ${bucketName}\n`);

        let units;
        if (unitId) {
            units = [await Unit.findById(unitId)];
            if (!units[0]) {
                console.error(`❌ Unit with ID ${unitId} not found`);
                process.exit(1);
            }
        } else {
            units = await Unit.find({ s3Key: { $exists: true, $ne: null } });
        }

        if (units.length === 0) {
            console.log('⚠️  No units with s3Key found');
            process.exit(0);
        }

        console.log(`Found ${units.length} unit(s) to check\n`);
        console.log('='.repeat(80));

        let foundCount = 0;
        let missingCount = 0;

        for (const unit of units) {
            const s3Key = unit.s3Key;
            console.log(`\n📄 Unit: ${unit.name} (ID: ${unit._id})`);
            console.log(`   S3 Key: ${s3Key}`);

            try {
                // Check if object exists
                const headResult = await s3.headObject({
                    Bucket: bucketName,
                    Key: s3Key
                }).promise();

                console.log(`   ✅ Object EXISTS in S3`);
                console.log(`   📊 Size: ${(headResult.ContentLength / 1024).toFixed(2)} KB`);
                console.log(`   📅 Last Modified: ${headResult.LastModified}`);
                console.log(`   🏷️  Content Type: ${headResult.ContentType || 'Not set'}`);

                // Test signed URL generation
                try {
                    const signedUrl = s3.getSignedUrl('getObject', {
                        Bucket: bucketName,
                        Key: s3Key,
                        Expires: 60
                    });
                    console.log(`   🔗 Signed URL generated successfully`);
                    foundCount++;
                } catch (urlError) {
                    console.log(`   ⚠️  Signed URL generation failed: ${urlError.message}`);
                }

            } catch (error) {
                if (error.code === 'NotFound' || error.statusCode === 404) {
                    console.log(`   ❌ Object NOT FOUND in S3`);
                    console.log(`   💡 The file needs to be uploaded to S3 at key: ${s3Key}`);
                    missingCount++;
                } else if (error.code === 'Forbidden' || error.statusCode === 403) {
                    console.log(`   ⚠️  Access DENIED - Check IAM permissions`);
                    console.log(`   Error: ${error.message}`);
                } else {
                    console.log(`   ⚠️  Error checking object: ${error.message}`);
                    console.log(`   Code: ${error.code || 'Unknown'}`);
                }
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Found: ${foundCount}`);
        console.log(`   ❌ Missing: ${missingCount}`);
        console.log(`   📦 Total: ${units.length}`);

        if (missingCount > 0) {
            console.log(`\n💡 To fix missing files:`);
            console.log(`   1. Upload PDFs to S3 using the addSubject.js script`);
            console.log(`   2. Or manually upload to S3 with the correct key`);
            console.log(`   3. Verify the s3Key in database matches the S3 object key`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

// Get unitId from command line args if provided
const unitId = process.argv[2] || null;
checkS3Object(unitId);
