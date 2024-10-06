import React, { PureComponent } from 'react';
import './SearchResult.scss';
import img from '../../../assets/images/logo.png';
import axios from 'axios';
import Loader from  '../../globalComponent/Loader'
import {rootUrl} from '../../../configs/config'

class SearchResultList extends PureComponent {

    state = {
        searching: false,
        results: [],
        error: ''
    }

    componentDidUpdate(prevProps) {
        if (prevProps.query !== this.props.query) {
            if (this.props.query&&this.props.query.trim().length > 0) {
                const query = this.props.query;
                this.setState({ searching: true, results: [] })
                // search form events
                axios.get('/api/event/'+query+'/search')
                    .then(res => {
                        let eventList = []; 
                        res.data.events.forEach(event => { 
                            event.eventType = "event";
                            if (!this.state.results.includes(event)) {
                                eventList.push(event) ; 
                            }
                        });
                        // search form services
                        axios.get('/api/service/' + query + '/search')
                            .then(res => {
                                let serviceList = [];
                                res.data.services.forEach(service => {
                                    service.eventType = "service";
                                    if (!this.state.results.includes(service)) {
                                        serviceList.push(service);
                                    }
                                });
                                this.setState({
                                    results: [...eventList, ...serviceList],
                                    searching: false
                                })
                            })
                            .catch(err => {
                                this.setState({ error: "Une érreur s'est produite. Veuillez recharger", searching: false })
                            })
                    })
                    .catch(err => {
                        this.setState({ error: "Une érreur s'est produite. Veuillez recharger", searching: false })
                    })
                
            } else {
                this.setState({ searching: false })
            }
        }
    }

    render() {
        return (
            <div className={`searchResult-list ${this.props.className}`}>
                {this.state.error.length ?<div className="alert alert-danger text-center">{this.state.error}</div>:null}
                {
                    this.state.searching ? <div className="d-flex justify-content-center p-3"><Loader/></div>:
                    this.state.results.length ? 
                        this.state.results.slice(0,10).map((anounce, id) => <SearchResultItem key={id} result={anounce} />)
                    : <div className="d-flex justify-content-center p-3"><span>Aucun résultat</span></div>   
                }
            </div>
        );
    }
}

export default SearchResultList;

export const SearchResultItem = (props) => (
    <a href={'/annonce/' + props.result.eventType + '/' + props.result._id} className="d-flex searchResult-item">
        <img src={rootUrl +'/'+ props.result.image} alt="" className="mr-3" />
        <div className="d-flex flex-column ">
            <h3>{props.result.title}</h3>
            <span className="text-muted">{props.result.category}</span>
        </div>
    </a>
)