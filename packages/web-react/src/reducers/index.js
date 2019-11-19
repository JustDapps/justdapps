import authReducer from './auth';
import modelsReducer from './models';

import { combineReducers } from 'redux';
const rootReducer = combineReducers({
    auth: authReducer,
    data: modelsReducer
});

export default rootReducer;