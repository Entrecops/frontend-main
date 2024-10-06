import React from 'react';
import Loader from 'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"

const ReactLoader = (props) => (
    <div style={{height: "100vh", width: "100%", zIndex: "100"}} 
        className="d-flex align-items-center justify-content-center">
        <Loader
            type="Rings"
            color="#DC3545"
            height={200}
            width={200}
            timeout={1000} //3 secs

        />
    </div>
);

export default ReactLoader;