import React, { Component } from 'react';
import Header from '../../globalComponent/Header';
import Events from './Events';
import Categories from '../Categories/Categories';
import Hoc from '../../globalComponent/Hoc'

class AllEventsPage extends Component {

    render() {
        return (
            <Hoc>
                <Header />
                <Categories />
                <Events eventType="Toutes les Actualités" isHomePage={false} />
            </Hoc>
        );
    }
}

export default AllEventsPage;