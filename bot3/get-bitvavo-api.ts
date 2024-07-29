export function getBitvavoApi() {
  const bitvavo = require('bitvavo')().options({
    APIKEY: process.env.APIKEY,
    APISECRET: process.env.APISECRET,
    ACCESSWINDOW: 10000,
    RESTURL: 'https://api.bitvavo.com/v2',
    WSURL: 'wss://ws.bitvavo.com/v2/',
    DEBUGGING: false
  })

  return bitvavo;
}
