const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')

// Vérifier si les variables S3 sont configurées
const isS3Configured = process.env.ID && process.env.SECRET && process.env.BUCKET_NAME;

let s3;
if (isS3Configured) {
    s3 = new AWS.S3({
        accessKeyId: process.env.ID,
        secretAccessKey: process.env.SECRET
    });
}

const uploadToS3 = async (file) => {
    try {
        if (!isS3Configured) {
            throw new Error('S3 non configuré - variables manquantes');
        }

        const fileExtension = file.originalname.split('.').pop()
        const key = `${uuidv4()}.${fileExtension}`

        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: key,
            Body: file.buffer
        };

        const uploadData = await s3.upload(params).promise();
        console.log(`File uploaded successfully. ${uploadData.Location}`)
        return uploadData.Location;

    } catch (error) {
        console.error('Error uploading to S3:', error)
        throw new Error('Failed to upload file to S3')
    }
};

module.exports = { uploadToS3 }