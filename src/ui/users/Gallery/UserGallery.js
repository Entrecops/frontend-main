import React, { Component } from 'react';
import Header from '../../globalComponent/Header';
import Gallery from 'react-grid-gallery';
import axios from 'axios';
import Loader from '../../globalComponent/Loader';
import Hoc from '../../globalComponent/Hoc';

class UserGallery extends Component {

    constructor(props) {
        super(props);

        this.state = { images: [], loading: true, currentImage: 0, isImageToDelete: false, deleting: false };
    }

    

    componentDidMount() {
        this.loadGallery()
    }

    componentDidUpdate(prevProps) {
        if(prevProps !== this.props) {
            this.loadGallery()
        }
    }

    loadGallery = () => {
        const authData = JSON.parse(localStorage.getItem("authData"));
        axios.get('/api/user/' + authData.user._id)
        .then(res => {
            let images = res.data.user.gallery.map((image, id) => (
                {
                    src: image,
                    thumbnail: image,
                    thumbnailWidth: 320,
                    thumbnailHeight: 200
                }
            ));
            images.reverse()
            this.setState({ images: images, loading: false })
        })
        .catch(err => {
            console.log(err)
            this.setState({ images: [], loading: false })
        })
    }    
    
    onSelectImageToRemove = (index, image) => {
        var images = this.state.images.slice();
        var img = images[index];
        if (img.hasOwnProperty("isSelected"))
            img.isSelected = !img.isSelected;
        else
            img.isSelected = true;

        this.setState({
            images: images
        }, () => {
            const selectedImages = this.state.images.filter(image => image.isSelected === true)
            selectedImages.length ? this.setState({ isImageToDelete: true }) : this.setState({ isImageToDelete: false })
        });
    }

    deleteFromMyGallery = () => {
        const userId = JSON.parse(localStorage.getItem('authData')).user._id
        this.setState({ deleting: true })
        const remainingImages = this.state.images.filter(image => image.isSelected !== true);
        let newImages = remainingImages.map(image => image.src);
        axios.patch('/api/user/'+ userId +'/gallery/delete', { images: newImages})
        .then(res => {
            this.setState({ deleting: false, images: remainingImages, isImageToDelete: false});
        })
        .catch(err => {
            this.setState({ deleting: false, isImageToDelete: false })
        })
    }

    render() {
        return (
            <Hoc>
                <Header />
                <section>
                    <div className="container py-5 mt-5">
                        <div className="row py-5" style={{ backgroundColor: "white" }}>
                            <div className="col-sm-12 p-5"><h2 className="text-center display-5">MA GALERIE</h2></div>
                            <div className="col-sm-12 px-5 pt-0 pb-5 mb-5" >
                                {
                                    this.state.loading ? <div className="d-flex justify-content-center"><Loader /></div>:
                                        this.state.images.length > 0 ?
                                        <Hoc>
                                            {this.state.isImageToDelete?
                                            this.state.deleting ?<div className="d-flex justify-content-center"><Loader /></div>:
                                            <div className="d-flex justify-content-center">
                                            <button onClick={this.deleteFromMyGallery} className="btn btn-danger my-3">Supprimer</button></div>:null
                                            }
                                            <Gallery 
                                                enableLightbox={true}
                                                enableImageSelection={true}
                                                onSelectImage={this.onSelectImageToRemove}
                                                images={this.state.images}
                                                currentImageWillChange={this.onCurrentImageChange}
                                            />
                                        </Hoc>
                                        : <div className="d-flex justify-content-center py-5"><h4>Aucune image dans votre galerie.</h4></div>
                                }
                            </div>
                        </div>
                    </div>
                </section>
            </Hoc>
        );
    }
}

export default UserGallery;
