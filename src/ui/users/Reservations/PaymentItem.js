import React from 'react';
import { DateFormat } from '../../utils/DateFormat'

export const PaymentItem = (props) => (
    <div className="d-flex align-items-center noti-link-wrapper">
        <div className="form-check">
            <input onChange={(e) => props.handleInputChange(e)} type="checkbox" className="form-check-input" />
            <label className="form-check-label" for="exampleCheck1"></label>
        </div>
        <a href="/#" className="noti-link d-flex">
            <div className="d-flex justify-content-between align-items-center flex-grow-1">
                <h3 className="mr-2">SOMME: 1500 FCFA</h3>
                    <h4 className="mr-2">Voyage pour Kribi</h4>
                    <span className="mr-2">Date: <DateFormat date={new Date()} /></span>
                <button className="btn btn-dark">Télécharger la facture</button>
            </div>
        </a>
    </div>
)
