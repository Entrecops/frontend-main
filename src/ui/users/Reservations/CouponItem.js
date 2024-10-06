import React from 'react';

export const CouponItem = (props) => (
    <a onClick={() => props.displayCoupon(props.coupon) } href={props.coupon.link} className={props.coupon.visited ? "noti-link d-flex" : "noti-link d-flex notvisited"}>
        <img src={props.coupon.image} className="rounded-circle img-fluid" alt="" />
        <div className="d-flex d-flex justify-content-between flex-grow-1">
            <div className="mr-auto">
                <h4>{props.coupon.infos}</h4>
                <h5><strong>{props.coupon.title}</strong></h5>
                <span>Limite de Validité: {props.coupon.datelimite}</span>
            </div>
            <h5 className=""><span className="badge badge-danger">Réduction {props.coupon.montant}</span></h5>
        </div>
    </a>
)
