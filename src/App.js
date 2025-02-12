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
    return (

        <Router>
            <Routes>
                <Route path="/magnetic" element={createPage(<Magnetic/>)}/>
                <Route path="/electro" element={createPage(<Electro/>)}/>
                <Route path="/electro-magnetic" element={createPage(<div>lol</div>)}/>
                <Route path="/" element={<ul>
                    <li>Что происходит с точкой в магнитном поле, у которой вектор скорости и магнитной индукции
                        сонаправлены?
                    </li>
                    <li>Что происходит с каждым полем, если скорость = 0?</li>
                    <li>Возможно сделать в электрическом поле до 3 зарядов? как тогда будет считаться траектория из за меняющейся силы? (использование закона кулона)</li>
                    <li>Может плавно отрисовывать траекторию с течением времени через animate?</li>
                </ul>}/>
            </Routes>
        </Router>

    );
}

export default App;
