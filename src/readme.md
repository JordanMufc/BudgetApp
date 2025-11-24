## Installation : Prérequis

Posséder Nodejs
Posséder MysqlServer
Posséder Dbeaver ou autre programme Sql

## Commandes à taper

Dans le terminal du dossier lancer commande : npm install

## Niveau Sql

1. Copier le fichier script.sql et éxecuter le script dans Dbeaver ou programme au choix.
2. Dans le fichier .env indiqué le bon chemin vers la DATABASE (normalement juste remplacer l'utilisateur et le mot de passe) + vérifier si c'est bien le bon port sur votre machine.

## Lancer le programme

Taper la commande : npm run start

## Useful commands

### vs code extension

version lens

### packages

npm install @prisma/client
npm install @prisma/adapter-mariadb

### scaffold

npx prisma db pull --schema ./.BudgetApp/src/main/repositories/prisma/schema.prisma

### generate client

npx prisma generate --schema ./.BudgetApp/src/main/repositories/prisma/schema.prisma
