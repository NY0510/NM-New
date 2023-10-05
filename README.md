<center><a href="https://github.com/NY0510/NM-New"><img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=NM%&fontSize=65&fontAlignY=35&animation=twinkling&fontColor=b8b8b8" /></a></center>

# NM, Lavalink Discord Music Bot (New Version, Under Development)

<p align="center">
  <a href="https://github.com/NY0510/NM-New">
    <img src="" alt="Screenshot"  height="300">
  </a>

## Installation Guide

### Requirements

-   [Node.js](https://nodejs.org/) v16.6.0 or newer
-   [Java 16](https://adoptium.net/?variant=openjdk16&jvmVariant=hotspot) or newer
-   [Lavalink](https://github.com/freyacodes/Lavalink/releases/latest) v4.0 or newer

### Setup

1.  Clone the repository

```sh
git clone https://github.com/NY0510/NM.git
```

2.  Install dependencies

```sh
npm install
```

### Configuration

Copy `config.example.json` to `config.json` and fill out the values:

-   `token` - Your bot's token
-   `clientId` - Your bot's client ID
-   `devGuild` - Your bot's development guild ID
-   `ownerId` - Your Discord user ID
-   `viewServerListAtStart` - Whether to view the server list at start
-   `color`
    -   `normal` - The color of the embeds
    -   `error` - The color of the error embeds
-   `lavalink`
    -   `host` - The host of the Lavalink server
    -   `port` - The port of the Lavalink server
    -   `secure` - Whether the Lavalink server is secure
    -   `password` - The password of the Lavalink server
-   `logging`
    -   `command` - Whether to log commands
    -   `button` - Whether to log button clicks

### Running

1.  Run Lavalink

```sh
java -jar Lavalink.jar
```

2.  Run the bot

```sh
`node .` or `npm start`
```
