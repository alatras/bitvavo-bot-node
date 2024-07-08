# Bitvavo Node Bot
- Based on sentiment strategy calculated from bid and ask volumes within a specified price range.

## How it works
- It fetches the book.
- It calculates the volume of `bid` and `ask` within the needed rance (default 8%).
- It calculates `bid volume percentage` and the `market sentiment` based on it. The later is scaled from 0-100%.
- It concludes signals based on the above two keys. Generally: if `market sentiment` is above a certain threshold (e.g. 60%), buy. If not, sell.

## How to run
- Create an `.env` out of `.env.example`
- API key and secret are a must in `.env`
- Edit the other variables to suit the range and the thresholds you want.
- Run:
```sh
npm start
```
- No production run/build yet.

## Analysis
- The analysis log comes under each transaction.
- The factor `Guess Ratio` is the main gauge based on which to optimize and refine.
- Read `calculateGuessRatio` to check how the ratio is calculated.
  
## Notes
- The `.evn` file is the controller and its comments are the observer notes. Refer to them to understand more.