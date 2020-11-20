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
                //do stuff here
            } else if (apiResponse.code === 401) {
                //do stuff here
            } else {
                this.username = apiResponse.username;
            }
        })
    },
    methods: {
        updateUsername() {
            fetch(`/api/database/accountUpdate?token=${cookies.get('dbToken')}&id=${cookies.get('userID')}&username=${this.usernameUpdate}`, {
                method: 'GET'
            }).then(response => response.json()).then((apiResponse) => {
                if (apiResponse.code === 404){
                    //do stuff here
                } else if (apiResponse.code === 401) {
                    //do stuff here
                } else {
                    this.messageText = `Successfully updated your linked account to ${this.usernameUpdate}!`
                    this.message = true;
                    this.username = this.usernameUpdate
                    setTimeout(() => {
                        this.message = false;
                        this.messageText = null;
                        this.usernameUpdate = null;
                    }, 5000)
                }
            });
        }
    }
}

Vue.createApp(accountUsername).mount('#account');
