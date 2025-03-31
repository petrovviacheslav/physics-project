import './nav.css'

const Nav = () => {
    return (
        <nav id={"navbar"} className={"navbar"}>
            <ul className="navbar-links">
                <li><a href="/physics-project/#/electro">Electro</a></li>
                <li><a href="/physics-project/#/magnetic">Magnetic</a></li>
                {/*<li><a href="/physics-project/#/electro-magnetic">Electro-Magnetic</a></li>*/}
            </ul>
        </nav>

    );
}

export default Nav;