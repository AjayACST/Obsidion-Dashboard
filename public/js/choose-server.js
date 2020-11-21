const cookies = new UniversalCookie();


if (!cookies.get('loggedin')) {
    cookies.set("error", "You need to be logged in to do that.", {maxAge: 2, path: "/"});
    location.replace('/');
}


var chooseGuild = {
    data() {
        return {
            server: 'Loading',
            guilds: [
                { text: 'Loading', value: 'Loading'}
            ],
            message: false,
            messageText: null
        }
    },
    mounted() {
        if(cookies.get('error')) {
            this.messageText = cookies.get('error');
            this.message = true;
            setTimeout(() => {
                this.message = false;
                this.messageText = null;
            }, 5000)
        }
        fetch('https://discord.com/api/v6/users/@me/guilds', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${cookies.get('token')}`
            }
        }).then(response => response.json()).then((discordResponse) => {
            guilds = []
            for (var i = 0; i < discordResponse.length; i++) {
                guilds.push({text: discordResponse[i].name, value: `${discordResponse[i].id}&${discordResponse[i].permissions}&${discordResponse[i].name}`})
            }
            this.guilds = guilds;
            this.server = `${discordResponse[0].id}&${discordResponse[0].permissions}&${discordResponse[0].name}`;
        })
    },
    methods: {
        selectGuild() {
            var split = this.server.split('&');
            var guildID = split[0];
            var permissions = split[1];
            var name = split[2];
            fetch(`https://api.obsidion-dev.com/api/v1/permissions?permission=${permissions}`, {
                method: "GET",
                headers: {
                    "Access-Control-Allow-Origin": "localhost:50451"
                }
            }).then(response => response.json()).then(apiResponse => {
                var isAdmin = apiResponse.permissions[3][1]
                if (isAdmin) {
                    cookies.set('guildID', guildID, {
                        maxAge: 604800000,
                        httpOnly: false,
                        path: "/"
                    });
                cookies.set('isAdmin', true, {
                    maxAge: 604800000,
                    httpOnly: false,
                    path: "/"
                });
                cookies.set('guildName', name, {
                    maxAge: 604800000,
                    httpOnly: false,
                    path: "/"
                });
                location.replace('/dashboard/prefix.html');
                } else if(!isAdmin) {
                    this.messageText = "Sorry you are not an administrator on that server. Please select a server you have admin rights to.";
                    this.message = true;
                    setTimeout(() => {
                        this.message = false;
                        this.messageText = null;
                    }, 5000)
                }
            })
        }
    }
}

Vue.createApp(chooseGuild).mount('#server')

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