import React, { Component } from 'react';
import axios from 'axios';
import { Notification, addNotification } from '../../globalComponent/Notifications'
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';

import { Tab, Tabs, Modal } from 'react-bootstrap';
import Loader from '../../globalComponent/Loader';
import Hoc from '../../globalComponent/Hoc';


class AdminEmails extends Component {

    constructor(props) {
        super(props);
        this.state = { 
            users: [],
            suppliers: [],
            loading: true,
            sending: false,
            selectedUsers: [],
            content: '',
            object: '',
            error: '',
            emailError: '',
            editorState: EditorState.createEmpty(),
        };
        this.onChange = (editorState) => this.setState({ editorState });
    }

    handleInputChange = (e) => {
        const value = e.target.value;
        const name = e.target.name;
        if(e.target.type === "checkbox") {
            const {selectedUsers} = this.state;
            if(selectedUsers.includes(value)) {
                let users = selectedUsers.filter(user => (user !== value))
                this.setState({selectedUsers: users});
            } else {
                this.setState(state => ({selectedUsers: [...state.selectedUsers, value]}));
            }
        } else {
            this.setState({[name]: value});
        }
    }

    componentDidMount() {
        //get user list
        axios.get('/api/user')
        .then(res => {
            this.setState({loading: false, users: res.data.users, error: ''})
        })
        .catch(err => {
            this.setState({loading: false,  error: 'Erreur, Veuillez reéssayer'})
        })
        //get suoolier list
        axios.get('/api/supplier/all')
        .then(res => {
            this.setState({loading: false, suppliers: res.data.suppliers, error: ''})
        })
        .catch(err => {
            this.setState({loading: false,  error: 'Erreur, Veuillez reéssayer'})
        })
    }

    onEditorStateChange = (editorState) => {
        this.setState({
            editorState,
            content: draftToHtml(convertToRaw(editorState.getCurrentContent()))
        });
    };

    sendEmails = () => {
        const {object, content, selectedUsers} = this.state;
        if(object.length <= 0 || content.length <= 0 || selectedUsers.length === 0 ) {
            addNotification("warning", "Envoi des Emails!", "Selectionez des utilisateurs et remplissez tous les champs")
        } else {
            this.setState({ sending: true })
            let emails = selectedUsers.filter(user => user.trim().length > 0);
            // Sending with gmail
            axios.post('/api/email/sendemail/gmail', {
                object: object,
                emails: emails,
                html: JSON.stringify(content)
            })
            .then(res => {
                this.setState({ sending: false, showModal: false, emailError: '', content: '', object: '', selectedUsers: [] })
                addNotification("success", "Envoi des Emails!", "Emails envoyés avec succès")
            })
            .catch(err => {
                this.setState({ sending: false, emailError: "Une érreur ss'est produite" })
                console.log(err)
            })
        }
    }

    selectAllUsers = (e, inputClass, toggleBtn) => {
        let usersCheckboxToggleAll = document.getElementsByClassName(toggleBtn)
        let usersCheckboxes = document.getElementsByClassName(inputClass)
        if(usersCheckboxToggleAll[0].checked) {
            let users = [];
            for (const input of usersCheckboxes) {
                input.checked = true
                users.push(input.value)
            }
            this.setState({selectedUsers: [...this.state.selectedUsers, ...users]})
        } else {
            let users = [...this.state.selectedUsers]
            for (const input of usersCheckboxes) {
                input.checked = false;
                users = users.filter(user => (user !== input.value))
            }
            this.setState({selectedUsers: users})
        }
    }

