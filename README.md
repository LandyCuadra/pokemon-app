# Basic Pokedex
_Basic pokedex operations (Synchronize, Add, Update, Get, Filter by Id, Name and Type) sourced from pokeapi.co_
## Required Installation
```
- Node.js V14.x^
- AWS Account Configured
```
## Try out this project local
```
git clone https://github.com/LandyCuadra/pokemon-app.git
```
```
cd pokemon-app
```
```
npm install
```
```
touch .env
```
## Enviroment File Example
```
POKEMON_TABLE_NAME=PokemonTable
AWS_REGION={YOUR_ACCOUNT_REGION_ID} //example us-east-1
AWS_KEY_ID={YOUR_ACCOUNT_KEY_ID}
AWS_SECRET={YOUR_ACCOUNT_SECRET}
MAX_POKEPROMISES=100 //recomended
MAX_DBBATCH=25 //maximum
```
```
npm run start
```

```
Server starts by in http://localhost:3000
for future reference {host} = http://localhost:3000
```

## Endpoints available

```
POST {host}/pokemon/sync
```
retrieve the initial data from pokeapi source to your dynamoDB instance in the table {POKEMON_TABLE_NAME} from .env file

* it creates the table {POKEMON_TABLE_NAME} if not created in your DynamoDB instace
* it overwrites every register from the source you have edited (do not affects the registers you have created)

```
POST {host}/pokemon

Body Example:
{
    "abilities": [
        {
            "isHidden": false,
            "name": "ability 1",
            "slot": 1
        },
        {
            "isHidden": false,
            "name": "ability 2",
            "slot": 2
        },
        {
            "isHidden": true,
            "name": "ability 3",
            "slot": 3
        }
    ],
    "baseExperience": 26,
    "height": 60,
    "name": "My super pokemon",
    "order": 657,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/228.png",
    "stats": [
        {
            "baseStat": 100,
            "effort": 0,
            "name": "hp"
        },
        {
            "baseStat": 100,
            "effort": 0,
            "name": "attack"
        },
        {
            "baseStat": 100,
            "effort": 0,
            "name": "defense"
        },
        {
            "baseStat": 100,
            "effort": 1,
            "name": "special-attack"
        },
        {
            "baseStat": 100,
            "effort": 0,
            "name": "special-defense"
        },
        {
            "baseStat": 100,
            "effort": 0,
            "name": "speed"
        }
    ],
    "types": [
        "dark",
        "fire"
    ],
    "weight": 108
}
```
Add a new record of pokemon to the pokemon table in dynamoDB

```
PUT {host}/pokemon/{id}

Body Example:
{
    "abilities": [
        {
            "isHidden": false,
            "name": "ability 1",
            "slot": 1
        },
        {
            "isHidden": false,
            "name": "ability 2",
            "slot": 2
        },
        {
            "isHidden": true,
            "name": "ability 3",
            "slot": 3
        }
    ],
    "baseExperience": 26,
    "height": 60,
    "name": "My super pokemon",
    "order": 657,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/228.png",
    "stats": [
        {
            "baseStat": 100,
            "effort": 0,
            "name": "hp"
        },
        {
            "baseStat": 100,
            "effort": 0,
            "name": "attack"
        },
        {
            "baseStat": 100,
            "effort": 0,
            "name": "defense"
        },
        {
            "baseStat": 100,
            "effort": 1,
            "name": "special-attack"
        },
        {
            "baseStat": 100,
            "effort": 0,
            "name": "special-defense"
        },
        {
            "baseStat": 100,
            "effort": 0,
            "name": "speed"
        }
    ],
    "types": [
        "dark",
        "fire"
    ],
    "weight": 108
}
```
Edit fields for a record of pokemon that already exists in your dinamoDB
* you can send partially the fields of the example to update only those fields
* the data updated will be overwriten by the synchronization operation for records pre-loaded from pokeapi source (this will not affect the records created by you with the creation endpoint)

```
GET {host}/pokemon
optional params: 
limit: 10 //default 50
lastKey: '{ID}'
```
retrieve a paginated set of records from the id or pokemon name provided with limited fields

```
GET {host}/pokemon/type/{type}
```
retrieve a record a set of records based on the pokemons type with limited fields

```
GET {host}/pokemon/{id||name}
```
retrieve a record base on its id o name with the full detailed of information'

**Pending
* validate query and body fields with nest js class validator
* consider using dynamoose for schema validation and make easier db request
* add a functional serverless and aws lambda configuration
* add testing scripts to ensure the correct backend functionality and ensure error handling 
