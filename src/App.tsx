
import Pagos from './components/Pagos'

function App() {

  return (
    <div className="app">
      <h1>Pagos App</h1>
      <Pagos total={1500} moneda="USD" />
    </div>
   
  )
}

export default App
