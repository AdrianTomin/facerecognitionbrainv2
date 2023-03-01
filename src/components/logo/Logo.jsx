import React from "react";
import './Logo.css';
import brain from './logo.png';

const Logo = () => {
    return (
        <div className="ma4 mt0">
            <div className="br2 shadow-2 tilt pa3">
                <img style={{paddingTop: '5px'}} src={brain} alt="Logo" />
            </div>
        </div>
    );
}

export default Logo;