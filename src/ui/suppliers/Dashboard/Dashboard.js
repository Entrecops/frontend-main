import React, { Component } from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import './Dashboard.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload} from '@fortawesome/free-solid-svg-icons';
import {Notification, addNotification} from '../../globalComponent/Notifications';
import axios from 'axios';

import Hoc from '../../globalComponent/Hoc';
import Header from '../../globalComponent/Header';
import ReviewItem from '../../components/Reviews/ReviewItem';
import Stars from '../../components/Stars/Stars';
import EventModal from './EventModal';
import ServiceModal from './ServiceModal';
import Loader from '../../globalComponent/Loader';
import { countNotViewedReservations } from '../../../store/actions/auth';

class Dashboard extends Component {

    state = {
        showNewEv: false,
        showNewAn: false,

        services: [],
        servicesAll: [],
        events: [],
        eventsAll: [],
        servicesLoading: true,
        eventsLoading: true,
        reservationLoading: true,
        reservations: [],
        reservationsAll: [],
        error: '',
        error2: '',
    }

    handleChange = (date) => {
        this.setState({
            date: date
        });
    }

    setFile(name, file) {
        this.setState({
            [name]: file,
            profileImageValid: true,
            error: ''
        }, this.validateForm);
    }

    closeEventModal = () => {
        this.setState({showNewEv: false, showNewAn: false});
    }

    componentDidUpdate(prevProps) {
        if(this.props.user !== prevProps.user) {
            // get events
            this.fetchServices()
            // get services
            this.fetchEvents()
        }
    }

    componentDidMount() {
        if(this.props.user) {
            // get events
            this.fetchServices()
            // get services
            this.fetchEvents()
            // get reservations
            this.retrieveReservation();
        }
    }

    // Récupération des réservations supplier
    retrieveReservation = () => {
        axios.get( '/api/user/supplier-reservations/' + this.props.user._id )
        .then( res => {
            this.setState({ reservations: res.data.body, reservationsAll: res.data.body });
            // Submit an object with all notification viewed to reset the notification counter
            this.props.onLoadedNotification( [{ partnerViewed: true }], 'supplier');
        });
    }

    fetchEvents = () => {
        axios.get('/api/event/supplier/'+ this.props.user._id)
        .then(res => {
            this.setState({events: res.data.events, eventsAll: res.data.events, eventsLoading: false, error: ''});
        })
        .catch(err => {
            this.setState({eventsLoading: false, error: 'Une erreur s\'est produite. Veuillez reéssayer.'});
            })
    }

    fetchServices = () => {
        axios.get('/api/service/supplier/'+ this.props.user._id)
        .then(res => {
            this.setState({services: res.data.services, servicesAll: res.data.services, servicesLoading: false, error: ''});
        })
        .catch(err => {
            this.setState({servicesLoading: false, error: 'Une erreur s\'est produite. Veuillez reéssayer.'});
        })
    }

    generateCSV = (data, announce) => {
        let csvContent = "data:text/csv;charset=utf-8,";
        // Format our csv file content
        csvContent += "id , name, email, tel, places \r\n";
        data.forEach(function (rowArray, i) {
            let row = (i + 1) + " , " + rowArray.name + " , " + rowArray.email + " , " + rowArray.tel + " , " + rowArray.numberOfPlaces;
            csvContent += row + "\r\n";
        });

        // Creating the file
        let encodedUri = encodeURI(csvContent);
        let link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        let fileName = announce.split(' ').join('-');
        link.setAttribute("download", fileName + ".csv");
        link.click();
    }

    searchEvent = ( e ) => {
        const filterParam = e.target.value;
        this.setState({ events: this.state.eventsAll.filter( ev => ev.title.toLowerCase().includes(filterParam.toLowerCase()))});
    }

