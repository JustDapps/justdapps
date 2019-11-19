import React from 'react';
import { connect } from 'react-redux';
import { ModelsList } from '@justdapps/react-components'


const ModelsBrowser = ({ models }) => {
    return (
        <>
            <ModelsList
                models={models}>
            </ModelsList>
        </>
    )
}

const mapStateToProps = (state) => ({
    models: state.data.models
});

export default connect(mapStateToProps)(ModelsBrowser);
