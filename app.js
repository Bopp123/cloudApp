const express = require('express');
const morgan = require('morgan');
const app = express();
app.set('port', process.env.PORT || 3000);
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const fs = require('fs-extra');


app.use(morgan('dev')); 
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request

var handlebars = require("express-handlebars").create({defaultLayout:'main',
helpers: {
    section: function (name, options) {
        if(!this._sections) this._sections = {};
        this._sections[name] = options.fn(this);
        return null;
    }
}});
app.engine('handlebars', handlebars.engine);
app.set('view engine', "handlebars");
app.set('view cache', true);
/**
 * End of app configuration
 */


const images = require('./images.js');


// routing
app.get('/', (req, res) => {
	res.render('images',{images: images.getImages()});
});
var formidable = require('formidable');

// app.get('/data/image', function (req,res) {
// 	var now = new Date();
// 	res.render('data/image', {
// 		year: now.getFullYear(),
// 		month: now.getMonth()
// 	});
// });

var aws = require('./aws.js');
app.post('/data/image', (req, res) => {
	var form = new formidable.IncomingForm();
	form.parse( req,function (err,fields,files) {
		var title = fields.title;
		var tempPath = files.image.path;
		console.log(title,tempPath);
		aws.uploadS3('cloudappdemo', tempPath,title, function () {
        	 console.log('file is in the cloud');
        	 res.sendFile(__dirname + "/redirect.html");
        	 var new_location = __dirname + '/uploads/';

        	 fs.copy(tempPath, new_location + files.image.name, function(err) {  
            if (err) {
                console.error(err);
            } else {
                console.log("success!")
               
                
            }
        	});
        });
		
	});
	
	// form.on('end', function(fields, files, title, res) {
		
 //        /* Temporary location of our uploaded file */
 //        var temp_path = this.openedFiles[0].path;
 //        console.log(temp_path);
 //        /* The file name of the uploaded file */
 //        var file_name = this.openedFiles[0].name;
 //        /* Location where we want to copy the uploaded file */
 //        
        

 //        // aws.uploadS3('cloudappdemo', temp_path);

 

	});

	



app.delete('/data/:image_hash', (req, res) => {
	var img = images.removeImage(req.params.image_hash);
	console.log(img.imageToDelete[0].awskey);
	aws.deleteFileS3("cloudappdemo",img.imageToDelete[0].awskey);
	res.render('images',{images: img});
	});


app.use(express.static(__dirname + "/uploads"));



//make our app listen to given port
app.listen(app.get('port'), () => {
	console.log(`app started on http://localhost:${app.get("port")}; press cmd + c to terminate`)
});