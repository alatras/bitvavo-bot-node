# Bitvavo Node Bot
- Based on sentiment strategy calculated from bid and ask volumes within a specified price range.
- API key and secret are needed in .env 

## How it works
1- Fetch the book.
2- Calculate the volume of `bid` and `ask` within the needed rance (default 8%).
3- Calculate `bid volume percentage` and the `market sentiment` based on it. The later is scaled from 0-100%.
4- Conclude signals based on the above two keys. Generally: if `market sentiment` is above a certain threshold (e.g. 60%), buy. If not, sell.