    render() {
        const { loading, users, suppliers, error, selectedUsers, object, sending, emailError, editorState} = this.state;
        return (
            <Hoc>
                <Notification />
                <div className="container mt-4">
                    <div className="row pt-5 pb-3">
                        <div className="col-sm-12">
                            {error && error.length ? <div className="alert alert-danger">{error}</div> : null}
                        </div>
                        <div className="col-sm-12">
                            <Tabs defaultActiveKey="users" id="uncontrolled-tab-example">
                                <Tab eventKey="users" title="Utilisateurs">
                                    {
                                        loading ? <div className="col-sm-12"><div className="d-flex justify-content-center mt-5"><Loader /></div></div> :
                                            <Hoc>
                                                <div className="col-sm-12 user-list">
                                                    <table className="table table-bordered reservations-list">
                                                        <thead className="thead-inverse thead-dark">
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Nom</th>
                                                                <th>Email</th>
                                                                <th>Actions <input onChange={(e) => this.selectAllUsers(e, "user-check", "user-check-verify")} type="checkbox" className="form-check-inline user-check-verify" /></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                users.map((user, i) => (
                                                                    <tr key={i}>
                                                                        <th scope="row">{i + 1}</th>
                                                                        <td>{user.name}</td>
                                                                        <td>{user.email}</td>
                                                                        <td><input onChange={(e) => this.handleInputChange(e)} type="checkbox" className="form-check-inline user-check" value={user.email} /></td>
                                                                    </tr>
                                                                ))
                                                            }
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </Hoc>
                                    }
                                </Tab>
                                <Tab eventKey="suppliers" title="Fournisseurs">
                                    {
                                        loading ? <div className="col-sm-12"><div className="d-flex justify-content-center mt-5"><Loader /></div></div> :
                                            <Hoc>
                                                <div className="col-sm-12 supplier-list">
                                                    <table className="table table-bordered reservations-list">
                                                        <thead className="thead-inverse thead-dark">
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Nom</th>
                                                                <th>Email</th>
                                                                <th>Actions <input onChange={(e) => this.selectAllUsers(e, "supplier-check", "supplier-check-verify")} type="checkbox" className="form-check-inline supplier-check-verify" /></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                suppliers.map((supplier, i) => (
                                                                    <tr key={i}>
                                                                        <th scope="row">{i + 1}</th>
                                                                        <td>{supplier.name}</td>
                                                                        <td>{supplier.email}</td>
                                                                        <td><input onChange={(e) => this.handleInputChange(e)} type="checkbox" className="form-check-inline supplier-check" name={supplier.email} value={supplier.email} /></td>
                                                                    </tr>
                                                                ))
                                                            }
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </Hoc>
                                    }
                                </Tab>
                            </Tabs>
                            <button onClick={() => this.setState({ showModal: true })} className="button send-email-btn">Envoyer un Email ({this.state.selectedUsers.length})</button>
                        </div>
                    </div>
                </div>

                {/* Envoyer les mail */}
                <Modal show={this.state.showModal} onHide={() => this.setState({showModal: !this.state.showModal})} size="lg" >
                    <Modal.Header closeButton>
                    <Modal.Title>Envoi du mail</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container">
                            <div className="row">
                               <div className="col-sm-12">
                                    {emailError && emailError.length ? <div className="alert alert-danger">{emailError}</div> : null}
                                    <div className="d-flex mb-4 flex-wrap">
                                        {
                                            selectedUsers.map((user, i) => <p className="user-email-item" key={i}>{user}</p>)
                                        }
                                    </div>
                                    <div className="form-group">
                                        <label for="name">Objet</label><br/>
                                        <input  type="text" className="form-control" value={object} onChange={(e) => this.handleInputChange(e)} name="object" placeholder="Objet" required />
                                    </div>
                                    <div className="form-group">
                                        <label for="name">Contenu</label>
                                        {/* <CKEditor
                                            editor={ClassicEditor}
                                            data=""
                                            config={{
                                                toolbar: ['heading', '|', 'bold', 'italic', 'insertTable',
                                                    'tableColumn', 'tableRow', 'mergeTableCells', '|', 'undo', 'redo']
                                            }} 
                                            onInit={editor => {
                                            }}
                                            onChange={(event, editor) => {
                                                const data = editor.getData();
                                                this.setState({content: data})
                                            }}
                                            onBlur={(event, editor) => {
                                            }}
                                            onFocus={(event, editor) => {
                                            }}
                                        /> */}
                                        <Editor
                                            editorState={editorState}
                                            wrapperClassName="wrapper-class"
                                            editorClassName="editor-class"
                                            toolbarClassName="toolbar-class"
                                            onEditorStateChange={this.onEditorStateChange}
                                        />
                                        {/* <textarea style={{fontSize: "1.5rem"}} type="text" className="form-control" value={content} onChange={(e) => this.handleInputChange(e)} name="content" rows={5} placeholder="Contenu de l'email"></textarea> */}
                                    </div>
                                    <div className="d-flex justify-content-end">
                                        <button onClick={this.sendEmails} className="button my-4">Envoyer ({selectedUsers.length}) {sending&&<Loader color="white"/>}</button>
                                    </div>
                               </div>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            </Hoc>
        );
    }
}

export default AdminEmails;