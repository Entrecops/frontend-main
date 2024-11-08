/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Upload from '../../components/Forms/Upload';
import axios from 'axios';
import socketIOClient from 'socket.io-client';
import Loader from '../../globalComponent/Loader';
import { rootUrl } from '../../../configs/config';
import './EventForm.scss';
import Hoc from '../../globalComponent/Hoc';
import citiesData from '../../../locations/Location.json'; // Import the JSON data with city


class ServiceModal extends Component {
    state = {
        title: '',
        category: '',
        cible: '',
        serviceVideo: '',
        serviceMenu: '',
        youtubeVideoLink: '',
        facebookLink: '',
        instagramLink: '',
        whatsappLink: '',
        twitterLink: '',
        offre: '',
        duration: '',
        tags: ['Fete', 'Concert', 'Shopping', 'Cinema', 'Brunch', 'Grillade', 'Restaurant', 'SnackBar'],
        place: '',
        mapLink: '',
        maxReservation: '',
        isTyping: false,
        formValid: false,
        previewImages: null,
        images: null,
        imageSizeError: false,
        titleValid: false,
        categoryValid: false,
        cibleValid: false,
        placeValid: false,
        priceValid: false,
        offreValid: false,
        serviceImageValid: false,
        maxReservationValid: false,
        loading: false,
        error: '',
        price: '',
        categories: [],
        validated: false,
        validating: false,
        deleting: false,
        loadingAn :false,
        placeSuggestions: [],
        loadingSuggestions: false,
        tempPlace: '',
        selectedTags:[]
    }

    handleInputChange = (e) => {
        e.preventDefault();
        const name = e.target.name;
        let value = e.target.value;
        if(name === "youtubeVideoLink") {
            let newValue = "https://www.youtube.com/embed/"+value.split("=")[1]
            if(newValue.includes("&")) {
                newValue = newValue.split("&")[0]
            }
            value = newValue;
        }
        this.setState({ [name]: value, error: '' },
            () => { this.validateField(name, value) });
    }

    // handleInputChange2 = async (e) => {
    //     const name = e.target.name;
    //     const value = e.target.value;
    //     const API_KEY = "AIzaSyAUBAW_vErbs4Nv4KBb8Q5eq8oS9ibdOIc";
    //     this.setState({ [name]: value, error: '' });

    //     if (name === 'place') {
    //         try {
    //             // Appel à l'API pour récupérer les suggestions de lieux
    //             const response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${value}&key=${API_KEY}`);
    //             this.setState({ placeSuggestions: response.data.predictions });
    //         } catch (error) {
    //             this.setState({ error: "Erreur lors de la récupération des suggestions de lieu." });
    //         }
    //     }
    // }

    handleInputChange2 = (e) => {
        const value = e.target.value;
        const filteredCities = citiesData.cities.filter((city) =>
            city.district.toLowerCase().includes(value.toLowerCase())
        );

        this.setState({
            tempPlace: value,
            isTyping: true,
            placeSuggestions: filteredCities,
            placeValid: true // Assuming validation is handled elsewhere
        });
    };

    handleSuggestionClick = (suggestion) => {
        this.setState({
            place: `${suggestion.district} - ${suggestion.name}`,
            tempPlace: `${suggestion.district} - ${suggestion.name}`,
            isTyping: false,
            placeSuggestions: []
        });
    };



    addTag = (tag) => {
        this.setState(prevState => ({
            selectedTags: [...prevState.selectedTags, tag]
        }));
    }

    removeTag = (tag) => {
        this.setState(prevState => ({
            selectedTags: prevState.selectedTags.filter(t => t !== tag)
        }));
    }

