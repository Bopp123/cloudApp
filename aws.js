 var AWS = require('aws-sdk');
 var fs = require('fs');
 var path = require('path');
 const images = require('./images.js');

 AWS.config.loadFromPath('./config.json');

 s3 = new AWS.S3();

 var uploadS3 = (bucketName, file, title, callback) =>{
 	console.log('halooooo')

 	var fileStream = fs.createReadStream(file);
 	var uploadParams = {};
 	uploadParams.Body = fileStream;
 	uploadParams.Key = path.basename(file);
 	uploadParams.Bucket = bucketName;
 	uploadParams.ContentType = 'image/jpeg';
 	var title2 = title;
 	s3.upload (uploadParams, function ( err, data) {
  		if (err) {
  			console.log('erooooooor')
    		console.log("Error", err);
  		} if (data) {
  			var url = data.Location;
    		console.log("Upload Success", url);
    		console.log(title2, data.Location);
    		images.addImage(title2,url,uploadParams.Key);
    		callback();
    		
  		}
	});
}; 

var deleteFileS3 = (bucketName, key) => {
	var params = {};
	params.Bucket = bucketName;
	params.Key = key;
	s3.deleteObject(params, function (err,data) {
		if (err) {
			console.log(err);
		}else {
			console.log('the file has been deleted');
		}
	});
}

var getAllFromS3 = (bucketName, key) =>{

}

module.exports = {
	uploadS3,
	deleteFileS3
};