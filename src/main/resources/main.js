const repoLib = require("/lib/xp/repo");
const node = require("/lib/xp/node");
const contextLib = require('/lib/xp/context');

//Created the shareit repo and state node
(function start() {

    contextLib.run({
        reposity: "com.enonic.app.shareit",
        branch: 'master',
        user: {
            login: 'su',
            idProvider: 'system',
        },
        principal: ['role:system.admin'],
    }, createRepo);

    function createRepo() {
        if (repoLib.get('com.enonic.app.shareit')) {
            return;
        }

        repoLib.create({
            id: 'com.enonic.app.shareit',
            rootPermissions: [{
                principal: "role:admin",
                allow: [
                    "READ",
                    "CREATE",
                    "MODIFY",
                    "DELETE",
                    "PUBLISH",
                    "READ_PERMISSIONS",
                    "WRITE_PERMISSIONS"
                ],
                deny: [],
            }]
        });

        let connection = node.connect({
            repoId: 'com.enonic.app.shareit',
            branch: 'master',
        });

        //linkedin storrage
        connection.create({
            _name: "linkedin",
            _parentPath: "/",
        });
        
        connection.create({
            _name: "facebook",
            _parentPath: "/",
        });
    }
})();