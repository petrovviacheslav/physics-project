import './App.css';

import Electro from "./components/electro/Electro";
import Footer from "./components/updown/Footer";
import Magnetic from "./components/magnetic/Magnetic";
import {HashRouter as Router, Route, Routes} from 'react-router-dom'
import Nav from "./components/nav/Nav";
import Header from "./components/updown/Header";


function App() {

    const createPage = (component) => {
        return (
            <div className="App">
                <Header/>
                <Nav/>
                <div className="main-container">
                    {component}
                </div>
                <Footer/>
            </div>
        )
    }

    // все стили для Magnetic, Electro в App.css, может их надо перенести?
    return (

        <Router>
            <Routes>
                <Route path="/magnetic" element={createPage(<Magnetic/>)}/>
                <Route path="/electro" element={createPage(<Electro/>)}/>
                <Route path="/electro-magnetic" element={createPage(<div>lol</div>)}/>
            </Routes>
        </Router>

    );
}

export default App;
