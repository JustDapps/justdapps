import { MODELS_LOAD } from '../actions';

const initialState = { models: [] };

const modelsReducer = (state = initialState, action) => {
    switch (action.type) {
        case MODELS_LOAD:
            return { models: action.models };
        default:
            return state;
    }
}

export default modelsReducer;