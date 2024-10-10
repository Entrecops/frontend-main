import React, { Component } from 'react';
import './NotFound.scss';

class NotFound extends Component {

    render() {
        return (
            <div className="errorpage">
                <div id="clouds">
                    <div className="cloud x1"></div>
                    <div className="cloud x1_5"></div>
                    <div className="cloud x2"></div>
                    <div className="cloud x3"></div>
                    <div className="cloud x4"></div>
                    <div className="cloud x5"></div>
                </div>
                <div className='c'>
                    <div className='_404'>404</div>
                    <hr />
                        <div className='_1 mt-5'>LA PAGE QUE VOUS RECHERCHEZ</div>
                        <div className='_2 mt-4'>EST INTROUVABLE</div>
                        <a className='btn btn-danger errorbtn btn-lg mt-5' href='/'>RETOUREZ A LA PAGE D'ACCUEIL</a>
                </div>
            </div>
        )
    }
}

export default NotFound;