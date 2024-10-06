import React, { Component, Fragment } from 'react';
import Events from '../Events/Events';
import Services from '../Services/Services';
import Loader from '../../globalComponent/Loader';
import axios from 'axios';

class CouponList extends Component {

    state = {
        loadingServices: true,
        loadingEvents: true,
        services: [],
        events: [],
        error: ''
    }

    componentDidMount() {
        this.getEventsWithCoupons();
        this.getServicesWithCoupons();
    }

    getEventsWithCoupons = () => {
        this.setState({ loadingEvents: true });
        // Fetch events/services
        axios.get('/api/event/with/coupon')
        .then(res => {
            let data = res.data.events;
            this.setState({events: data, error: '', loadingEvents: false});
        })
        .catch(err => {
            this.setState({ error: 'Une érreur s\'est produite. Veuillez recharger.', loadingEvents: false});
        })
    }

    getServicesWithCoupons = () => {
        this.setState({ loadingServices: true });
        // Fetch services/services
        axios.get('/api/service/with/coupon')
        .then(res => {
            let data = res.data.services;
            this.setState({services: data, error: '', loadingServices: false});
        })
        .catch(err => {
            this.setState({ error: 'Une érreur s\'est produite. Veuillez recharger.', loadingServices: false});
        })
    }

    render() {
        const {events, services, loadingEvents, loadingServices} = this.state;
        return (
            <Fragment>
                {
                    loadingEvents ? <div className="d-flex justify-content-center py-5"><Loader /></div> :
                        <Events showMore={false} category={"Coupons"}  events={events} isCategoryPage={true} displayFilter={false} eventType="Evènements" isHomePage={false} /> 
                }
                {
                    loadingServices ? <div className="d-flex justify-content-center py-5"><Loader /></div> :
                        <Services showMore={false} category={"Coupons"} services={services} isCategoryPage={true} displayFilter={false} eventType="Services" isHomePage={false} />
                }
            </Fragment>
        );
    }
}

export default CouponList;