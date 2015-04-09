// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var User 	   = require('./models/user');
var Task 	   = require('./models/task')	

mongoose.connect('mongodb://harjas:mongo@ds033097.mongolab.com:33097/mp3');

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  next();
};
app.use(allowCrossDomain);

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 4000;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

router.use(function(req, res, next){
	console.log("Logging constantly!");
	next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api, Harjas!' });   
});

/*------------------------------------------
----------------USER ROUTE-------------------
-------------------------------------------*/
var userRoute = router.route('/users');

//----------USER ROUTE POST---------------
userRoute.post(function(req, res){
	var user = new User();
	user.name = req.body.name;
	user.email = req.body.email;

	console.log(user.name);
	console.log(user.email);

	if(typeof user.name === 'undefined' && typeof user.email === 'undefined'){
		res.json({message:"You're missing a field. Need name and email to create user!"});
	}
	else{
		User.find({email:user.email}, function(err,docs){
			if(docs.length){
				res.json({message:"Email already exists"})
			}
			else{
				user.save(function(err){
					if(err){
						res.status(500);
						res.send(err);
					}

					res.status(201);
					res.json({message: 'User Created!'});
				});
			}
		});
	}
});
//--------------------------------
//--------USER ROUTE GET----------
userRoute.get(function(req, res) {

	var where = JSON.parse(req.query.where || "{}");
	var fields = JSON.parse(req.query.select || "{}");
	var attributes = ['_id', 'name', 'email', 'dateCreated', 'pendingTasks'];
	var queryOptions = {
		sort: JSON.parse(req.query.sort || "{}"),
		skip: JSON.parse(req.query.skip || "{}"),
		limit: JSON.parse(req.query.limit || "{}")
	};

    User.find(where, fields, queryOptions, function(err, users) {
        if (err){
        	res.status(404);
            res.send(err);
        }

        res.status(200);
        res.json({message:"OK", data:users});
    });
});
//----------------------------------
//-------USER ROUTE OPTIONS---------
userRoute.options(function(req, res){
      res.writeHead(200);
      res.end();
});

//----------------------------------
//-----INDIVIDUAL USER ROUTES-------
//----------------------------------

//---------GET INDIVIDUAL USER INFO------------
var indiUserRoute = router.route('/users/:id');

indiUserRoute.get(function(req, res){
	User.findById(req.params.id, function(err, user){
		if(err){
			res.status(404);
			res.send(err);
		}
		res.status(200);
		res.json(user);
	});
});
//---------------------------------------------

//-------PUT INDIVIDUAL USER INFO--------------
indiUserRoute.put(function(req, res){
	User.findById(req.params.id, function(err, user){
		if(err){
			res.status(404);
			res.send(err);
		}

		user.name = req.body.name;
		user.email = req.body.email;

		if(typeof user.name === "undefined" && typeof user.email === "undefined"){
			res.json({message:"You're missing a field. Need name and email to update user!"})
		}
		else{
			user.save(function(err){
				if(err){
					res.status(500);
					res.send(err);
				}
				res.status(200);
				res.json({message:"updated user!"});
			});
		}
	});
});

//----------------------------------------------
//---------DELETE INDIVIDUAL USER INFO----------
indiUserRoute.delete(function(req, res){
	User.remove({
		_id: req.params.id
	}, function(err, user){
		if(err){
			res.status(404);
			res.send(err);
		}
		res.status(200);
		res.json({message:"Successfully deleted user!"});
	});
});

//------------------------------------------


/*------------------------------------------
----------------TASK ROUTE-------------------
-------------------------------------------*/
var taskRoute = router.route('/tasks');

taskRoute.post(function(req, res){
	var task = new Task();
	task.name = req.body.name;
	if(typeof req.body.description === "undefined"){
		task.description = "";
	}
	else{
		task.description = req.body.description;
	}
	task.deadline = req.body.date;
	task.completed = false;

	if(typeof task.name === "undefined" && typeof task.deadline === "undefined"){
		res.json({message:"Task cannot be created without name or deadline!"});
	}
	else{
		task.save(function(err){
			if(err){
				res.status(500);
				res.send(err);
			}

			res.status(201);
			res.json({message: 'Task Created!'});
		});
	}
});

taskRoute.get(function(req, res) {

	var where = JSON.parse(req.query.where || "{}");
	var fields = JSON.parse(req.query.select || "{}");
	var queryOptions = {
		sort: JSON.parse(req.query.sort || "{}"),
		skip: JSON.parse(req.query.skip || "{}"),
		limit: JSON.parse(req.query.limit || "{}")
	};

    Task.find(where, fields, queryOptions, function(err, tasks) {
        if (err){
        	res.status(404);
            res.send(err);
        }

        res.status(200);
        res.json(tasks);
    });
});


var indiTaskRoute = router.route('/tasks/:id');

indiTaskRoute.get(function(req, res){
	Task.findById(req.params.id, function(err, task){
		if(err){
			res.status(404);
			res.send(err);
		}
		res.status(200);
		res.json(task);
	});
});

indiTaskRoute.put(function(req, res){
	Task.findById(req.params.id, function(err, task){
		if(err){
			res.status(404);
			res.send(err);
		}

		task.name = req.body.name;	
		task.email = req.body.email;
		
		if(typeof task.name === "undefined" && typeof task.deadline === "undefined"){
			res.json({message:"Task cannot be updated without name and deadline!"});
		}
		else{
			task.save(function(err){
				if(err){
					res.status(500);
					res.send(err);
				}
				res.status(200);
				res.json({message:"updated task!"});
			});
		}
	});
});

indiTaskRoute.delete(function(req, res){
	Task.remove({
		_id: req.params.id
	}, function(err, task){
		if(err){
			res.status(404);
			res.send(err);
		}
		res.status(200);
		res.json({message:"Successfully deleted task!"});
	});
});

app.use('/api', router);

app.listen(port);
console.log('Magic happens on port ' + port);