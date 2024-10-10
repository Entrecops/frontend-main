import React, { Component } from 'react';
import Gallery from 'react-grid-gallery';
import './Gallery.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {DateFormat} from '../../utils/DateFormat'
import axios from 'axios'
import {Notification, addNotification} from '../../globalComponent/Notifications'
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import {rootUrl} from '../../../configs/config';
import logo from '../../../assets/images/logo.png';
import Loader from '../../globalComponent/Loader';
import Hoc from '../../globalComponent/Hoc';

class GalleryItem extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: false, 
            deleting: this.props.deleting, 
            user: null, 
            images: [],
            currentImage: 0
        };

        this.importTomyGallery = this.importTomyGallery.bind(this);
        this.onCurrentImageChange = this.onCurrentImageChange.bind(this);
    }

    importTomyGallery() {
        // Saving in gallery
        const {images} = this.state;
        if(this.state.user.gallery) {
            if (this.state.user.gallery.includes(images[this.state.currentImage].src)) {
                addNotification("warning", "Galerie!", "Cette image est déja incluse dans votre Galerie.")
            } else {
                axios.patch('/api/user/' + this.state.user._id + '/galleryimages/save', { gallery: [images[this.state.currentImage].src]})
                .then(res => {
                    addNotification("success", "Galerie!", "Image importée avec succès!!")
                })
                .catch(err => {
                    console.log(err)
                })
            }
        }
    }

    componentDidMount() {
        let images = [];
        if(this.props.images.length) {
            images = this.props.images.map((image, id) => (
                {
                    src: rootUrl + '/' + image,
                    thumbnail: rootUrl + '/' + image,
                    thumbnailWidth: 512,
                    thumbnailHeight: 360,
                    isSelected: false,
                }
            ));
        }
        const authData = JSON.parse(localStorage.getItem("authData"));
        this.setState({user: authData&&authData.user ? authData.user : null, images: images})
    }


    onCurrentImageChange(index) {
        this.setState({ currentImage: index });
    }

    render() {
        const {images} = this.state;
        return (
            <Hoc>
                <Notification/>
                <div className="gallery-item d-block">
                    <div className="header d-flex">
                        <img src={logo} width="70px" height="50px" className="mr-3" alt="" />
                        <div className="name">
                            <h5>Entrecops</h5>
                            <span><DateFormat date={this.props.date} /></span>
                            <div className="description" onClick={this.toggleModal}>
                                <div className="mb-4 mt-3">
                                    <h4>{this.props.content}</h4>
                                </div>
                            </div>
                        </div>
                        {
                            this.state.user && this.state.user.role === "admin" ?
                                <div className="ml-auto flex-shrink-0">
                                    <button onClick={() => this.props.deletePublication(this.props.id)} className="btn btn-danger btn-lg">Supprimer cette publication {this.state.deleting&&<Loader color="white"/>}</button>
                                </div>
                                : null
                        }
                    </div>
                   
                    <div className="body">
                        {this.state.user ?
                            <Gallery
                                enableLightbox={true}
                                enableImageSelection={false}
                                images={images}
                                currentImageWillChange={this.onCurrentImageChange}
                                customControls={[<i></i>,
                                    <button style={{position: "absolute", right: "0", bottom: "40px", borderRadius: "0"}} 
                                    className="btn btn-danger btn-lg" key="deleteImage" onClick={this.importTomyGallery}>
                                    <FontAwesomeIcon size="1x" icon={faDownload} /> Importer dans ma Galerie</button>
                                ]}
                            />:
                            <Gallery
                                enableLightbox={true}
                                enableImageSelection={false}
                                images={images}
                                currentImageWillChange={this.onCurrentImageChange}
                            />
                        }
                </div>
            </div>
            </Hoc>
        );
    }
}

export default GalleryItem;
