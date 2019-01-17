require('dotenv').config();
const aws = require('aws-sdk');
const bodyParser = require('body-parser');
const proxy = require('http-proxy-middleware')
const express = require('express'),
  app = express(),
  port = 3010;

  
app.use(bodyParser.json());
app.use( (req, res, next) => {
  console.log('Server hit')
  next();
})
// app.use('/api', proxy({ target: `http://localhost:${port}`}))
  
const { S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;

app.get('/api/test', (req, res) => {
  console.log('yay')
  res.status(200).send('you hit the endpoint')
})

app.get('/api/signs3', (req, res) => {
    console.log('made it')
  aws.config = {
    region: AWS_REGION,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  };

  const s3 = new aws.S3();
  const fileName = req.query['file-name'];
  const fileType = req.query['file-type'];
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read',
  };

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    console.log('s3Params:', s3Params)
    console.log('data:', data)
    if (err) {
      console.log(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`,
    };

    return res.send(returnData);
  });
});

app.listen(port, () => console.log(`Hard to port ${port}`));