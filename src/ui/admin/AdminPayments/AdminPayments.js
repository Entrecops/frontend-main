import React, { Component } from 'react';
import axios from 'axios';
import {connect} from 'react-redux';
import {DateFormat} from '../../utils/DateFormat'
import { Modal, Button } from 'react-bootstrap';
import CountUp from 'react-countup';
import Loader from '../../globalComponent/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload} from '@fortawesome/free-solid-svg-icons';
import Hoc from '../../globalComponent/Hoc';
import { Notification, addNotification } from '../../globalComponent/Notifications'
import './AdminPayments.scss'

class AdminPayments extends Component {

    state = {
        showModal: false,
        showReservationListModal: false,
        events: [],
        error: '',
        event: null,
        loading: false,
        showCreationModal: false,
        selectedReservations: [],
        deleting: false
    }

    componentDidMount() {
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

    openModal = () => {
        this.setState({showModal: true})
    }


    render() {
        const { error, events, loading } = this.state;
        return (
            <Hoc>
                <Notification />
                <div className="container payment_section">
                    {/* quick stats */}
                    <div className="row mt-5">
                        <div className="col-sm-12">
                            <div className="stats">
                                <div className="stat_item">
                                    <h2>Total Paiement</h2>
                                    <p>(455 paiements)</p>
                                    <h3><CountUp end={5000000} />  <span className="fc">FCFA</span></h3>
                                </div>
                                <div className="stat_item">
                                    <h2>Aujourd'hui</h2>
                                    <p>(21 paiements)</p>
                                    <h3><CountUp end={20000} />  <span className="fc">FCFA</span></h3>
                                </div>
                                <div className="stat_item">
                                    <h2>Echecs</h2>
                                    <p>(Paiements échoués)</p>
                                    <h3 className="red">21</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mt-5 payments_historic">
                        <div className="col-sm-12 d-flex justify-content-between align-items-center mb-5">
                            <h3 className="mb-0">HISTORIQUES DES PAIEMENTS</h3>
                            <button className="btn btn-danger">Télécharger l'historique</button>
                        </div>
                        <div className="col-sm-12 text-center">
                            {error && error.length ? <div className="alert alert-danger" style={{ fontSize: "1.3rem" }}>{error}</div> : null}

                            <table className="table table-bordered">
                                <thead className="thead-inverse thead-dark">
                                    <tr>
                                        <th>#</th>
                                        <th>Nom</th>
                                        <th>Email</th>
                                        <th>Tel</th>
                                        <th>Actu/Service</th>
                                        <th>Somme</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr key={"event._id"}>
                                        <th scope="row">1</th>
                                        <th>Joe Doe</th>
                                        <td>joedoe@gmail.com</td>
                                        <td>655891562</td>
                                        <td>Lounge Galaxy</td>
                                        <td>1500 FCFA</td>
                                        <td><DateFormat date={new Date()} /></td>
                                        <td className="actions"><button className="btn btn-outline-dark" onClick={() => this.openModal()}>Afficher</button></td>
                                    </tr>
                                    <tr key={"event._id"}>
                                        <th scope="row">2</th>
                                        <th>Joe Doe</th>
                                        <td>joedoe@gmail.com</td>
                                        <td>655891562</td>
                                        <td>Chop et Yamo</td>
                                        <td>1500 FCFA</td>
                                        <td><DateFormat date={new Date()} /></td>
                                        <td className="actions"><button className="btn btn-outline-dark" onClick={() => this.openModal()}>Afficher</button></td>
                                    </tr>
                                    <tr key={"event._id"}>
                                        <th scope="row">3</th>
                                        <th>Joe Doe</th>
                                        <td>joedoe@gmail.com</td>
                                        <td>655891562</td>
                                        <td>Lounge Galaxy</td>
                                        <td>1000 FCFA</td>
                                        <td><DateFormat date={new Date()} /></td>
                                        <td className="actions"><button className="btn btn-outline-dark" onClick={() => this.openModal()}>Afficher</button></td>
                                    </tr>
                                    <tr key={"event._id"}>
                                        <th scope="row">4</th>
                                        <th>Joe Doe</th>
                                        <td>joedoe@gmail.com</td>
                                        <td>655891562</td>
                                        <td>Chop et Yamo</td>
                                        <td>1000 FCFA</td>
                                        <td><DateFormat date={new Date()} /></td>
                                        <td className="actions"><button className="btn btn-outline-dark" onClick={() => this.openModal()}>Afficher</button></td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* {
                                loading ? <Loader /> :
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
                                            events.map((event, i) => (
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
                                    </table> : null
                            } */}
                        </div>
                    </div>
                </div>
                
                {/* Modal to display single payment */}
                <Modal show={this.state.showModal} onHide={() => this.setState({ showModal: false })} size="md" >
                    <Modal.Header closeButton>
                        <Modal.Title>Détails du paiement</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container modalo">
                            <div className="row justify-content-between">
                                <div className="col-sm-12 pl-4 pr-4 mt-4 mb-3 text-center">
                                    <table className="table table-bordered">
                                        <tbody>
                                            <tr key={"event._id"}>
                                                <th scope="row">Nom</th>
                                                <td>Joe Doe</td>
                                            </tr>
                                            <tr key={"event._id"}>
                                                <th scope="row">Email</th>
                                                <td>joedoe@gmail.com</td>
                                            </tr>
                                            <tr key={"event._id"}>
                                                <th scope="row">Evènement associé</th>
                                                <td>Restaurant Bastos</td>
                                            </tr>
                                            <tr key={"event._id"}>
                                                <th scope="row">Réduction de:</th>
                                                <td>0 FCFA</td>
                                            </tr>
                                            <tr key={"event._id"}>
                                                <th scope="row">Tel</th>
                                                <td>655891562</td>
                                            </tr>
                                            <tr key={"event._id"}>
                                                <th scope="row">Somme</th>
                                                <td>1500 FCFA</td>
                                            </tr>
                                            <tr key={"event._id"}>
                                                <th scope="row">Date</th>
                                                <td><DateFormat date={new Date()} /></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="py-3">
                            <Button variant="default" onClick={() => this.setState({ showModal: false })}>
                                Fermer
                            </Button>
                        </div>
                    </Modal.Footer>
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
export default connect(mapPropsToState)(AdminPayments);