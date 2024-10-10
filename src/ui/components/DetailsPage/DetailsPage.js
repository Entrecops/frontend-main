/* eslint-disable no-mixed-operators */
import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import socketIOClient from "socket.io-client";
import {connect} from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faMapMarked, faSearch, faComment, faAnchor } from '@fortawesome/free-solid-svg-icons';
import './DetailsPage.scss';
import {DateFormat} from "../../utils/DateFormat"
// import AwesomeSlider from 'react-awesome-slider';
// import AwsSliderStyles from 'react-awesome-slider/src/styles';
// import pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/scss/image-gallery.scss";

import Header from '../../globalComponent/Header';
import {Notification, addNotification} from '../../globalComponent/Notifications'
import Hoc from '../../globalComponent/Hoc';
import ReviewItem from '../Reviews/ReviewItem';
import SearchResultItem from '../UserSearchResult/UserSearchResult';
import Stars from '../Stars/Stars';
import Loader from '../../globalComponent/Loader';
import {CouponPreview} from '../CouponSchema/CouponPreview'
import {rootUrl} from '../../../configs/config';
import { SocialIcon } from 'react-social-icons';
// import logo from '../../../assets/images/logo.png';
// import {counponToPrint} from '../CouponSchema/Coupon'
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
// const image2base64 = require('image-to-base64');


class DetailsPage extends Component {
    socket = socketIOClient(rootUrl);

    state = {
        showReservationModal: false,
        showRecModal: false,
        showCouponModal: false,
        showVideo: false,
        showToast: false,
        downloadingCoupon: false,
        coupon: '',

        announce: null,
        loading: true,
        error: '',
        /* When leaving a comment */
        userMessage: '',
        userEmail: this.props.user ? this.props.user.email : '',
        userName: this.props.user&&this.props.user.name ? this.props.user.name : '',
        sendingComment: false,
        messageValid: false,
        deletingComment: false,
        commentError: '',

        /* When making a reservation */
        tel: '',
        name: this.props.user ? this.props.user.name : '',
        email: this.props.user ? this.props.user.email : '',
        formValid: false,
        reserving: false,
        reservationError: '',
        operator: '2',

        /* when searching user */
        searchingUser: false,
        userList: [],
        search: '',

        /* when making recommandations */
        recError: '',
        pageLocation: window.location.href,

        /** Processing event */
        processingEvent: {}
    }

    handleInputChange = (e) => {
        e.preventDefault();
        const name = e.target.name;
        const value = e.target.value;
        if( name === 'tel' ){
            this.setState({
                'tel_pay': value
            }, this.validate);
        }
        this.setState({
            [name]: value
        }, this.validate);
    }

    handleCommentInputChange = (e) => {
        e.preventDefault();
        const name = e.target.name;
        const value = e.target.value;
        this.setState({
            [name]: value
        }, this.validateComment);
    }

