import React, { Component } from 'react';
import axios from 'axios';
import { rootUrl } from '../../../configs/config';

import { Tab, Tabs, Modal, Button } from 'react-bootstrap';
import Loader from '../../globalComponent/Loader';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Hoc from '../../globalComponent/Hoc';
import {CouponPreview} from '../../components/CouponSchema/CouponPreview'
import { Notification, addNotification } from '../../globalComponent/Notifications'

// For coupon
/* import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import logo from '../../../assets/images/logo.png';
import {counponToPrint} from '../../components/CouponSchema/Coupon'
pdfMake.vfs = pdfFonts.pdfMake.vfs;
const image2base64 = require('image-to-base64'); */

class AdminCoupons extends Component {

    state = {
        showModal: false,
        error: '',
        loading: false,
        selectedAnnonce: null,
        eventType: '',
        announce: null,
        announceType: '',

        event: null,
        events: [],
        eventsAll: [],
        eventsLoading: true,

        services: [],
        servicesAll: [],
        service: null,
        servicesLoading: true,

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

        currentPage: 1,
        couponsPerPage: 15
    }

    handleInputChange = (e) => {
        e.preventDefault();
        const name = e.target.name;
        const value = e.target.value;
        this.setState({
            [name]: value
        }, this.validate);
    }

    pickDate = (date) => {
        this.setState({ datelimite: date })
    }

    validate = () => {
        const { nCoupons, infos, datelimite, montant} = this.state;
        this.setState({
            couponValid: nCoupons.trim().length > 0
                        && infos.trim().length > 0
                        && datelimite != null
                        && montant.trim().length > 0
        })
    }

    componentDidMount() {
        //Get all validated events
        axios.get('/api/event/validated/all')
        .then(res => {
            this.setState({ eventsAll: res.data.events, events: res.data.events, eventsLoading: false, error: '' })
        })
        .catch(err => {
            this.setState({ error: "Une érreur s'est produite. Veuillez reéssayer.", eventsLoading: false })
        })

        //Get all validated services
        axios.get('/api/service/validated/all')
        .then(res => {
            this.setState({ servicesAll: res.data.services, services: res.data.services, servicesLoading: false, error: '' })
        })
        .catch(err => {
            this.setState({ error: "Une érreur s'est produite. Veuillez reéssayer.", servicesLoading: false })
        })
    }

    // Open modal and get single event/Service
    openModal = (id, type) => {
        this.setState({showModal: true, loading: true, eventType: type});
        let url = "/api/" + type + "/" + id;
        axios.get(url)
        .then(res => {
            const data = type === "event" ? res.data.event : res.data.service;
            this.setState({ selectedAnnonce: data, loading: false })
        })
        .catch(err => {
            this.setState({error: 'Une erreur s\'est produite. Veuillez reéssayer.', loading: false})
        })
    }

    generateCoupon = () => {
        const {nCoupons, montant, datelimite, infos, eventType, selectedAnnonce} = this.state;
        let clients = [];
        if (selectedAnnonce.coupons) {
            if (selectedAnnonce.coupons.clients) {
                clients = [...selectedAnnonce.coupons.clients];
            }
        }
        this.setState({loading: true});
        const coupon = {
            nCoupons: parseInt(nCoupons),
            montant: montant,
            datelimite: datelimite,
            title: selectedAnnonce.title,
            infos: infos,
            clients: clients,
            image: rootUrl + '/' + selectedAnnonce.image,
        };
        axios.patch(rootUrl + '/api/' + eventType + '/' + selectedAnnonce._id + '/add/coupon', { coupon: coupon })
        .then(res => {
            const data = eventType === "event" ? this.state.events : this.state.services;
            let newEvents = data.filter(event => {
                if (event._id === selectedAnnonce._id) {
                    event.coupons = coupon;
                }
                return event;
            })
            this.setState({ loading: false, showModal: false, [eventType + "s"]: newEvents })
            addNotification("success", "Coupon!", "Coupon généré avec succès")
            // generate the coupon
            /* image2base64(logo) // you can also to use url
            .then(response => {
                let docDefinition = counponToPrint(response, infos, montant, datelimite,
                    selectedAnnonce.title, "Entrecops", selectedAnnonce.title.split(' ').join('-'))
                pdfMake.createPdf(docDefinition).open();
                this.setState({ loading: false, showModal: false, [eventType+"s"]: newEvents })
            })
            .catch((error) => console.log(error)) */
        })
        .catch(err => {
            this.setState({ loading: false, couponError: 'Une erreur s\'est produite. Veuillez reéssayer.' });
        })
    }

