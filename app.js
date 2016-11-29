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

app.get('/data/image', function (req,res) {
	var now = new Date();
	res.render('data/image', {
		year: now.getFullYear(),
		month: now.getMonth()
	});
});

app.post('/data/image/:year/:month', (req, res) => {
	var form = new formidable.IncomingForm();
	form.parse(req, function (err,fields,files) {
		console.log(fields.title, '    : fields');
		console.log('files: ',files.image.name);
		images.addImage(fields.title,files.image.name);

	});
	form.on('end', function(fields, files) {
        /* Temporary location of our uploaded file */
        var temp_path = this.openedFiles[0].path;
        /* The file name of the uploaded file */
        var file_name = this.openedFiles[0].name;
        /* Location where we want to copy the uploaded file */
        var new_location = __dirname + '/uploads/';

 
        fs.copy(temp_path, new_location + file_name, function(err) {  
            if (err) {
                console.error(err);
            } else {
                console.log("success!")
                res.redirect(200, "http://localhost:3000/");
            }
        });
	});

	
});

app.delete('/data/:image_hash', (req, res) => {
	console.log(req.params.image_hash);
	var img = images.removeImage(req.params.image_hash);
	res.render('images',{images: img});
	});


app.use(express.static(__dirname + "/uploads"));



//make our app listen to given port
app.listen(app.get('port'), () => {
	console.log(`app started on http://localhost:${app.get("port")}; press cmd + c to terminate`)
});