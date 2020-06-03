const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const app = express();
var busboy = require('connect-busboy');
app.use(cors({origin:true}));
app.use(busboy());
var serviceAccount = require("./performance.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://todo-bca74.firebaseio.com"
});

const db = admin.firestore();

app.get('/hello-world', (req, res) => {
	return res.status(200).send('Hello! from Yashodeeps Firebase Server');
});


app.post('/api/create', (req, res) => {
	( async() => {
		try
		{
			await db.collection('users').doc('/' + req.body.id + '/')
			.create({
				name : req.body.name,
				bloodgroup: req.body.bloodgroup,
				occupation: req.body.occupation,
				mobileno: req.body.mobileno
			})
				return res.status(200).send('Data Added');
		}
		catch(error)
		{
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});


app.get('/api/read/:id', (req, res) => {
	( async() => {
		try
		{
			let query = db.collection('users').doc(req.params.id);
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


app.get('/api/readalldata', (req, res) => {
	( async() => {
		try
		{
			let query = db.collection('users');
			let response = [];

			await query.get().then( querysnapshot =>{
				let docs = querysnapshot.docs;

				for(let doc of docs)
				{
					const selectedItem = {
						id: doc.id,
						name: doc.data().name
					};
					response.push(selectedItem);
				}

				return response;

			})
			return res.status(200).send(response);


		}
		catch(error)
		{
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});

app.get('/api/readbyname/:pageNo&:limit', (req, res) => {
	( async() => {
		try
		{
			let query = db.collection('users');
			let response = [];

			await query.get().then( querysnapshot =>{
				let docs = querysnapshot.docs;
				for(let doc of docs)
				{
					const selectedItem = {
						id: doc.id,
						name: doc.data().name,
						bloodgroup: doc.data().bloodgroup,
						occupation: doc.data().occupation,
						mobileno: doc.data().mobileno
					};
					response.push(selectedItem);	
				}
				return response;
			})
			return res.status(200).send(response);
		}
		catch(error)
		{
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});


app.get('/api/readbyname/:searchtext&:pageNo&:limit', (req, res) => {
	( async() => {
		try
		{
			let query = db.collection('users');
			let response = [];

			await query.get().then( querysnapshot =>{
				let docs = querysnapshot.docs;
				console.log(req.params.searchtext);
				for(let doc of docs)
				{
					if(req.params.searchtext === null || req.params.searchtext === '')
					{
						console.log("in empty condition");
						const selectedItem = {
							id: doc.id,
							name: doc.data().name,
							bloodgroup: doc.data().bloodgroup,
							occupation: doc.data().occupation,
							mobileno: doc.data().mobileno
						};
						response.push(selectedItem);	
					}
					else if((doc.data().name.toLowerCase().indexOf(req.params.searchtext.toLowerCase()) >= 0) || (doc.data().occupation.toLowerCase().indexOf(req.params.searchtext.toLowerCase()) >= 0) || (doc.data().bloodgroup.indexOf(req.params.searchtext.toUpperCase()) >= 0) )
					{
						console.log("comparing condition");
						const selectedItem = {
							id: doc.id,
							name: doc.data().name,
							bloodgroup: doc.data().bloodgroup,
							occupation: doc.data().occupation,
							mobileno: doc.data().mobileno
						};
						response.push(selectedItem);
					}
					else
					{
						console.log("In Else");
					}
				}
				return response;
			})
			return res.status(200).send(response);
		}
		catch(error)
		{
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});




app.get('/api/authphone/:phoneno', (req, res) => {
	( async() => {
		try
		{
			let query = db.collection('users');
			let response = null;
			await query.get().then( querysnapshot =>{
				let docs = querysnapshot.docs;

				for(let doc of docs)
				{
					if(doc.data().mobileno.toString() === req.params.phoneno.toString()) 
					{
						const selectedItem = {
							id: doc.id,
							name: doc.data().name,
							bloodgroup: doc.data().bloodgroup,
							occupation: doc.data().occupation,
							mobileno: doc.data().mobileno
						};
						response = selectedItem;
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

app.get('/api/paginationlist/:pageNo&:limit', (req, res) => {
	( async() => {
		try
		{
			let query = db.collection('users');
			let pageNo = req.params.pageNo;
			let limit = req.params.limit;
			let response = [];
			await query.get().then( querysnapshot =>{
				let docs = querysnapshot.docs;
				if(limit > docs.length )
				{
					limit = docs.length;
				}
				let totalpages = (docs.length/limit);
				let startIndex = (pageNo-1)*limit;
				let endIndex = pageNo*limit;
				if(endIndex > totalpages*limit)
				{
					endIndex = totalpages*limit;
				}
				console.log(startIndex);
				console.log(endIndex);
				console.log(totalpages);
				for(let index = startIndex; index < endIndex; index++)
				{
					//console.log(docs[1].data());
					//console.log(docs.length);
					const selectedItem = {
							id: docs[index].id,
							name: docs[index].data().name,
							bloodgroup: docs[index].data().bloodgroup,
							occupation: docs[index].data().occupation,
							mobileno: docs[index].data().mobileno
						};
						console.log(selectedItem);
						response.push(selectedItem);
				}
				response.push("totalpages: " + totalpages);
				response.push("currentpage: " + pageNo);
				return response;
			})
			return res.status(200).send(response);
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