    previewCoupon = (announce) => {
        this.setState({ showCouponPreviewModal: true, coupon: announce.coupons })
        // image2base64(logo) // you can also to use url
        //     .then(response => {
        //         let docDefinition = counponToPrint(response, infos, montant, datelimite,
        //             announce.title, "Entrecops", announce.title.split(' ').join('-'))
        //         pdfMake.createPdf(docDefinition).open();
        //     })
        //     .catch((error) => console.log(error))
    }

    removeCoupon = (id, type) => {
        this.setState({ removing: true });
        let url = rootUrl + '/api/' + type + '/' + id + '/remove/coupon';
        axios.patch(url)
        .then(res => {
            const data = type === "event" ? this.state.events : this.state.services;
            let newAnnounces = data.filter(an => {
                if (an._id === id) {
                    an.coupons = null;
                }
                return an;
            })
            this.setState({ removing: false, [type + "s"]: newAnnounces })
            addNotification("success", "Coupon!", "Coupon annulé avec succès")
        })
        .catch(err => {
            this.setState({ error: 'Une erreur s\'est produite. Veuillez reéssayer.', loading: false })
        })
    }

    // Open modal for retrieve coupon
    openRetrieveCouponModal = (announce, type) => {
        this.setState({ showUserListModal: true, announce: announce, announceType: type });
    }

    // Récupération du coupon
    retrieveCoupon = (userId) => {
        const {announce, announceType} = this.state;
        this.setState({ showUserListModal: true, announce: announce, removing: true });

        let url = rootUrl + '/api/announce/' + announce._id + '/retrieve/coupon';
        let coupon = { ...announce.coupons};
        coupon.nCoupons = Number(coupon.nCoupons) + 1;
        let newClients = coupon.clients.filter(client => client.id !== userId)
        coupon.clients = newClients;
        axios.patch(url, { coupon: coupon, announceType: announceType })
        .then(res => {
            const data = announceType === "event" ? this.state.events : this.state.services;
            let newEvents = data.filter(event => {
                if (event._id === announce._id) {
                    event.coupons = coupon;
                }
                return event;
            })
            this.setState({ removing: false, [announceType + "s"]: newEvents, showUserListModal: false })
            addNotification("success", "Coupon!", "Coupon Récupéré avec succès")
        })
        .catch(err => {
            this.setState({ error: 'Une erreur s\'est produite. Veuillez reéssayer.', removing: false })
        })
    }

    searchServicesAndActu = ( e ) => {
        const filterParam = e.target.value;
        this.setState({ services: this.state.servicesAll.filter( ev => ev.title.toLowerCase().includes(filterParam.toLowerCase()) )});
        this.setState({ events: this.state.eventsAll.filter( ev => ev.title.toLowerCase().includes(filterParam.toLowerCase()) )});
    }

    paginate = pageNumber => {
        this.setState({ currentPage: pageNumber });
    };


