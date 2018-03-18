// in src/App.js
import React from 'react';
import {jsonServerRestClient, Admin, Resource, Delete , fetchUtils} from 'admin-on-rest';

import Dashboard from './Dashboard';
import { UserList, UserCreate, UserEdit } from './users';
import { GradeList, GradeCreate, GradeEdit } from './grades'

import GradeIcon from 'material-ui/svg-icons/action/book';
import UserIcon from 'material-ui/svg-icons/social/group';

import authClient from './authClient';

const httpClient = (url, options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    const token = localStorage.getItem('token');
    options.headers.set('Authorization', `Basic ${token}`);
    return fetchUtils.fetchJson(url, options);
}

const restClient = jsonServerRestClient('http://howell-info.us:3001',httpClient);

const App = () => (
    <Admin dashboard={Dashboard} restClient={restClient} authClient={authClient}>
	<Resource name="students" list={UserList} icon={UserIcon} create={UserCreate} edit={UserEdit} remove={Delete}/>
	<Resource name="grades" list={GradeList} icon={GradeIcon} create={GradeCreate} edit={GradeEdit} remove={Delete}/>
    </Admin>
);

export default App;
