import {Map, fromJS} from 'immutable';
import {expect} from 'chai';

import reducer from '../src/reducer';

describe('reducer', () => {

  it('handles SET_ENTRIES', () => {
    const initialState = Map();
    const action = {type: 'SET_ENTRIES', entries: ['Trainspotting']};
    const nextState = reducer(initialState, action);

    expect(nextState).to.equal(fromJS({
      entries: ['Trainspotting'],
      initialEntries: ['Trainspotting']
    }));
  });

  it('handles NEXT', () => {
    const initialState = fromJS({
      entries: ['Trainspotting', '28 Days Later'],
      initialEntries: ['Trainspotting']
    });
    const action = {type: 'NEXT'};
    const nextState = reducer(initialState, action);

    expect(nextState).to.equal(fromJS({
      vote: {
        pair: ['Trainspotting', '28 Days Later'],
        id: 1
      },
      entries: [],
      initialEntries: ['Trainspotting']
    }));
  });

  it('handles RESTART by setting the first state', () => {
    const initialState = fromJS({
      entries: ['Trainspotting', '28 Days Later'],
      initialEntries: ['Trainspotting', '28 Days Later']
    });
    const actions = [
      {type: 'NEXT'},
      {type: 'VOTE', entry: 'Trainspotting', voterId: 'John'},
      {type: 'RESTART'}
    ];
    const finalState = actions.reduce(reducer, initialState);

    expect(finalState).to.equal(fromJS({
      vote: {
        pair: ['Trainspotting', '28 Days Later'],
        id: 2
      },
      entries: [],
      initialEntries: ['Trainspotting', '28 Days Later']
    }));
  });

  it('handles VOTE', () => {
    const initialState = fromJS({
      vote: {
        pair: ['Trainspotting', '28 Days Later']
      },
      entries: [],
      initialEntries: ['Trainspotting', '28 Days Later']
    });
    const action = {type: 'VOTE', entry: 'Trainspotting', voterId: 'John'};
    const nextState = reducer(initialState, action);

    expect(nextState).to.equal(fromJS({
      vote: {
        pair: ['Trainspotting', '28 Days Later'],
        tally: {Trainspotting: 1},
        votes: {John: 'Trainspotting'}
      },
      entries: [],
      initialEntries: ['Trainspotting', '28 Days Later']
    }));
  });

  it('does nothing if VOTE for an invalid entry', () => {
    const initialState = fromJS({
      vote: {
        pair: ['Trainspotting', '28 Days Later']
      },
      entries: [],
      initialEntries: ['Trainspotting', '28 Days Later']
    });
    const action = {type: 'VOTE', entry: 'Sunshine', voterId: 'John'};
    const nextState = reducer(initialState, action);

    expect(nextState).to.equal(fromJS({
      vote: {
        pair: ['Trainspotting', '28 Days Later']
      },
      entries: [],
      initialEntries: ['Trainspotting', '28 Days Later']
    }));
  });

  it('has an initial state', () => {
    const action = {type: 'SET_ENTRIES', entries: ['Trainspotting']};
    const nextState = reducer(undefined, action);
    expect(nextState).to.equal(fromJS({
      entries: ['Trainspotting'],
      initialEntries: ['Trainspotting']
    }));
  });

  it('can be used with reduce', () => {
    const actions = [
      {type: 'SET_ENTRIES', entries: ['Trainspotting', '28 Days Later']},
      {type: 'NEXT'},
      {type: 'VOTE', entry: 'Trainspotting'},
      {type: 'VOTE', entry: '28 Days Later'},
      {type: 'VOTE', entry: 'Trainspotting'},
      {type: 'NEXT'}
    ];
    const finalState = actions.reduce(reducer, Map());

    expect(finalState).to.equal(fromJS({
      winner: 'Trainspotting',
      initialEntries: ['Trainspotting', '28 Days Later']
    }));
  });

});