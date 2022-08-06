# ShrubHub

ShrubHub allows people who want their lawn mowed to connect with people that mow lawns through a website. Please note that ShrubHub is a work-in-progress name, and the website is not currently operational.

ShrubHub uses Vue and Vuetify on the frontend, and MongoDB, Mongoose, and AWS on the backend. There are a few dependencies needed to run this website:

- "aws": "^0.0.3-2",
- "dotenv": "^16.0.1",
- "express": "^4.18.1",
- "express-session": "^1.17.3",
- "mongoose": "^6.4.4",
- "passport": "^0.6.0",
- "passport-local": "^1.0.0"

Along with a few Enviornment Variables that can be recreated to your needs:

- MURL = "Insert your mongoDB server link here."

- AWS_PHOTO_URL = "Insert your basic AWS photo url here. This url will have the bucket name and a picture name appended to the end to allow for adding image urls to the html file."
- PHOTO_BUCKET_NAME = "Insert your AWS bucket name here."
- BUCKET_REGION = "Insert your bucket region here."
- IDENTITY_POOL_ID = "Insert your bucket region pool ID here."

Please note that we followed the instructions on the following webpage for creating the S3 AWS bucket: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photo-album.html
