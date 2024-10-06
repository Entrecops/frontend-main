import React, { Component } from 'react';
import CategoryItem from './CategoryItem';
import './Categories.scss';
import axios from 'axios';
import Loader from '../../globalComponent/Loader';
import imgGallery from '../../../assets/icons/photo.svg';

class Categories extends Component {
    state = {
        selected: false,
        categories: [],
        loading: true,
        error: null
    }

    componentDidMount() {
        //get the categories
        const categories = JSON.parse(localStorage.getItem("categories"));
        if(categories) {
            this.setState({
                categories: categories,
                loading: false
            });
            // Fetch if new categories
            axios.get('/api/category/all')
            .then(res => {
                if(JSON.stringify(categories) !== JSON.stringify(res.data.categories)) {
                    localStorage.setItem("categories", JSON.stringify(res.data.categories));
                    console.log('Categories changed');
                    this.setState({
                        categories: res.data.categories,
                        loading: false
                    })
                }
            })
            .catch(err => {
                this.setState({
                    error: "Une erreur s'est produite",
                    loading: false
                })
            })
            
        } else {
            this.fetchCategories();
        }
    }

    fetchCategories = () => {
        axios.get('/api/category/all')
        .then(res => {
            localStorage.setItem("categories", JSON.stringify(res.data.categories));
            this.setState({
                categories: res.data.categories,
                loading: false
            })
        })
        .catch(err => {
            this.setState({
                error: "Une erreur s'est produite",
                loading: false
            })
        })
    }

    render() {
        const { categories, loading } = this.state;
        let content = <div className="d-block ml-auto mr-auto"><Loader /></div>;
        if(!loading&&categories.length) {
            content = categories.map(category => {
                if(this.props.selected === category.name) {
                    return <CategoryItem selected={true} key={category._id} category={category}  />
                } else {
                    return <CategoryItem key={category._id} category={category} />
                }
        });
        }
        return (
            <section className="categories">
                <div className="container pb-4">
                    <div className="row py-5">
                        <div className="col">
                            <center><h2 className="pt-4 service-header">Parcourir par catégorie</h2></center>
                        </div>
                    </div>
                    <div className="row pb-5 categories-wrapper">
                        {content}
                        <div className="wrimagecard wrimagecard-topimage">
                            <a href="/gallery">
                                <div className="wrimagecard-topimage_header">
                                    <center><center><img src={imgGallery} alt="Galerie" /></center></center>
                                </div>
                                <div className="wrimagecard-topimage_title">
                                    <p className={"text-center"}>Galerie</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

export default Categories;