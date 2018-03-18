var express = require('express');
var app = express();

var cors = require('cors');

// use it before all route definitions
app.use(cors({origin: 'http://howell-info.us:3000'}));

var redis = require('redis');
var redisClient = redis.createClient();

var bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var basicAuth = require('express-basic-auth')
 
app.use(basicAuth({
    users: { 'admin': 'secret' },
	challenge: true,
    realm: 'api-login'
}))



redisClient.on('connect',function(){
	console.log('connected');
})

app.get('/students/:username', function(req,res){
	var user = req.params.username;
	
	redisClient.sismember("students",user,function(err,reply){
		if(reply==1){
			redisClient.hgetall("user:"+user,function(err,reply){
				res.json(reply);
			})
		}
		else{
			console.log("404: "+user+" not found")
			res.status(404).end()
		}
	});
});
app.get('/students/', function(req,res){
	redisClient.smembersAsync("students").then(function(usernames){
		var promises = [];
		var tmpObj = {};
		var studentArr = [];
		for(var i=0;i<usernames.length;i++){
			promises.push(redisClient.hgetallAsync("user:"+usernames[i]).then(function(reply){
				tmpObj = reply;
				studentArr.push(tmpObj);
			})
		)}
		Promise.all(promises).then(function(){
			res.header("Access-Control-Expose-Headers", "X-Total-Count")
			res.header("X-Total-Count",studentArr.length);
			res.header("Authorization")
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization,X-Total-Count");
			
			var reverseOrder = true;
			var method = function(a){return a.toUpperCase()};
			/*
			if(req.query._sort == 'username' || req.query._sort == 'type'){
				method = function(a){return a.toUpperCase()}
			}
			*/
			if(req.query._order == 'ASC'){
				reverseOrder = false;	
			}
			
			studentArr.sort(sort_by(req.query._sort,reverseOrder,method));
			
			var studentArrFiltered = [];
				var filters = {}
				filters['name'] = req.query.name;
				filters['username'] = req.query.username;

				var isFiltering = false;
				
				for(var filter in filters){
					if(filters[filter] != undefined){
						isFiltering = true;
					}
				}
				
				if(isFiltering){
					studentArrFiltered = filterArray(studentArr,filters)
				}
				else{
					studentArrFiltered = studentArr;
				}
			
			var studentArrSliced = studentArrFiltered.slice(req.query._start,req.query._end);
			res.json(studentArrSliced);
		})
	}).catch(function(err){
		//err
	});
});
app.post('/students', function(req,res){
	var postObj = {};
	postObj = req.body;
	console.log("Recieved post body:");
	console.log(postObj);
	//If body is valid
	if((Object.keys(postObj).length == 0) || postObj.username == undefined || postObj.name == undefined){
		console.log("400: Body empty or missing parameter");
		res.status(400).end();
	}
	else{
		redisClient.sismemberAsync("students",postObj.username).then(function(reply){
			if(reply == 1){
				console.log("400: Tried to add user that already exists")
				res.status(400).end();
			}
			else{
				postObj['_ref'] = "/students/"+postObj['username'];
				console.log("Appended "+postObj['_ref']+" to body");
				postObj['id'] = postObj['username']; //Proj 6: Create id firld, set equal to username
				redisClient.sadd("students",postObj['username']);
				
				for(var key in postObj){
					//console.log(key);
					redisClient.hset("user:"+postObj['username'],key,postObj[key],function(err,reply){
					})
				}
				
				redisClient.hgetallAsync("user:"+postObj['username']).then(function(reply){
					var returnObj = {};
					returnObj = reply;
					

					
					console.log("Returning user to client:");
					console.log(returnObj);
					res.status(200).send(returnObj)
				})
			}
		})
	}
})

app.put('/students/:username',function(req,res){
	var body = {};
	body = req.body;
	var username = req.params.username;
	console.log(body);
	
	if((Object.keys(body).length == 0) || body.name == undefined){
		console.log("400: Body incorrect");
		res.status(400).end();
	}
	else{
		redisClient.sismemberAsync("students",username).then(function(reply){//Check if user is a member
			if(reply==1){
				redisClient.hset("user:"+username,"name",body['name'],function(err,reply){
					console.log("Success: Changed user " +username+"'s name to "+body['name']);
				})
				
				redisClient.hgetallAsync("user:"+username).then(function(reply){
					var returnObj = {} 
					returnObj = reply;
					console.log("Returning user to client:");
					console.log(returnObj);
					res.status(200).send(returnObj)
				})
				
			}
			else{
				console.log("400: Tried to change username or user doesn't exist");
				res.status(400).end() //User doesn't exist
			}
		})
	}
})

