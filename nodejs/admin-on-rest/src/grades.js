// in src/users.js
import React from 'react';
import {  List, Datagrid, TextField, Create, SimpleForm, TextInput, Edit, DisabledInput, EditButton, required, Filter} from 'admin-on-rest';

export const GradeList = (props) => (
    <List {...props} filters={<GradeFilter />}>
        <Datagrid>
            <TextField source="id" />
	        <TextField source="grade" />
            <TextField source="max" />
	        <TextField source="username" />
	        <TextField source="type" />
				<EditButton />
        </Datagrid>
    </List>
);

export const GradeCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
	        <TextInput source="grade" />
            <TextInput source="max" />
	        <TextInput source="username" />
	        <TextInput source="type" />
        </SimpleForm>
    </Create>
);

export const GradeEdit = (props) => (
	<Edit title="Grade Edit" {...props}>
        <SimpleForm>
            <DisabledInput label="id" source="id" />
            <TextInput source="grade" validate={required} />
			<TextInput source="max" validate={required}/>
		    <DisabledInput label="username" source="username" />
			<TextInput source="type" validate={required}/>
        </SimpleForm>
    </Edit>
);

const GradeFilter = (props) => (
    <Filter {...props}>
	        <TextInput source="grade" />
            <TextInput source="max" />
	        <TextInput source="username" />
	        <TextInput source="type" />
    </Filter>
);