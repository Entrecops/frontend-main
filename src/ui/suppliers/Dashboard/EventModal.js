import React, {Component} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Upload from '../../components/Forms/Upload';
import axios from 'axios';
import socketIOClient from 'socket.io-client';
import Loader from '../../globalComponent/Loader';
import {rootUrl} from '../../../configs/config';
import './EventForm.scss';
import Hoc from '../../globalComponent/Hoc';
import citiesData from '../../../locations/Location.json'; // Import the JSON data with city

class EventModal extends Component {
    state = {
        title: '',
        category: '',
        place: '',
        description: '',
        date: new Date(),
        eventVideo: '',
        eventDocument: '',
        youtubeVideoLink: '',
        facebookLink: '',
        instagramLink: '',
        whatsappLink: '',
        twitterLink: '',
        previewImages: '',
        imageSizeError: false,
        maxReservation: '',
        otherInfos: '',
        mapLink: '',
        price: 0,
        priceValid: false,
        images: null,
        isTyping: false,
        formValid: false,
        titleValid: false,
        categoryValid: false,
        maxReservationValid: false,
        placeValid: false,
        descriptionValid: false,
        imageValid: false,
        loading: false,
        error: '',
        categories: [],
        validated: false,
        validating: false,
        deleting: false,
        tags: ['Appartements', 'Bar-Lounge', 'Barbecue', 'Beauté', 'Boire', 'Cabaret', 'Coiffure', 'Concert', 'Danser', 'Grillade', 'Gym', 'Haman', 'Karaoké', 'Lodge', 'Manger', 'Manicure', 'Maquillage', 'Musique', 'Oldschool', 'Pédicure', 'Piscine', 'Randonnée', 'Sauna', 'Sport', 'Sushi', 'Tourisme'],
        selectedTags: [],
        tempPlace: '',
        placeSuggestions: []
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
        let { titleValid, descriptionValid, placeValid, imageValid, categoryValid, maxReservationValid } = this.state;

        switch (fieldName) {
            case 'title':
                titleValid = value.length > 0;
                break;
            case 'description':
                descriptionValid = value.length > 0;
                break;
            case 'place':
                placeValid = value.length > 0;
                break;
            case 'category':
                categoryValid = value.length > 0;
                break;
            case 'images':
                imageValid = value;
                break;
            case 'maxReservation':
                maxReservationValid = value.length > 0;
                break;
            default:
                break;
        }
        this.setState({
            titleValid: titleValid,
            descriptionValid: descriptionValid,
            placeValid: placeValid,
            imageValid: imageValid,
            categoryValid: categoryValid,
            maxReservationValid: maxReservationValid
        }, this.validateForm);
    }

