var express = require('express'),
	app = express(),
	Howl = require('howler'),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	Dictionary = require('./models/country'),
	request = require('request'),
	player = require('play-sound')(opts = {}),
	session = require('express-session'),
	https = require('https');



/* Setting up mongoose */
mongoose.connect("mongodb+srv://fahad:fahad@yelpcamp-esxrl.mongodb.net/dictionary?retryWrites=true&w=majority", {useNewUrlParser : true, useCreateIndex : true});

app.set("view engine", "ejs");

app.use(session(
{
  secret: "mine",
  proxy: true,
  resave: true,
  saveUninitialized: true
}));

/* User statements*/

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static(__dirname + "/public"));

/* Routes */
app.get("/", (req,res)=>{
	Dictionary.find({}, (err, foundCountries)=>{
		if(err){
			console.log("ERROR!, Countries cant be found!");
		}else{
			
		}
			res.render("./dictionary/index", {countries : foundCountries});
	});

});


app.get("/wordSearch", (req,res)=>{
	var	keyword = req.query.word;
	var url = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/" + keyword + "?key=910f00e1-e2d3-49be-a216-7c4f92dc7679" ;
	https.get(url, (resp)=>{
      let data = '';
      resp.on('data', (x)=>{
        data += x;
      });
      resp.on('end', ()=>{
        //res.end(data.toString());   
		//res.render("./dictionary/result", {keyword:keyword, data : data.toString()});
		  req.session.data = data.toString();
		res.redirect("/"+ keyword + "/result");
      });
    }).on("error", (err)=>{
      res.send(err);
    });

	
	
	
	
// 	request(url, function(error,response,body){
//         if(!error && response.statusCode == 200){
//             var data = JSON.parse(body);
// 			player.play('https://media.merriam-webster.com/soundc11/c/cat00001.wav', function(err){
//   if (err) throw err
// })
//             res.render("./dictionary/result", {keyword:keyword, data : data});
//         }else{
//             res.send("<h2>Out of Luck! Request not found</h2>");
//         }
//     });
});

app.get("/:keyword/result/", (req,res)=>{
	let keyword = req.params.keyword;
	res.render("./dictionary/result", {keyword:keyword, data : req.session.data});

});

app.post("/", (req,res)=>{
	
	Dictionary.create(req.body.dict, (err, newCountry)=>{
		if(err){
			console.log("ERROR! Country cant be created!");
		}else{
			res.redirect("/");
		}
	});
});

app.get("/new", (req,res)=>{
	res.render("./dictionary/new");
});

app.get("/:id/show", (req,res)=>{
	Dictionary.findById(req.params.id , (err, foundCountry)=>{
		if(err){
			console.log("ERROR! Country can't be found!");
		}else{
			res.render("./dictionary/show", {country : foundCountry});
		}
	});

});
app.get("/:id/slangs/new", (req,res)=>{
	Dictionary.findById(req.params.id, (err, foundCountry)=>{
		if(err){
			console.log("ERROR! country can't be found");
		}else{
			res.render("./dictionary/newslang", {country : foundCountry});
		}				
	});
});
app.post("/:id/slangs", (req,res)=>{
	var id = req.params.id;
	var slang = {
			def : req.body.def,
			exp : req.body.exp,
			category : req.body.category
	}
	Dictionary.findById(id, (err, foundCountry)=>{
		if(err){
			console.log("ERROR! country can't be found");
		}else{
			foundCountry.slangs.push(slang);
			foundCountry.save();
			res.redirect("/"+ id + "/show");
		}				
	});
});
app.get("/:category", (req,res)=>{
	
	var cat= req.params.category;
	if(cat == "AcademicLife"){
		Dictionary.find({"slangs.category":"AcademicLife"}, (err, slangList)=>{
			if(err){
				console.log(err);
			}else{
			res.render("categories/academic", {slangs : slangList});
			}	
	});
	}else if(cat == "ExpressingYourself"){
		Dictionary.find({"slangs.category":"ExpressingYourself"}, (err, slangList)=>{
		if(err){
				console.log(err);
		}else{
			res.render("categories/expressing", {slangs : slangList});
		}	
	}
);		
	}else if(cat == "Outing"){
		Dictionary.find({"slangs.category":"Outing"}, (err, slangList)=>{
		if(err){
				console.log(err);
		}else{
			res.render("categories/outing", {slangs : slangList});
		}	
	}
);	}
});

app.get("/credits", (req,res)=>{
	res.render("credits");
});

/* Server */
app.listen(process.env.PORT, process.env.IP, ()=>{
	console.log("Slang Dictionary Server Started...");
});