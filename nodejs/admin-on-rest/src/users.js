// in src/users.js
import React from 'react';
import { List, Datagrid, TextField, Create, SimpleForm, TextInput, Edit, DisabledInput, EditButton, required, Filter} from 'admin-on-rest';

export const UserList = (props) => (
    <List title="All users" {...props} filters={<UserFilter/>}>
        <Datagrid>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="username" />
			<EditButton />
        </Datagrid>
    </List>
);

export const UserCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="name" />
            <TextInput source="username" />
        </SimpleForm>
    </Create>
);

export const UserEdit = (props) => (
	<Edit title="User Edit" {...props}>
        <SimpleForm>
            <DisabledInput label="Id" source="id" />
            <TextInput source="name" validate={required} />
            <DisabledInput source="username" />
        </SimpleForm>
    </Edit>
);
const UserFilter = (props) => (
    <Filter {...props}>
            <TextInput source="name" />
            <TextInput source="username" />
    </Filter>
);	