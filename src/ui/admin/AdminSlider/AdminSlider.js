import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import Loader from '../../globalComponent/Loader';
import Gallery from 'react-grid-gallery';
import { Notification, addNotification } from '../../globalComponent/Notifications'
import axios from 'axios';
import { rootUrl } from '../../../configs/config';
import Hoc from '../../globalComponent/Hoc';

class AdminSlider extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            showModal: false,
            searching: false,
            imageToDelete: false,
            selectedOne: null,
            images: [],
            error: '',
            currentBanner: [],
            results: [],

            imagesToUpload: [],
            previewImages: null,
            successUpload: false,
        }

        this.onCurrentImageChange = this.onCurrentImageChange.bind(this);
    }
    

    onSelectImage = (index, image) => {
        var images = this.state.images.slice();
        var img = images[index];
        if(img.hasOwnProperty("isSelected"))
            img.isSelected = !img.isSelected;
        else
            img.isSelected = true;

        this.setState({
            images: images
        });
    }

    onSelectImageToRemove = (index, image) => {
        var currentBanner = this.state.currentBanner.slice();
        var img = currentBanner[index];
        if(img.hasOwnProperty("isSelected"))
            img.isSelected = !img.isSelected;
        else
            img.isSelected = true;

        this.setState({
            currentBanner: currentBanner
        }, () => {
            const images = this.state.currentBanner.filter(image => image.isSelected === true)
            images.length ? this.setState({imageToDelete: true}): this.setState({imageToDelete: false})
        });
    }

    componentDidMount() {
       this.getImages();
    }

    // preview image
    preview = (e) => {
        let images = Array.from(e.target.files).map(file => URL.createObjectURL(file));
        this.setState({ previewImages: images, imagesToUpload: e.target.files });
    }

    getImages = () => {
         // get all banner images
         axios.get('/api/banner')
         .then(res => {
             let currentBanner = res.data.banners.map(banner => {
                 return {
                        src: banner.link,
                        thumbnail: banner.link,
                        thumbnailWidth: 320,
                        thumbnailHeight: 213,
                        thumbnailCaption: banner.title,
                        id: banner._id
                    }
                })
             this.setState({loading: false, successUpload: true, currentBanner: currentBanner})
         })
         .catch(err => {
             this.setState({error: "Une erreur s'est produite, veuillez reéssayer", loading: false, successUpload: false})
         })
    }


    //Upload images
    /* handleSubmit = (e) => {
        e.preventDefault();
        if(this.state.imagesToUpload.length) {
            this.setState({loading: true, successUpload: false, error: ''})
            const config = {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            };
            Array.from(this.state.imagesToUpload).forEach((file, i) => {
                const formData = new FormData();
                formData.append('image', file);
                axios.post('/api/banner', formData, config)
                .then(res => {
                    if(this.state.imagesToUpload.length === i+1) {
                        this.setState({successUpload: true, error: '', showModal: false})
                        this.getImages()
                    }
                })
                .catch(err => {
                    if(this.state.imagesToUpload.length === i+1) {
                        this.setState({error: "Une erreur s'est produite, veuillez reéssayer", loading: false, successUpload: false})
                    }
                })
            });
        } else {
            addNotification("warning", "Bannière!", "Choisissez des images à importer")
        }
    } */

    // Configure banner
    setBanner = () => {
        const bannerImages = this.state.images.filter(banner => banner.isSelected === true);
        if(bannerImages.length) {
            this.setState({loading: true})
            axios.post('/api/banner/set', {bannerImages: bannerImages})
            .then(res => {
                this.setState({error: ''})
                this.getImages();
            })
            .catch(err => {
                this.setState({loading: false, error: "Une erreur s'est produite, veuillez reéssayer",})
            })
        } else {
            addNotification("warning", "Bannière!", "Sélectionnez des images à configurer sur la bannière")
        }
    }

    //Remove images to banner
    removeToBanner = () => {
        const bannerImages = this.state.currentBanner.filter(banner => banner.isSelected === true);
        if(bannerImages.length) {
            this.setState({loading: true})
            axios.patch('/api/banner/remove', {bannerImages: bannerImages})
            .then(res => {
                this.setState({error: '', imageToDelete: false})
                this.getImages();
            })
            .catch(err => {
                this.setState({loading: false, error: "Une erreur s'est produite, veuillez reéssayer", imageToDelete: false})
            })
        } else {
            addNotification("warning", "Bannière!", "Sélectionnez des images à enlever de la bannière")
        }
    }


    makeSearch = (query) => {
        this.setState({ searching: true, results: [] })
        // search form events
        if(query.length>1) {
            axios.get('/api/event/' + query + '/search')
                .then(res => {
                    let eventList = [];
                    res.data.events.forEach(event => {
                        event.eventType = "event";
                        if (!this.state.results.includes(event)) {
                            eventList.push(event);
                        }
                    });
                    // search form services
                    axios.get('/api/service/' + query + '/search')
                        .then(res => {
                            let serviceList = [];
                            res.data.services.forEach(service => {
                                service.eventType = "service";
                                if (!this.state.results.includes(service)) {
                                    serviceList.push(service);
                                }
                            });
                            this.setState({
                                results: [...eventList, ...serviceList],
                                searching: false
                            })
                        })
                        .catch(err => {
                            this.setState({ error: "Une érreur s'est produite. Veuillez recharger", searching: false })
                        })
                })
                .catch(err => {
                    this.setState({ error: "Une érreur s'est produite. Veuillez recharger", searching: false })
                })
        } else {
            this.setState({searching: false, results: []})
        }
    }

    // Select one event or service
    selectOne = (e, result) => {
        e.preventDefault();
        const allImages = result.images.map(image => {
            return {
                src: rootUrl + '/' + image,
                thumbnail: rootUrl + '/' + image,
                thumbnailWidth: 320,
                thumbnailHeight: 213,
                followlink: "/annonce/" + result.eventType + "/" + result._id,
                title: result.title,
                id: result._id
            }
        })
        this.setState({selectedOne: result, showModal: false, images: allImages})
    }

    onCurrentImageChange(index) {
        this.setState({ currentImage: index });
    }

    render() {
        const {loading, showModal} = this.state;
        return (
            <Hoc>
                <Notification />
                <div className="container mt-4 mb-5">
                    <div className="row pt-5 pb-3">
                        <div className="col d-flex justify-content-between align-items-center">
                            <h1>Configuration de la bannière</h1>
                            <button onClick={() => this.setState({showModal: true})} className="button">CHOISIR LA BANNIERE</button>
                        </div>
                    </div>
                    {this.state.error.length ? <div className="d-flex justify-content-center alert-danger alert">{this.state.error}</div>:null}
                    {this.state.loading ? <div className="d-flex justify-content-center"><Loader /></div> : 
                        <Hoc>
                            <div className="row mt-2">
                                <div className="col-sm-12 d-flex mt-5 mb-4">
                                    <h2>Images sur la Bannière actuelle</h2>
                                </div>
                                <div className="col-sm-12">
                                    <Gallery
                                        images={this.state.currentBanner}
                                        onSelectImage={this.onSelectImageToRemove}
                                        lightboxWidth={1536}
                                        enableLightbox={true}
                                    />
                                </div>
                                {this.state.imageToDelete ?
                                    <div className="col-sm-12 d-flex justify-content-center mt-5 mb-4">
                                        <button onClick={this.removeToBanner} className="btn btn-danger">{loading ? <Loader color="white" /> :"Enlever de la bannière"}</button>
                                    </div>:null
                                }
                            </div>
                            {/* <div className="row mt-5">
                                <div className="col-sm-12 mt-5 mb-4">
                                    <h2>Toutes les images importées</h2>
                                    <h5>Selectionnez des images et enregistrer pour configurer la bannière.</h5>
                                </div>
                                <div className="col-sm-12">
                                    <Gallery
                                        images={this.state.images}
                                        onSelectImage={this.onSelectImage}
                                        lightboxWidth={1536}
                                    />
                                </div>
                                <div className="col-sm-12 d-flex mt-5 justify-content-end">
                                    <button className="button" onClick={this.setBanner}>Ajouter à la bannière</button>
                                </div>
                            </div> */}
                            {
                                this.state.selectedOne ? 
                                    <div className="row mt-5">
                                        <div className="col-sm-12 mt-5 mb-4">
                                            <h2>{this.state.selectedOne.title}</h2>
                                            <h5>Selectionnez des images et enregistrer pour configurer la bannière.</h5>
                                        </div>
                                        <div className="col-sm-12">
                                            <Gallery
                                                images={this.state.images}
                                                onSelectImage={this.onSelectImage}
                                                lightboxWidth={1536}
                                            />
                                        </div>
                                        <div className="col-sm-12 d-flex mt-5">
                                            <button className="button" onClick={this.setBanner}>Ajouter à la bannière</button>
                                        </div>
                                    </div>:null
                            }
                        </Hoc>
                    }
                </div>

                <Modal show={showModal} onHide={() => this.setState({showModal : false})} size="lg" >
                    <Modal.Header closeButton>
                        <Modal.Title>Choisir les images de bannière</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form>
                            <div className="container">
                                <div className="row">
                                    <div className="col-sm-12 pl-4 pr-4 mt-4 mb-3">
                                        <div className="row justify-content-center py-3">
                                            <div className="col-sm-12 col-md-12 mb-2">
                                                <div className="custom-file">
                                                    <input type="text" onChange={(e) => this.makeSearch(e.target.value)} placeholder="Rechercher une actualité ou un évènement" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row justify-content-center mt-3">
                                            <div className="col-sm-12">
                                                    {this.state.searching ? <div className="d-flex justify-content-center"><Loader /></div> :
                                                    this.state.results.length > 0 ? 
                                                        this.state.results.map((result, id) => (
                                                            <div key={id} className="d-flex mb-3 align-items-center pb-3" style={{ borderBottom: "solid 1px #eee" }}>
                                                                <img src={rootUrl +'/'+ result.image} className="rounded-circle" width="50" height="50" alt="" />
                                                                <h4 className="ml-3">{result.title} </h4>
                                                                <button onClick={(e) => this.selectOne(e, result)} className="btn btn-dark ml-auto">Afficher</button>
                                                            </div>
                                                        ))
                                                    :<p className="text-center">Pas de résultats</p>
                                                    }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>
            </Hoc>
        );
    }
}

export default AdminSlider;