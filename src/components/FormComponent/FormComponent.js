import React, { Component } from 'react';
import HttpService from '../../services/HttpServices';
import AppConstants from '../../AppConstants';
import {DebounceInput} from "react-debounce-input";

class FormComponent extends Component {

  service = new HttpService();

  constructor(props) {
    super(props);
    this.state = FormComponent.defaultState();
    this.handleRepositoryOwnerChange = this.handleRepositoryOwnerChange.bind(this);
    this.handleRepositoryChange = this.handleRepositoryChange.bind(this);
    this.storeRepository = this.storeRepository.bind(this);
  }

  static defaultState() {
    return { repositoryOwner: '', repositoryList: [], invalidOwner: false, selectedRepository: {}, date: new Date() }
  }

  handleRepositoryGetResponse(res) {
    const repositories = JSON.parse(res.text);
    this.setState( { invalidOwner: false, repositoryList: repositories, selectedRepository: repositories[0] } );
  }

  handleRepositoryOwnerChange(event) {
    this.setState( { repositoryOwner: event.target.value });
      this.service.get(AppConstants.GITHUB_USER_REPOSITORIES.replace('{OWNER}', this.state.repositoryOwner))
      .then( (res) => {
        this.handleRepositoryGetResponse(res);
      })
      .catch( (error) => {
        if (error.status === 404) {
          this.setState( { invalidOwner: true } );
        }
      });
  }

  handleRepositoryChange(event) {
    this.setState({selectedRepository: JSON.parse(event.target.value)});
  }

  // TEMPORARY, WILL BE PERSISTED IN A BACKEND
  storeRepository(event) {
    event.preventDefault();
    const { selectedRepository, repositoryList, repositoryOwner } = this.state;
    let storedSearches = JSON.parse(localStorage.getItem('storedSearches'));

    storedSearches.push({
      repository: repositoryList[selectedRepository],
      date: new Date(),
      owner: this.state.repositoryOwner
    });

    localStorage.setItem('storedSearches', JSON.stringify(storedSearches));

    this.props.updateLandingPage();
  }

  render() {
    const { repositoryOwner, repositoryList, invalidOwner, selectedRepository } = this.state;
    const repositories = repositoryList.map((item, i) => (<option key={i} value={i}>{item.name}</option>));

    return (
        <div className="col-xs-12 col-md-10 col-md-offset-1">
          <div className="well">
            <form className="form-horizontal">
              <fieldset>
                <legend>GitHub Repository Details</legend>
                <div className="form-group">
                  <label htmlFor="repositoryNameElm" className="col-lg-2 control-label">Owner</label>
                  <div className="col-lg-10">
                    <DebounceInput
                        className="form-control"
                        debounceTimeout={1500}
                        onChange={this.handleRepositoryOwnerChange}
                        placeholder="Repository Owner"
                    />
                    { invalidOwner && ( <span className="help-block danger">Invalid repository owner name.</span> ) }
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="gitRepository" className="col-lg-2 control-label">Repository</label>
                  <div className="col-lg-10">
                    <select
                        value={selectedRepository}
                        onChange={this.handleRepositoryChange}
                        name="repositoryName"
                        id="repositoryName"
                        className="form-control"
                    >
                      {/*
                         if our repositories array is equal to
                         zero then return no repos available,
                         otherwise return available options
                      */}
                      { repositories.length === 0 ? (<option value="false">You must enter a valid repository owner</option>) : repositories }
                    </select>
                  </div>
                </div>
              </fieldset>
              <div className="text-right">
                <button className="btn btn-default" onClick={this.storeRepository}>Check Repo Info</button>
              </div>
            </form>
          </div>
        </div>
    )
  }
}

export default FormComponent;