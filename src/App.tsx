
import ghostLogo from '/assets/icon02.png'
import './App.css'

function App() {
  const onClick = async () => {
    const [tab] = await chrome.tabs.query({ active: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: () => {
        alert('Ghost Hunter is Activated')
      },
      
    })
  }

  return (
    <>
      <div>
        <a href="" target="_blank">
          <img src={ghostLogo} className="logo" alt="GhostHunter logo" />
        </a>
        
      </div>
      <h1>Ghost Hunter</h1>
      <div className="card">
        <button onClick={() => onClick()}>
          Activate Extention
        </button>
        <p>
          Click <code>Activate Extention</code> to start using Ghost Hunter
        </p>
      </div>
      <p className="read-the-docs">
      A browser extension designed to help job seekers identify and track ghost job postings.
      </p>
    </>
  )
}

export default App
