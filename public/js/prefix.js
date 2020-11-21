const cookies = new UniversalCookie();

if (!cookies.get('loggedin')) {
    cookies.set("error", "You need to be logged in to do that.", {maxAge: 2, path: "/"});
    location.replace('/');
}

if(!cookies.get('isAdmin')) {
    cookies.set("error", "You are not admin on that server!", {maxAge: 2, path: "/"});
    location.replace('/dashboard/choose-server.html');
}

var guildPrefix = {
    data() {
        return {
            prefix: null,
            prefixUpdate: null,
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
        fetch(`/api/database/prefix?token=${cookies.get('dbToken')}&guildid=${cookies.get('guildID')}`, {
            method: "GET"
        }).then(response => response.json()).then((apiResponse) => {
            console.log(apiResponse)
            if (apiResponse.code === 404) {
                this.prefix = "You do not currently have a custom prefix set on that server!"
            } else if (apiResponse.code === 401) {
                this.messageText = 'Sorry, you are not authorized to do that. Please try logging in again <a href="/api/discord/login"> here. </a>'
                this.message = true;
                this.viewUpdate = false;
            } else {
                this.prefix = `Your prefix is currently set to: "${apiResponse.prefix}"`;
            }
        })
    },
    methods: {
        updatePrefix() {
            fetch(`/api/database/prefixUpdate?token=${cookies.get('dbToken')}&guildid=${cookies.get('guildID')}&prefix=${this.prefixUpdate}&userid=${cookies.get('userID')}`, {
                method: 'GET'
            }).then(response => response.json()).then((apiResponse) => {
                if (apiResponse.code === 404){
                    this.messageText = "Sorry, an error has occured please try again later."
                    this.message = true;
                    setTimeout(() => {
                        this.message = false;
                        this.messageText = null;
                        this.usernameUpdate = null;
                    }, 3000)
                } else if (apiResponse.code === 401) {
                    this.messageText = 'Sorry, you are not authorized to do that. Please try logging in again <a href="/api/discord/login"> here. </a>'
                    this.message = true;
                    this.viewUpdate = false;
                } else {
                    this.messageText = `Successfully updated your prefix to "${this.prefixUpdate}"!`
                    this.message = true;
                    this.prefix = `Your prefix is currently set to: "${this.prefixUpdate}"`;
                    setTimeout(() => {
                        this.message = false;
                        this.messageText = null;
                        this.prefixUpdate = null;
                    }, 3000)
                }
            });
        }
    }
}

Vue.createApp(guildPrefix).mount('#prefix');

const header = {
    data() {
        return {
            username: cookies.get('username'),
            imgURL: cookies.get('imgurl'),
            guildName: cookies.get('guildName')
        }
    }
};

Vue.createApp(header).mount("#header")