app.delete('/students/:username',function(req,res){
	var username = req.params.username;
	
	redisClient.sismemberAsync("students",username).then(function(reply){
		if(reply==1){//Username is a member of students so delete it
			redisClient.delAsync("user:"+username).then(function(reply){ //Delete from hash
				console.log("Success: Removed hash memmber user:"+username);
			}).then(function(reply){
				redisClient.sremAsync("students",username).then(function(reply){ //Delete from set
					console.log("Success: Removed user "+username+" from student set");
					var obj = {};
					obj['0'] = "Success: Removed user "+username+" from student set"
					res.status(200).send(obj);
				})
			})
		}
		else{
			res.status(404).end();
		}
	})
})
/*
//Needs to be a promise?
var findNearestValidGradeId = function(gradeid){
	redisClient.sismemberAsync("grades",gradeid).then(function(reply,err){
		var validID = gradeid;
		if(reply==1){
			validID = findNearestValidGradeId(gradeid+1);
		}
		else{//grade id does not exist so is valid
			return gradeid;
		}
		
		return validID;
	})
}
*/
app.post('/grades/',function(req,res){
	var postObj = {};
	postObj = req.body;
	console.log("Recieved post body:");
	console.log(postObj);
	//If body is valid
	if((Object.keys(postObj).length == 0) || postObj.username == undefined || postObj.type == undefined || postObj.max == undefined || postObj.grade == undefined){
		console.log("400: Body empty or missing parameter");
		res.status(400).end();
	}
	else{
        redisClient.getAsync("gradeid").then(function(reply){//get value of gradeid
			var gradeid=1;
            console.log("reply gradeid is:"+reply);
            if(reply == null){//gradeid does not exist, create it with value of 1
                redisClient.set("gradeid",1,redis.print);
                gradeid = 1;
            }
            else{ //gradeid set exists.
				redisClient.incrAsync("gradeid");	//Potential race
                gradeid = reply;				//Lazy so this should usually work
				gradeid++;
            }
            //console.log(err);
            //console.log(gradeid);
            redisClient.get("gradeid",redis.print);
            
            postObj['_ref'] = "/grades/"+gradeid;
            console.log("Appended "+postObj['_ref']+" to body");
			
			postObj['id'] = gradeid //Actually store grade id as part of object
			console.log("Appended id "+gradeid+" to body");
            redisClient.sadd("grades",gradeid);
            
            for(var key in postObj){
                redisClient.hset("grade:"+gradeid,key,postObj[key]);
            }
            
            redisClient.hgetallAsync("grade:"+gradeid).then(function(reply){
                var returnObj = {};
                returnObj = reply;
				console.log("Returning grade to client:");
				console.log(returnObj);

				//res.status(200).send(returnObj)
				res.json(returnObj);
		  })
        })
	}
})

app.get('/grades/:gradeid',function(req,res){
	var postObj = {};
	postObj = req.body;
		var gradeid = req.params.gradeid;
		redisClient.sismemberAsync("grades",gradeid).then(function(reply){
			if(reply==1){
				//get gradeid from hash
				redisClient.hgetallAsync("grade:"+gradeid).then(function(reply){
                var returnObj = {};
					returnObj = reply;
					console.log("Returning grade to client:");
					console.log(returnObj);
					res.status(200).send(returnObj)
				})
			}
			else{
				console.log("404: Grade with id "+gradeid+" not found")
			res.status(404).end(); //gradeid doesn't exist
		}
	})
})

app.put('/grades/:gradeid',function(req,res){
	var gradeid = req.params.gradeid;
	var postObj = {};
	postObj = req.body;
	console.log("Recieved post body:");
	console.log(postObj);
	//If body is valid
	if((Object.keys(postObj).length == 0) || (postObj.username == undefined && postObj.type != undefined && postObj.max == undefined && postObj.grade == undefined)){
		console.log("400: Body empty or missing parameter");
	}
	else{
		redisClient.sismemberAsync("grades",gradeid).then(function(reply){
			if(reply==1){
				for(var key in postObj){
                	redisClient.hsetAsync("grade:"+gradeid,key,postObj[key]).then(function(reply){
						console.log("Success: Changed gradeid "+gradeid+" "+key+" to "+postObj[key]);
	
						//get gradeid from hash
						redisClient.hgetallAsync("grade:"+gradeid).then(function(reply){
                			var returnObj = {};
							returnObj = reply;
							console.log("Returning grade to client:");
							console.log(returnObj);
							res.status(200).send(returnObj)
						}).catch(function(err){
							console.log("500: Grade with id "+gradeid+" could not be retrieved")
							res.status(500);
						})
					}).bind(null,key);
            	}
			}else{
				console.log("404: Grade with id "+gradeid+" not found")
				res.status(404).end();
			}
		})
	}
})
		