    searchReservations = ( e ) => {
        const filterParam = e.target.value;
        this.setState({ reservations: this.state.reservationsAll.filter( ev => ev.title.toLowerCase().includes(filterParam.toLowerCase()) || ev.name.toLowerCase().includes(filterParam.toLowerCase()) )});
    }

    searchServices = ( e ) => {
        const filterParam = e.target.value;
        this.setState({ services: this.state.servicesAll.filter( ev => ev.title.toLowerCase().includes(filterParam.toLowerCase()) )});
    }

    render() {
        const { events, services, eventsLoading, servicesLoading, error, error2, reservations } = this.state;
        const {user} = this.props;
        return (
            <Hoc>
                <Notification />
                {user&&user.role !== "supplier" ? <Redirect to="/" />:null }
                <Header />
                <section className="dashboard mt-5">
                    <div className="container p-5">
                        <div className="row pt-3">
                            <div className="col-sm-12 d-flex mb-3 add-buttom-wrapper">
                                <h2 className="py-3 mr-auto align-align-self-end">TOUTES LES RESERVATIONS</h2>
                                <button className="button" onClick={() => this.setState({showNewEv: true})}>NOUVELLE ACTUALITE</button>
                                <button className="button" onClick={() => this.setState({showNewAn: true})}>NOUVEAU SERVICE</button>
                            </div>
                            {/* Reservations (Tout) */}
                            <div className="col-sm-12 text-center mb-2">
                                <input type="text" placeholder="Rechercher une reservation" onChange={this.searchReservations}/>
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
                                            reservations.length > 0 ?
                                                reservations.map((resa, i) => (
                                                    <tr key={resa._id} style={{ backgroundColor: ( resa.partnerViewed ) ? "#fff" : "#FFB6C1"}}>
                                                        <th scope="row">{i + 1}</th>
                                                        <td>{resa.name}</td>
                                                        <td>{resa.tel}</td>
                                                        <td>{resa.totalAmount}</td>
                                                        <td>{resa.title}</td>
                                                        <td>{ new Date(resa.date).toLocaleDateString() }</td>
                                                        <td>{resa.paid? <span style={{ color: "green" }}>Validé</span> : <b style={{ color: "red" }}>En attente</b>}</td>
                                                        <td>{ ( resa.paidDate !== undefined && resa.paidDate != null) ? new Date(resa.paidDate).toLocaleDateString() : " Non payé" }</td>
                                                    </tr>
                                                ))
                                            :
                                            <tr>
                                                <td colSpan={7}>Aucune réservation enregistrée</td>
                                            </tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                            <div className="col-sm-12">
                                <hr/>
                            </div>
                        </div>
                        {/* Events */}
                        <div className="row mt-2"><div className="col-sm-12 mt-2"><h3>MES ACTUALITES</h3></div></div>
                        <div className='row pb-2'>
                            <div className="col-sm-12 text-center mb-2">
                                <input type="text" placeholder="Rechercher une actualité" id="searchbar" onChange={this.searchEvent}/>
                            </div>
                        </div>
                        <div className="row mt-4 pb-5">
                            <div className="col-sm-12 col-md-12 col-lg-4 mt-2">
                            {
                                eventsLoading ? <div className="d-flex justify-content-center"><Loader /></div>:
                                    events && events.length ?
                                        <div className="list-group" id="list-tab" role="tablist">
                                        {
                                            events.map((event, i) => (
                                                <a key={i} className={i===0 ?"list-group-item list-group-item-action active":"list-group-item list-group-item-action"} data-toggle="list" href={`#item${i}`} role="tab">
                                                    {event.title} ({event.reservations&&event.reservations.length ? event.reservations.length: 0})
                                                    <br/>
                                                    <Stars
                                                        isSupplierDashboard
                                                        rate={event.rate ? event.rate: null }
                                                        anounceType={"event"}
                                                        id={event._id} />
                                                </a>
                                            ))
                                        }
                                        </div>
                                    : <h5 className="">Vous n'avez aucune Actualité active</h5>
                            }
                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-8 mt-2 d-flex flex-column justify-content-between">
                                {error && error.length ? <div className="alert alert-danger" style={{ fontSize: "1.3rem" }}>{error}</div> : null}
                                <div className="tab-content" id="nav-tabContent">
                                    <h3 className="pt-0 mb-3">Liste des réservations</h3>
                                    {
                                        eventsLoading ? null :
                                            events && events.length ?
                                                events.map((event, i) => (
                                                    (event.reservations && event.reservations.length) || event.comments ?
                                                    (
                                                        <div key={i} className={i === 0 ? "tab-pane fade show active" : "tab-pane fade"} id={`item${i}`} role="tabpanel">
                                                            <table className="table">
                                                                <tbody>
                                                                    {event.reservations.map((reservation, i) => (
                                                                        <tr key={i}>
                                                                            <th scope="row">{i+1}</th>
                                                                            <td>{reservation.name}</td>
                                                                            <td>{reservation.email}</td>
                                                                            <td>{reservation.tel}</td>
                                                                            <td>Payé: {(reservation.paid) ? 'Oui' : 'Non'}</td>
                                                                            <td>Montant: {reservation.totalAmount}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                            <div className="deleteWrapper d-flex mt-auto">
                                                                <button className="btn btn-dark ml-auto mt-3" onClick={() => this.generateCSV(event.reservations, event.title)}>Télécharger la liste&nbsp;<FontAwesomeIcon icon={faDownload} size={"1x"} /></button>
                                                                {/* <button className={event.reservations.length ? "btn btn-danger ml-3 mt-3" : "btn btn-danger ml-auto mt-3"}>Supprimer l'évenement</button> */}
                                                            </div>
                                                            <div className="row pt-3">
                                                            <div className="col-sm-12">
                                                                <h3 className="pt-3 mb-5">Commentaires des utilisateurs</h3>
                                                                {
                                                                    event.comments&&event.comments.length ?
                                                                    event.comments.reverse().map((comment, i) => (
                                                                        <ReviewItem key={i} comment={comment} />
                                                                    ))
                                                                    : <h5 className="py-3">Aucun commentaire</h5>
                                                                }
                                                            </div>
                                                        </div>
                                                        </div>
                                                    ):
                                                    <div key={i} className={i===0 ?"tab-pane fade show active":"tab-pane fade show"} id={`item${i}`} role="tabpanel" >
                                                        <h3 className="text-center">Aucune reservation sur cet évènement.</h3>
                                                        {/* <button className="btn btn-danger d-block ml-auto mt-3">Supprimer l'évenement</button> */}
                                                    </div>
                                                ))
                                            : null
                                    }
                                </div>
                            </div>
                        </div>

                        <hr/>
                        {/* Services */}
                        <div className="row mt-5"><div className="col-sm-12 mt-2"><h3>MES SERVICES</h3></div></div>
                        <div className='row pb-2'>
                            <div className="col-sm-12 text-center mb-2">
                                <input type="text" placeholder="Rechercher un service" id="searchbar" onChange={this.searchServices}/>
                            </div>
                        </div>
                        <div className="row mt-4 pb-5">
                            <div className="col-sm-12 col-md-12 col-lg-4 mt-2">
                            {
                                servicesLoading ? <div className="d-flex justify-content-center"><Loader /></div>:
                                    services && services.length ?
                                        <div className="list-group" id="list-tab" role="tablist">
                                        {
                                            services.map((service, i) => (
                                                <a key={service._id} className={i===0 ?"list-group-item list-group-item-action active":"list-group-item list-group-item-action"} data-toggle="list" href={`#service${i}`} role="tab">
                                                    {service.title} ({service.reservations&&service.reservations.length ? service.reservations.length: 0})
                                                    <br/>
                                                    <Stars
                                                        isSupplierDashboard
                                                        rate={service.rate ? service.rate: null }
                                                        anounceType={"service"}
                                                        id={service._id} />
                                                </a>
                                            ))
                                        }
                                        </div>
                                    : <h5 className="">Vous n'avez aucun Service actif</h5>
                            }
                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-8 mt-2 d-flex flex-column justify-content-between">
                                {error2 && error2.length ? <div className="alert alert-danger" style={{ fontSize: "1.3rem" }}>{error}</div> : null}
                                <div className="tab-content" id="nav-tabContent">
                                <h3 className="pt-0 mb-3">Liste des réservations</h3>
                                {
                                    servicesLoading ? null :
                                        services && services.length ?
                                            services.map((service, i) => (
                                                (service.reservations && service.reservations.length) || service.comments ?
                                                (
                                                    <div key={i} className={i === 0 ? "tab-pane fade show active" : "tab-pane fade"} id={`service${i}`} role="tabpanel" >
                                                        <table className="table">
                                                            <tbody>
                                                                {service.reservations.map((reservation, i) => (
                                                                    <tr key={i}>
                                                                        <th scope="row">{i + 1}</th>
                                                                        <td>{reservation.name}</td>
                                                                        <td>{reservation.email}</td>
                                                                        <td>{reservation.tel}</td>
                                                                        <td>Payé: {(reservation.paid) ? 'Oui' : 'Non'}</td>
                                                                        <td>Montant: {reservation.totalAmount}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                        <div className="deleteWrapper d-flex mt-auto">
                                                            <button className="btn btn-dark ml-auto mt-3" onClick={() => this.generateCSV(service.reservations, service.title)}>Télécharger la liste&nbsp;<FontAwesomeIcon icon={faDownload} size={"1x"} /></button>
                                                            {/* <button className={service.reservations.length ? "btn btn-danger ml-3 mt-3" : "btn btn-danger ml-auto mt-3"}>Supprimer l'évenement</button> */}
                                                        </div>
                                                        <div className="row pt-3">
                                                            <div className="col-sm-12">
                                                                <h3 className="pt-3 mb-5">Commentaires des utilisateurs</h3>
                                                                {
                                                                    service.comments&&service.comments.length ?
                                                                    service.comments.reverse().map((comment, i) => (
                                                                        <ReviewItem key={i} comment={comment} />
                                                                    ))
                                                                    : <h5 className="py-3">Aucun commentaire</h5>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                ):
                                                <div key={i} className={i===0 ?"tab-pane fade show active":"tab-pane fade show"} id={`service${i}`} role="tabpanel">
                                                    <h3 className="text-center">Aucune reservation sur ce service.</h3>
                                                    {/* <button className="btn btn-danger d-block ml-auto mt-3">Supprimer le service</button> */}
                                                </div>
                                            ))
                                            : null
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* messages */}
                    {/* <div className="container mt-5 p-5 mb-5">
                        <div className="row pt-3 align-items-start">
                            <div className="col-sm-12 col-md-12 col-lg-8">
                                <h3 className="pt-3 mb-5">Messages sur l'évènement</h3>

                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-4">
                                <h2></h2>
                            </div>
                        </div>
                    </div> */}
                </section>

                {/* New Event/Annonce */}
                <EventModal
                    user={this.props.user}
                    show={this.state.showNewEv}
                    addNotification={addNotification}
                    closeModal={this.closeEventModal}  />

                {/* New Service */}
                <ServiceModal
                    user={this.props.user}
                    show={this.state.showNewAn}
                    addNotification={addNotification}
                    closeModal={this.closeEventModal} />
            </Hoc>
        );
    }
}

const mapPropsToState = state => {
    return {
        user: state.auth.user
    }
}

const mapDispatchToState = dispatch => {
    return {
        onLoadedNotification: ( data, type ) => dispatch( countNotViewedReservations(data, type ))
    }
}
export default connect(mapPropsToState, mapDispatchToState)(Dashboard);