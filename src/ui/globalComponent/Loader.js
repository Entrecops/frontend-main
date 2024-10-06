import React from 'react';

const Loader = (props) => (
    <div className="spinner-border" role="status" style={{color: props.color}}>
        <span className="sr-only">Loading...</span>
    </div>
);

export default Loader;