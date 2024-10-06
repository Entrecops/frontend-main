import React, { Component } from 'react';
import Header from '../../globalComponent/Header';
import './Notifications.scss';
import Loader from '../../globalComponent/Loader';
import Hoc from '../../globalComponent/Hoc';
class NotificationsPage extends Component {

    state = {
        loading: true,
        notifications: [],
        error: ''
    }

    componentDidMount() {
        const authData = JSON.parse(localStorage.getItem("authData"))
        this.setState({ notifications: authData.user.recommandations.filter( rec => rec.visited === false ), loading: false})
    }

    render() {
        let notifications = [...this.state.notifications];
        notifications.reverse();
        return (
            <Hoc>
                <Header/>
                <section className="rec-section mt-5">
                    <div className="container my-5">
                        <div className="row justify-content-between">
                            <div className="col-sm-12 py-4">
                                <h3>Toutes les Notifications</h3>
                            </div>
                            <div className="col-sm-12">
                                {
                                    this.state.loading ? <div className="d-block ml-auto mr-auto text-center"><Loader/></div>:
                                        notifications.map((notification, id) => (
                                            <a key={id} href={notification.link} className={notification.visited ? "noti-link d-flex" : "noti-link d-flex notvisited" }>
                                                <img src={notification.image} className="rounded-circle img-fluid" alt="" />
                                                <div className="d-flex d-flex justify-content-between flex-grow-1">
                                                    <div className="mr-auto">
                                                        <h3>{notification.title}</h3>
                                                        <span>Recommandé par: {notification.name}</span>
                                                    </div>
                                                    <h6>{notification.date ? notification.date : null}</h6>
                                                </div>
                                            </a>
                                        ))
                                }
                            </div>
                        </div>
                    </div>
                </section>
            </Hoc>
        );
    }
}


export default NotificationsPage;