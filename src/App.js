import React, { Component, Suspense, lazy } from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import {connect} from 'react-redux';

import ReactLoader from './ui/globalComponent/ReactLoader';
import { autoSignIn } from './store/actions';
import { PrivateRoute } from './ui/utils/PrivateRoute'; 

const Home = lazy(() => import('./ui/Home'))
const SignupPage = lazy(() => import('./ui/components/Forms/SignupPage'))
const LoginPage = lazy(() => import('./ui/components/Forms/LoginPage'))
const AllServicesPage = lazy(() => import('./ui/components/Services/AllServicesPage'))
const AllEventsPage = lazy(() => import('./ui/components/Events/AllEventsPage'))
const SingleCategoryPage = lazy(() => import('./ui/components/Categories/SingleCategoryPage'))
const DetailsPage = lazy(() => import('./ui/components/DetailsPage/DetailsPage'))
const SupplierDashboard = lazy(() => import('./ui/suppliers/Dashboard/Dashboard'))
const SupplierRegistration = lazy(() => import('./ui/components/Supplier/SupplierRegistration'))
const SupplierConfirmationForm = lazy(() => import('./ui/components/Supplier/SupplierConfirmationForm'))
const Gallery = lazy(() => import('./ui/users/Gallery/GalleryPage'))
const UserGallery = lazy(() => import('./ui/users/Gallery/UserGallery'))
const Profile = lazy(() => import('./ui/users/Profile/Profile'))
const Notifications = lazy(() => import('./ui/users/Notifications/NotificationsPage'))
const UserReservations = lazy(() => import('./ui/users/Reservations/Reservations'))
const FilterResults = lazy(() => import('./ui/components/Filter/FilterResults'))
const NotFound = lazy(() => import('./ui/components/NotFound/NotFound'))
const Admin = lazy(() => import('./ui/admin/Admin'))

/* Admin Pages */
// import Admin from './ui/admin/Admin';

class App extends Component {
  componentDidMount() {
    if(!this.props.user) {
      this.props.onAutoSiginIn();
    }
  }

  render() {
      return (
        <BrowserRouter>
          <Suspense fallback={<ReactLoader />}>
            <Switch>
              <Route path="/" exact component={Home}  />
              <Route path="/auth/login" exact component={LoginPage}  />
              <Route path="/auth/signup" exact component={SignupPage}  />
              <Route path="/events" exact component={AllEventsPage}  />
              <Route path="/services" exact component={AllServicesPage}  />
              <Route path="/supplier" exact component={SupplierRegistration}  />
              <Route path="/supplier/:id/account/confirmation" exact component={SupplierConfirmationForm}  />
              <Route path="/:AnounceType/category/:id" exact component={SingleCategoryPage}  />
              <Route path="/category/:id" exact component={SingleCategoryPage}  />
              <Route path="/annonce/:anounceType/:id" exact component={DetailsPage}  />
              <Route path="/gallery" exact component={Gallery}  />
              <Route path="/filter" exact component={() => <FilterResults filter={localStorage.getItem("searchParams")} />}  />

              {/* Supplier Routes */}
              <PrivateRoute path="/dashboard/reservations" exact component={SupplierDashboard}  />

              {/* User Routes */}
              <PrivateRoute path="/user/profile" exact component={Profile}  />
              <PrivateRoute path="/user/notifications" exact component={Notifications}  />
              <PrivateRoute path="/user/reservations" exact component={UserReservations}  />
              <PrivateRoute path="/user/gallery" exact component={UserGallery}  />
      
              {/* Admin Routes */}
              <PrivateRoute path="/admin" component={Admin} />

              {/* 404 page error*/}
              <Route path="*" component={NotFound} />
            </Switch>
          </Suspense>
        </BrowserRouter>
      );
  }
}

const mapPropsToState = state => {
  return {
    user: state.auth.user,
    token: state.auth.token
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onAutoSiginIn: () => dispatch(autoSignIn())
  }
}

export default connect(mapPropsToState, mapDispatchToProps)(App);
