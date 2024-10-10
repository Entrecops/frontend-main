import React, { Component } from 'react';
import Header from '../../globalComponent/Header';
import Hoc from '../../globalComponent/Hoc'
import Services from './Services';
import Categories from '../Categories/Categories';

class AllServicesPage extends Component {

    render() {
        return (
            <Hoc>
                <Header />
                <Categories />
                <Services eventType="Tous les Services" isHomePage={false} />
            </Hoc>
        );
    }
}

export default AllServicesPage;