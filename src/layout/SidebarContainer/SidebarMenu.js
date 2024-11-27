import { useState } from "react"
import { Link } from "react-router-dom";

function SidebarMenu({title, submenu, path, label}) {
    const [isSubmenuOpen, setSubmenuOpen] = useState(false);
    
    //If Submenu exists, render Collapsible menu
    if (submenu){
        return (
            <li className={isSubmenuOpen ? 'active' : ''}>
          <Link
            to="#"
            onClick={() => setSubmenuOpen(!isSubmenuOpen)}
            className="dropdown-toggle"
            aria-expanded = {isSubmenuOpen}
          >
            {title}
          </Link>
          <ul className={`collapse list-unstyled small-font ${isSubmenuOpen ? 'show' : ''}`} id="homeSubmenu">
            {submenu.map((item, index) => <li key={index}><Link to={item.path}>{item.label}</Link></li> )}
            

          </ul>
        </li>
        )
    }
    return (
        <li><Link to={path}>{label}</Link></li>
    )
}

export default SidebarMenu
