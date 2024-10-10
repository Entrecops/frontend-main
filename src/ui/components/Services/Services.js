import React, { Component } from 'react';
import ServiceItem from './ServicesItem';
import Loader from '../../globalComponent/Loader';
import axios from 'axios';
import './Services.scss';
// import Filter from '../Filter/Filter'
import Hoc from '../../globalComponent/Hoc'

class Services extends Component {

    state = {
        loading: true,
        services: [],
        error: ''
    }

    componentDidMount() {
        if (this.props.isHomePage) {
            axios.get('/api/service/4')
            .then(res => {
                this.setState({ loading: false, services: res.data.services, error: '' })
            })
            .catch(err => {
                this.setState({ loading: false, error: 'Une erreur s\'est produite. Veuillez recharger la page' })
            })
        } else if (this.props.isCategoryPage) {
            this.setState({ services: this.props.services, loading: false, error: '' })
        } else if (this.props.isFilterPage) {
            this.setState({ services: this.props.services, loading: false, error: '' })
        } else {
            axios.get('/api/service/validated/all')
            .then(res => {
                this.setState({ loading: false, services: res.data.services, error: '' })
            })
            .catch(err => {
                this.setState({ loading: false, error: 'Une erreur s\'est produite. Veuillez recharger la page' })
            })
        }
    }

    componentDidUpdate(prevProps) {
        if(this.props.services !== prevProps.services) {
            if (this.props.isCategoryPage || this.props.isFilterPage) {
                this.setState({services: this.props.services, loading: false, error: ''})
            }
        }
    }

    render() {
        const {error, services, loading} = this.state;
        return (
            <Hoc>
                {/* {this.props.displayFilter&&<Filter />} */}
                <section className={this.props.isHomePage ? "services bg-white pb-5" : "services pb-5"}>
                    <div className="container pt-3 pb-5">
                        <div className="row pt-5">
                            <div className="col">
                                <h1 className={this.props.isHomePage ? "pt-4 pb-4 service-header text-center" : "pt-4 pb-4 service-header text-left"}>
                                    {this.props.eventType}
                                </h1>
                            </div>
                        </div>
                        <div className={loading || error.length || this.props.isHomePage? "row pb-5 mb-2 justify-content-center":"row pb-5 mb-2"}>
                            {error.length ? <div className="alert alert-danger">{error}</div>:null}
                            {
                                loading ? <div className="d-block ml-auto mr-auto justify-content-center"><Loader/></div>:
                                    services&&services.length ?
                                    services.map((service, id) => (
                                            <div key={id} className="col-sm-12 col-md-6 col-lg-3 mt-3">
                                                <ServiceItem service={service} />
                                            </div>
                                        )): null
                            }
                            {!loading&&services.length === 0 &&!error.length ? <div className="d-block ml-auto mr-auto justify-content-center"><h5>Aucun Service</h5></div>:null}
                        </div>
                            {
                            this.props.isHomePage&&services.length !==0 ?
                                <div className="row">
                                    <div className="col text-center see-more">
                                        <a href="/services" className="btn btn-danger">Voir plus</a>
                                    </div>
                                </div>: null
                            }
                            {
                            this.props.showMore&&services.length !==0 ?
                                <div className="row pb-5">
                                    <div className="col text-center see-more">
                                        <a className="btn btn-danger" href={"/services/category/"+ this.props.category}>Voir plus</a>
                                    </div>
                                </div>: null
                            }
                    </div>
                </section>
            </Hoc>
        );
    }
}

export default Services;