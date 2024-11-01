import React, { Component } from 'react';
import axios from 'axios';
import {connect} from 'react-redux';
import Modal from 'react-bootstrap/Modal';
import {DateFormat} from '../../utils/DateFormat'
import Loader from '../../globalComponent/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload} from '@fortawesome/free-solid-svg-icons';
import EventModal from '../../suppliers/Dashboard/EventModal';
import Hoc from '../../globalComponent/Hoc';
import { Notification, addNotification } from '../../globalComponent/Notifications'

class AdminAnnonce extends Component {

    state = {
        showModal: false,
        showReservationListModal: false,
        eventsLoading: true,
        events: [],
        error: '',
        event: null,
        loading: false,
        showCreationModal: false,
        selectedReservations: [],
        deleting: false,
        eventsAll: [],
        currentPage: 1,
        eventsPerPage: 15
    }

    componentDidMount() {
        //Get all events
        this.getAllServices();
    }

    getAllServices = () => {
        //Get all events
        axios.get('/api/event/all')
            .then(res => {
                this.setState({ eventsAll: res.data.events, events: res.data.events, eventsLoading: false, error: '' });
            })
            .catch(err => {
                this.setState({ error: "Une érreur s'est produite. Veuillez reéssayer.", eventsLoading: false })
            })
    }

    searchEvent = ( e ) => {
        const filterParam = e.target.value;
        this.setState({ events: this.state.eventsAll.filter( ev => ev.title.toLowerCase().includes(filterParam.toLowerCase()))});
    }

    refreshEventList = () => {
        this.setState({ eventsLoading: true })
        this.getAllServices();
    }

    getSingleEvent = (id, info) => {
        if(info === "detail")
            this.setState({ loading: true, showModal: true})
        else
            this.setState({ loading: true, showReservationListModal: true })
        axios.get('/api/event/' + id)
        .then(res => {
            this.setState({
                loading: false,
                event: res.data.event,
                'error': ''
            })
        })
        .catch(err => {
            this.setState({
                loading: false,
                'error': 'Erreur survenue, veuillez actualiser'
            })
        })
    }

    paginate = pageNumber => {
        this.setState({ currentPage: pageNumber });
    };

    // Refresh view when delete or validate event/service
    refreshList = (list, name) => {
        this.setState({
            [name]: list
        })
    }

