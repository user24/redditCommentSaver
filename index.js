var url = require('url');
var http = require('http');

var verbose = true;

function getComments(username, callback, after) {
	var comments = '';
	// Define the URL to fetch
	var redditUrl = "http://www.reddit.com/user/"+username+".json";
	if(after) {
		 redditUrl += "?after="+after;
	}
	// Set some http options
	var urlOptions = url.parse(redditUrl);
	urlOptions.Connection = "keep-alive";
	// Fetch the comments
	verbose && console.log('Fetching ['+redditUrl+']');
	var request = http.request(urlOptions, function gotCommentsFromHTTP(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			comments += chunk;
		});
		res.on('end', gotData);
	});
	request.end();

	function gotData() {
		// Parse the comments - epic fail if it fails
		comments = JSON.parse(comments);
		// Call back with the data
		verbose && console.log('Fetched ' + comments.data.children.length + ' comments');
		callback(comments);
		// Get the next set of comments if applicable
		if("after" in comments.data) {
			if(comments.data.after == null) {
				// We're done!
				return;
			} else {
				getComments(username, callback, comments.data.after);
			}
		}
	}
}

getComments("user24", saveCommentsToCouch);

function saveCommentsToCouch(comments) {
	// Stored the comments
	console.log('Saving ' + comments.data.children.length + ' comments to couch');
}