    validate = () => {
        const { name, email, tel } = this.state;
        this.setState({
            formValid: name.trim().length > 0 &&
                email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)
                && tel.trim().length > 0
         })
    }

    validateComment = () => {
        const { userEmail, userName, userMessage } = this.state;
        this.setState({
            messageValid: userName.trim().length > 0 &&
                userEmail.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i) &&
                userMessage.trim().length > 0
         })
    }

    searchUser = (e) => {
        e.preventDefault();
        const name = e.target.name;
        const value = e.target.value;
        this.setState({
            [name]: value,
            searchingUser: true
        });
        if(value.length > 1) {
            axios.get('/api/user/' + value + '/search')
            .then(res => {
                const userList = res.data.users
                this.setState({ searchingUser: false, userList: userList })
            })
            .catch(err => {
                this.setState({ searchingUser: false})
            })
        }
    }

    openRecommandationModal = () => {
        if(this.props.user) {
            this.setState({showRecModal: true})
        } else {
            this.props.history.push('/auth/login');
        }
    }

    // Make a reccommandation
    makeRecommadation = (id) => {
        const rec = {
            to: id,
            title: this.state.announce.title,
            link: '/annonce/' + this.props.match.params.anounceType + '/' + this.props.match.params.id,
            image: rootUrl +'/'+ this.state.announce.image,
            name: this.props.user.name,
            visited: false,
            projectId: this.props.match.params.id,
            date: new Date()
        }
        try {
            // Send notification with socketio
            const socket = socketIOClient(rootUrl);
            // save in database
            axios.patch('/api/user/'+id+'/recommand', { rec: rec })
            .then(res => {
                    socket.emit("new notification", rec);
                    this.setState({ recError: '' })
                })
                .catch(err => {
                    this.setState({ recError: 'Une érreur s\'est produite. Veuillez recharger la page.' })
                })
        } catch (error) {
            this.setState({ recError: 'Une érreur s\'est produite. Veuillez recharger la page.' })
        }
    }

    // When make a reservation
    makeReservation = (e) => {
        e.preventDefault();
        // Check if Max reservation have been reached
        const maxReservation = this.state.announce.maxReservation;
        const currentReservation = this.state.announce.reservations.length;
        if(maxReservation > currentReservation) {
            // There are available place
            this.setState({reserving: true})
            const { anounceType, id } = this.props.match.params;
            let url = "";
            if(anounceType === "event") {
                url = "/api/event/" + id + "/makereservation";
            } else
            if (anounceType === "service"){
                url = "/api/service/" + id + "/makereservation";
            }
            try {
                const reservation = {
                    userId: this.props.user._id,
                    name: this.state.name,
                    email: this.state.email,
                    tel: this.state.tel,
                    tel_pay: this.state.tel_pay,
                    operator: this.state.operator,
                    image: rootUrl + '/' + this.state.announce.image,
                    title: this.state.announce.title,
                    link: '/annonce/' + this.props.match.params.anounceType + '/' + this.props.match.params.id,
                    projectId: this.props.match.params.id,
                    date: new Date()
                }
                let announce = { ...this.state.announce}
                announce.reservations.push(reservation)
                axios.patch(url, { reservation: reservation })
                .then(res => {
                    if( res.data.processPayment ){
                        this.setState({ processingEvent: res.data.event});
                        this.processButton.click();
                    } else {
                        addNotification("success", "Reservation!", "Reservation enregistrée avec succès");
                        // Send notification to supplier and admin
                        this.socket.emit( "new_notification" , {
                            "receiver": "admin",
                            data: { announce, reservation },
                            "type": "new_reservation"
                        });
                        this.socket.emit( "new_notification" , {
                            "receiver": announce.owner._id,
                            data: { announce, reservation },
                            "type": "new_reservation"
                        });
                        this.setState({ reserving: false, reservationError: '', showReservationModal: false, announce: announce })
                    }
                })
                .catch(err => {
                    console.log( err );
                    if( err.response.status === 401 ) {
                        addNotification("warning", "Reservation!", "Vous ne pouvez plus effectuer de reservation");
                        this.setState({ reserving: false, reservationError: '', showReservationModal: false, announce: announce })
                    } else {
                        this.setState({ reserving: false, reservationError: 'Une érreur s\'est produite. Veuillez recharger la page.' })
                    }
                })
            } catch (error) {
                this.setState({ reserving: false, reservationError: 'Une érreur s\'est produite. Veuillez recharger la page.' })
            }
        } else {
            this.setState({ reserving: false, reservationError: '', showReservationModal: false})
            addNotification("warning", "Reservation!", "Le nombre de réservation limite a été atteint.");
        }
    }

    openReservationModal = () => {
        if(this.props.user) {
            this.setState({showReservationModal: true})
        } else {
            this.props.history.push('/auth/login');
        }
    }

    componentDidUpdate(prevProps) {
        if(prevProps.user !== this.props.user) {
            this.setState({
                name: this.props.user.name,
                email: this.props.user.email && this.props.user.email ? this.props.user.email: "",
                userEmail: this.props.user.email && this.props.user.email ? this.props.user.email : "",
                userName: this.props.user.name})
        }
    }

    componentDidMount() {
        const {anounceType, id} = this.props.match.params;
        let url = "";
        if(anounceType === "event") {
            url = '/api/event/' + id;
        } else if(anounceType === "service") {
            url = '/api/service/' + id;
        }
        // get data from event/service
        try {
            axios.get(url)
            .then(res => {
                let data = anounceType === "event" ? res.data.event: res.data.service;
                this.setState({announce: data, loading: false, error: ''})
                // The way to update visited notification
                const authData = JSON.parse(localStorage.getItem("authData"));
                if (authData&&authData.user.recommandations) {
                    let notifications = [...authData.user.recommandations];
                    authData.user.recommandations.forEach((not, i) => {
                        if (not.projectId === this.props.match.params.id && !not.visited) {
                            let updateOne = {...not};
                            updateOne.visited = true;
                            notifications[i] = updateOne;
                            axios.patch('/api/user/' + authData.user._id + '/notification/seen', { rec: notifications})
                            .then(res => {
                                this.setState({ recError: '' })
                            })
                            .catch(err => {
                                this.setState({ recError: 'Une érreur s\'est produite. Veuillez recharger la page.' })
                            })
                        }
                    });
                }
            })
            .catch(err => {
                this.setState({loading: false, error: 'Une érreur s\'est produite. Veuillez recharger la page.'})
            })
        } catch (error) {
            this.setState({ loading: false, error: 'Une érreur s\'est produite. Veuillez recharger la page.' })
        }

    }

    submitComment = (e) => {
        e.preventDefault();
        this.setState({ sendingComment: true })
        const { anounceType, id } = this.props.match.params;
        let url = "";
        if (anounceType === "event") {
            url = "/api/event/" + id + "/comment";
        } else
            if (anounceType === "service") {
                url = "/api/service/" + id + "/comment";
            }
        try {
            const comment = {
                name: this.state.userName,
                email: this.state.userEmail,
                message: this.state.userMessage,
                date: new Date()
            }
            axios.patch(url, { comment: comment })
            .then(res => {
                let newAnnounce = {...this.state.announce};
                newAnnounce.comments.push(comment);
                this.setState({ sendingComment: false, commentError: '', userMessage: '', announce: newAnnounce })
            })
            .catch(err => {
                this.setState({ sendingComment: false, commentError: 'Une érreur s\'est produite. Veuillez recharger la page.' })
            })
        } catch (error) {
            this.setState({ sendingComment: false, commentError: 'Une érreur s\'est produite. Veuillez recharger la page.' })
        }
    }

    // Delete commet [by admin]
    deleteComment = (commentId) => {
        this.setState({deletingComment: true})
            const { anounceType, id } = this.props.match.params;
            let url = "";
            if(anounceType === "event") {
                url = "/api/event/" + id + "/deletecomment";
            } else
            if (anounceType === "service"){
                url = "/api/service/" + id + "/deletecomment";
            }
            axios.patch(url, { commentId: commentId })
                .then(res => {
                    // Romove comment on the frontend
                    let announce = { ...this.state.announce}
                    let updatedComments = announce.comments.filter(comment => {
                        return comment._id !== commentId
                    })
                    announce.comments = updatedComments;
                    this.setState({ deletingComment: false, announce: announce })
                    addNotification("success", "Commentaire!", "Commentaire supprimé avec succès");
                })
                .catch(err => {
                    this.setState({ reserving: false, reservationError: 'Une érreur s\'est produite. Veuillez recharger la page.' })
                })
    }

    // Téléchargement du coupon
    getCoupon = () => {
        if(this.props.user) {
            const sanctionDateLimit = this.props.user.sanctionDateLimit;
            const haveAccessToCoupon = !sanctionDateLimit || (new Date(sanctionDateLimit).getTime() - new Date().getTime()) < 0;
            // Verify if user is not sanctionned to access coupon
            if(!haveAccessToCoupon) {
                addNotification("danger", "Coupon Info!", "Vous n'avez pas accès aux coupons. Nouvelle accès jusqu'à la date du: "+sanctionDateLimit);
            } else {
                if (this.state.announce.coupons && this.state.announce.coupons.clients) {
                    // Verify if i have not already download the this coupons
                    if (this.state.announce.coupons.clients.filter(client => client.id === this.props.user._id).length > 0) {
                        addNotification("warning", "Coupon Info!", "Vous avez déja télécharger le coupon.")
                    } else {
                        // Verify if user have already make reservation
                        // let haveMakedReservation = false;
                        // this.state.announce.reservations.forEach(res => {
                        //     if (res.userId === this.props.user._id) {
                        //         haveMakedReservation = true;
                        //         return;
                        //     }
                        // })
                        // if(haveMakedReservation) {
                            this.setState({downloadingCoupon: true})
                            // update the the remainings coupons
                            let url = rootUrl + '/api/' + this.props.match.params.anounceType + '/' + this.state.announce._id + '/add/coupon';
                            let coupon = { ...this.state.announce.coupons};
                            coupon.nCoupons = Number(coupon.nCoupons) - 1;
                            const user = {"id": this.props.user._id, "name": this.props.user.name, "email": this.props.user.email, "tel": this.props.user.tel}
                            coupon.clients.push(user);
                            axios.patch(url, { coupon: coupon })
                            .then(res => {
                                let newAnnounce = {...this.state.announce}
                                newAnnounce.coupons.clients.push(user)
                                this.setState({ downloadingCoupon: false, announce: newAnnounce, showCouponModal: false });
                                addNotification("success", "Coupon!", "Le coupon a été sauvegardé dans votre espace personnel.")
                                // Generate the pdf
                                /* image2base64(logo) // you can also to use url
                                    .then(response => {
                                        const {infos, montant, datelimite} = this.state.announce.coupons;
                                        let docDefinition = counponToPrint(response, infos, montant, datelimite,
                                            this.state.announce.title, window.location.href, this.state.announce.title.split(' ').join('-'))
                                        const pdfDocGenerator = pdfMake.createPdf(docDefinition).open();
                                        this.setState({ downloadingCoupon: false, announce: newAnnounce, showCouponModal: false });
                                        pdfDocGenerator.getDataUrl((dataUrl) => {
                                            const iframe = document.createElement('iframe');
                                            iframe.src = dataUrl;
                                            // document.getElementById("couponpreview").appendChild(iframe);
                                        });
                                    })
                                    .catch((error) => console.log(error)) */
                            })
                            .catch(err => {
                                this.setState({ loading: false, couponError: 'Une erreur s\'est produite. Veuillez reéssayer.' });
                            })
                            // User have not made reservation
                        // } else {
                        //     addNotification("warning", "Coupon Info!", "Veuillez effectuer une reservation avant de télécharger le coupon.")
                        // }
                    }
                }
            }
        } else {
            this.props.history.push('/auth/login');
        }
    }

    displayToast = () => {
        this.setState({showToast: true});
        navigator.clipboard.writeText('http://entrecops.co/annonce/' + this.props.match.params.anounceType + '/' + this.props.match.params.id,);
        setTimeout(() => {
            this.setState({showToast: false});
        }, 2000)
    }

    setFile(name,file, previewFile) {
        this.setState({
            [name]: file
        });
    }

    openMap = (e, url) => {
        e.preventDefault()
        const width = 600, height = 600
        const left = (window.innerWidth / 2) - (width / 2)
        const top = (window.innerHeight / 2) - (height / 2)

        return window.open(url, '',
            `toolbar=no, location=no, directories=no, status=no, menubar=no,
      scrollbars=no, resizable=no, copyhistory=no, width=${width},
      height=${height}, top=${top}, left=${left}`
        )
    }

    render() {
        const { announce, error, loading, name, email, tel, messageValid, reserving, downloadingCoupon, formValid, reservationError, recError, sendingComment, userEmail, userName, userMessage, tel_pay, operator, processingEvent } = this.state;
        const {anounceType} = this.props.match.params;

        let images = [];
        if(announce&&announce.images) {
            images = announce.images.map(image => {
                return {
                    original: rootUrl + '/' + image,
                    thumbnail: rootUrl + '/' + image
                }
            })
        }

        return (
            <Hoc>
                <Header />
                <Notification />
                <section className="project-details">
                    <div className="container" id="projectdetails">
                        <div className="row">
                            {error.length ? <div className="alert alert-danger d-block mr-auto ml-auto">{error}</div>:null}
                        </div>
                        <div className="row pb-5 pt-3">
                            {
                                loading ? <div className="d-block mr-auto ml-auto py-5 mt-5"><Loader /></div>:
                                <Hoc>
                                    <div className="col-sm-12 col-md-8 col-lg-8 left">
                                        <div className="infos pb-4">
                                            {/* <img src={rootUrl + '/' +announce.image} alt="service" /> */}
                                            {/* <AwesomeSlider bullets={false} cssModule={AwsSliderStyles}>
                                                {announce.images.map((image, id) => <div key={id} data-src={rootUrl + '/' + image} />)}
                                            </AwesomeSlider> */}

                                            <ImageGallery items={images} />

                                            <div className="otherinfos">
                                                <div className="d-flex align-items-center justify-content-between titleandstars">
                                                    <div>
                                                        <h2>{announce.title}</h2>
                                                        <h5 className="py-2">{announce.category}</h5>
                                                    </div>
                                                    <div className="moreinfos d-none d-md-block d-flex justify-content-between mt-3">
                                                        <Stars
                                                            rate={announce.rate ? announce.rate: null }
                                                            anounceType={anounceType}
                                                            id={this.props.match.params.id} />
                                                    </div>
                                                </div>
                                                <hr/>
                                            </div>

                                            {/* Mobile Version */}
                                            <div className="right right-mobile" id="right-mobile">
                                                <div className="infos">
                                                {
                                                    anounceType === "event" ?
                                                    <Hoc>
                                                        <div className="d-flex py-2">
                                                            <FontAwesomeIcon icon={faCalendar} size={"2x"} />
                                                            <h2>Date: <DateFormat date={announce.date} /></h2>
                                                        </div>
                                                        <hr />
                                                        <div className="d-flex py-2">
                                                            <FontAwesomeIcon icon={faMapMarked} size={"2x"} />
                                                            <h2>Lieu: {announce.place}</h2>
                                                        </div>
                                                    </Hoc>:null
                                                }
                                                {
                                                    anounceType === "service" ?
                                                    <Hoc>
                                                        <div className="d-flex py-2">
                                                            <FontAwesomeIcon icon={faCalendar} size={"2x"} />
                                                            <h2>Durée: {announce.duration}</h2>
                                                        </div>
                                                        <hr />
                                                        <div className="d-flex py-2">
                                                            <FontAwesomeIcon icon={faMapMarked} size={"2x"} />
                                                            <h2>Lieu: {announce.place}</h2>
                                                        </div>
                                                        <hr />
                                                        <div className="d-flex py-2">
                                                            <FontAwesomeIcon icon={faAnchor} size={"2x"} />
                                                            <h2>Cible: {announce.target}</h2>
                                                        </div>
                                                    </Hoc>:null
                                                }
                                                    <hr />
                                                    <button className="button mt-3 book"
                                                        onClick={this.openReservationModal}>Reserver ({announce.maxReservation - announce.reservations.length} restants)</button>
                                                    <button className="button mt-3 reccommand"
                                                        onClick={this.openRecommandationModal}>Partager</button>
                                                </div>

                                                <div className="other-infos mt-4">
                                                    {announce.coupons ?
                                                        Number(announce.coupons.nCoupons) > 0 ?
                                                        <div className="d-flex flex-column alert alert-warning py-4 px-3">
                                                            <h3 className="pb-3 text-center mt-3">{announce.coupons.nCoupons} Coupons Restants</h3>
                                                            <h3 className="text-center" style={{ color: "#DC3545"}}>{announce.coupons.infos}</h3><br/>
                                                            <h4 className="text-center">Réduction de <strong>{announce.coupons.montant}%</strong>.</h4><br/>
                                                            <button className="button mt-1 mb-3 book" onClick={() => this.setState({ showCouponModal: true })}>Télécharger le Coupon</button>
                                                        </div> :
                                                            <div className="d-flex flex-column py-2">
                                                                <h3 className="text-center">Pas de Coupons de réductions disponible pour cette annonce.</h3>
                                                            </div> :
                                                        <div className="d-flex flex-column py-2">
                                                            <h3 className="text-center">Pas de Coupons de réductions disponible pour cette annonce.</h3>
                                                        </div>
                                                    }
                                                </div>
                                                <div className="moreinfos d-flex justify-content-between mb-3">
                                                    <div className="headers d-flex align-items-center py-4">
                                                        <FontAwesomeIcon icon={faComment} size={"2x"} />
                                                        <h3 className="ml-3 mb-0">Reviews des clients</h3>
                                                    </div>
                                                    <Stars
                                                        rate={announce.rate ? announce.rate: null }
                                                        anounceType={anounceType}
                                                        id={this.props.match.params.id} />
                                                </div>
                                                <div className="other-infos mt-4">
                                                    <div className="d-flex flex-column">
                                                        {
                                                            announce.video&&announce.video.length ?
                                                            <Hoc>
                                                                <h3 className="mb-3">Regardez l'aperçu en video</h3>
                                                                <video src={rootUrl + '/' + announce.video} width="100%" height="100%" controls onClick={() => this.setState({ showVideo: true })}>
                                                                </video>
                                                            </Hoc> :
                                                                    announce.youtubeVideoLink&&announce.youtubeVideoLink.length ?
                                                                <Hoc>
                                                                    <h3 className="mb-3">Regardez l'aperçu en video</h3>
                                                                    <iframe width="100%" height="100%" title="Video de l'annonce"
                                                                        src={announce.youtubeVideoLink}
                                                                        onClick={() => this.setState({ showVideo: true })}>
                                                                    </iframe>
                                                                </Hoc> :
                                                                <h3 className="mb-3 text-center">Aucune vidéo disponible.</h3>
                                                        }
                                                    </div>
                                                    <div className="d-flex flex-column">
                                                        <h3 className="mb-4">Localisation</h3>
                                                        {announce.mapLink && announce.mapLink.length ?
                                                            <Hoc>
                                                                <h2><a href="#map" style={{"cursor":"pointer"}} onClick={(e) => this.openMap(e, announce.mapLink)} >Lien Google Map</a></h2>
                                                                <p>Cliquez sur le lien pour agrandir.</p>
                                                            </Hoc> :
                                                            <p>Pas de Localisation disponible</p>}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* End Mobile Version */}

                                            {
                                                anounceType === "event" ?
                                                <Hoc>
                                                    <div className="otherinfos">
                                                        <div className="d-flex flex-column">
                                                            <h3>Description</h3>
                                                            <p>{announce.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="otherinfos">
                                                        <div className="d-flex flex-column">
                                                            <h3>Autres Informations</h3>
                                                            <p>{announce.otherInfos}</p>
                                                        </div>
                                                        <hr/>
                                                    </div>
                                                </Hoc>:null
                                            }
                                            {
                                                anounceType === "service" ?
                                                <Hoc>
                                                    <div className="otherinfos">
                                                        <div className="d-flex flex-column">
                                                            <h3>Prix d'une reservation</h3>
                                                            <p>{announce.price} FCFA</p>
                                                        </div>
                                                    </div>
                                                    <div className="otherinfos">
                                                        <div className="d-flex flex-column">
                                                            <h3>Offre</h3>
                                                            <p>{announce.offre}</p>
                                                        </div>
                                                    </div>
                                                </Hoc>:null
                                            }

                                            <div className="moreinfos d-flex justify-content-between mb-3">
                                                <div className="headers d-flex align-items-center py-4">
                                                    <FontAwesomeIcon icon={faComment} size={"2x"} />
                                                    <h3 className="ml-3 mb-0">Reviews des clients</h3>
                                                </div>
                                            </div>
                                            <div className="moreinfos">
                                                <div className="content">
                                                    {
                                                        announce.comments&&announce.comments.length ?
                                                        announce.comments.reverse().map((comment, i) => (
                                                            <ReviewItem key={i} deleteComment={this.deleteComment} deleting={this.state.deletingComment} role={this.props.user&&this.props.user.role ? this.props.user.role: "visitor"} comment={comment} />
                                                        ))
                                                        : <h5 className="text-center py-3">Aucun commentaire</h5>
                                                    }
                                                </div>
                                            </div>
                                            <div className="form-content mb-5">
                                                <p>Laissez un commentaire</p>
                                                <form className="input__form">
                                                    <div className="row">
                                                        <div className="col-sm-6">
                                                            <div className="form-group">
                                                                    <input placeholder="Votre nom" value={userName} className="form-control" name="userName" onChange={(e) => this.handleCommentInputChange(e)} />
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-6">
                                                            <div className="form-group">
                                                                    <input placeholder="Adresse email" value={userEmail} className="form-control" name="userEmail" onChange={(e) => this.handleCommentInputChange(e)} />
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-12 my-2">
                                                            <div className="form-group">
                                                                    <textarea placeholder="Entrer votre commentaire" value={userMessage} name="userMessage" className="form-control" onChange={(e) => this.handleCommentInputChange(e)} id="textmessage" rows="3"></textarea>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button disabled={sendingComment || !messageValid} onClick={(e) => this.submitComment(e)} className="btn btn-danger send-btn" type="submit">Publier {sendingComment ? <Loader color="white"/>:null}</button>
                                                </form>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="col-sm-12 col-md-4 col-lg-4 right right-desktop">
                                        <div className="">
                                            <div className="infos">
                                            {
                                                anounceType === "event" ?
                                                <Hoc>
                                                    <div className="d-flex py-2">
                                                        <FontAwesomeIcon icon={faCalendar} size={"2x"} />
                                                        <h2>Date: <DateFormat date={announce.date} /></h2>
                                                    </div>
                                                    <hr />
                                                    <div className="d-flex py-2">
                                                        <FontAwesomeIcon icon={faMapMarked} size={"2x"} />
                                                        <h2>Lieu: {announce.place}</h2>
                                                    </div>
                                                </Hoc>:null
                                            }
                                            {
                                                anounceType === "service" ?
                                                <Hoc>
                                                    <div className="d-flex py-2">
                                                        <FontAwesomeIcon icon={faCalendar} size={"2x"} />
                                                        <h2>Durée: {announce.duration}</h2>
                                                    </div>
                                                    <hr />
                                                    <div className="d-flex py-2">
                                                        <FontAwesomeIcon icon={faMapMarked} size={"2x"} />
                                                        <h2>Lieu: {announce.place}</h2>
                                                    </div>
                                                    <hr />
                                                    <div className="d-flex py-2">
                                                        <FontAwesomeIcon icon={faAnchor} size={"2x"} />
                                                        <h2>Cible: {announce.target}</h2>
                                                    </div>
                                                </Hoc>:null
                                            }
                                                <hr />
                                                <button className="button mt-3 book"
                                                    onClick={() => this.openReservationModal()}>Reserver ({announce.maxReservation - announce.reservations.filter( resa => resa.paid === true ).length } restants)</button>
                                                <br/>
                                                <br/>
                                                    <h4>Prix d'une reservation: {announce.price} FCFA </h4>
                                                <button className="button mt-3 reccommand"
                                                    onClick={() => this.openRecommandationModal()}>Partager</button>
                                            </div>

                                            <div className="other-infos mt-4">
                                                {announce.coupons ?
                                                    Number(announce.coupons.nCoupons) > 0 ?
                                                    <div className="d-flex flex-column alert alert-warning py-4 px-3">
                                                        <h3 className="pb-3 text-center mt-3">{announce.coupons.nCoupons} Coupons Restants</h3>
                                                        <h3 className="text-center" style={{ color: "#DC3545"}}>{announce.coupons.infos}.</h3><br/>
                                                        <h4 className="text-center">Réduction de <strong>{announce.coupons.montant}%</strong>.</h4><br/>
                                                        <button className="button mt-1 mb-3 book mx-4" onClick={() => this.setState({ showCouponModal: true })}>Télécharger le Coupon</button>
                                                    </div>:
                                                    <div className="d-flex flex-column py-2">
                                                        <h3 className="text-center">Pas de Coupons de réductions disponible pour cette annonce.</h3>
                                                    </div>:
                                                    <div className="d-flex flex-column py-2">
                                                        <h3 className="text-center">Pas de Coupons de réductions disponible pour cette annonce.</h3>
                                                    </div>
                                                }
                                            </div>

                                            <div className="other-infos mt-4">
                                                <div className="d-flex flex-column">
                                                        {
                                                            announce.video&&announce.video.length ?
                                                                <Hoc>
                                                                    <h3 className="mb-3">Regardez l'aperçu en video</h3>
                                                                    <video src={rootUrl + '/' + announce.video} width="100%" height="100%" controls onClick={() => this.setState({ showVideo: true })}>
                                                                    </video>
                                                                </Hoc> :
                                                                announce.youtubeVideoLink&&announce.youtubeVideoLink.length ?
                                                                    <Hoc>
                                                                        <h3 className="mb-3">Regardez l'aperçu en video</h3>
                                                                        <iframe width="100%" height="100%" title="Video de l'annonce"
                                                                            src={announce.youtubeVideoLink}
                                                                            onClick={() => this.setState({ showVideo: true })}>
                                                                        </iframe>
                                                                    </Hoc> :
                                                                <h3 className="mb-3 text-center">Aucune vidéo disponible.</h3>
                                                        }
                                                </div>
                                            </div>
                                            <div className="other-infos mt-4">
                                                <div className="d-flex flex-column">
                                                    <h3 className="mb-4">Localisation</h3>
                                                    {announce.mapLink && announce.mapLink.length ?
                                                    <Hoc>
                                                        <h2><a href="#map" style={{ "cursor": "pointer" }} onClick={(e) => this.openMap(e, announce.mapLink)} >Lien Google Map</a></h2>
                                                        <p>Cliquez sur le lien pour agrandir.</p>
                                                    </Hoc>:
                                                    <p>Pas de Localisation disponible</p>}
                                                </div>
                                            </div>
                                            <div className="other-infos mt-4">
                                                <div className="d-flex flex-column">
                                                    <h3 className="mb-4">Réseaux sociaux</h3>
                                                        {announce.facebookLink && announce.facebookLink.length ||
                                                        announce.instagramLink && announce.instagramLink.length ||
                                                        announce.twitterLink && announce.twitterLink.length ||
                                                        announce.whatsappLink && announce.whatsappLink.length ?
                                                    <Hoc>
                                                        <div className='row pt-4'>
                                                            <div className='social-icons-container'>
                                                                {announce.facebookLink && announce.facebookLink.length &&
                                                                <SocialIcon url={announce.facebookLink} target="_blank"/>}
                                                                {announce.instagramLink && announce.instagramLink.length &&
                                                                <SocialIcon url={announce.instagramLink} target="_blank"/>}
                                                                {announce.twitterLink && announce.twitterLink.length &&
                                                                <SocialIcon url={announce.twitterLink} target="_blank"/>}
                                                                {announce.whatsappLink && announce.whatsappLink.length &&
                                                                <SocialIcon url={`https://wa.me/${announce.whatsappLink}`} target="_blank"/>}
                                                            </div>
                                                        </div>
                                                    </Hoc>:
                                                    <p>Pas de reseaux sociaux disponible.</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                            </Hoc>
                            }
                        </div>
                    </div>
                </section>

                {/* Reservation */}
                <Modal show={this.state.showReservationModal} onHide={() => this.setState({showReservationModal: !this.state.showReservationModal})} >
                    <Modal.Header closeButton>
                    <Modal.Title>Faites votre réservation</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container">
                            <div className="row">
                                <div className="col-sm-12 pl-4 pr-4 mt-4 mb-3">
                                    {!formValid ? <div className="alert alert-danger">Veuillez remplir tous les champs</div>:null}
                                    {reservationError.length ? <div className="alert alert-danger">{reservationError}</div>:null}
                                    <div className="form-group">
                                        <label for="name">Nom complet</label>
                                        <input type="text" className="form-control" onChange={(e) => this.handleInputChange(e)} value={name} name="name" id="name" placeholder="Nom complet"/>
                                    </div>
                                    <div className="form-group">
                                        <label for="email">Addresse Email</label>
                                        <input type="email" className="form-control" onChange={(e) => this.handleInputChange(e)} value={email} name="email" id="email" placeholder="Adresse Email"/>
                                    </div>
                                    <div className="form-group">
                                        <label for="tel">Numero de Téléphone (Whatsapp)</label>
                                        <input type="tel" className="form-control" value={tel} onChange={(e) => this.handleInputChange(e)} name="tel" id="tel" pattern="[0-9]{9}" placeholder="Numero Whatsapp"/>
                                    </div>
                                    <div className="form-group">
                                        <label for="tel_pay">Numero de Téléphone (Paiement)</label>
                                        <input type="tel" className="form-control" value={tel_pay} onChange={(e) => this.handleInputChange(e)} name="tel_pay" id="tel_pay" pattern="[0-9]{9}" placeholder="Numero de paiement"/>
                                    </div>
                                    <h6><strong>*Des frais supplémentaires de transaction peuvent s'appliquer</strong></h6>
                                    <form method="post" action="https://www.my-dohone.com/dohone/pay">
                                        <input type="hidden" name="cmd" value="start"/>
                                        <input type="hidden" name="rN" value={processingEvent.name}/>
                                        <input type="hidden" name="rT" value={processingEvent.tel_pay}/>
                                        <input type="hidden" name="rE" value={processingEvent.email}/>
                                        <input type="hidden" name="rH" value="VN216Z0741083077833"/>
                                        <input type="hidden" name="rI" value={processingEvent.transactionId}/>
                                        <input type="hidden" name="rMt" value={processingEvent.totalAmount}/>
                                        <input type="hidden" name="rDvs" value="XAF"/>
                                        <input type="hidden" name="rLocale" value="fr"/>
                                        <input type="hidden" name="source" value="Entrecops"/>
                                        <input type="hidden" name="endPage" value={window.location.href}/>
                                        <input type="hidden" name="notifyPage" value="https://entrecops.co/api/hook/webhook"/>
                                        <input type="hidden" name="cancelPage" value={window.location.href}/>
                                        <input type="hidden" name="motif" value="Paiement de la réservation"/>
                                        <button type="submit" value="Valider" ref={ button => this.processButton = button} style={{ display:'none' }}></button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="py-3">
                            <Button variant="danger" disabled={!formValid || reserving} onClick={(e) => this.makeReservation(e) }>
                                Valider la Reservation {reserving ? <Loader color="white" />: null}
                            </Button>
                            <Button variant="default" onClick={() => this.setState({showReservationModal: !this.state.showReservationModal})}>
                                Fermer
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>

                {/* Recommandation */}
                <Modal show={this.state.showRecModal} onHide={() => this.setState({showRecModal: !this.state.showRecModal})} size="lg" >
                    <Modal.Header closeButton>
                    <Modal.Title>Faire des recommandations</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container">
                            <div className="row">
                                <div className="col-sm-12 pl-4 pr-4 mt-4 mb-3">
                                    {recError.length ? <div className="alert alert-danger">{recError}</div>:null}
                                    <div className="d-flex flex-row search align-items-center">
                                        <input type="text" className="form-control searchInput" value={this.state.search} onChange={(e) => this.searchUser(e)} name="search" placeholder="Rechercher un membre"/>
                                        <FontAwesomeIcon icon={faSearch} />
                                    </div>
                                    {/* Results */}
                                    {
                                        this.state.searchingUser ? <div className="d-block mr-auto ml-auto text-center mt-3"><Loader/></div>:
                                            this.state.userList.length ?
                                            <div className="results py-5">
                                                {
                                                    this.state.userList.map((user, i) => {
                                                        const item = user.recommandations.filter(ev => (
                                                            ev.title === announce.title
                                                        ))
                                                        if (item.length) {
                                                            return <SearchResultItem key={i} recommanded={true} makeRecommandation={() => this.makeRecommadation(user._id)} name={user.name} email={user.email} />
                                                        } else {
                                                            return <SearchResultItem key={i} recommanded={false} makeRecommandation={() => this.makeRecommadation(user._id)} name={user.name} email={user.email} />
                                                        }
                                                    })
                                                }
                                            </div>:<h5 className="text-center d-block mr-auto ml-auto mt-3">Aucun utilisateur trouvé.</h5>
                                    }
                                    <br></br>
                                    <h4 onClick={() => {navigator.clipboard.writeText(this.state.pageLocation)}}>Ou partager le lien: <strong>{ this.state.pageLocation }</strong></h4>
                                    <h6>Veuillez cliquer sur le lien pour copier</h6>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        {this.state.showToast ? <h4 className="mr-3">Lien de partage Copié !!!</h4> : null}
                        {/* <Button variant="outline-dark" onClick={this.displayToast}>
                            Copier le lien de partage
                        </Button> */}
                        <Button variant="default" onClick={() => this.setState({showRecModal: !this.state.showRecModal})}>
                            Fermer
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Coupon */}
                <Modal show={this.state.showCouponModal} onHide={() => this.setState({showCouponModal: false})} size="md" >
                    <Modal.Header closeButton>
                    <Modal.Title>Coupon de réduction</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container">
                            <div className="row justify-content-between">
                                <div className="col-sm-12 pl-4 pr-4 mt-4 mb-3 text-center">
                                    <Hoc>
                                        {
                                            this.state.announce&&this.state.announce.coupons ?
                                            <Hoc>
                                                <CouponPreview coupon={this.state.announce.coupons} />
                                                <div className="d-flex justify-content-center" id="couponpreview">
                                                    <button
                                                        className="btn btn-danger btn-lg mb-2 mt-4"
                                                        onClick={this.getCoupon}>Sauvegarder le coupon {downloadingCoupon ? <Loader color="white" /> : null}</button>
                                                </div>
                                            </Hoc>
                                            :null
                                        }
                                    </Hoc>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="py-3">
                            <Button variant="default" onClick={() => this.setState({showCouponModal: false})}>
                                Fermer
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>

                {/* Video */}
                <Modal show={this.state.showVideo} onHide={() => this.setState({showVideo: false})} size="lg" >
                    <Modal.Header closeButton>
                    <Modal.Title>Video</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {
                            this.state.announce && this.state.announce.video && this.state.announce.video.length ?
                                <Hoc>
                                    <h3 className="mb-3">Regardez l'aperçu en video</h3>
                                    <video src={rootUrl + '/' + this.state.announce.video} width="100%" height="100%" controls onClick={() => this.setState({ showVideo: true })}>
                                    </video>
                                </Hoc> :
                                this.state.announce && this.state.announce.youtubeVideoLink && this.state.announce.youtubeVideoLink.length ?
                                    <Hoc>
                                        <h3 className="mb-3">Regardez l'aperçu en video</h3>
                                        <iframe width="100%" height="100%" title="Video de l'annonce"
                                            src={this.state.announce.youtubeVideoLink}
                                            onClick={() => this.setState({ showVideo: true })}>
                                        </iframe>
                                    </Hoc> :
                                    <h3 className="mb-3 text-center">Aucune vidéo disponible.</h3>
                        }
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

export default connect(mapPropsToState)(DetailsPage);