import React from 'react';
import { DateFormat } from '../../utils/DateFormat'

export const ReservationItem = (props) => (
    <div className="d-flex align-items-center noti-link-wrapper">
        <div className="form-check">
            <input onChange={(e) => props.handleInputChange(e)} type="checkbox" value={JSON.stringify(props.notification)} className="form-check-input" />
            <label className="form-check-label" for="exampleCheck1"></label>
        </div>
        <a href={props.notification.link} className={props.notification.visited ? "noti-link d-flex" : "noti-link d-flex notvisited"}>
            <img src={props.notification.image} className="rounded-circle img-fluid" alt="" />
            <div className="d-flex d-flex justify-content-between flex-grow-1">
                <div className="mr-auto">
                    <h3>{props.notification.title}</h3>
                    <span>Date de l'activité: <DateFormat date={props.notification.date} /></span>
                </div>
                <h5 className=""> Payé: <span className="badge badge-info">{ (props.notification.paid) ? 'Payé': 'Non payé' }</span></h5>
                <h5 className="">&nbsp;&nbsp;Nombres de places réservées: <span className="badge badge-danger">{props.notification.numberOfPlaces}</span></h5>
            </div>
        </a>
    </div>
)
