const cookies = new UniversalCookie();

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