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
  res.header('Access-Control-Allow-Methods',"GET, POST, PUT, OPTIONS, DELETE");
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
	//console.log("Logging constantly!");
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
	if(typeof req.body.name === 'undefined' || typeof req.body.email === 'undefined'){
		res.json({message:"You're missing a field. Need name and email to create user!", data:[]});
	}
	else{
		user.name = req.body.name;
		user.email = req.body.email;
		if(typeof req.body.pendingTasks !== "undefined"){
			user.pendingTasks = req.body.pendingTasks;
		}

		//console.log(user.name);
		//console.log(user.email);
		User.find({"email":user.email}, function(err,docs){
			if(docs.length){
				res.status(400);
				res.json({message:"Email already exists", data:[]});
			}
			else{
				user.save(function(err){
					if(err){
						res.status(500);
						res.send(err);
					}

					res.status(201);
					res.json({message: 'User Created!', data:user});
					// User.find({email:user.email}, function(error,doc){
					// 	res.json({message: 'User Created!', data:doc[0]});
					// });
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
		//console.log(user);
		if(user === null){
			res.status(404);
			res.json({message:"User not found", data:[]});
			return;
		}
		if(err){
			res.status(404);
			res.json({message:"User not found", data:[]});
			return;
		}
		res.status(200);
		res.json({message:"OK", data:user});
		return;
	});
});
//---------------------------------------------
//-------PUT INDIVIDUAL USER INFO--------------
indiUserRoute.put(function(req, res){
	User.findById(req.params.id, function(err, user){
		//console.log(user);
		if(user === null){
			//console.log("here");
			res.status(404);
			res.json({message:"User not found", data:[]});
			return;
		}
		if(err){
			res.status(404);
			res.json({message:"User not found", data:[]});
			return;
		}

		if(typeof req.body.name === "undefined" || typeof req.body.email === "undefined"){
			res.json({message:"You're missing a field. Need name and email to update user!", data:[]})
		}

		user.name = req.body.name;
		user.email = req.body.email;
		if(typeof req.body.pendingTasks !== "undefined"){
			user.pendingTasks = req.body.pendingTasks;
		}
		
		user.save(function(err){
			if(err){
				res.status(500);
				res.send(err);
			}
			res.status(200);
			User.findById(req.params.id, function(error, updatedUser){
				res.json({message:"Updated user!", data:updatedUser});
			});
		});
	});
});

//----------------------------------------------
//---------DELETE INDIVIDUAL USER INFO----------
indiUserRoute.delete(function(req, res){
	User.remove({
		_id: req.params.id
	}, function(err, user){
		//console.log(user);
		if(user === 0){
			//console.log("here");
			res.status(404);
			res.json({message:"User not found", data:[]});
			return;
		}
		if(err){
			res.status(404);
			res.json({message:"User not found", data:[]});
			res.send(err);
		}
		res.status(200);
		res.json({message:"Successfully deleted user!", data:user});
	});
});

//------------------------------------------


/*------------------------------------------
----------------TASK ROUTE-------------------
-------------------------------------------*/
var taskRoute = router.route('/tasks');

taskRoute.post(function(req, res){

	// if(!req.body.name || !req.body.deadline){
	// 	res.json({message:"Task cannot be created without name or deadline!", data:[]});
	// }

	// var task = new Task(req.body);
	// console.log(req.body.assignedUser);

	// /*if(typeof task.name === "undefined" && typeof task.deadline === "undefined"){
	// 	res.json({message:"Task cannot be created without name or deadline!", data:[]});
	// }*/
	// task.save();

	// console.log(req.body);

	// if(task.assignedUser === '') {
	// 	return;
	// }

	// User.findById(task.assignedUser, function(err, user) {
	// 	console.log(user.name)
	// 	if(err) {
	// 		res.status(404).json({message: "Not OK", data: "Didn't find user"});
	// 	}
	// 	else {
	// 		user.pendingTasks.push(task._id);
	// 		user.save();
	// 		res.status(201).json({message: "OK", data: task});
	// 	}
	// });

	var task = new Task();
		task.name = req.body.name;
		if(typeof req.body.description === "undefined"){
			task.description = "";
		}
		else{
			task.description = req.body.description;
		}
		if(typeof req.body.name === "undefined" && typeof req.body.deadline === "undefined"){
			res.status(400);
			res.json({message:"Task cannot be created without name or deadline!"});
		}
		task.deadline = req.body.deadline;
		task.completed = false;
		task.assignedUser = req.body.assignedUser;
		task.assignedUserName = req.body.assignedUserName;

		task.save(function(err){
			if(err){
				res.status(500);
				res.send(err);
			}

			res.status(201);
			res.json({message: 'Task Created!', data:task});
		});
	
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
        console.log(tasks);
        res.status(200);
        res.json({message:"OK", data:tasks});
    });
});


var indiTaskRoute = router.route('/tasks/:id');

indiTaskRoute.get(function(req, res){
	Task.findById(req.params.id, function(err, task){
		if(task === null){
			res.status(404);
			res.json({message:"Task not found!", data:[]});
			return;
		}
		if(err){
			res.status(404);
			res.json({message:"Task not found!", data:[]});
			return;
		}
		res.status(200);
		res.json({message:"OK",data:task});
	});
});

indiTaskRoute.put(function(req, res){

	Task.findById(req.params.id, function(err, task){
		
		if(task === null){
			res.status(404);
			res.json({message:"Task not found!", data:[]});
			return;
		}
		
		if(err){
			res.status(404);
			res.json({message:"Task not found!", data:[]});
			return;
		}

		if(typeof req.body.name === "undefined" || typeof req.body.deadline === "undefined" || req.body.deadline === ""){
			res.status(400);
			res.json({message:"Cannot update task without name and deadline!", data:[]});
			return;
		}
		if(typeof req.body.deadline !== "undefined"){
			console.log("setting deadline");
			task.deadline = req.body.deadline;	
		}
		if(typeof req.body.completed !== "undefined"){
			console.log("setting completed");
			task.completed = req.body.completed;	
		}
		
		if(typeof req.body.name !== "undefined"){
			task.name = req.body.name;	
		}
		if(typeof req.body.assignedUser !== "undefined"){
			task.assignedUser = req.body.assignedUser;	
		}
		if(typeof req.body.assignedUserName !== "undefined"){
			task.assignedUserName = req.body.assignedUserName;
		}
		
		// if(typeof task.name === "undefined" && typeof task.deadline === "undefined"){
		// 	res.json({message:"Task cannot be updated without name and deadline!", data:[]});
		// }
		task.save(function(err){
			if(err){
				res.status(500);
				res.send(err);
			}
			console.log("saving this bad boy");
			res.status(200);
			res.json({message:"updated task!", data:task});
		});
	});
});

indiTaskRoute.delete(function(req, res){
	Task.remove({
		_id: req.params.id
	}, function(err, task){
		//console.log(task);

		if(task === 0){
			res.status(404);
			res.json({message:"Cannot delete task that doesnt exist!", data:[]});
			return;
		}
		if(err){
			res.status(404);
			res.json({message:"Cannot delete task that doesnt exist!", data:[]});
			return;
		}
		res.status(200);
		res.json({message:"Successfully deleted task!", data:[]});
	});
});

app.use('/api', router);

app.listen(port);
console.log('Magic happens on port ' + port);