    closeModal = () => {
        this.setState({ showModal: false, showCreationModal: false});
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

    // Handle checkbox
    handleInputChange = (e) => {
        const value = e.target.value;
        const {selectedReservations} = this.state;
        // When uncheck
        if (selectedReservations.filter(res => JSON.stringify(res) === value).length > 0) {
            let reservations = selectedReservations.filter(res => (JSON.stringify(res) !== value))
            this.setState({selectedReservations: reservations});
        // When checked
        }else {
            this.setState(state => ({selectedReservations: [...state.selectedReservations, JSON.parse(value)]}));
        }
    }

    deleteReservation = () => {
        this.setState({deleting: true});
        axios.patch('/api/announce/reservations/delete', {reservations: this.state.selectedReservations})
        .then(res => {
            // Update view
            let newReservations = []
            this.state.event.reservations.forEach(resa => {
                this.state.selectedReservations.forEach(reservation => {
                    if(JSON.stringify(resa) !== JSON.stringify(reservation)) {
                        newReservations.push(resa);
                    }
                });
            });
            this.setState({deleting: false, event: {...this.state.event, "reservations": newReservations }, selectedReservations: [] });
        })
        .catch(err => {
            this.setState({ error: "Une érreur s'est produite. Veuillez recharger", loading: false })
        })
    }

    render() {
        const { error, events, eventsLoading, deleting, currentPage, eventsPerPage } = this.state;

        const indexofLastEvent = currentPage * eventsPerPage;
        const indexOfFirstEvent = indexofLastEvent - eventsPerPage;
        const currentEvents = events.slice(indexOfFirstEvent, indexofLastEvent);

        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(events.length / eventsPerPage); i++) {
            pageNumbers.push(i);
        }
        return (
            <Hoc>
                <Notification />
                <div className="container">
                    <div className="row mt-5">
                        <div className="col-sm-12 d-flex justify-content-between align-items-center mb-2">
                            <h3 className="title">TOUTES LES EVENEMENTS</h3>
                            <button onClick={() => this.setState({showCreationModal: true})} className="button">Ajouter un évènement</button>
                        </div>
                        <div className="col-sm-12 text-center mb-2">
                            <input type="text" placeholder="Rechercher un évènement" id="searchbar" onChange={this.searchEvent}/>
                        </div>
                        <div className="col-sm-12 text-center">
                            {error && error.length ? <div className="alert alert-danger" style={{ fontSize: "1.3rem" }}>{error}</div> : null}
                            {
                                eventsLoading ? <Loader /> :
                                    events && events.length ?
                                    <table className="table table-bordered">
                                        <thead className="thead-inverse thead-dark">
                                            <tr>
                                                <th>#</th>
                                                <th>Titre</th>
                                                <th>Lieux</th>
                                                <th>Date</th>
                                                <th>Categorie</th>
                                                <th>Etat</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            currentEvents.map((event, i) => (
                                                <tr key={event._id}>
                                                    <th scope="row">{i + 1}</th>
                                                    <th>{event.title}</th>
                                                    <td>{event.place}</td>
                                                    <td><DateFormat date={event.date} /></td>
                                                    <td>{event.category}</td>
                                                    <td>{event.validated ? <span style={{ color: "green" }}>Validé</span> : <b style={{ color: "red" }}>En attente</b>}</td>
                                                    <td className="actions">
                                                        <button onClick={() => this.getSingleEvent(event._id, "detail")} className="btn btn-outline-dark btn-md ml-3">Afficher</button>
                                                        <button onClick={() => this.getSingleEvent(event._id, "reservations")} className="btn btn-dark btn-md ml-3">Voir les réservations</button>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                        </tbody>
                                    </table> : null}
                                    <div className='pagi'>
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
                </div>

                {/* View/Update An Event */}
                <EventModal
                    user={null}
                    isEditing={true}
                    event={this.state.event}
                    refreshList={this.refreshList}
                    events={this.state.events}
                    loadingEv={this.state.loading}
                    show={this.state.showModal}
                    addNotification={addNotification}
                    closeModal={this.closeModal} />

                {/* New Event/Annonce */}
                <EventModal
                    user={this.props.user}
                    show={this.state.showCreationModal}
                    closeModal={this.closeModal}
                    addNotification={addNotification}
                    refreshEventList={this.refreshEventList} />

                {/* reservation list */}
                <Modal show={this.state.showReservationListModal} onHide={() => this.setState({showReservationListModal : false, selectedReservations: []})} size="lg" >
                    <Modal.Header closeButton>
                        <Modal.Title>Liste des réservations</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container">
                            <div className="row">
                                <div className="col-sm-12 pl-4 pr-4 mt-4 mb-3">
                                    {this.state.loading ? <div className="d-flex justify-content-center"><Loader /></div>:
                                    this.state.event&&this.state.event.reservations && this.state.event.reservations.length ?
                                            (
                                               <Hoc>
                                               <h3 className="mb-3">{this.state.event.title}</h3>
                                                <table className="table table-bordered reservations-list">
                                                        <tbody>
                                                            {this.state.event.reservations.map((reservation, i) => (
                                                                <tr key={i}>
                                                                    <th scope="row">{i + 1}</th>
                                                                    <td>
                                                                    <td>
                                                                        <div className="form-check">
                                                                            <input onChange={(e) => this.handleInputChange(e)} type="checkbox" value={JSON.stringify(reservation)} className="form-check-input" />
                                                                            <label className="form-check-label" for="exampleCheck1"></label>
                                                                        </div>
                                                                    </td>
                                                                    </td>
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
                                                        {this.state.selectedReservations.length > 0 &&
                                                        <button disabled={deleting} onClick={() => this.deleteReservation()} className="btn btn-danger btn-sm">{deleting ? <Loader color="white"/>: "Supprimer"}</button>}
                                                        <button className="btn btn-dark ml-auto mt-3" onClick={() => this.generateCSV(this.state.event.reservations, this.state.event.title)}>Télécharger la liste&nbsp;<FontAwesomeIcon icon={faDownload} size={"1x"} /></button>
                                                    </div>
                                               </Hoc>
                                            ): <div className="d-flex justify-content-center"><p>Aucune réservation.</p></div>
                                    }
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>

            </Hoc>
        );
    }
}

const mapPropsToState = state => {
    return {
        user: state.auth.user
    }
}
export default connect(mapPropsToState)(AdminAnnonce);