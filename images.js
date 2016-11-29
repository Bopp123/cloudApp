const fs = require('fs');

var saveImages = (images) =>{
	fs.writeFileSync('data.json', JSON.stringify(images));
};

var getImages = ()  =>{
	try {
		var notesString = fs.readFileSync('data.json');

		return JSON.parse(notesString);
	} catch(e) {
		return [];
	}	
};

var hashCode = function(s){
	console.log(s);
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
}


var addImage = (title, url) =>{
	var images = getImages();
	var urlHash = hashCode(title+url);
	debugger;
	var image = {
		title,
		url,
		hash: urlHash
	};

	images.push(image);
	saveImages(images);
	console.log(`image with title: ${title} has been saved succesfully`);
};

var removeImage = (hash) =>{
	var images = getImages();
	var imageToDelete = images.filter((image) => image.hash == hash);
	console.log(imageToDelete);
	fs.unlinkSync(__dirname + "/uploads/" + imageToDelete[0].url);
	var remainingImages = images.filter((image)=> {
		
		return image.hash != hash;
	});

	saveImages(remainingImages);
	if (remainingImages.length < images.length) {console.log(`image has been succesfully deleted `);
		return remainingImages;
		};
};

var clearImages = () => saveImages();

module.exports={
	getImages,
	addImage,
	removeImage,
	clearImages
}; 