const cookies = new UniversalCookie();

          var token = cookies.get('token');

          const discordLogin = {
            data() {
              return {
                notlogin: true
              }
            },
            mounted() {
              if (cookies.get("loggedin")) {
                this.notlogin = false
              }
            }
          };
          Vue.createApp(discordLogin).mount("#discord-login");

          const header = {
            data() {
              return {
                username: "Please login",
                imgURL: "",
                loggedin: false
              }
            },
            mounted() {
                if (!token) {
                    return;
                }
              if (cookies.get("username")) {
                  this.username = cookies.get("username");
                  this.imgURL = cookies.get("imgurl")
                  this.loggedin = true
                  return;
              }
              fetch('https://discord.com/api/v6/users/@me', {
                method: "GET",
                headers: {
                  "Authorization": `Bearer ${token}`
                }
              }).then(response => response.json()).then((discordResponse) => {
                if (discordResponse.message === "401: Unauthorized") {
                  this.username = "Please login";
                  this.imgURL = "";
                  this.loggedin = false;
                } else {
                  this.username = discordResponse.username;
                  this.imgURL = `https://cdn.discordapp.com/avatars/${discordResponse.id}/${discordResponse.avatar}.png`;
                  this.loggedin = true;
                  cookies.set("username", discordResponse.username, {maxAge: 604800});
                  cookies.set("imgurl", `https://cdn.discordapp.com/avatars/${discordResponse.id}/${discordResponse.avatar}.png`, {maxAge: 604800});
                  cookies.set("userID", discordResponse.id, {maxAge: 604800});
                }
                
              })
            }
          };

          Vue.createApp(header).mount("#header");

          const error = {
              data() {
                  return {
                      error: null,
                      errorView: false
                  }
              },
              mounted() {
                    if(cookies.get('error')) {
                    this.error = cookies.get('error');
                    this.errorView = true;
                }
              }
          }

          Vue.createApp(error).mount('#error')