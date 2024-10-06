import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {DateFormat} from '../../utils/DateFormat'
import Modal from 'react-bootstrap/Modal';
import { Notification, addNotification } from '../../globalComponent/Notifications'
import Button from 'react-bootstrap/Button';
import SupplierForm from '../../components/Forms/SuplierForm';
import Loader from '../../globalComponent/Loader';
import EventModal from '../../suppliers/Dashboard/EventModal';
import ServiceModal from '../../suppliers/Dashboard/ServiceModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import Hoc from '../../globalComponent/Hoc';

class AdminHome extends Component {

    state = {
        showModal: false,
        eventsLoading: true,
        events: [],
        servicesLoading: true,
        services: [],
        error: '',
        showEventModal: false,
        showServiceModal: false,
        loadinSingleEv: false,
        loadinSingleAn: false,
        event: null,
        service: null,
        /* For uploading images to gallery */
        userMessage: '',
        uploadError: '',
        loading: false,
        
        /* When publish on gallery */
        showUploadModal: false,
        images: null,
        content: '',
        tags: '',
        publishing: false,
        succesPublish: false,
        publishError: false
    }

    closeSupplierModal = () => {
        this.setState({ showModal: false, showEventModal: false, showServiceModal: false });
    }

    componentDidMount() {
        //Get 5 events
        axios.get('/api/event/5')
            .then(res => {
                this.setState({ events: res.data.events, eventsLoading: false, error: '' })
            })
            .catch(err => {
                this.setState({ error: "Une érreur s'est produite. Veuillez reéssayer.", eventsLoading: false })
            });

        //Get 5 services
        axios.get('/api/service/5')
            .then(res => {
                this.setState({ services: res.data.services, servicesLoading: false, error: '' })
            })
            .catch(err => {
                this.setState({ error: "Une érreur s'est produite. Veuillez reéssayer.", servicesLoading: false })
            })
    }

    getSingleEvent = (id) => {
        this.setState({ loadinSingleEv: true, showEventModal: true })
        axios.get('/api/event/' + id)
            .then(res => {
                this.setState({
                    loadinSingleEv: false,
                    event: res.data.event,
                    'error': ''
                })
            })
            .catch(err => {
                this.setState({
                    loadinSingleEv: false,
                    'error': 'Erreur survenue, veuillez actualiser'
                })
            })
    }

    getSingleService = (id) => {
        this.setState({ loadinSingleAn: true, showServiceModal: true })
        axios.get('/api/service/' + id)
            .then(res => {
                this.setState({
                    loadinSingleAn: false,
                    service: res.data.service,
                    'error': ''
                })
            })
            .catch(err => {
                this.setState({
                    loadinSingleEv: false,
                    'error': 'Erreur survenue, veuillez actualiser'
                })
            })
    }

    // Refresh view when delete or validate event/service
    refreshList = (list, name) => {
        this.setState({
            [name]: list
        })
    }

    handleInputChange = (e) => {
        e.preventDefault();
        const name = e.target.name;
        const value = e.target.value;
        this.setState({
            [name]: value
        });
    }

    // Preview images
    preview = (e) => {
        let imageValid = true;
        this.setState({ publishError: false, previewImages: [], images: null })
        Array.from(e.target.files).forEach(file => {
            if((file.size)/1024 > 1024) {
                imageValid = false;
                this.setState({ publishError: 'La taille d\'une image ne doit pas dépasser 1Mo (1 méga octect).'})
            }
        });
        if(imageValid) {
            let images = Array.from(e.target.files).map(file => URL.createObjectURL(file));
            this.setState({ previewImages: images, images: e.target.files });
        }
    }
    
