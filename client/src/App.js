import React,{useState, useRef} from 'react';
import './App.css';

function App() {
  const Item = useRef()
  const [Value, setValue] = useState('null')
  const [Image, setImage] = useState()
  const [cPrice, setCprice] = useState('null')
  const [test, setTest] = useState('none')

  function TestPost(){
    setTest('starting test post')
    fetch(`/tpost`, {
          method: 'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            message: 'It works'
          })
      })
    setTest('ended test post')
  }

  async function TestGet(){
    setTest('starting test get')
    const R = await fetch('/tget')
    const D = await R.json()
    setTest(D)
  }

  async function FetchTest(){
    setTest('starting')
    const Res = await fetch('/test')
    const Data = await Res.json()
    setTest(Data)
  }

  async function sendData(){
    if(Item.current.value === '') return
    setValue('loading results...')
    setCprice('loading results...')
    setImage(null)
      fetch(`/post`, {
          method: 'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            Item : Item.current.value
          })
      })
      const response = await fetch(`/scrape`)
      const data = await response.json()
      setValue(data.average)
      setImage(data.image)
      setCprice(data.cheapestPrice)
  }

  return (
    <div>
      <h1>Search for an Item on Amazon and find its average price</h1>
      <div className='inputs'>
        <div>
          <input className="txtBar" type='text' placeholder="search for a item" ref={Item}/>
          <button className="btn" onClick={sendData}>Search</button>
        </div>
      </div>
      <div className='inputs'>
        <div>
        <img className='image' src={`${Image}`} alt='ScrapedImage'/>
        <p className='result'>Average price of Amazon item: {Value}</p>
        <p className='result'> Cheapest price for item: {cPrice}</p>
        </div>
      </div>
      <p>{test}</p>
      <button onClick={FetchTest}> Test </button>
      <button onClick={TestPost}> Test Post </button>
      <button onClick={TestGet}> Test Get </button>
    </div>
  )
}

export default App;
