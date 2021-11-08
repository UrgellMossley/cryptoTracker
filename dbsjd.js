const fetchHistory = async (id) =>{
    const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=eur&days=90&interval=daily`
    const res =  await fetch(url)
    const data = await res.json()
    const normalised = data[`prices`].map(item=>item[1])
    return normalised
  
  }

  console.log(fetchHistory(item.coinId))
