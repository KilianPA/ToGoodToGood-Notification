# ToGoodToGo (WIP)

Nodejs client to watch when basket is available :

# Installation

- Clone project
- Setup database tables
- Setup .env :

```
TELEGRAM_TOKEN= 
TELEGRAM_IDS=[]
MYSQL_HOST= 
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=
```

Start index.js

Use listener.js to add account and setup auth with pinCode

Command available for you telegram Bot

```
/start <email> // Create account
/code <email> <code> // To set pinCode
```

The bot will start authentification with TooGoodToGo api and ask you to enter de "pinCode". The pinCode is send to you by email


<img width="527" alt="Capture d’écran 2023-09-06 à 13 53 05" src="https://github.com/KilianPA/ToGoodToGo/assets/31858257/43bbfc30-5bb3-4847-8a3d-845340a0b1b9">

Bot is configured to check only your favorites items, last packages available and send message to Telegram if available.

Contact kpas01@icloud.com
