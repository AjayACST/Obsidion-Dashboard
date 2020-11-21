const cookies = new UniversalCookie();

if (!cookies.get('loggedin')) {
    cookies.set("error", "You need to be logged in to do that.", {maxAge: 2, path: "/"});
    location.replace('/');
}

var accountUsername = {
    data() {
        return {
            username: null,
            usernameUpdate: null,
            messageText: null,
            message: false,
            viewUpdate: true
        }
    },
    mounted() {
        fetch(`/api/database/account?token=${cookies.get('dbToken')}&id=${cookies.get('userID')}`, {
            method: "GET"
        }).then(response => response.json()).then((apiResponse) => {
            if (apiResponse.code === 404) {
                this.username = 'You have not yet linked your account to a Minecraft username.'
            } else if (apiResponse.code === 401) {
                this.messageText = 'Sorry, you are not authorized to do that. Please try logging in again <a href="/api/discord/login"> here. </a>'
                    this.message = true;
                    this.viewUpdate = false;
            } else {
                this.username = `Your account is currently linked to: ${apiResponse.username}`;
            }
        })
    },
    methods: {
        updateUsername() {
            fetch(`/api/database/accountUpdate?token=${cookies.get('dbToken')}&id=${cookies.get('userID')}&username=${this.usernameUpdate}`, {
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
                    this.messageText = `Successfully updated your linked account to ${this.usernameUpdate}!`
                    this.message = true;
                    this.username = `Your account is currently linked to: ${this.usernameUpdate}`;
                    setTimeout(() => {
                        this.message = false;
                        this.messageText = null;
                        this.usernameUpdate = null;
                    }, 3000)
                }
            });
        }
    }
}

Vue.createApp(accountUsername).mount('#account');


if (!cookies.get('loggedin')) {
    cookies.set("error", "You need to be logged in to do that.", {maxAge: 2, path: "/"});
    console.log(cookies.get('error'))
    location.replace('/');
}

const header = {
    data() {
        return {
            username: cookies.get('username'),
            imgURL: cookies.get('imgurl')
        }
    }
};

Vue.createApp(header).mount("#header")
