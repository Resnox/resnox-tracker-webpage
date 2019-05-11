let parts = window.location.search.substr(1).split("&");
let $_GET = {};

for (let i = 0; i < parts.length; i++)
{
    let temp = parts[i].split("=");
    $_GET[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
}