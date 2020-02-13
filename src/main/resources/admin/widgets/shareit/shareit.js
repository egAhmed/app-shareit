//var contentLib = require('lib/xpcontent');
const portal = require('/lib/xp/portal');
const thymleaf = require('/lib/thymeleaf');
const context = require('/lib/xp/context');
const libContent = require('/lib/xp/content');
const linkedinLib = require('/lib/linkedin');
const shareTool = require('/lib/share-tool');

const view = resolve('shareit.html');

exports.get = function (req) {
    let content = getContentId(req);
    if (content == null) return errorMessage("No content selected");

    //content selected in CS
    let siteConfig = libContent.getSiteConfig({
        key: content._id,
        applicationKey: app.name
    });

    if (!siteConfig.domain) return errorMessage("App not configured for this site");

    //Check for config file
    if (app.config && Object.keys(app.config).length === 0) {
        return errorMessage("Missing configuration file, application not enabled");
    }

    var published;

    //Check if its published
    context.run({ branch: "master" }, () => {
        published = libContent.exists({ key: content._id });
    });

    if (published == false) {
        return errorMessage("Item not published");
    }

    let site = libContent.getSite({ key: content._id });
    let pathAppend = content._path.replace(site._path, "");

    //prepend siteconfig.domain
    let url = siteConfig.domain + '' + pathAppend;


    let sharingService = portal.serviceUrl({
        service: "share-message",
        type: "absolute"
    });

    let model = {
        //content to share/post
        url,
        name: content.displayName,

        //stylesheets
        stylesheet: portal.assetUrl({ path: "styles/main.css" }),

        //Linkedin authorize url
        linkedin: createLinkedinModel(),

        //images
        twitterLogoUrl: portal.assetUrl({ path: "images/TwitterWhite.svg" }),

        //service
        serviceUrl: sharingService,

        //Scripts
        communication: portal.assetUrl({ path: "script/communication.js" }),
    };

    return {
        contentType: 'text/html',
        body: thymleaf.render(view, model),
    };
};

function errorMessage(message) {
    return {
        contentType: 'text/html',
        body: `<widget class="error">${message}</widget>`
    };
}

// Creates all thymeleaf variables for linkedin
function createLinkedinModel() {
    let authService = portal.serviceUrl({
        service: "linkedin-authorize",
        type: "absolute",
    });

    let redirect = encodeURIComponent(authService);
    let randomString = shareTool.genRandomString(30);
    linkedinLib.saveState();
    
    let scope = encodeURIComponent("w_member_social"); //r_liteprofile

    let authpage = shareTool.createUrl(
        "https://www.linkedin.com/oauth/v2/authorization",
        [
            { key: "response", value: "code" },
            { key: "client_id", value: app.config['linkedin.client_id'] },
            { key: "redirect_uri", value: redirect },
            { key: "state", value: randomString },
            { key: "scope", value: scope }
        ]
    );

    return {
        authpage: authpage,
    };
}

function getContentId(req) {
    let current = portal.getContent();
    let contentId = req.params.contentId;
    //Set current if its missing from params
    if (!contentId && current) {
        contentId = current._id;
    }

    //Still missing? Nothing selected
    if (!contentId) {
        return null;
    }

    if (!current) {
        current = libContent.get({ key: contentId });
    }

    return current;
}