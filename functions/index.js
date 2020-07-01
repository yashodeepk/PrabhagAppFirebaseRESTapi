const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const fileUpload = require("./cloud-function-file-upload");
const app = express();
app.use(cors({origin:true}));

fileUpload("/api/picture", app);	

var serviceAccount = require("./performance.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://shreyanagarapp.firebaseio.com",
  storageBucket: "gs://shreyanagarapp.appspot.com"
});

const db = admin.firestore();

//Get feed
app.get('/api/getfeed/:pageNo&:limit', (req, res) => {
( async() => {
		try
		{
			let query = db.collection('feed');
			let response = [];
			let pagedata;
			let returnvar;
			await query.get().then( querysnapshot =>{
				let docs = querysnapshot.docs;
				let pageNo = req.params.pageNo;
				let limit = req.params.limit;
				if(limit > docs.length )
				{
					limit = docs.length;
				}
				let totalpages = Math.ceil(docs.length/limit);
				let startIndex = (pageNo-1)*limit;
				let endIndex = pageNo*limit;
				if(endIndex > docs.length)
				{
					endIndex = docs.length;
				}
				for(let index = startIndex; index < endIndex; index++)
				{
						let selectedItem = {
							id					: docs[index].id,
							name				: docs[index].data().name	,
							imageURL            : docs[index].data().imageURL,
							discription         : docs[index].data().discription
						};
						response.push(selectedItem);
				}
				
				pagedata = {totalpages:totalpages,
							currentpage:pageNo};
	
									
				returnvar = {response:response,
								pagedata:pagedata};
								
				return returnvar;
			})
			if(returnvar !== null)
			{
				return res.status(200).send(returnvar);
			}
			else
			{
				return res.status(404).send('No Feeds');
			}
		}
		catch(error)
		{
			
		}
	})();
});

