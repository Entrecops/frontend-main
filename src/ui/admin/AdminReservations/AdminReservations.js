import React, { Component } from 'react';
import axios from 'axios';
import { rootUrl } from '../../../configs/config';
import { connect } from 'react-redux';


import "react-datepicker/dist/react-datepicker.css";
import Hoc from '../../globalComponent/Hoc';
import { countNotViewedReservations } from '../../../store/actions/auth';

class AdminReservations extends Component {

    state = {
        reservations: [],
        reservationsAll: [],
        currentPage: 1,
        reservationsPerPage: 15,


        nCoupons: '',
        infos: '',
        datelimite: '',
        montant: '',
        couponValid: false,
        couponError: '',
        removing: false,


        showCouponPreviewModal: false,
        coupon: null,
        showUserListModal: false, // User that took coupon
        thresholdDays: 7 // Default threshold duration
    }


    componentDidMount () {
       this.retrieveReservation();
    }


    // Récupération des réservations admin
    retrieveReservation = () => {
        axios.get( rootUrl + '/api/user/admin-reservations' )
        .then( res => {
            this.setState({ reservations: res.data.body, reservationsAll: res.data.body });
            // Submit an object with all notification viewed to reset the notification counter
            this.props.onLoadedNotification( [{ adminViewed: true }], 'admin');
        });
    }

    searchResa = ( e ) => {
        const filterParam = e.target.value;
        this.setState({ reservations: this.state.reservationsAll.filter( ev => ev.title.toLowerCase().includes(filterParam.toLowerCase()) || ev.name.toLowerCase().includes(filterParam.toLowerCase()) )});
    }

    handleThresholdChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value)) {
            this.setState({ thresholdDays: value });
        }
    }

    paginate = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    };


    render() {
        const { reservations, currentPage, reservationsPerPage, thresholdDays } = this.state;
        const currentDate = new Date();
        const thresholdDate = new Date(currentDate);
        thresholdDate.setDate(currentDate.getDate() - thresholdDays);

        const indexOfLastResa = currentPage * reservationsPerPage;
        const indexOfFirstResa = indexOfLastResa - reservationsPerPage;
        const currentReservations = reservations.slice(indexOfFirstResa, indexOfLastResa);

        const renderReservations = currentReservations.map((resa, i) => (
            <tr key={resa._id} style={{ backgroundColor: ( new Date(resa.date) >= thresholdDate ) ? "#FFFF00" : "#fff"}}>
                <th scope="row">{i + 1}</th>
                <td>{resa.name}</td>
                <td>{resa.tel}</td>
                <td>{resa.totalAmount}</td>
                <td>{resa.title}</td>
                <td>{ new Date(resa.date).toLocaleDateString() }</td>
                <td>{resa.paid? <span style={{ color: "green" }}>Validé</span> : <b style={{ color: "red" }}>En attente</b>}</td>
                <td>{ ( resa.paidDate !== undefined && resa.paidDate != null) ? new Date(resa.paidDate).toLocaleDateString() : " Non payé" }</td>
            </tr>
        ));

        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(reservations.length / reservationsPerPage); i++) {
            pageNumbers.push(i);
        }

        return (
            <Hoc>
                <div className="container admin-coupons mt-4">
                    <div className="row pt-5 pb-3">
                        <div className="col-12">
                            <h1>Liste des réservations enregistrées</h1>
                        </div>
                        <div className="col-sm-8 text-center mb-2">
                            <div className="d-flex align-items-center">
                                <input type="text" placeholder="Filtrer Reservations" id="searchbar" onChange={this.searchResa} className="col-12 form-control mr-5"/>
                                <h5 className="mb-0">Ancienneté: </h5>
                                <input type="number" id="thresholdDays" value={thresholdDays} onChange={this.handleThresholdChange} className="col-1 form-control ml-2 "/><h5 className="mb-0">Jours</h5>
                            </div>
                        </div>

                        <div className='col-12'>
                            <table className="table table-bordered">
                                <thead className="thead-inverse thead-dark">
                                    <tr>
                                        <th>#</th>
                                        <th>Client</th>
                                        <th>Téléphone</th>
                                        <th>Montant</th>
                                        <th>Service/Evenement</th>
                                        <th>Date</th>
                                        <th>Paiement</th>
                                        <th>Date Paiement</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        renderReservations
                                    }
                                </tbody>
                            </table>
                            <h5>Pagination</h5>
                            <ul className="pagination">
                                {pageNumbers.map(number => (
                                    <li key={number} className="page-item">
                                        <button onClick={() => this.paginate(number)} className="mr-3 page-link">
                                            {number}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </Hoc>
        );
    }
}

const mapDispatchToState = dispatch => {
    return {
        onLoadedNotification: ( data, type ) => dispatch( countNotViewedReservations(data, type ))
    }
}

export default connect(null, mapDispatchToState)(AdminReservations);