const Discord = require('discord.js');
const client = new Discord.Client();

var request = require('request');

//subreddit to check
var subreddit = "https://www.reddit.com/r/.../new.json?sort=new";
//keyword to check for
var keyword = "...";
//used to store post times to track checks
var newestPost = "";
//ID of your server here - right click server and select copy ID
var serverID = "...";
//ID of channel you wish bot to post in - type \#channelname in channel to get ID
var channelID = "...";
//bot token
var botToken = "...";


client.on('ready', () => {
    console.log("bot started!");
});

getValues();

//checks for new posts every minute
setInterval(check, 60000);

//checks connection to reddit, checks connection to discord channel, gets most recent post ID
function getValues(){
	request(subreddit, function(error, response, body){
		if(!error && response.statusCode == 200){
			var parsedData = JSON.parse(body);
			newestPost = (parsedData["data"]["children"]["0"]["data"]["created_utc"]);
				var guild = client.guilds.get(serverID);
		    	if(guild && guild.channels.get(channelID)){
		        	guild.channels.get(channelID).send(":on: Checking for new posts containing keyword **'" + keyword + "'** in: **r/" + subreddit.split("/")[4] + "**");
		   		} else {
		   			console.log("did not connect");
		   		}
   		} else {
			console.log("Double check subreddit name and try again");
			console.log(error);
		}
	});
}

function check(){
	//get current date and time and save it to "datetime"
	Date.prototype.today = function () { 
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
	}
	Date.prototype.timeNow = function () {
	     return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
	}
	var newDate = new Date();
	var datetime = newDate.today() + " @ " + newDate.timeNow();
	
	//initialises variable containing comment
	var postComment = ":new: **New posts** containing keyword **'"+ keyword +"'** found in **r/" + subreddit.split("/")[4] + "**:\n\n";
	var found = false;
	//make request to reddit
	request(subreddit, function(error, response, body){
		if(!error && response.statusCode == 200){
			//parse and store data
			var parsedData = JSON.parse(body);
			//assigns latest post time to checkedPost variable
			var checkedPost = parsedData["data"]["children"]["0"]["data"]["created_utc"];
			//checks if latest post from recent request matches newest post upon last check
			if(checkedPost > newestPost){
				var i = 0;
				//if not, begins looping through response JSON until last post from previous check is found
				//on post deletion, the loop may not end, so additionally check if loop count is lower than 24
				while(checkedPost > newestPost/* && i <= 23*/){
					//if current post title contains keyword, add to link to post comment and change found boolean to true
					if(parsedData["data"]["children"][String(i)]["data"]["title"].toLowerCase().includes(keyword)){
						var purl = "**" + parsedData["data"]["children"][String(i)]["data"]["title"] + " | **http://www.reddit.com" + parsedData["data"]["children"][String(i)]["data"]["permalink"];
						found = true;
						postComment += purl + "\n";
					}
					i++;
					//used to log checks in console
					console.log(parsedData["data"]["children"][String(i)]["data"]["id"]);
					checkedPost = parsedData["data"]["children"][String(i)]["data"]["created_utc"];
				} 
				//reassigns newest to most recent post from this check for use as reference in following check
				newestPost = parsedData["data"]["children"]["0"]["data"]["created_utc"];
				var guild = client.guilds.get(serverID);
				//if a post was found, comment link in discord
				if(found === true){
			    	if(guild && guild.channels.get(channelID)){
			        	guild.channels.get(channelID).send(postComment);
			   		} else {
			   			console.log("did not connect");
			   		}
				}
			}
		//track checks in console
		console.log("Last checked at: " + datetime + ". Latest thread time = " + newestPost);
   		} else {
			console.log("SOMETHING WENT WRONG");
			console.log(error);
		}
	});
};

client.login(botToken);