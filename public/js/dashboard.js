const cookies = new UniversalCookie();

if (!cookies.get('loggedin')) {
    cookies.set("error", "You need to be logged in to do that.");
    console.log(cookies.get('error'))
    location.replace('/');
}