    render() {
        const { error, events, eventsLoading, services, servicesLoading, selectedAnnonce, loading, showUserListModal, announce, currentPage, couponsPerPage } = this.state;

        const indexofLastCoupon = currentPage * couponsPerPage;
        const indexofFirstCoupon = indexofLastCoupon - couponsPerPage;
        return (
            <Hoc>
                <Notification />
                <div className="container admin-coupons mt-4">
                    <div className="row pt-5 pb-3">
                        <div className="col">
                            <h1>Genérer des coupons de réduction</h1>
                        </div>
                    </div>
                    {/* <div className="row">
                        <div className="col-sm-12 col-md-8 col-lg-8">
                            <input type="text" placeholder="Rechercher un service / Evènement" id="searchbar" />
                        </div>
                    </div> */}
                    {/* Evenement */}
                    <div className="row mt-3">
                        <div className="col-sm-12">
                            {error.length ? <div className="alert alert-danger" style={{ fontSize: "1.3rem" }}>{error}</div> : null}
                        </div>
                        <div className="col-sm-12 text-center mb-2">
                            <input type="text" placeholder="Filtrer actualité et services" id="searchbar" onChange={this.searchServicesAndActu}/>
                        </div>
                        <div className="col-sm-12">
                            <Tabs defaultActiveKey="events" id="uncontrolled-tab-example">
                                <Tab eventKey="events" title="Actualités">
                                    {
                                        eventsLoading ? <div className="d-block mr-auto ml-auto text-center mt-5"><Loader /></div> :
                                            events && events.length ?
                                                <table className="table table-bordered tabs" id="thetable">
                                                    <thead className="thead-inverse thead-dark">
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Nom de l'évenement</th>
                                                            <th>Coupons Restants</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            events.map((event, i) => (
                                                                <tr key={event._id}>
                                                                    <th scope="row">{i + 1}</th>
                                                                    <td>{event.title}</td>
                                                                    <td>{event.coupons ?
                                                                        (new Date(event.coupons.datelimite).getTime() > new Date().getTime()) ? event.coupons.nCoupons: "Coupon Expiré" : "Pas de coupon"}</td>
                                                                    <td className="actions text-right">
                                                                        {/* Si le coupon existe et est encore en période de validité */}
                                                                        {event.coupons && (new Date(event.coupons.datelimite).getTime() > new Date().getTime())?
                                                                            <Hoc>
                                                                                <button className="btn btn-dark btn-lg mr-3" onClick={() => this.previewCoupon(event)}>Afficher le coupon</button>
                                                                                <button className="btn btn-outline-danger mr-3 btn-lg" onClick={() => this.removeCoupon(event._id, "event")}>Annuler coupons</button>
                                                                                <button className="btn btn-outline-dark btn-lg" onClick={() => this.openRetrieveCouponModal(event, "event")}>Liste/Récupération</button>
                                                                            </Hoc> :
                                                                            <button className="btn btn-danger btn-lg mr-3" onClick={() => this.openModal(event._id, "event")}>Générer des coupons</button>
                                                                        }
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        }
                                                    </tbody>
                                                </table> : null
                                    }
                                </Tab>
                                <Tab eventKey="services" title="Services">
                                    {
                                        servicesLoading ? <div className="d-block mr-auto ml-auto text-center mt-5"><Loader /></div> :
                                            services && services.length ?
                                                <table className="table table-bordered">
                                                    <thead className="thead-inverse thead-dark">
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Nom du service</th>
                                                            <th>Coupons Restants</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            services.map((service, i) => (
                                                                <tr key={service._id}>
                                                                    <th scope="row">{i + 1}</th>
                                                                    <td>{service.title}</td>
                                                                    <td>{service.coupons ?
                                                                        (new Date(service.coupons.datelimite).getTime() > new Date().getTime()) ? service.coupons.nCoupons: "Coupon Expiré" : "Pas de coupon"}</td>
                                                                    <td className="actions">
                                                                        {
                                                                            service.coupons && (new Date(service.coupons.datelimite).getTime() > new Date().getTime())?
                                                                                <Hoc>
                                                                                    <button className="btn btn-dark btn-lg mr-3" onClick={() => this.previewCoupon(service)}>Afficher le coupon</button>
                                                                                    <button className="btn btn-outline-danger mr-3 btn-lg" onClick={() => this.removeCoupon(service._id, "service")}>Annuler coupons</button>
                                                                                    <button className="btn btn-outline-dark btn-lg" onClick={() => this.openRetrieveCouponModal(service, "service")}>Liste/Récupération</button>
                                                                                </Hoc> :
                                                                                <button className="btn btn-danger btn-lg mr-3" onClick={() => this.openModal(service._id, "service")}>Générer des coupons</button>
                                                                        }
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        }
                                                    </tbody>
                                                </table> : null
                                    }
                                </Tab>
                            </Tabs>
                        </div>
                    </div>
                </div>

                {/* Générer des coupons */}
                <Modal show={this.state.showModal} onHide={() => this.setState({showModal: !this.state.showModal})} >
                    <Modal.Header closeButton>
                    <Modal.Title>Générer des coupons</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container">
                            <div className="row">
                                {
                                    loading ? <div className="d-block mr-auto ml-auto text-center"><Loader /></div>:
                                    selectedAnnonce ?
                                    <div className="col-sm-12 pl-4 pr-4 mt-4 mb-3">
                                        {!this.state.couponValid ? <div className="alert alert-danger mb-4">Veuillez remplis tous les champs</div>:null}
                                        <div className="pb-3">
                                            <h4>Coupons pour: &nbsp;<b>{selectedAnnonce.title}</b></h4>
                                        </div>
                                        <div className="form-group">
                                            <label for="name">Infos sur la réduction</label>
                                            <input type="text" onChange={(e) => this.handleInputChange(e)} value={this.state.infos} name="infos" className="form-control" placeholder="Informations"/>
                                        </div>
                                        <div className="form-group">
                                            <label for="name">Montant / Poucentage de reduction</label>
                                            <input type="text" onChange={(e) => this.handleInputChange(e)} value={this.state.montant} name="montant" className="form-control" placeholder="Montant / Pourcentage"/>
                                        </div>
                                        <div className="form-group">
                                            <label for="name">Date limite de validité</label><br/>
                                            <DatePicker showTimeSelect placeholder="Date limite de validité" dateFormat="Pp" className="form-control" selected={this.state.datelimite} onChange={date => this.pickDate(date)} />
                                        </div>
                                        <div className="form-group">
                                            <label for="ncoupons">Nombre de coupons</label>
                                            <input type="number" onChange={(e) => this.handleInputChange(e)} value={this.state.nCoupons} name="nCoupons" className="form-control" placeholder="Nombre de coupons"/>
                                        </div>
                                        <div className="couponwrap" id="couponwrap">

                                        </div>
                                    </div>:null
                                }
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="py-3">
                            <Button disabled={!this.state.couponValid} variant="danger" onClick={this.generateCoupon}>
                                Générer
                            </Button>
                            <Button variant="default" className="ml-4" onClick={() => this.setState({showModal: false})}>
                                Fermer
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>

                {/* Coupon preview */}
                <Modal show={this.state.showCouponPreviewModal} onHide={() => this.setState({ showCouponPreviewModal: false })} size="md" >
                    <Modal.Header closeButton>
                        <Modal.Title>Coupon de réduction</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container">
                            <div className="row justify-content-between">
                                <div className="col-sm-12 pl-4 pr-4 mt-4 mb-3 text-center">
                                    <CouponPreview coupon={this.state.coupon} />
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="py-3">
                            <Button variant="default" onClick={() => this.setState({ showCouponPreviewModal: false })}>
                                Fermer
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>

                {/* User list that have coupon */}
                <Modal show={showUserListModal} onHide={() => this.setState({ showUserListModal: false })} size="lg" >
                    <Modal.Header closeButton>
                        <Modal.Title>Récupération du coupon</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container">
                            <div className="row justify-content-between">
                                <div className="col-sm-12 pl-4 pr-4 mt-4 mb-3 text-center">
                                <table className="table table-bordered">
                                    <thead className="thead-inverse thead-dark">
                                        <tr>
                                            <th>#</th>
                                            <th>Nom</th>
                                            <th>Email</th>
                                            <th>Tel</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            announce&&announce.coupons&&announce.coupons.clients&&announce.coupons.clients.map((client, i) => (
                                                <tr key={client.id}>
                                                    <th scope="row">{i + 1}</th>
                                                    <td><h4>{client.name}</h4></td>
                                                    <td><h4>{client.email}</h4></td>
                                                    <td><h4>{client.tel}</h4></td>
                                                    <td className="actions">
                                                        <button disabled={this.state.removing} className="btn btn-danger btn-lg mr-3"
                                                        onClick={() => this.retrieveCoupon(client.id)}>{this.state.removing ? <Loader color="white"/>: "Récupérer le coupon"}</button>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="py-3">
                            <Button variant="default" onClick={() => this.setState({ showUserListModal: false })}>
                                Fermer
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>
            </Hoc>
        );
    }
}

export default AdminCoupons;