import React, { Component } from 'react';
import './Filter.scss';
import DatePicker from "react-datepicker";
import {Link} from 'react-router-dom';
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

class Filter extends Component {
    state = {
        date1: null,
        date2: null,
        category: "",
        tag: "",
        town: ""
    }

    pickDate = (date, field) => {
        this.setState({ [field]: date }, this.save)
    }

    handleChange = (e) => {
        const value = e.target.value.trim();
        const name = e.target.name;
        this.setState({[name]: value}, this.save)
    }

    // save search params to localstorage
    save = () => {
        const searchParams = this.state;
        localStorage.setItem("searchParams", JSON.stringify(searchParams))
    }

    liveFilter = (e) => {
        e.preventDefault();
    }

    render() {
        const { date1, date2, category, town, tag} = this.state;
        return (
            <section className="filter-row">
                <div className="filter container">
                    <div className="row justify-content-center align-items-center py-4">
                        <div className="form-group col-sm-6 col-md-2 mt-2">
                            <label className="mb-4 d-block" id="cat">Catégories</label>
                            <select name="category" id="inputState" onChange={(e) => this.handleChange(e)} defaultValue={category} className="form-control form-control-lg">
                                <option defaultValue>Choisir la catégorie</option>
                                <option>Sortir</option>
                                <option>Bars Lounge & Restaurants</option>
                                <option>Shopping</option>
                                <option>Beauté & Santé</option>
                                <option>Voyages</option>
                                <option>Made in 237</option>
                            </select>
                        </div>
                        <div className="form-group col-sm-6 col-md-2 mt-2">
                        <label className="mb-4 d-block" id="cat">Ville</label>
                            <select name="Ville" id="ville" onChange={(e) => this.handleChange(e)} defaultValue={town} className="form-control form-control-lg">
                                <option defaultValue>Choisir la ville</option>
                                <option>Douala</option>
                                <option>Yaounde</option>
                                <option>Kribi</option>
                                <option>Edea</option>
                                <option>Nkongsamba</option>
                                <option>Limbe</option>
                                <option>Buea</option>
                                <option>Bafoussam</option>
                            </select>
                            {/* <label>Ville</label>
                            <input type="text" onChange={(e) => this.handleChange(e)} name="town" className="form-control" value={town} id="ville" placeholder="Entrez une ville" /> */}
                        </div>
                        <div className="form-group col-sm-6 col-md-2 mt-sm-2">
                        <label className="mb-4 d-block" id="cat">Tag</label>
                            <select name="tag" id="tag" onChange={(e) => this.handleChange(e)} defaultValue={tag} className="form-control form-control-lg">
                                <option defaultValue>Choisir le tag</option>
                                <option>Fete</option>
                                <option>Concert</option>
                                <option>Shopping</option>
                                <option>Cinema</option>
                                <option>Brunch</option>
                                <option>Grillade</option>
                                <option>Restaurant</option>
                                <option>SnackBar</option>
                            </select>
                            {/* <label>Tag</label>
                            <input type="text" onChange={(e) => this.handleChange(e)} name="tag" className="form-control" value={tag} id="tag" placeholder="Entrez un tag" /> */}
                        </div>
                        <div className="form-group col-sm-6 col-md-2 mt-sm-2">
                            <label>Se déroulant entre le:</label>
                            <DatePicker
                                dateFormat="Pp"
                                placeholderText="Choisissez une date"
                                className="form-control" selected={date1}
                                onChange={date => this.pickDate(date, "date1")} />
                        </div>
                        <div className="form-group col-sm-6 col-md-2 mt-sm-2">
                            <label>Et le:</label>
                            <DatePicker
                                dateFormat="Pp" id="date2"
                                placeholderText="Choisissez une date"
                                className="form-control" selected={date2}
                                onChange={date => this.pickDate(date, "date2")} />
                        </div>
                        <div className="form-group col-sm-12 col-md-1 mt-sm-2">
                            <Link to="/filter" className="button"><FontAwesomeIcon icon={faSearch} size="1x" /></Link>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

export default Filter;