    validateForm = () => {
        this.setState({
            formValid:
                this.state.titleValid &&
                this.state.placeValid &&
                this.state.descriptionValid &&
                this.state.imageValid &&
                this.state.categoryValid
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        if (this.state.formValid) {
            const formData = new FormData();
            const {
                title,
                description,
                place,
                category,
                 eventVideo,
                 eventDocument,
                 otherInfos,
                 date,
                 images,
                 youtubeVideoLink,
                 facebookLink,
                 instagramLink,
                 whatsappLink,
                 twitterLink,
                 //tags,
                 mapLink,
                 maxReservation,
                 price
            } = this.state;
            formData.append('title', title);
            formData.append('price', price);
            formData.append('category', category);
            formData.append('place', place);
            formData.append('youtubeVideoLink', youtubeVideoLink);
            formData.append('facebookLink', facebookLink);
            formData.append('instagramLink', instagramLink);
            formData.append('twitterLink', twitterLink);
            formData.append('whatsappLink', whatsappLink);
            formData.append('description', description);
            formData.append('otherInfos', otherInfos);
            formData.append('date', date);
            formData.append('maxReservation', maxReservation);
            //formData.append('tags', tags);
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
            if(eventVideo !== "") {
                formData.append('eventVideo', eventVideo);
            }
            if(eventDocument !== "") {
                formData.append('eventDocument', eventDocument);
            }
            const config = {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            };
            // Add event
            this.setState({ loading: true });
            if (this.props.isEditing) {
                // Update event
                try {
                    axios.patch('/api/event/' + this.props.event._id, formData, config)
                        .then(res => {
                            this.setState({
                                loading: false,
                            });
                            this.props.closeModal();
                            this.props.addNotification("success", "Modification!", "Modification éffectuée avec succès");
                        })
                        .catch(err => {
                            this.setState({ error: "Une érreur s'est produite, veuillez reéssayer.", loading: false });
                        })
                } catch (error) {
                    this.setState({ error: "Erreur de connexion. Veuillez reéssayer", loading: false });
                }
            } else {
                // Create new event
                try {
                    console.log(formData);
                    axios.post('/api/event/new', formData, config)
                        .then(res => {
                            this.setState({
                                loading: false,
                                error: '',
                                title: '',
                                place: '',
                                category: '',
                                otherInfos: '',
                                maxReservation: '',
                                description: '',
                                mapLink: '',
                                instagramLink: '',
                                facebookLink: '',
                                whatsappLink: '',
                                twitterLink: '',
                                tags: [],
                                eventVideo: '',
                                eventDocument: '',
                                images: null,
                                previewImages: null,
                                selectedTags: [],
                             });
                            // For admin when he creates event
                            if (this.props.refreshEventList) {
                                this.props.refreshEventList();
                            }
                            this.props.addNotification("success", "Evènement!", "Evènement créé avec succès. En attente de validation");
                            this.props.closeModal();
                        })
                        .catch(err => {
                            console.log({err});
                            this.setState({ error: "Une érreur s'est produite. Veuillez reéssayer.", loading: false });
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
        e.preventDefault();
        let imageValid = true;
        this.setState({ imageSizeError: false, previewImages: [], images: null })
        Array.from(e.target.files).forEach(file => {
            if ((file.size) / 1024 > 1024) {
                imageValid = false;
                this.setState({ imageSizeError: 'La taille d\'une image ne doit pas dépasser 1Mo.', imageValid: false })
            }
        });
        if (imageValid) {
            let images = Array.from(e.target.files).map(file => URL.createObjectURL(file));
            this.setState({ previewImages: images, images: e.target.files, imageValid: true },
                () => { this.validateField("images", true)});
        }
    }

    // preview video
    setFile = (name, file) => {
        this.setState({
            [name]: file,
            error: ''
        }, this.validateForm);
    }

    pickDate = (date) => {
        this.setState({ date: date })
    }

    componentDidMount() {
        //Charge categories on form
        this.initCategories();
    }

    componentDidUpdate(prevProps) {
        if(prevProps.event !== this.props.event) {
            const { isEditing, loadingEv, event } = this.props;
            if (isEditing && !loadingEv) {
                let images = event.images.map(image => rootUrl + '/' + image);
                this.setState({
                    title: event.title,
                    category: event.category,
                    place: event.place,
                    description: event.description,
                    date: new Date(event.date),
                    maxReservation: event.maxReservation,
                    price: event.price,
                    eventVideo: event.video&&event.video.length ? rootUrl + "/" + event.video : null,
                    eventDocument: event.menu&&event.menu.length ? rootUrl + "/" + event.menu : null,
                    previewImages: images,
                    otherInfos: event.otherInfos ? event.otherInfos : null,
                    validated: event.validated,
                    youtubeVideoLink: event.youtubeVideoLink,
                    facebookLink: event.facebookLink,
                    instagramLink: event.instagramLink,
                    whatsappLink: event.whatsappLink,
                    twitterLink: event.twitterLink,
                    tags: event.tags,
                    mapLink: event.mapLink,
                    titleValid: true,
                    priceValid: true,
                    maxReservationValid: true,
                    descriptionValid: true,
                    placeValid: true,
                    imageValid: true,
                    categoryValid: true,
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

    validateEvent = (event) => {
        this.setState({ validating: true, event: event })
        axios.patch('/api/event/validate/' + event._id)
            .then(res => {
                let events = this.props.events.map(event => {
                    let newEvent = { ...event };
                    if (event._id === this.props.event._id) {
                        newEvent.validated = true;
                    }
                    return newEvent;
                })
                this.props.refreshList(events, "events");
                this.props.closeModal();
                this.setState({
                    validating: false,
                    'error': ''
                })
                // Send a notification
                const not = {
                    to: "all",
                    title: event.title,
                    image: rootUrl + '/' + event.image,
                    link: '/annonce/event/' + event._id,
                    name: "Le Fournisseur",
                    visited: false,
                    projectId: event._id,
                    date: new Date()
                }
                // First save befor send notification
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

    deleteEvent = (event) => {
        this.setState({ deleting: true, event: event })
        axios.delete('/api/event/' + event._id)
            .then(res => {
                let events = this.props.events.filter(event => {
                    return JSON.stringify(event) !== JSON.stringify(this.props.event)
                })
                this.props.refreshList(events, "events");
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
        const { eventVideo, eventDocument, title, description, place, otherInfos, date, youtubeVideoLink,
            facebookLink, instagramLink, whatsappLink, twitterLink, category, imageValid, titleValid, descriptionValid, placeValid, categoryValid,
            error, loading, isTyping, categories, validating, deleting, tags, mapLink,
            maxReservation, maxReservationValid, price, priceValid, selectedTags, placeSuggestions, tempPlace } = this.state;
        const { show, closeModal, loadingEv, isEditing, event} = this.props;
        return (
            <Modal show={show} onHide={() => closeModal()} size="lg" >
                <Modal.Header closeButton>
                    <Modal.Title>Ajouter un nouvel évènement</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <div className="wrapper">
                    <form className="create-form">

                            <div className="row">
                                <div className="col-sm-12 pl-4 pr-4 mt-4 mb-3">
                                    {
                                        loadingEv ? <div className="d-flex justify-content-center"><Loader /></div> :
                                        <Hoc>
                                          {error && error.length ? <div className="alert alert-danger" style={{ fontSize: "1.3rem" }}>{error}</div> : null}
                                            <h2><Modal.Title>Informations générales</Modal.Title></h2>
                                            <br/>
                                            <div className="row">
                                                <div className="col-md-6 col-sm-12">
                                                        <label className="fadeIn second" htmlFor="title">Titre *</label>
                                                        <input type="text" className="fadeIn second" value={title} onChange={(e) => this.handleInputChange(e)} name="title" placeholder="Titre de l'évènement" required />
                                                        {isTyping && !titleValid ? <div className="invalid-feedback">Invalide</div> : null}

                                                </div>
                                                <div className="col-md-6 col-sm-12">
                                                    <label className="fadeIn second" htmlFor="category">Categorie *</label>
                                                <select id="category" name="category" value={category} onChange={(e) => this.handleInputChange(e)} className="fadeIn second form-control" >
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
                                            <label className="fadeIn second" htmlFor="description">Description *</label>
                                            <textarea type="text" value={description} className="fadeIn second form-control" onChange={(e) => this.handleInputChange(e)} name="description" rows={2} placeholder="Resumé"></textarea>
                                            {isTyping && !descriptionValid ? <div className="invalid-feedback">Invalide</div> : null}

                                            <div className="row justify-content-between">
                                                <div className="col-sm-12 col-md-7 col-lg-7">
                                                            <label className="fadeIn second" htmlFor="place">Lieu *</label>
                                                            <input type="text" value={tempPlace} onChange={(e) => this.handleInputChange2(e)} className="fadeIn second" name="place" placeholder="Lieu de l'évènement" required />
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
                                                <div className="col-sm-12 col-md-5 col-lg-5">
                                                        <label className="fadeIn second" htmlFor="date">Date *</label>
                                                        <DatePicker showTimeSelect dateFormat="Pp" className="fadeIn second dater" selected={date} onChange={date => this.pickDate(date)} />

                                                </div>
                                            </div>

                                                <label for="name">Nombre de places *</label>
                                                <input type="number" value={maxReservation} onChange={(e) => this.handleInputChange(e)} className="fadeIn second" name="maxReservation" placeholder="Nombre Max de réservations" required />
                                                {isTyping && !maxReservationValid ? <div className="invalid-feedback">Invalide</div> : null}


                                                <label for="name">Prix d'une réservation *</label>
                                                <input type="number" value={price} onChange={(e) => this.handleInputChange(e)} className="fadeIn second" name="price" placeholder="Prix d'une reservation" required />
                                                {isTyping && !priceValid ? <div className="invalid-feedback">Invalide</div> : null}


                                            <label for="tags">Tags * <strong>(Sélectionnez un ou plusieurs)</strong></label>
                                                    <select id="tags" name="tags" className="fadeIn second form-control" multiple onChange={(e) => this.addTag(e.target.value)}>
                                                        {tags.map(tag => (
                                                            <option key={tag} value={tag}>{tag}</option>
                                                        ))}
                                                    </select>
                                                    {/* <input type="text" value={tags} onChange={(e) => this.handleInputChange(e)} className= "form-control" name="tags" placeholder="Tags: Exple fete, concert, boutique" /> */}


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
                                                            <input type="text" value={facebookLink} onChange={(e) => this.handleInputChange(e)} className="fadeIn second" name="facebookLink" placeholder="Lien Facebook" />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 col-sm-12">
                                                        <div className="form-group">
                                                            <input type="text" value={instagramLink} onChange={(e) => this.handleInputChange(e)} className="fadeIn second" name="instagramLink" placeholder="Lien Instagram" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-6 col-sm-12">
                                                        <div className="form-group">
                                                            <input type="text" value={twitterLink} onChange={(e) => this.handleInputChange(e)} className="fadeIn second" name="twitterLink" placeholder="Lien Twitter" />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 col-sm-12">
                                                        <div className="form-group">
                                                            <input type="text" value={whatsappLink} onChange={(e) => this.handleInputChange(e)} className="fadeIn second" name="whatsappLink" placeholder="Numéro WhatsApp (2376xxx)" />
                                                        </div>
                                                    </div>
                                                </div>
                                            <div className="form-group">
                                                <input type="text" value={mapLink} onChange={(e) => this.handleInputChange(e)} className="fadeIn second" name="mapLink" placeholder="Lien Google Map" />
                                            </div>

                                            <div className="form-group">
                                                <textarea type="text" className="fadeIn second" value={otherInfos} onChange={(e) => this.handleInputChange(e)} name="otherInfos" rows={3} placeholder="Autres informations"></textarea>
                                            </div>
                                            <div className="row align-items-start py-3">
                                                <div className="col-sm-12 col-md-6 col-lg-6">
                                                    <label for="name">Importer des images</label><br />
                                                    <div className="custom-file">
                                                        <input onChange={(e) => this.preview(e)} type="file" className="custom-file-input" accept="image/*" id="customFile" multiple />
                                                        <label className="custom-file-label" for="customFile">Choisir les images</label>
                                                    </div>
                                                    {isTyping && !imageValid ? <p className="alert alert-danger">Image Requise</p> : null}
                                                    <div className="row justify-content-center mt-3">
                                                        {this.state.previewImages ?
                                                            this.state.previewImages.map((image, id) => (
                                                                <div key={id} className="col-sm-6 mt-2">
                                                                    <img src={image} className="img-fluid" alt="" />
                                                                </div>
                                                            )) : null
                                                        }
                                                        {this.state.imageSizeError ? <div className="container"><div className="alert alert-danger">{this.state.imageSizeError}</div></div>:null}
                                                    </div>
                                                </div>
                                                <div className="col-sm-12 col-md-6 col-lg-6">
                                                    <label for="name">Importer une vidéo</label><br />
                                                    <Upload type="video" oldUrl={eventVideo} setFile={(name, file) => this.setFile(name, file)} name="eventVideo" label={"Importer depuis votre ordinateur"} />
                                                    <span>Ou bien insérez le lien youtube.</span>
                                                    <input type="text" value={youtubeVideoLink} onChange={(e) => this.handleInputChange(e)} className="fadeIn second" name="youtubeVideoLink" placeholder="Lien youtube" />
                                                    {
                                                        youtubeVideoLink&&youtubeVideoLink.length ?
                                                        <iframe width="100%" title="video"
                                                            src={youtubeVideoLink}>
                                                        </iframe>:null
                                                    }
                                                </div>
                                                <div className="col-sm-12 col-md-6 col-lg-6">
                                                    <label for="name">Importer le menu</label><br />
                                                    <Upload
                                                        type="document"
                                                        oldUrl={eventDocument}
                                                        setFile={(name, file) => this.setFile(name, file)}
                                                        name="eventDocument"
                                                        label={"Importer depuis votre ordinateur"}
                                                        />
                                                </div>
                                            </div>
                                            {
                                                !isEditing ?
                                                <div className="d-flex justify-content-center">
                                                    <button disabled={loading} type="submit" onClick={(e) => this.handleSubmit(e)} className="button fourth mt-4 mb-5">{loading ? <Loader color="white" /> : "Ajouter l'Evenement"}</button>
                                                </div>:
                                                <div className="d-flex justify-content-center">
                                                    <button disabled={loading} type="submit" onClick={(e) => this.handleSubmit(e)} className="button fourth mt-4 mb-5">{loading ? <Loader color="white" /> : "Enregistrer la modification"}</button>
                                                </div>
                                            }
                                        </Hoc>
                                    }
                                </div>
                            </div>

                    </form>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    {
                        isEditing ?
                        <Hoc>
                            {!this.state.validated ? <Button disabled={validating} variant="dark" className="mr-3" onClick={() => this.validateEvent(event)}>{validating ? <Loader color="white" /> : "Valider l'évènement"}</Button>: null}
                            <Button variant="danger" disabled={deleting} className="mr-3" onClick={() => this.deleteEvent(event)}>{deleting ? <Loader color="white" /> : "Supprimer"}</Button>
                        </Hoc>:null
                    }
                    <Button variant="default" onClick={() => closeModal()}>Fermer</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default EventModal;