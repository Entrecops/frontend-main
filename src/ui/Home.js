import React, { Component, Suspense, lazy } from 'react';
import ReactLoader from '../ui/globalComponent/ReactLoader'
import Hoc from './globalComponent/Hoc';

const Header = lazy(() => import('../ui/globalComponent/Header'))
const Events = lazy(() => import('../ui/components/Events/Events'))
const Services = lazy(() => import('../ui/components/Services/Services'))
const Categories = lazy(() => import('../ui/components/Categories/Categories'))
const Caroussel = lazy(() => import('../ui/components/Caroussel/Caroussel'))
const SupplierBaner = lazy(() => import('../ui/components/Supplier/SupplierBanner'))
const Filter = lazy(() => import('../ui/components/Filter/Filter'))

class Home extends Component {
    render() {
        return (
            <Hoc>
                <Suspense fallback={<ReactLoader />}>
                    <Header home={true} />
                    <Caroussel />
                    <Filter />
                    <Categories />
                    <Events eventType="Actualités" isHomePage={true} displayFilter={false} />
                    <Services eventType="Services" isHomePage={true} displayFilter={false} />
                    <SupplierBaner />
                </Suspense>
            </Hoc>
        );
    }
}

export default Home;