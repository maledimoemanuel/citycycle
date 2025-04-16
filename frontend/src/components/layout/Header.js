import React from 'react'

function Header() {
  return (
    <nav className='navbar'>
        <link className='logo'>
            <a href='/'>🚴‍♂️</a>
        </link>
        <ul className='nav-links'>
            <li><a href='/'>Home</a></li>
            <li><a href='/bikelist'>Bike List</a></li>
            <li><a href='/admin'>About</a></li>
        </ul>
    </nav>
  )
}

export default Header