import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import './Notifications.scss';

class Notifications extends Component {
    render() {
        let recommandations = [...this.props.recommandations.reverse()];
        recommandations.reverse();
        return (
            <div className="recommandations d-flex flex-column">
            {
                recommandations.slice(0,5).map((rec, i) =>(
                    <div key={i} className={!rec.visited ? "notvisited rec-item" : "rec-item"}>
                        <a href={rec.link}>
                            <h4>{rec.title}</h4>
                            <div className="d-flex">
                                <div className="d-flex flex-row align-items-center">
                                    <FontAwesomeIcon icon={faUserCircle} size={"1x"} />
                                    <h6 className="ml-2 mb-0">Par {rec.name}</h6>
                                </div>
                                {/* <label className="ml-auto">New</label> */}
                            </div>
                        </a>
                    </div>
                ))
            }
            </div>
        );
    }
}

export default Notifications;