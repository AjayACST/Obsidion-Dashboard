const cookies = new UniversalCookie();

var accountUsername = {
    data() {
        return {
            username: null,
            usernameUpdate: null,
            messageText: null,
            message: false
        }
    },
    mounted() {
        fetch(`/api/database/account?token=${cookies.get('dbToken')}&id=${cookies.get('userID')}`, {
            method: "GET"
        }).then(response => response.json()).then((apiResponse) => {
            if (apiResponse.code === 404) {
                this.messageText = "You have not linked your account before."
                    this.message = true;
                    setTimeout(() => {
                        this.message = false;
                        this.messageText = null;
                        this.usernameUpdate = null;
                    }, 5000)
            } else if (apiResponse.code === 401) {
                this.messageText = "Sorry, you are not authorized to do that."
                    this.message = true;
                    setTimeout(() => {
                        this.message = false;
                        this.messageText = null;
                        this.usernameUpdate = null;
                    }, 3000)
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
                    this.messageText = "Sorry, you are not authorized to do that."
                    this.message = true;
                    setTimeout(() => {
                        this.message = false;
                        this.messageText = null;
                        this.usernameUpdate = null;
                    }, 3000)
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
