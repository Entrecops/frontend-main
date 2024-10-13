import React, { Component } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload} from '@fortawesome/free-solid-svg-icons';
import ServiceModal from '../../suppliers/Dashboard/ServiceModal';
import Loader from '../../globalComponent/Loader';
import Hoc from '../../globalComponent/Hoc';
import { Notification, addNotification } from '../../globalComponent/Notifications'

class AdminService extends Component {

    state = {
        showModal: false,
        servicesLoading: true,
        showReservationListModal: false,
        services: [],
        servicesAll: [],
        currentPage: 1,
        servicesPerPage: 15,
        error: '',
        service: null,
        loading: false,
        showCreationModal: false,
        selectedReservations: [],
        deleting: false
    }

    componentDidMount() {
        this.getAllServices();
    }

    getAllServices = () => {
        //Get all services
        axios.get('/api/service/all')
            .then(res => {
                this.setState({ servicesAll: res.data.services, services: res.data.services, servicesLoading: false, error: '' })
            })
            .catch(err => {
                this.setState({ error: "Une érreur s'est produite. Veuillez reéssayer.", servicesLoading: false })
            })
    }

    refreshServiceList = () => {
        this.setState({ servicesLoading: true })
        this.getAllServices();
    }

    getSingleEvent = (id, info) => {
        if(info === "detail")
            this.setState({ loading: true, showModal: true})
        else
            this.setState({ loading: true, showReservationListModal: true })
        axios.get('/api/service/' + id)
            .then(res => {
                this.setState({
                    loading: false,
                    service: res.data.service,
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

    // Refresh view when delete or validate service/service
    refreshList = (list, name) => {
        this.setState({
            [name]: list
        })
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

    closeModal = () => {
        this.setState({ showModal: false, showCreationModal: false });
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

    deleteReservation = () => {
        this.setState({deleting: true});
        axios.patch('/api/announce/reservations/delete', {reservations: this.state.selectedReservations})
        .then(res => {
            // Update view
            let newReservations = []
            this.state.service.reservations.forEach(resa => {
                this.state.selectedReservations.forEach(reservation => {
                    if(JSON.stringify(resa) !== JSON.stringify(reservation)) {
                        newReservations.push(resa);
                    }
                });
            });
            this.setState({deleting: false, service: {...this.state.service, "reservations": newReservations }, selectedReservations: [] });
        })
        .catch(err => {
            this.setState({ error: "Une érreur s'est produite. Veuillez recharger", loading: false })
        })
    }

    paginate = pageNumber => {
        this.setState({ currentPage: pageNumber });
    };

    searchServices = ( e ) => {
        const filterParam = e.target.value;
        this.setState({ services: this.state.servicesAll.filter( ev => ev.title.toLowerCase().includes(filterParam.toLowerCase()) )});
    }

    render() {
        const { error, services, servicesLoading, deleting, currentPage, servicesPerPage } = this.state;

        const indexofLastServices = currentPage * servicesPerPage;
        const indexofFirstServices = indexofLastServices - servicesPerPage;
        const currentServices = services.slice(indexofFirstServices, indexofLastServices);

        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(services.length / servicesPerPage); i++) {
            pageNumbers.push(i);
        }
        return (
            <Hoc>
                <Notification />
                <div className="container">
                    <div className="row mt-5">
                        <div className="col-sm-12 text-center d-flex justify-content-between align-items-center mb-5">
                            <h3 className="title">TOUS LES SERVICES</h3>
                            <button onClick={() => this.setState({ showCreationModal: true })} className="button">Ajouter un service</button>
                        </div>
                        <div className="col-sm-12 text-center mb-2">
                            <input type="text" placeholder="Rechercher un service" id="searchbar" onChange={this.searchServices}/>
                        </div>
                        <div className="col-sm-12 text-center">
                            {error && error.length ? <div className="alert alert-danger" style={{ fontSize: "1.3rem" }}>{error}</div> : null}
                            {
                                servicesLoading ? <Loader /> :
                                    services && services.length ?
                                    <table className="table table-bordered">
                                        <thead className="thead-inverse thead-dark">
                                            <tr>
                                                <th>#</th>
                                                <th>Titre</th>
                                                <th>Lieu</th>
                                                <th>Cible</th>
                                                <th>Durée</th>
                                                <th>Etat</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                currentServices.map((service, i) => (
                                                    <tr key={service._id}>
                                                        <th scope="row">{i + 1}</th>
                                                        <td>{service.title}</td>
                                                        <td>{service.place}</td>
                                                        <td>{service.target}</td>
                                                        <td>{service.duration}</td>
                                                        <td>{service.validated ? <span style={{ color: "green" }}>Validé</span> : <b style={{ color: "red" }}>En attente</b>}</td>
                                                        <td className="actions">
                                                            <button onClick={() => this.getSingleEvent(service._id, "detail")} className="btn btn-outline-dark btn-md ml-3">Afficher</button>
                                                            <button onClick={() => this.getSingleEvent(service._id, "reservations")} className="btn btn-dark btn-md ml-3">Voir les réservations</button>
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
                <ServiceModal
                    user={null}
                    isEditing={true}
                    service={this.state.service}
                    refreshList={this.refreshList}
                    services={this.state.services}
                    loadingAn={this.state.loading}
                    show={this.state.showModal}
                    addNotification={addNotification}
                    closeModal={this.closeModal} />

                {/* New Service */}
                <ServiceModal
                    user={this.props.user}
                    show={this.state.showCreationModal}
                    addNotification={addNotification}
                    closeModal={this.closeModal}
                    refreshServiceList={this.refreshServiceList} />

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
                                    this.state.service&&this.state.service.reservations && this.state.service.reservations.length ?
                                            (
                                               <Hoc>
                                               <h3 className="mb-3">{this.state.service.title}</h3>
                                                    <table className="table table-bordered reservations-list">
                                                        <tbody>
                                                            {this.state.service.reservations.map((reservation, i) => (
                                                                <tr key={i}>
                                                                    <th scope="row">{i + 1}</th>
                                                                    <td>
                                                                    <div className="form-check">
                                                                        <input onChange={(e) => this.handleInputChange(e)} type="checkbox" value={JSON.stringify(reservation)} className="form-check-input" />
                                                                        <label className="form-check-label" for="exampleCheck1"></label>
                                                                    </div>
                                                                    </td>
                                                                    <td>{reservation.name}</td>
                                                                    <td>{reservation.email}</td>
                                                                    <td>{reservation.tel}</td>
                                                                    <td>Payé: {(reservation.paid) ? 'Oui' : 'Non'}</td>
                                                                    <td>Places: {reservation.numberOfPlaces}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    <div className="deleteWrapper d-flex mt-auto">
                                                        {this.state.selectedReservations.length > 0 &&
                                                        <button disabled={deleting} onClick={() => this.deleteReservation()} className="btn btn-danger btn-sm">{deleting ? <Loader color="white"/>: "Supprimer"}</button>}
                                                        <button className="btn btn-dark ml-auto mt-3" onClick={() => this.generateCSV(this.state.service.reservations, this.state.service.title)}>Télécharger la liste&nbsp;<FontAwesomeIcon icon={faDownload} size={"1x"} /></button>
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
export default connect(mapPropsToState)(AdminService);