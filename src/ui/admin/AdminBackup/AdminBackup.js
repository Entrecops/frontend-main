import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import Loader from '../../globalComponent/Loader';
import Gallery from 'react-grid-gallery';
import { Notification, addNotification } from '../../globalComponent/Notifications'
import axios from 'axios';
import { rootUrl } from '../../../configs/config';
import Hoc from '../../globalComponent/Hoc';

class AdminBackup extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            showModal: false,
            searching: false,
            error: '',

        }
    }

    componentDidMount() {
    }

    handleSubmit = (e) => {
        e.preventDefault();

        try {
            axios.post('/api/backup')
            .then(
                res => {
                    this.setState({
                        loading: false,
                        error: ''
                    });
                    addNotification("success", "Backup!", "BACKUP DATA éffectué avec succès.");
                }
            ).catch (err => {
                console.log({err});
                this.setState({ error:  "Une érreur s'est produite lors de la soumission du formulaire. Veuillez reéssayer.", loading: false })
            })
        } catch (error) {
            this.setState({ error: "Erreur de connexion. Veuillez reéssayer", loading: false});
        }
    }


    render() {
        //const {loading, showModal} = this.state;
        return (
            <Hoc>
                <Notification />
                <div className="container mt-4 mb-5">
                    <div className="row pt-5 pb-3">
                        <div className="col d-flex justify-content-between align-items-center">
                            <h1>Démarrage de la sauvegarde de la Base de Données </h1>
                            <button onClick={(e) => this.handleSubmit(e)} className="button">DEMARRER LE BACKUP</button>
                        </div>
                    </div>
                </div>
            </Hoc>
        );
    }
}

export default AdminBackup;