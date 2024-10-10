import React from 'react';
import logo from '../../../assets/images/logo.png'

export const CouponPreview = (props) => (
    <div className="container-fluid">
        <div className="row"  >
            <div className="col-sm-12 py-5 px-4" style={{ "border": "solid 1px #eee", backgroundColor: "#fafafa" }}>
                <img src={logo} alt="" width="100" />
                <h3 className="mt-2"><strong>COUPON DE REDUCTION</strong></h3>
                <h3 className="mt-4"><strong>{props.coupon.infos}</strong></h3>
                <h3><strong className="text-danger" style={{ "color": "#de0027" }}>Vous béneficiez d'une reduction de {props.coupon.montant} %.</strong></h3>
                <h3>Pour l'annonce: {props.coupon.title}</h3>
                <h5 className="mt-4"><i>Offre valable jusqu'au {props.coupon.datelimite} sous présentation au guichet.</i></h5>
            </div>
        </div>
    </div>
)