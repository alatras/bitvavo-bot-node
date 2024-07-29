# Bitvavo Node Bot
- Based on sentiment strategy calculated from bid and ask volumes within a specified price range.

## How it works - the strategy
- It fetches the book including bids and asks.
- It calculates the volume of `bid` and `ask` within the needed rance (default 8%).
- It calculates `bid volume percentage` and the `market sentiment` based on it. The later is scaled from 0-100%.
- It concludes signals based on the above two keys. Generally: if `market sentiment` is above a certain threshold (e.g. 60%), buy. If not, sell.

## How to run
- Create an `.env` out of `.env.example` 
- API key and secret are a must in `.env`
- Edit the other variables to suit the range and the thresholds you want.
- Run it in dev mode with:
```sh
npm start
```
- No production run/build yet.

## Analysis
- A log of analysis comes under each transaction in console.
- In logs, the factor `Guess Ratio` is the main gauge based on which to optimize and refine.
- In code, read `calculateGuessRatio` to check how the ratio is calculated.
  
## Notes
- **The file `.env` is control panel for tuning.**
- **The `.evn` comments are the observer notes. Refer to them to understand more.**
- **Bot2 and Bot3 are different bots that may share `node_modules` with the main bot. Don't put the main bot in a folder.s**