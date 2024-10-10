import React, { Component } from 'react';
import './Supplier.scss';
import img from '../../../assets/images/b2.png';
import Hoc from '../../globalComponent/Hoc'

class Home extends Component {
    render() {
        return (
            <Hoc>
                <section className=" bannerwrapper">
                    <div className="container py-5 banner">
                        <div className="row py-5 justify-content-between align-items-center">
                            <div className="col-sm-12 d-none d-md-block col-md-6 align-self-end text-center">
                                <img src={img} className="img-fluid " alt="" />
                            </div>
                            <div className="col-sm-12 col-md-6 d-md-center">
                                <h2><b>Vous avez des services ou</b> </h2>
                                <h2><b>des actualités à communiquer ?</b></h2>
                                <a className="btn btn-outline-light btn-lg mt-5 supplierdemand" href="/supplier">Devenez un Partenaire Maintenant</a>
                            </div>
                        </div>
                    </div>
                </section>
            </Hoc>
        );
    }
}

export default Home;