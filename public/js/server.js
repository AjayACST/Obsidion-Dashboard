const cookies = new UniversalCookie();

if (!cookies.get('loggedin')) {
    cookies.set("error", "You need to be logged in to do that.", {maxAge: 2, path: "/"});
    location.replace('/');
}

if(!cookies.get('isAdmin')) {
    cookies.set("error", "You are not admin on that server!", {maxAge: 2, path: "/"});
    location.replace('/dashboard/choose-server.html');
}

var guildServer = {
    data() {
        return {
            server: null,
            serverUpdate: null,
            messageText: null,
            message: false,
            viewUpdate: true
        }
    },
    mounted() {
        fetch(`/api/database/discordGuild?token=${cookies.get('dbToken')}&guildid=${cookies.get('guildID')}`, {
            method: "GET",
        }).then(response => response.json()).then((apiResponse) => {
            if (apiResponse.message === 'Bot is not in that guild.') {
                this.messageText = 'Sorry that is not a server that Obsidion is in. Please choose a new server <a href="/dashboard/choose-server.html">here.</a>'
                this.message = true
                this.viewUpdate = false;
            }
        })
        fetch(`/api/database/server?token=${cookies.get('dbToken')}&guildid=${cookies.get('guildID')}`, {
            method: "GET"
        }).then(response => response.json()).then((apiResponse) => {
            console.log(apiResponse)
            if (apiResponse.code === 404) {
                this.server = "You do not currently have a linked server on that server! You can set one below."
            } else if (apiResponse.code === 401) {
                this.messageText = 'Sorry, you are not authorized to do that. Please try logging in again <a href="/api/discord/login"> here. </a>'
                this.message = true;
                this.viewUpdate = false;
            } else {
                this.server = `Your server is currently linked to: "${apiResponse.server}"`;
            }
        })
    },
    methods: {  
        updateServer() {
            if (this.serverUpdate === null) {
                this.messageText = 'The new linked server cannot be empty!';
                this.message = true;
                setTimeout(() => {
                    this.message = false;
                    this.messageText = null;
                    this.serverUpdate = null;
                    return;
                }, 3000)
            } else {
                fetch(`/api/database/serverUpdate?token=${cookies.get('dbToken')}&guildid=${cookies.get('guildID')}&server=${this.serverUpdate}`, {
                    method: 'GET'
                }).then(response => response.json()).then((apiResponse) => {
                    if (apiResponse.code === 404){
                        this.messageText = "Sorry, an error has occured please try again later."
                        this.message = true;
                        setTimeout(() => {
                            this.message = false;
                            this.messageText = null;
                            this.serverUpdate = null;
                        }, 3000)
                    } else if (apiResponse.code === 401) {
                        this.messageText = 'Sorry, you are not authorized to do that. Please try logging in again <a href="/api/discord/login"> here. </a>'
                        this.message = true;
                        this.viewUpdate = false;
                    } else {
                        if (this.serverUpdate === null) {
                            this.messageText = 'The new server cannot be empty!'
                        }
                        this.messageText = `Successfully updated your linked server to "${this.serverUpdate}"!`
                        this.message = true;
                        this.server = `Your server is currently linked to: "${this.serverUpdate}"`;
                        setTimeout(() => {
                            this.message = false;
                            this.messageText = null;
                            this.serverUpdate = null;
                        }, 3000)
                    }
                });
            }
            
        }
    }
}

Vue.createApp(guildServer).mount('#server');

const header = {
    data() {
        return {
            username: cookies.get('username'),
            imgURL: cookies.get('imgurl'),
            guildName: cookies.get('guildName'),
            guildIcon: cookies.get('guildIcon')
        }
    }
};

Vue.createApp(header).mount("#header")