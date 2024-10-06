import React, { Component } from 'react';
import Header from '../../globalComponent/Header';
import {Redirect} from 'react-router';
import { connect } from 'react-redux';
import GalleryList from './GalleryList';
import Hoc from '../../globalComponent/Hoc';

class Gallery extends Component {

    state = {};

    componentDidMount() {
       
    }

    render() {

        return (
            !this.props.user ? <Redirect to="/" />:
            <Hoc>
                <Header />
                <GalleryList />
            </Hoc>
        );
    }
}

const mapPropsToState = state => {
    return {
        user: state.auth.user
    }
}

export default connect(mapPropsToState)(Gallery);