app.delete('/grades/:gradeid',function(req,res){
	var gradeid = req.params.gradeid;
	
	redisClient.sismemberAsync("grades",gradeid).then(function(reply){
		if(reply==1){
			redisClient.delAsync("grade:"+gradeid).then(function(reply){ //Delete from hash
			console.log("Success: Removed hash memmber grade:"+gradeid);
			}).then(function(reply){
				redisClient.sremAsync("grades",gradeid).then(function(reply){ //Delete from set
				console.log("Success: Removed gradeid "+gradeid+" from grades set");
				var obj = {};
				obj['0'] = "Success: Removed gradeid "+gradeid+" from grades set"
				res.status(200).send(obj);
				})
			})
		}
		else{
			console.log("Incorrect or mismatched gradeID!");
			res.status(404).end();
		}
	})
})

var filterGrade = function(filterObj,gradeObj){
	/*
	var filters = [];
	var promises = [];
	var promise = new Promise(function(resolve,reject){
		if(filterObj.username != undefined){
			resolve(gradeObj.(filterObj.username)) //Make resolution contain the desired object
		}
	})*/
	//console.log(filterObj);
	//console.log(gradeObj)
	console.log("filters:")
	console.log(filterObj);
	console.log("grade to be filtered: ");
	console.log(gradeObj);

	
	if(Object.keys(filterObj).length != 0){
		if(filterObj.username != undefined && filterObj.type != undefined){
			console.log("here");
			if((gradeObj.username === filterObj.username) && (gradeObj.type === filterObj.type)){
				return gradeObj;
			}
		}
		if(filterObj.type != undefined && filterObj.username === undefined){
			if(gradeObj.type === filterObj.type){
				return gradeObj;
			}
		}
		if(filterObj.username != undefined && filterObj.type === undefined){
			if(gradeObj.username === filterObj.username){
				return gradeObj;
			}
		}
		return false;
	}
	else{
		return gradeObj;
	}
}

var filter = function(objArr, filterArr){
	console.log("Filtering Grades");
	return objArr;
}

var sort_by = function(field, reverse, primer){

   var key = primer ? 
       function(x) {return primer(x[field])} : 
       function(x) {return x[field]};

   reverse = !reverse ? 1 : -1;

   return function (a, b) {
       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
     } 
}

var sortArray = function(array, field, order){
	var method;
	console.log(array)

	//array.sort(sort_by(field,order,method));
	
	return array;
	
}

var filterArray = function(array,filters){
	var arrFiltered = [];
	for(var filter in filters){
		for(let i=0;i<array.length;i++){
			if(array[i][filter] == filters[filter]){
				console.log(array[i]);
				arrFiltered.push(array[i]);
			}
		}
	}
	return arrFiltered;
}

app.get('/grades',function(req,res){
	redisClient.smembersAsync("grades").then(function(reply){
		//console.log(reply);
		var gradeArr = [];
		var gradeObj = {};
		var promises = [];
		
		redisClient.getAsync("gradeid").then(function(reply){
			var gradeid = reply;
			var size =0;
			for(var id=1;id<=gradeid;id++){
				//console.log(id);
				promises.push(redisClient.hgetallAsync("grade:"+id).then(function(reply){
					if(reply != null){
						//size++;
						//var filtered = filterGrade(req.query,reply);
						//if(filtered != false){
						//	gradeArr.push(filtered)
						//}
						gradeArr.push(reply);
						size++;
					}
			}));
			}
			Promise.all(promises).then(function(reply){
				var reverseOrder = true;
				var method = parseInt;
				
				if(req.query._sort == 'username' || req.query._sort == 'type'){
					method = function(a){return a.toUpperCase()}
				}
				
				if(req.query._order == 'ASC'){
					reverseOrder = false;	
				}
				
				gradeArr.sort(sort_by(req.query._sort,reverseOrder,method));
				
				console.log(gradeArr);
				
				var gradeArrFiltered = [];
				var filters = {}
				filters['grade'] = req.query.grade;
				filters['max'] = req.query.max;
				filters['username'] = req.query.username;
				filters['type'] = req.query.type;
				
				var isFiltering = false;
				
				for(var filter in filters){
					if(filters[filter] != undefined){
						isFiltering = true;
					}
				}
				
				if(isFiltering){
					gradeArrFiltered = filterArray(gradeArr,filters)
				}
				else{
					gradeArrFiltered = gradeArr;
				}

				var gradeArrSliced = gradeArrFiltered.slice(req.query._start,req.query._end);
				
				res.header("Access-Control-Expose-Headers", "X-Total-Count")
				res.header("X-Total-Count",size);
			
				res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization,X-Total-Count");
				
				res.json(gradeArrSliced);
			})
		})
	})
})

app.delete('/db',function(req,res){
	redisClient.flushdbAsync().then(function(reply){
		console.log("Success: Flushed DB");
		res.status(200).end();
	})
})

app.listen(3001, function () {
	console.log('listening on port 3001!');
});