const https = require('https');
const apiKey = process.env.cognitiveServicesKey;
const cognitiveServicesUrl = 'https://northeurope.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment';
const getSentimentScoreForTweet = (tweetId, tweetText, done) => {
    const postData = JSON.stringify({
        documents: [
            {
                id: tweetId,
                text: tweetText
            }
        ]
    });
    const options = {
        hostname: 'northeurope.api.cognitive.microsoft.com',
        port: 443,
        method: 'POST',
        path: '/text/analytics/v2.0/sentiment',
        headers: {
            'Ocp-Apim-Subscription-Key': apiKey,
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };
    let request = https.request(options, (res) => {
         res.on('data', (data) => {
            done(res
                ? JSON.parse(data).documents.find(doc => doc.id === tweetId).score
                : -1);
            });
    });
    request.on('error', (e) => {
        done(-1);
    });
    request.write(postData);
    request.end();
}
const saveOutputDocument = (context, document, index) => {
    context.log(document);
    context.bindings.outputDocument = document;
    tryFinalize(context, index, index);
}

const tryFinalize = (context, currentIndex, totalCount) => {
    if (currentIndex === totalCount) {
        context.done();
    }
}

module.exports = (context, documents) => {
    if (!!documents && documents.length > 0) {
        context.bindings.outputDocuments = [];
        documents.map((document,index) => {
            if (!document.sentiment) {
                getSentimentScoreForTweet(document.id, document.tweet.TweetText, (tweetSentiment) => {
                    saveOutputDocument(context, {
                        id: document.id,
                        sentiment: tweetSentiment,
                        author: document.tweet.TweetedBy,
                        text: document.tweet.TweetText,
                        date: document.tweet.CreatedAtIso,
                        reach: document.tweet.UserDetails.FollowersCount
                    }, index);
                });
            }
        });
    }
}
