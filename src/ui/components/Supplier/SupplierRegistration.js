import React, { Component } from 'react';
import Header from '../../globalComponent/Header';
import SuplierForm from '../Forms/SuplierForm';
import Hoc from '../../globalComponent/Hoc'
import './Supplier.scss';
import { Notification, addNotification } from '../../globalComponent/Notifications';

class SupplierRegistration extends Component {
    render() {
        return (
            <Hoc>
                <Notification/>
                <Header />
                <section className="supplier-view-page" style={{marginTop: "5rem"}}>
                    <div className="container my-5">
                        <div className="row justify-content-center mt-5">
                            <div className="col-sm-11 col-md-10 col-lg-8 mb-5 supplier-registration-form">
                                <div className="row mb-5">
                                    <div className="col-sm-12">
                                        <h2 className="text-center mb-3">DEVENIR UN PARTENAIRE</h2>
                                        <h5 className="text-center mb-5">Vous serez contactez par email pour confirmer votre compte après vérification de vos informations.</h5>
                                        <hr />
                                    </div>
                                </div>
                                <SuplierForm addNotification={addNotification} closeTo="/" />
                            </div>
                        </div>
                    </div>
                </section>
            </Hoc>
        );
    }
}

export default SupplierRegistration;