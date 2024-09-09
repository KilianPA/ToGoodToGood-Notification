# ToGoodToGo (Working 09/24)

[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2FKilianPA%2FToGoodToGood-Notification&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false)](https://hits.seeyoufarm.com)

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