    // Publish in gallery
    publish = (e) => {
        e.preventDefault();
        const { images, content, tags } = this.state;
        if(images&&content.length) {
            this.setState({publishing: true, showUploadModal: true})
            const formData = new FormData();
            formData.append('content', content);
            formData.append('tags', tags);
            Array.from(images).forEach(file => {
                formData.append('images', file);
            });
            const config = {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            };
            try {
                axios.post('/api/gallery/publish', formData, config)
                    .then(res => {
                        this.setState({
                            publishing: false,
                            succesPublish: true,
                            publishError: false,
                            content: '',
                            images: null,
                            previewImages: null
                        });
                    })
                    .catch(err => {
                        this.setState({ publishError: "Une érreur s'est produite. Veuillez reéssayer.", publishing: false });
                    })
            } catch (error) {
                this.setState({ publishError: "Erreur de connexion. Veuillez reéssayer", publishing: false });
            }
        } else {
            addNotification("warning", "Galerie!", "Veuillez entrer toutes les informations")
        }
    }

    render() {
        const { events, eventsLoading, services, servicesLoading, error } = this.state;
        return (
            <Hoc>
                <Notification />
                <div className="container">
                    <div className="row  pt-3 mt-5">
                        <div className="col-sm-12">
                            <h3 className="title">ACTIONS RAPIDES</h3>
                        </div>
                    </div>
                    <div className="row mb-5">
                        <div className="col-md-6 col-lg-3 col-sm-6 mb-2">
                            <div className="card text-center">
                                <div className="card-body">
                                    <h5 className="card-title">Ajouter un Fournisseur</h5>
                                    <p className="card-text">Créer un nouveau Fournisseur.</p>
                                    <a href="#supplier" onClick={() => this.setState({ showModal: true })} className="btn btn-dark btn-block">Ajouter un Fournisseur</a>
                                </div>
                            </div>
                        </div>


                        <div className="col-md-6 col-lg-3 col-sm-6 mb-2">
                            <div className="card text-center">
                                <div className="card-body">
                                    <h5 className="card-title">Actualités</h5>
                                    <p className="card-text">Valider/Supprimer Actualité.</p>
                                    <Link className="btn btn-dark btn-block" to="/admin/annonces">Gérer les Actualités</Link>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3 col-sm-6 mb-2">
                            <div className="card text-center">
                                <div className="card-body">
                                    <h5 className="card-title">Services</h5>
                                    <p className="card-text">Valider/Supprimer un Service.</p>
                                    <Link className="btn btn-dark btn-block" to="/admin/services">Gérer les Services</Link>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3 col-sm-6 mb-2">
                            <div className="card text-center">
                                <div className="card-body">
                                    <h5 className="card-title">Galerie</h5>
                                    <p className="card-text">Ajouter du contenu dans la Galerie</p>
                                    <Link to="#gallery" onClick={() => this.setState({ showUploadModal: true })} className="btn btn-dark btn-block upload-btn">Publier dans la Galerie &nbsp; <FontAwesomeIcon icon={faCamera} size={"1x"} /></Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mt-5">
                        <div className="col-sm-12">
                            <h3 className="title">ACTUALITES RECENTES</h3>
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
                                                    <th>Nom</th>
                                                    <th>Lieux</th>
                                                    <th>Date</th>
                                                    <th>Catégorie</th>
                                                    <th>Etat</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    events.map((event, i) => (
                                                        <tr key={event._id}>
                                                            <th scope="row">{i + 1}</th>
                                                            <td>{event.title}</td>
                                                            <td>{event.place}</td>
                                                            <td><DateFormat date={event.date} /></td>
                                                            <td>{event.category}</td>
                                                            <td>{event.validated ? <span style={{ color: "green" }}>Validé</span> : <b style={{ color: "red" }}>En attente</b>}</td>
                                                            <td className="actions">
                                                                <button onClick={() => this.getSingleEvent(event._id)} className="btn btn-outline-dark btn-md ml-3">Afficher</button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                        </table> : null
                            }
                            <div className="d-flex justify-content-end">
                                <Link className="btn btn-dark" to="/admin/annonces">Afficher tous</Link>
                            </div>
                        </div>
                    </div>
                    <div className="row mt-5">
                        <div className="col-sm-12">
                            <h3 className="title">SERVICES RECENTS</h3>
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
                                                    services.map((service, i) => (
                                                        <tr key={service._id}>
                                                            <th scope="row">{i + 1}</th>
                                                            <td>{service.title}</td>
                                                            <td>{service.place}</td>
                                                            <td>{service.target}</td>
                                                            <td>{service.duration}</td>
                                                            <td>{service.validated ? <span style={{ color: "green" }}>Validé</span> : <b style={{ color: "red" }}>En attente</b>}</td>
                                                            <td className="actions">
                                                                <button onClick={() => this.getSingleService(service._id)} className="btn btn-outline-dark btn-md ml-3">Afficher</button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                        </table> : null
                            }
                            <div className="d-flex justify-content-end">
                                <Link className="btn btn-dark" to="/admin/services">Afficher tous</Link>
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
                    loadingEv={this.state.loadinSingleEv}
                    show={this.state.showEventModal}
                    addNotification={addNotification}
                    closeModal={this.closeSupplierModal} />

                {/* View/Update a Service */}
                <ServiceModal
                    user={null}
                    isEditing={true}
                    service={this.state.service}
                    refreshList={this.refreshList}
                    services={this.state.services}
                    loadingAn={this.state.loadinSingleAn}
                    show={this.state.showServiceModal}
                    addNotification={addNotification}
                    closeModal={this.closeSupplierModal} />

                {/* Add a new Supplier Popup */}
                <Modal show={this.state.showModal} size="lg" onHide={() => this.setState({ showModal: !this.state.showModal })} >
                    <Modal.Header closeButton>
                        <Modal.Title>Nouveau Fournisseur</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container supplier-form">
                            <SupplierForm closeModal={this.closeSupplierModal} />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="py-3">
                            <Button variant="outline" onClick={() => this.setState({ showModal: !this.state.showModal })}>
                                Fermer
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>

                {/* Publish on gallery modal */}
                <Modal show={this.state.showUploadModal} onHide={() => this.setState({ showUploadModal: false })} size="lg" >
                    <Modal.Header closeButton>
                        <Modal.Title>Importer des Images</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <section className="updload-section">
                            <div className="container">
                                <div className="row justify-content-center">
                                    <div className="col-sm-12">
                                        {this.state.publishError.length && <div className="alert alert-danger" >{this.state.publishError}</div>}
                                        {this.state.succesPublish && <div className="alert alert-success">Publié avec succès</div>}
                                        <div className="upload">
                                            <label className="mt-3 mb-4">Entrez un message pour votre publication</label>
                                            <textarea placeholder="Exprimez vous"
                                                value={this.state.content} name="content"
                                                className="form-control" onChange={(e) => this.handleInputChange(e)} rows="2"></textarea>
                                        </div>
                                        <div className="form-group ">
                                            <label className="mt-3">Tags (Séparez par des virgules)</label>
                                            <input className="form-control" onChange={(e) => this.handleInputChange(e)} type="text" name="tags" value={this.state.tags} placeholder="Entrez des tags" />
                                        </div>
                                    </div>
                                </div>
                                <div className="row text-center mt-3 justify-content-center">
                                    <div className="col-sm-6">
                                        <form className="mt-3 mb-4">
                                            <div className="custom-file">
                                                <input onChange={(e) => this.preview(e)} type="file" className="custom-file-input" accept="image/*" id="customFile" multiple />
                                                <label className="custom-file-label" for="customFile">Choisir les images</label>
                                            </div>
                                        </form>
                                    </div>
                                <div className="container mt-2">
                                    <div className="row justify-content-center">
                                        {this.state.previewImages ? 
                                            this.state.previewImages.map((image, id) => (
                                                <div key={id} className="col-4 mt-2">
                                                    <img src={image} className="img-fluid" alt="" /> 
                                                </div>
                                            )) : null
                                        }
                                    </div>
                                </div>
                                </div>
                            </div>
                        </section>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="py-3">
                            <Button variant="danger" onClick={(e) => this.publish(e)}>
                                Publier {this.state.publishing&&<Loader color="white"/>}
                            </Button>
                            <Button variant="default" onClick={() => this.setState({ showUploadModal: false })}>
                                Fermer
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>

            </Hoc>
        );
    }
}

export default AdminHome;