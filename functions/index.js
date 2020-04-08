const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({origin:true}));

var serviceAccount = require("./performance.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://todo-bca74.firebaseio.com"
});

const db = admin.firestore();

app.get('/hello-world', (req, res) => {
	return res.status(200).send('Hello world!');
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


app.get('/api/readbyname/:searchtext', (req, res) => {
	( async() => {
		try
		{
			let query = db.collection('users');
			let response = [];

			await query.get().then( querysnapshot =>{
				let docs = querysnapshot.docs;

				for(let doc of docs)
				{
					if((doc.data().name.toLowerCase().indexOf(req.params.searchtext.toLowerCase()) >= 0) || (doc.data().occupation.toLowerCase().indexOf(req.params.searchtext.toLowerCase()) >= 0) || (doc.data().bloodgroup.indexOf(req.params.searchtext.toUpperCase()) >= 0) )
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
			let query = db.collection('AUTH');
			let response = null;
			await query.get().then( querysnapshot =>{
				let docs = querysnapshot.docs;

				for(let doc of docs)
				{
					if(doc.data().phoneno.toString() === req.params.phoneno.toString()) 
					{
						response = {
							id: doc.id,
							phoneno: doc.data().phoneno,
							name: doc.data().name,
							usertype: doc.data().usertype
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

//Export the api to firebase cloud functions
exports.app = functions.https.onRequest(app);

