# S3 CORS Configuration Guide

## Why CORS is Required

When your browser tries to load a PDF from S3 using pdf.js, it makes a cross-origin request. S3 buckets block these requests by default unless CORS is properly configured.

## How to Configure CORS on Your S3 Bucket

### Method 1: Using AWS Console (Recommended)

1. **Log in to AWS Console**
   - Go to https://console.aws.amazon.com/
   - Navigate to **S3** service

2. **Select Your Bucket**
   - Click on your bucket name (the one specified in `AWS_BUCKET_NAME`)

3. **Open Permissions Tab**
   - Click on the **Permissions** tab
   - Scroll down to **Cross-origin resource sharing (CORS)**

4. **Edit CORS Configuration**
   - Click **Edit** button
   - Paste the following CORS configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:5174"
        ],
        "ExposeHeaders": [
            "Content-Length",
            "Content-Type",
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

5. **For Production**
   - Replace `localhost` origins with your actual domain(s)
   - Example:
   ```json
   "AllowedOrigins": [
       "https://yourdomain.com",
       "https://www.yourdomain.com"
   ]
   ```

6. **Save Changes**
   - Click **Save changes**

### Method 2: Using AWS CLI

If you have AWS CLI installed, you can configure CORS using a JSON file:

1. **Create a CORS configuration file** (`cors-config.json`):

```json
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "HEAD"],
            "AllowedOrigins": [
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:5174"
            ],
            "ExposeHeaders": [
                "Content-Length",
                "Content-Type",
                "ETag"
            ],
            "MaxAgeSeconds": 3000
        }
    ]
}
```

2. **Apply the configuration**:

```bash
aws s3api put-bucket-cors --bucket YOUR_BUCKET_NAME --cors-configuration file://cors-config.json
```

### Method 3: Using AWS SDK (Programmatic)

You can also configure CORS programmatically. Create a script:

```javascript
import s3 from './config/s3.js';
import dotenv from 'dotenv';

dotenv.config();

const corsConfiguration = {
    CORSRules: [
        {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'HEAD'],
            AllowedOrigins: [
                'http://localhost:5173',
                'http://localhost:3000',
                'http://localhost:5174'
            ],
            ExposeHeaders: [
                'Content-Length',
                'Content-Type',
                'ETag'
            ],
            MaxAgeSeconds: 3000
        }
    ]
};

s3.putBucketCors({
    Bucket: process.env.AWS_BUCKET_NAME,
    CORSConfiguration: corsConfiguration
}, (err, data) => {
    if (err) {
        console.error('Error configuring CORS:', err);
    } else {
        console.log('CORS configured successfully:', data);
    }
});
```

## Verify CORS Configuration

After configuring CORS, verify it's working:

1. **Check in AWS Console**
   - Go to your bucket → Permissions → CORS
   - You should see your configuration

2. **Test in Browser**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try loading a PDF
   - Check if CORS errors are gone

3. **Using curl** (optional):

```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://YOUR_BUCKET_NAME.s3.REGION.amazonaws.com/YOUR_KEY
```

## Common Issues

### Issue: Still getting CORS errors
- **Solution**: Make sure your frontend origin matches exactly what's in CORS config
- Check browser console for the exact origin being used
- Ensure you've saved the CORS configuration in S3

### Issue: PDF loads but shows blank
- **Solution**: Check if `ResponseContentType: 'application/pdf'` is set in signed URL (already fixed in code)
- Verify the PDF file is valid

### Issue: "Access Denied" errors
- **Solution**: Check your IAM user/role has `s3:GetObject` permission
- Verify bucket policy allows public read (or your IAM user)

## Security Notes

- **For Production**: Only allow specific origins, not `*`
- **For Development**: You can use `*` for AllowedOrigins, but it's better to list specific localhost ports
- **Bucket Policy**: Consider adding a bucket policy that only allows signed URLs

## Additional Resources

- [AWS S3 CORS Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)
- [Troubleshooting CORS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors-troubleshooting.html)
