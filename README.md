# lol-query


# About

porting live-match and user-stats data from op.gg, likely a wise choice for interacting with discord bot

## Usage
```javascript
const lolQuery = require('lol-query');

lolQuery.getStats('1ncredibad', 'na', false).
    then(stats => console.log(stats))      
    
lolQuery.getLiveMatch('1ncredibad', 'na').
    then(liveMatch => console.log(liveMatch))   
```


```javascript
// Output
{
  Name: '1ncredibad',
  Level: '259',
  RecurrentWins: '7',
  RecurrentLoses: '13',
  Rank: 'Gold 2',
  KDARatio: '2.01:1',
  RankedLP: '21 LP ',
  WinRate: '35%',
  MainLane: 'ADC',
  MainChampion: 'Jhin',
  LastTimeOnline: '16 hours ago'
}
```

## Paramaters
getStats(username: string, region: string, refresh: boolean)
getLiveMatch(username: string, region: string)


## Regions

na kr oce jp euw eune lan br las ru tr