    validateField = (fieldName, value) => {
        let { titleValid, cibleValid, serviceImageValid,
            categoryValid, offreValid, placeValid, maxReservationValid, priceValid } = this.state;

        switch (fieldName) {
            case 'title':
                titleValid = value.length > 0;
                break;
            case 'cible':
                cibleValid = value.length > 0;
                break;
            case 'category':
                categoryValid = value.length > 0;
                break;
            case 'offre':
                offreValid = value.length > 0;
                break;
            case 'place':
                placeValid = value.length > 0;
                break;
            case 'images':
                serviceImageValid = value;
                break;
            case 'maxReservation':
                maxReservationValid = value.length > 0;
                break;
            case 'price':
                priceValid = value >= 0;
                break;
            default:
                break;
        }
        this.setState({
            titleValid: titleValid,
            cibleValid: cibleValid,
            serviceImageValid: serviceImageValid,
            categoryValid: categoryValid,
            offreValid: offreValid,
            placeValid: placeValid,
            maxReservationValid: maxReservationValid
        }, this.validateForm);
    }

    validateForm = () => {
        this.setState({
            formValid:
                this.state.titleValid &&
                this.state.cibleValid &&
                this.state.categoryValid &&
                this.state.serviceImageValid &&
                this.state.offreValid &&
                this.state.placeValid&&
                this.state.maxReservationValid
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        if (this.state.formValid) {
            const formData = new FormData();
            const { title,  cible, category, images, serviceVideo, serviceMenu, offre, duration, place, youtubeVideoLink, facebookLink, instagramLink, whatsappLink, twitterLink, tags, mapLink, maxReservation, price } = this.state;
            formData.append('title', title);
            formData.append('category', category);
            formData.append('cible', cible);
            formData.append('youtubeVideoLink', youtubeVideoLink);
            formData.append('facebookLink', facebookLink);
            formData.append('instagramLink', instagramLink);
            formData.append('twitterLink', twitterLink);
            formData.append('whatsappLink', whatsappLink);
            formData.append('offre', offre);
            formData.append('price', price);
            formData.append('duration', duration);
            formData.append('place', place);
            //formData.append('tags', tags);
            formData.append('maxReservation', maxReservation);
            formData.append('mapLink', mapLink);
            formData.append('user', JSON.stringify(this.props.user));
            this.state.selectedTags.forEach(tag => {
                formData.append('tags', tag);
            });
            if(images) {
                Array.from(images).forEach(file => {
                    formData.append('images', file);
                });
            }
            if (serviceVideo !== "") {
                formData.append('serviceVideo', serviceVideo);
            }
            if (serviceMenu !== "") {
                formData.append('serviceMenu', serviceMenu);
            }
            const config = {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            };
            // Add the service
            this.setState({ loading: true });
            if(this.props.isEditing) {
                // Editing service
                try {
                    axios.patch('/api/service/' + this.props.service._id, formData, config)
                        .then(res => {
                            this.setState({
                                loading: false,
                            });
                            this.props.closeModal();
                            this.props.addNotification("success", "Modification!", "Modification éffectuée avec succès")
                        })
                        .catch(err => {
                            this.setState({ error: "Une érreur s'est produite, veuillez reéssayer.", loading: false });
                        })
                } catch (error) {
                    this.setState({ error: "Erreur de connexion. Veuillez reéssayer", loading: false });
                }
            } else {
                // Create new service
                try {
                    axios.post('/api/service/new', formData, config)
                        .then(res => {
                            this.setState({
                                loading: false,
                                error: '',
                                title: '',
                                cible: '',
                                category: '',
                                serviceVideo: '',
                                serviceMenu: '',
                                maxReservation: '',
                                offre:'',
                                duration: '',
                                place: '',
                                tags: [],
                                mapLink: '',
                                instagramLink: '',
                                facebookLink: '',
                                whatsappLink: '',
                                twitterLink: '',
                                selectedTags: [],
                            });
                            // For admin when he creates service
                            if (this.props.refreshServiceList) {
                                this.props.refreshServiceList();
                            }
                            this.props.addNotification("success", "Service!", "Service crée avec succès. En attente de validation");
                            this.props.closeModal();
                        })
                        .catch(err => {
                            console.log({err});
                            this.setState({ error: "Une érreur s'est produite lors de la soumission du formulaire. Veuillez reéssayer.", loading: false });
                        })
                } catch (error) {
                    this.setState({ error: "Erreur de connexion. Veuillez reéssayer", loading: false });
                }
            }
        } else {
            this.setState({ error: "Veuillez remplir tous les champs", isTyping: true });
        }
    }

    // preview image
    preview = (e) => {
        let imageValid = true;
        this.setState({ imageSizeError: false, previewImages: [], images: null, serviceImageValid: false })
        Array.from(e.target.files).forEach(file => {
            if ((file.size) / 1024 > 1024) {
                imageValid = false;
                this.setState({ imageSizeError: 'La taille d\'une image ne doit pas dépasser 1Mo.' })
            }
        });
        if (imageValid) {
            let images = Array.from(e.target.files).map(file => URL.createObjectURL(file));
            this.setState({ previewImages: images, images: e.target.files, serviceImageValid: true },
                () => { this.validateField("images", true) });
        }
    }

    setFile = (name, file) => {
        this.setState({
            [name]: file,
            error: ''
        }, this.validateForm);
    }

    componentDidMount() {
        //Charge categories on form
        this.initCategories();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.service !== this.props.service) {
            const { isEditing, loadingAn, service } = this.props;
            if (isEditing && !loadingAn) {
                let images = service.images.map(image => rootUrl + '/' + image);
                this.setState({
                    title: service.title,
                    category: service.category,
                    cible: service.target,
                    offre: service.offre,
                    place: service.place,
                    price: service.price,
                    serviceVideo: service.video&&service.video.length ? rootUrl + "/" + service.video : null,
                    serviceMenu: service.menu&&service.menu.length ? rootUrl + "/" + service.menu : null,
                    previewImages: images,
                    maxReservation: service.maxReservation,
                    duration: service.duration,
                    mapLink: service.mapLink,
                    validated: service.validated,
                    youtubeVideoLink: service.youtubeVideoLink,
                    facebookLink: service.facebookLink,
                    instagramLink: service.instagramLink,
                    whatsappLink: service.whatsappLink,
                    twitterLink: service.twitterLink,
                    maxReservationValid: true,
                    tags: service.tags,
                    titleValid: true,
                    cibleValid: true,
                    serviceImageValid: true,
                    categoryValid: true,
                    offreValid: true,
                    placeValid: true,
                    priceValid: true,
                    formValid: true
                })
            }
        }
    }

    // Fetch categories on the server and update if there is a new one
    fetchCategories = () => {
        let categories = JSON.parse(localStorage.getItem("categories"));
        axios.get("/api/category/all")
        .then(res => {
            if(JSON.stringify(categories) !== JSON.stringify(res.data.categories)) {
                this.setState({ categories: res.data.categories })
            }
        })
        .catch(err => {
            this.setState({ error: "Erreur de chargement des catégories. Veuillez reéssayer." })
        })
    }

    initCategories = () => {
        let categories = JSON.parse(localStorage.getItem("categories"));
        if (categories && categories.length) {
            this.setState({ categories: categories });
            // Verify is there is a new category
            this.fetchCategories();
        } else {
            try {
                this.fetchCategories();
            } catch (error) {
                this.setState({ error: "Erreur de chargement des catégories. Veuillez reéssayer." })
            }
        }
    }

    validateservice = (service) => {
        this.setState({ validating: true, service: service })
        axios.patch('/api/service/validate/' + service._id)
            .then(res => {
                let services = this.props.services.map(service => {
                    let newservice = { ...service };
                    if (service._id === this.props.service._id) {
                        newservice.validated = true;
                    }
                    return newservice;
                })
                this.props.refreshList(services, "services");
                this.props.closeModal();
                this.setState({
                    validating: false,
                    'error': ''
                })
                // Send a notification
                const not = {
                    to: "all",
                    title: service.title,
                    image: rootUrl + '/' + service.image,
                    link: '/annonce/service/' + service._id,
                    name: "Le Fournisseur",
                    visited: false,
                    projectId: service._id,
                    date: new Date()
                }
                axios.patch('/api/user/recommand/to/all', { rec: not })
                    .then(res => {
                        const socket = socketIOClient(rootUrl);
                        socket.emit("new anounce notification", not);
                    })
                    .catch(err => {
                        this.setState({ recError: 'Une érreur s\'est produite. Veuillez recharger la page.' })
                    })
                // Send Email to Supplier
            })
            .catch(err => {
                this.setState({
                    validating: false,
                    'error': 'Erreur survenue, veuillez actualiser'
                })
            })
    }

    deleteservice = (service) => {
        this.setState({ deleting: true, service: service })
        axios.delete('/api/service/' + service._id)
            .then(res => {
                let services = this.props.services.filter(service => {
                    return JSON.stringify(service) !== JSON.stringify(this.props.service)
                })
                this.props.refreshList(services, "services");
                this.props.closeModal();
                this.setState({
                    deleting: false,
                    'error': ''
                })
            })
            .catch(err => {
                this.setState({
                    deleting: false,
                    error: err
                })
            })
    }

    render() {
        const { serviceVideo, serviceMenu, title, cible, youtubeVideoLink, facebookLink, instagramLink, twitterLink, whatsappLink,
            category, serviceImageValid, titleValid, cibleValid, categoryValid, offre, place, placeValid, placeSuggestions,
            error, loading, isTyping, categories, validating, deleting, duration, offreValid, mapLink,
            maxReservation, maxReservationValid, priceValid, price, tags, selectedTags, tempPlace } = this.state;
        const { show, closeModal, loadingAn, isEditing, service } = this.props;
        return (
            <Modal show={show} onHide={() => closeModal()} size="lg" >
                <Modal.Header closeButton>
                    <Modal.Title>Ajouter un nouveau Service</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form className="create-form">
                        <div className="container">
                            <div className="row">
                                <div className="col-sm-12 pl-4 pr-4 mt-4 mb-3">
                                    {
                                        loadingAn ? <div className="d-flex justify-content-center"><Loader /></div> :
                                            <Hoc>
                                                {error && error.length ? <div className="alert alert-danger" style={{ fontSize: "1.3rem" }}>{error}</div> : null}
                                                <Modal.Title>Informations générales</Modal.Title>
                                                <br/>
                                                <div className="row">
                                                    <div className="form-group col-md-6 col-sm-12">
                                                        <label for="name">Nom du Service *</label>
                                                        <input type="text" className={isTyping && !titleValid ? "form-control is-invalid" : "form-control"} value={title} onChange={(e) => this.handleInputChange(e)} name="title" placeholder="Nom du Service" required />
                                                        {isTyping && !titleValid ? <div className="invalid-feedback">Invalide</div> : null}
                                                    </div>
                                                    <div className="form-group col-md-6 col-sm-12">
                                                        <label for="category">Catégorie *</label>
                                                        <select id="category" name="category" value={category} onChange={(e) => this.handleInputChange(e)} className={isTyping && !categoryValid ? "form-control is-invalid" : "form-control"} >
                                                            <option>Choisir...</option>
                                                            {
                                                                categories && categories.length ?
                                                                    categories.map(category => (
                                                                        <option key={category._id}>{category.name}</option>
                                                                    )) : <option>Loading...</option>
                                                            }
                                                        </select>
                                                        {isTyping && !categoryValid ? <div className="invalid-feedback">Sélectionnez une catégorie</div> : null}
                                                    </div>

                                                </div>

                                                <div className="form-group">
                                                    <label for="name">Offre *</label>
                                                    <textarea type="text" value={offre} className={isTyping && !offreValid ? "form-control is-invalid" : "form-control"} onChange={(e) => this.handleInputChange(e)} name="offre" rows={2} placeholder="Offre"></textarea>
                                                    {isTyping && !offreValid ? <div className="invalid-feedback">Invalide</div> : null}
                                                </div>

                                                <div className="row">
                                                    <div className="form-group col-md-6 col-sm-12">
                                                        <label for="name">Nombre Maximal de Réservations *</label>
                                                        <input type="number" value={maxReservation} onChange={(e) => this.handleInputChange(e)} className={isTyping && !maxReservationValid ? "form-control is-invalid" : "form-control"} name="maxReservation" placeholder="Nombre Max de réservations" required />
                                                        {isTyping && !maxReservationValid ? <div className="invalid-feedback">Invalide</div> : null}
                                                    </div>

                                                    <div className="form-group col-md-6 col-sm-12">
                                                        <label for="name">Prix d'une réservation *</label>
                                                        <input type="number" value={price} onChange={(e) => this.handleInputChange(e)} className={isTyping && !priceValid ? "form-control is-invalid" : "form-control"} name="price" placeholder="Prix d'une reservation" required />
                                                        {isTyping && !priceValid ? <div className="invalid-feedback">Invalide</div> : null}
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-6 col-sm-12">
                                                        <div className="form-group">
                                                            <label for="place">Lieux & Adresse*</label>
                                                            <input type="text" value={tempPlace} onChange={(e) => this.handleInputChange2(e)} className={isTyping && !placeValid ? "form-control is-invalid" : "form-control"} name="place" placeholder="Lieu & Adresse" required />
                                                            {isTyping && !placeValid ? <div className="invalid-feedback">Invalide</div> : null}
                                                            {
                                                                placeSuggestions.length > 0 && (
                                                                    <ul className="suggestions-list">
                                                                        {placeSuggestions.map((suggestion, index) => (
                                                                            <li key={index} onClick={() => this.handleSuggestionClick(suggestion)}>
                                                                                {suggestion.district} - {suggestion.name}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 col-sm-12">
                                                        <div className="form-group">
                                                            <label for="name">Durée du service/ Dates d'ouverture</label>
                                                            <input type="text" value={duration} onChange={(e) => this.handleInputChange(e)} className= "form-control" name="duration" placeholder="Exple: 2 Mois" required />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label for="tags">Tags <strong>(Sélectionnez un ou plusieurs)</strong></label>
                                                    <select id="tags" name="tags" className="form-control" multiple onChange={(e) => this.addTag(e.target.value)}>
                                                        {tags.map(tag => (
                                                            <option key={tag} value={tag}>{tag}</option>
                                                        ))}
                                                    </select>
                                                    {/* <input type="text" value={tags} onChange={(e) => this.handleInputChange(e)} className= "form-control" name="tags" placeholder="Tags: Exple fete, concert, boutique" /> */}
                                                </div>

                                                {/* Affichage des tags sélectionnés */}
                                                <div className="selected-tags">
                                                    {selectedTags.map(tag => (
                                                        <span key={tag} className="selected-tag" onClick={() => this.removeTag(tag)}>{tag} <i className="fa fa-times"></i></span>
                                                    ))}
                                                </div>

                                                <br/>
                                                <Modal.Title>Reseaux sociaux & Médias</Modal.Title>
                                                <br/>

                                                <div className="row">
                                                    <div className="col-md-6 col-sm-12">
                                                        <div className="form-group">
                                                            <label for="place">Lien Facebook (facultatif)</label>
                                                            <input type="text" value={facebookLink} onChange={(e) => this.handleInputChange(e)} className="form-control" name="facebookLink" placeholder="Lien Facebook" />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 col-sm-12">
                                                        <div className="form-group">
                                                            <label for="name">Lien Instagram (facultatif)</label>
                                                            <input type="text" value={instagramLink} onChange={(e) => this.handleInputChange(e)} className="form-control" name="instagramLink" placeholder="Lien Instagram" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-6 col-sm-12">
                                                        <div className="form-group">
                                                            <label for="place">Lien Twitter (facultatif)</label>
                                                            <input type="text" value={twitterLink} onChange={(e) => this.handleInputChange(e)} className="form-control" name="twitterLink" placeholder="Lien Twitter" />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 col-sm-12">
                                                        <div className="form-group">
                                                            <label for="name">Lien WhatsApp (facultatif)</label>
                                                            <input type="text" value={whatsappLink} onChange={(e) => this.handleInputChange(e)} className="form-control" name="whatsappLink" placeholder="Numéro WhatsApp (2376xxx)" />
                                                        </div>
                                                    </div>
                                                </div>


                                                <div className="form-group">
                                                    <label for="tags">Lien Google Map (facultatif)</label>
                                                    <input type="text" value={mapLink} onChange={(e) => this.handleInputChange(e)} className="form-control" name="mapLink" placeholder="Lien Google Map" />
                                                </div>

                                                <div className="row align-items-start py-3">
                                                    <div className="col-sm-12 col-md-6 col-lg-6">
                                                        <label for="name">Importer des images</label><br />
                                                        <div className="custom-file">
                                                            <input onChange={(e) => this.preview(e)} type="file" className="custom-file-input" accept="image/*" id="customFile" multiple />
                                                            <label className="custom-file-label" for="customFile">Choisir les images</label>
                                                        </div>
                                                        {isTyping && !serviceImageValid ? <p className="alert alert-danger">Image Requise</p> : null}
                                                        <div className="row justify-content-center mt-3">
                                                            {this.state.previewImages ?
                                                                this.state.previewImages.map((image, id) => (
                                                                    <div key={id} className="col-sm-6 mt-2">
                                                                        <img src={image} className="img-fluid" alt="" />
                                                                    </div>
                                                                )) : null
                                                            }
                                                            {this.state.imageSizeError ? <div className="container"><div className="alert alert-danger">{this.state.imageSizeError}</div></div> : null}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-12 col-md-6 col-lg-6">
                                                        <label for="name">Importer une vidéo</label><br />
                                                        <Upload type="video" oldUrl={serviceVideo} setFile={(name, file) => this.setFile(name, file)} name="serviceVideo" label={"Importer depuis votre ordinateur"} />
                                                        <span>Ou alors insérez le lien youtube.</span>
                                                        <input type="text" value={youtubeVideoLink} onChange={(e) => this.handleInputChange(e)} className="form-control" name="youtubeVideoLink" placeholder="Lien youtube" />
                                                        {
                                                            youtubeVideoLink&&youtubeVideoLink.length ?
                                                                <iframe width="100%" title="video"
                                                                    src={youtubeVideoLink}>
                                                                </iframe> : null
                                                        }
                                                    </div>
                                                    <div className="col-sm-12 col-md-6 col-lg-6">
                                                        <label for="name">Importer un menu</label><br />
                                                        <Upload type="document" oldUrl={serviceMenu} setFile={(name, file) => this.setFile(name, file)} name="serviceMenu" label={"Importer depuis votre ordinateur"} />
                                                    </div>
                                                </div>
                                                {
                                                !isEditing ?
                                                    <div className="d-flex justify-content-end">
                                                        <button disabled={loading} type="submit" onClick={(e) => this.handleSubmit(e)} className="button fourth mt-4 mb-5">{loading ? <Loader color="white" /> : "Ajouter l'Evenement"}</button>
                                                    </div> :
                                                    <div className="d-flex justify-content-end">
                                                        <button disabled={loading} type="submit" onClick={(e) => this.handleSubmit(e)} className="button fourth mt-4 mb-5">{loading ? <Loader color="white" /> : "Enregistrer la modification"}</button>
                                                    </div>
                                                }
                                            </Hoc>
                                    }
                                </div>
                            </div>
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    {
                        isEditing ?
                            <Hoc>
                                {!this.state.validated ? <Button disabled={validating} variant="dark" className="mr-3" onClick={() => this.validateservice(service)}>{validating ? <Loader color="white" /> : "Valider le service"}</Button> : null}
                                <Button variant="danger" disabled={deleting} className="mr-3" onClick={() => this.deleteservice(service)}>{deleting ? <Loader color="white" /> : "Supprimer"}</Button>
                            </Hoc> : null
                    }
                    <Button variant="default" onClick={() => closeModal()}>Fermer</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default ServiceModal;