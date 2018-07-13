import React, { Component } from "react";

export default class AllNotes extends Component {
    componentDidMount() {
        this.props.onRef(this)
    }

    constructor(props) {
        super(props);

        this.state = {
            editing: {}
        }
    }

    static defaultProps = {
        notes: [],
        onDelete: () => null,
        onEdit: () => null,
    }

    handleDelete = (note) => {
        if (window.confirm('Are you sure')) {
            this.props.onDelete(note);
        }
    }

    handleEdit = (note) => {
        const { editing } = this.state;

        this.setState({ editing: { ...editing, [note.id]: { ...note } } });
    }

    handleEditCancel = (id) => {
        const { editing } = this.state;
        const { [id]: curr, ...others } = editing;

        this.setState({ editing: { ...others } });
    }

    handleFieldEdit = (id, field, event) => {
        const { target: { value } } = event;
        const { editing } = this.state;
        const editData = { ...editing[id] };

        editData[field] = value;

        this.setState({
            editing: { ...editing, ...{ [id]: editData } }
        });
    }

    handleEditSave = (id) => {
        const { editing } = this.state;
        const { [id]: editedNote, ...others } = editing;

        this.props.onEdit({ ...editedNote });

        this.setState({
            editing: { ...others }
        });
    }

    saveEditedNote = (note) => {
        const { editing } = this.state;
        const { [note.id]: editedNote, ...others } = editing;

        this.props.onEdit({ ...editedNote });

        this.setState({
            editing: { ...others }
        });
    }

    renderOrEditNote = (note) => {
        const { editing } = this.state;

        const editData = editing[note.id];
        const isEditing = !!editData;

        return (
            !isEditing ?
                (
                    <tr key={note.id}>
                        {/*<td>{note.id}</td>*/}
                        <td>
                            {note.url === '-' ? (
                                '...'
                            ) : (
                                    <audio controls>
                                        <source src={note.url} type='audio/wav' />
                                    </audio>
                                )}
                        </td>
                        <td>{note.text}</td>
                        {/*<td>{note.url}</td>*/}
                        <td>
                            <button onClick={this.handleEdit.bind(this, note)}>Edit</button>
                            <button onClick={this.handleDelete.bind(this, note)}>Delete</button>
                        </td>
                    </tr>
                ) : (
                    <tr key={note.id}>
                        <td>
                            {note.id}
                        </td>
                        <td>
                            <input type="text" value={editData.text} onChange={this.handleFieldEdit.bind(this, note.id, 'text')} />
                        </td>
                        <td>
                            <input type="text" value={editData.url} onChange={this.handleFieldEdit.bind(this, note.id, 'url')} />
                        </td>
                        <td>
                            <button onClick={this.handleEditSave.bind(this, note.id)}>Save</button>
                            <button onClick={this.handleEditCancel.bind(this, note.id)}>Cancel</button>
                        </td>
                    </tr>
                )
        );
    }

    render() {
        const { notes } = this.props;

        return (<table width="100%">
            <thead>
                <tr>
                    <th>audio</th>
                    <th>text</th>
                </tr>
            </thead>
            <tbody>
                {[].concat(notes).sort((a, b) => b.id - a.id).map(this.renderOrEditNote)}
            </tbody>
        </table>);
    }
}