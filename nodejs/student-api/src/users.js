// in src/users.js
import React from 'react';
import { List, Datagrid, EmailField, TextField, Create, SimpleForm, ReferenceInput, TextInput, LongTextInput, SelectInput, Edit, DisabledInput, EditButton, ReferenceManyField, required, DateField} from 'admin-on-rest';

export const UserList = (props) => (
    <List title="All users" {...props}>
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
	    <Edit title="ehh" {...props}>
        <SimpleForm>
            <DisabledInput label="Id" source="id" />
            <TextInput source="name" validate={required} />
            <DisabledInput source="username" />
        </SimpleForm>
    </Edit>
	
	
	
);