import React, {Component} from 'react';
import axios from 'axios';
import Loader from '../../globalComponent/Loader';
import './Caroussel.scss';
import Hoc from '../../globalComponent/Hoc'

class Caroussel extends Component {
    state = {
        images: [],
        error: '',
        loading: true
    }
    componentDidMount() {
        const bannerImages = JSON.parse(localStorage.getItem('banner'))
        if(bannerImages&&bannerImages.length) {
            this.setState({images: bannerImages, loading: false})
        }
        this.getBannerImages()
    }

    getBannerImages = () => {
        axios.get('/api/banner/current')
        .then(res => {
            if(JSON.stringify(res.data.banners) !== localStorage.getItem('banner')) {
                // Banner have changed
                let images = res.data.banners;
                images.reverse()
                this.setState({loading: false, images: images, error: ''})
                localStorage.setItem('banner', JSON.stringify(images))
            }
        })
        .catch(err => {
            this.setState({loading: false, error: "Une erreur s'est produite, veuillez reéssayer",})
        })
    }

    render() {
        return (
            <section id="showcase">
                <div id="carouselExampleIndicators" className="carousel slide" data-ride="carousel">
                    <ol className="carousel-indicators">
                        {
                            this.state.images.length ? 
                            <Hoc>
                                {this.state.images.map((image, i) => (<li key={i} data-target="#carouselExampleIndicators" data-slide-to={i} className={i===0&&"active"}></li>))}
                            </Hoc>:null
                        }
                    </ol>
                    <div className="carousel-inner">
                        {this.state.loading ? <div className="d-flex justify-content-center align-items-center" style={{minHeight: "75vh"}}><Loader /></div> :
                            <Hoc>
                                {this.state.images.map((image, i) => {
                                    return (
                                        <a style={{padding: "0"}} key={i} className={i === 0 ? "carousel-item active" : "carousel-item"} href={image.followlink}>
                                            <img className="d-block w-100" src={image.link} alt="First slide" />
                                            
                                            {/* <div id="carousel-caption" className="carousel-caption d-none d-sm-block text-bottom mb-5">
                                                <h1 className="">Faites vos réservations et bénéficiez des meilleurs prix</h1>
                                                <p className="mt-3">Réservez directement vos places.</p>
                                                <a href="#events" className="btn btn-danger btn-lg mt-3">Parcourir les Annonces</a>
                                            </div> */}
                                        </a>
                                    )
                                })}
                            </Hoc> 
                        }
                    </div>
                    <a className="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="sr-only">Previous</span>
                    </a>
                    <a className="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="sr-only">Next</span>
                    </a>
                </div>
            </section>
        );
    }
}

export default Caroussel;