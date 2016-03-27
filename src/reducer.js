import {setEntries, next, vote, restart} from './core';
import {Map} from 'immutable';

export const INITIAL_STATE = Map();

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'SET_ENTRIES':
      return setEntries(state, action.entries);
    case 'NEXT':
      return next(state);
    case 'VOTE':
      return state.update('vote',
        voteState => vote(voteState, action.entry, action.voterId))
    case 'RESTART':
      return restart(state);
  }
  return state;
}