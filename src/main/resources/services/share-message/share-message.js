const util = require('/lib/util');
const facebook = require('/lib/util');
const linkedin = require('/lib/linkedin');
const twitter = require('/lib/twitter');

const logf = util.log;

exports.post = function (req) {

    if (req.body) {
        let body = JSON.parse(req.body);
        let message = body.message;
        if (message != undefined && message != "") {
            switch (body.platform) {
                case "twitter":
                    return twitter.sendMessage(message);
                case "linkedin": {
                    let repo = linkedin.getRepo();
                    let token = linkedin.getAccessToken(repo);
                    return linkedin.sendMessage(token, message);
                }
                case "facebook": {
                    let repo = facebook.getRepo();
                    let token = facebook.getAccessToken(repo);
                    return facebook.sendMessage(token, message);
                }
                default:
                    logf(`Share-messsage.js: No platform found with name: ${body.platform}`);
                    break;
            }
        }
        logf("Share-message.js: No message was included");
        return {
            status: 400,
        };
    }
    logf("Share-message.js: header malformed");
    return {
        status: 400,
    };
};