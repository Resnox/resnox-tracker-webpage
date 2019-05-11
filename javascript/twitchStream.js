const streamHeight = 720;
if($_GET['stream'] !== undefined)
{
    document.getElementById('stream-viewer').style.display = "block";

    new Twitch.Player("twitch-embed", {
        width: "80%",
        height: streamHeight,
        theme: 'dark',
        channel: $_GET['stream'],
        autoplay: false
    });

    let chat = document.getElementById("twitch-embed");

    let frame_e = document.createElement("iframe");
    frame_e.setAttribute('class', 'float-right');
    frame_e.setAttribute('frameborder', 0);
    frame_e.setAttribute('scrolling', "yes");
    frame_e.setAttribute('id', $_GET['stream']);
    frame_e.setAttribute('src', "https://www.twitch.tv/embed/" + $_GET['stream'] + "/chat?darkpopout");
    frame_e.setAttribute('width', "20%");
    frame_e.setAttribute('theme', "dark");
    frame_e.setAttribute('height', streamHeight);

    chat.appendChild(frame_e);
}