//upload Feed
app.post('/api/uploadfeed', (req, res) => {
	( async() => {
		try
		{
			db.collection('feed').doc()
			.create({
							name				: req.body.name			,
							imageURL            : req.body.imageURL			,
							discription         : req.body.discription
			})
			return res.status(200).send('Feed Added');
		}
		catch(error)
		{
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});

//Upload Image
app.post("/api/picture/", function (req, response, next) {
    uploadImageToStorage(req.files.file[0])
    .then(metadata => {
        response.status(200).json(req.files.file[0].originalname);
        next();
    })
    .catch(error => {
        console.error(error);
        response.status(500).json({ error });
        next();
    });
});

//TEST API
app.get('/hello-world', (req, res) => {
	return res.status(200).send("Yashodeep's firebase database!");
});

//Reads by ID
app.get('/api/read/:id', (req, res) => {
	( async() => {
		try
		{
			let query = db.collection('entities').doc(req.params.id);
			let person = await query.get();
			let response = person.data();  
			
			return res.status(200).send(response);
		}
		catch(error)
		{
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});

const uploadImageToStorage = file => {
    const storage = admin.storage();
    return new Promise((resolve, reject) => {
        const fileUpload = storage.bucket().file(file.originalname);
        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: "image/jpg"
            }
        });

        blobStream.on("error", error => reject(error));

        blobStream.on("finish", () => {
            fileUpload.getMetadata()
            .then(metadata => resolve(metadata))
            .catch(error => reject(error));
        });
		
    
	blobStream.end(file.buffer);
  });
}

//for login
app.get('/api/authphone/:mobileno', (req, res) => {
	( async() => {
		try
		{
			let query = db.collection('entities');
			let response = null;
			await query.get().then( querysnapshot =>{
				let docs = querysnapshot.docs;

				for(let doc of docs)
				{
					if(doc.data().mobileno.toString() === req.params.mobileno.toString()) 
					{
						response = {
							id: doc.id,
							familycode: doc.data().familycode,
							mobileno: doc.data().mobileno,
							name: doc.data().name,
							usertype: doc.data().usertype,
						};
						break;
					}
				}
				return response;
			})
			if(response !== null)
			{
				return res.status(200).send(response);
			}
			else
			{
				return res.status(404).send('User not found');
			}
		}
		catch(error)
		{
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});

//Get family member data
app.get('/api/familymember/:familycode', (req, res) => {
	( async() => {
		try
		{
			let query = db.collection('entities');
			let response = [];
			await query.get().then( querysnapshot =>{
				let docs = querysnapshot.docs;

				for(let doc of docs)
				{
					if(doc.data().familycode.toString() === req.params.familycode.toString()) 
					{
						let selectedItem = {
							id                  : doc.id,
							familycode			: doc.data().familycode		,
							name				: doc.data().name			,
							mobileno			: doc.data().mobileno		,
							address				: doc.data().address		,	
							relation			: doc.data().relation		,
							dob			        : doc.data().dob			,    
							dom			        : doc.data().dom			,    
							education		    : doc.data().education		,
							bloodgroup          : doc.data().bloodgroup     , 
							businessjob	        : doc.data().businessjob	,    
							email		        : doc.data().email		    ,
							typeofbusiness      : doc.data().typeofbusiness , 
							businessbrief       : doc.data().businessbrief  , 
							businessaddress     : doc.data().businessaddress 
						};
						response.push(selectedItem);
					}
				}
				return response;
			})
			if(response !== null)
			{
				return res.status(200).send(response);
			}
			else
			{
				return res.status(404).send('User not found');
			}
		}
		catch(error)
		{
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});

app.post('/api/readbyname', (req, res) => {
	( async() => {
		try
		{
			console.log(req.body.pageNo);
			console.log(req.body.limit);
			console.log(req.body.searchtext);
			let returnvar;
			let query = db.collection('entities');
			let pageNo = req.body.pageNo;
			let limit = req.body.limit;
			let searchtext = req.body.searchtext;
			console.log(searchtext);
			let response = [];
			let response2 = [];
			let pagedata;
			await query.get().then( querysnapshot =>{
				let docs = querysnapshot.docs;
				if(searchtext)
				{
					for(let doc of docs)
					{
						if((doc.data().name.toString().toLowerCase().indexOf(req.body.searchtext.toString().toLowerCase()) >= 0) || (doc.data().education.toString().toLowerCase().indexOf(req.body.searchtext.toString().toLowerCase()) >= 0) || (doc.data().bloodgroup.toString().indexOf(req.body.searchtext.toString().toLowerCase()) >= 0) )
						{
							console.log("comparing condition");
							const selectedItem = {
								id			: doc.id,
								name		: doc.data().name,
								familycode	: doc.data().familycode,
								education	: doc.data().education
							};
							response.push(selectedItem);
						}
					}
					if(limit > response.length )
					{
						limit = response.length;
					}
					let totalpages = Math.ceil(response.length/limit);
					let startIndex = (pageNo-1)*limit;
					let endIndex = pageNo*limit;
					if(endIndex > response.length)
					{
						endIndex = response.length;
					}
					
					for(let index = startIndex; index < endIndex; index++)
					{
						//console.log(response[1].data());
						//console.log(response.length);
						const selectedItem = {
								id			: response[index].id	,		
								name		: response[index].name	,	
								familycode	: response[index].familycode,		
								education	: response[index].education	
							};
							console.log(selectedItem);
							response2.push(selectedItem);
					}
					
					pagedata = {totalpages:totalpages,
									currentpage:pageNo};
	
									
					returnvar = {response:response2,
								pagedata:pagedata};
								
					return returnvar;
				}
				else
				{
					if(limit > docs.length )
					{
						limit = docs.length;
					}
					let totalpages = Math.ceil(docs.length/limit);
					let startIndex = (pageNo-1)*limit;
					let endIndex = pageNo*limit;
					if(endIndex > docs.length)
					{
						endIndex = docs.length;
					}
					
					for(let index = startIndex; index < endIndex; index++)
					{
						//console.log(docs[1].data());
						//console.log(docs.length);
						const selectedItem = {
								id			: docs[index].id	,		
								name		: docs[index].data().name	,	
								familycode	: docs[index].data().familycode,		
								education	: docs[index].data().education	
							};
							console.log(selectedItem);
							response2.push(selectedItem);
					}
					
					pagedata = {totalpages:totalpages,
									currentpage:pageNo};
	
									
					returnvar = {response:response2,
								pagedata:pagedata};
								
					return returnvar;
				}
			})
			return res.status(200).send(returnvar);
		}
		catch(error)
		{
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});

//Profile update
app.post('/api/update', (req, res) => {
	( async() => {
		try
		{
			for(let index = 0; index< req.body.person.length; index++)
			{
				db.collection('entities').doc('/' + req.body.person[index].id + '/')
				.update({
							familycode			: req.body.person[index].familycode		,
							name				: req.body.person[index].name			,
							mobileno			: req.body.person[index].mobileno		,
							address				: req.body.person[index].address		,	
							relation			: req.body.person[index].relation		,
							dob			        : req.body.person[index].dob			,    
							dom			        : req.body.person[index].dom			,    
							education		    : req.body.person[index].education		,
							bloodgroup          : req.body.person[index].bloodgroup     , 
							businessjob	        : req.body.person[index].businessjob	,    
							email		        : req.body.person[index].email		    ,
							typeofbusiness      : req.body.person[index].typeofbusiness , 
							businessbrief       : req.body.person[index].businessbrief  , 
							businessaddress     : req.body.person[index].businessaddress 
				})
			}
				return res.status(200).send('Data Added');
		}
		catch(error)
		{
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});

//Export the api to firebase cloud functions
exports.app = functions.https.onRequest(app);